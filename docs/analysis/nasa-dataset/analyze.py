"""Reproduce the AU Mic Sector 1 learning analysis; never modify the input FITS."""
import argparse
import hashlib
import json
import platform
from pathlib import Path

import astropy
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import scipy
from astropy.io import fits
from astropy.timeseries import LombScargle
from scipy.ndimage import median_filter
from scipy.optimize import minimize_scalar

EXPECTED = 'fe601f0f82b7d89c4d303e3c3acaa43efb61e38976b47482efce577e0029c9c3'


def period_search(t, flux):
    y = flux / np.median(flux) - 1
    ls = LombScargle(t - t.min(), y, fit_mean=True, center_data=True, nterms=1)
    freq, power = ls.autopower(minimum_frequency=0.1, maximum_frequency=2.0,
                              samples_per_peak=30, normalization='standard', method='cython')
    i = int(np.argmax(power))
    opt = minimize_scalar(lambda f: -float(ls.power(f, method='cython')),
                          bounds=(freq[max(0, i-1)], freq[min(len(freq)-1, i+1)]),
                          method='bounded', options={'xatol': 1e-12})
    return {'rows': len(t), 'period_days': float(1 / opt.x),
            'power': float(-opt.fun), 'grid_points': len(freq),
            'span_days': float(np.ptp(t))}, freq, power


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('fits_file', type=Path)
    parser.add_argument('output_dir', type=Path)
    args = parser.parse_args()
    out = args.output_dir.resolve()
    repo = Path(__file__).resolve().parents[3]
    if out == repo or repo in out.parents:
        raise ValueError('Graphs must be written outside the repository')
    sha = hashlib.sha256(args.fits_file.read_bytes()).hexdigest()
    if sha != EXPECTED:
        raise ValueError('Input hash does not match the studied product')
    out.mkdir(parents=True, exist_ok=True)
    with fits.open(args.fits_file, mode='readonly', checksum=True) as hdus:
        d = hdus['LIGHTCURVE'].data.copy()
        h = hdus['LIGHTCURVE'].header.copy()
        primary = dict(hdus[0].header)
        checksums = {x.name: {'checksum_status': int(x.verify_checksum()),
                              'datasum_status': int(x.verify_datasum())} for x in hdus}
        hdus.verify('exception')
        cols = [{'name': c.name, 'unit': c.unit, 'format': c.format} for c in hdus[1].columns]
    t = np.asarray(d['TIME'], dtype=float)
    f = np.asarray(d['PDCSAP_FLUX'], dtype=float)
    q = d['QUALITY'] != 0
    invalid_t = ~np.isfinite(t)
    invalid_f = ~np.isfinite(f)
    invalid = invalid_t | invalid_f
    keep = ~(q | invalid)
    tt, ff = t[keep], f[keep]
    assert np.all(np.diff(tt) > 0)
    base, freq, power = period_search(tt, ff)
    # A short-window median estimates the local baseline for a sensitivity test only.
    # 151 samples are about 0.21 d at 2-min cadence; process each continuous segment.
    cuts = np.r_[0, np.where(np.diff(tt) > 0.01)[0] + 1, len(tt)]
    trend = np.empty_like(ff)
    for a, b in zip(cuts[:-1], cuts[1:]):
        trend[a:b] = median_filter(ff[a:b], size=151, mode='nearest')
    residual = ff - trend
    scale = float(1.4826 * np.median(np.abs(residual - np.median(residual))))
    clipped = np.abs(residual - np.median(residual)) <= 5 * scale
    tests = {'PDCSAP_quality_zero': base}
    tests['PDCSAP_local_5MAD'] = period_search(tt[clipped], ff[clipped])[0]
    tests['PDCSAP_all_finite'] = period_search(t[~invalid], f[~invalid])[0]
    sap = np.asarray(d['SAP_FLUX'], dtype=float)
    sap_keep = np.isfinite(t) & np.isfinite(sap) & ~q
    tests['SAP_quality_zero'] = period_search(t[sap_keep], sap[sap_keep])[0]
    midpoint = (tt.min() + tt.max()) / 2
    for label, mask in [('first_half', tt < midpoint), ('second_half', tt >= midpoint)]:
        tests[label] = period_search(tt[mask], ff[mask])[0]
    # Alternative repeat check on the same data: Pearson correlation of 0.1-d bins.
    # Missing bins remain NaN; no interpolation across the downlink gap.
    edges = np.arange(tt.min(), tt.max() + 0.1, 0.1)
    ids = np.digitize(tt, edges) - 1
    medians = np.array([np.median(ff[ids == i]) if np.any(ids == i) else np.nan
                        for i in range(len(edges)-1)])
    lags = np.arange(5, 101)
    acf, pairs = [], []
    for lag in lags:
        a, b = medians[:-lag], medians[lag:]
        valid = np.isfinite(a) & np.isfinite(b)
        pairs.append(int(valid.sum()))
        acf.append(float(np.corrcoef(a[valid], b[valid])[0, 1]))
    acf = np.array(acf)
    local_max = np.where((acf[1:-1] > acf[:-2]) & (acf[1:-1] > acf[2:]))[0] + 1
    best = int(local_max[np.argmax(acf[local_max])])
    report = {
        'input': args.fits_file.name, 'sha256': sha,
        'fits_internal_checksums': checksums,
        'versions': {'python': platform.python_version(), 'numpy': np.__version__,
                     'astropy': astropy.__version__, 'scipy': scipy.__version__,
                     'matplotlib': matplotlib.__version__},
        'primary': {k: primary.get(k) for k in ['OBJECT', 'TICID', 'SECTOR', 'DATE-OBS', 'DATE-END', 'DATA_REL', 'PROCVER']},
        'time': {k: h.get(k) for k in ['TIMESYS', 'TIMEREF', 'BJDREFI', 'BJDREFF', 'TIMEDEL', 'TSTART', 'TSTOP']},
        'columns': cols,
        'counts': {'total': len(d), 'nonfinite_time': int(invalid_t.sum()),
                   'nonfinite_pdcsap': int(invalid_f.sum()),
                   'both_nonfinite': int((invalid_t & invalid_f).sum()),
                   'any_nonfinite': int(invalid.sum()), 'quality_nonzero': int(q.sum()),
                   'nonfinite_and_quality': int((invalid & q).sum()),
                   'excluded_union': int((invalid | q).sum()), 'kept': int(keep.sum()),
                   'clip_removed_from_kept': int((~clipped).sum())},
        'flux_median_e_per_s': float(np.median(ff)),
        'first_retained_row': {k: float(d[k][keep][0]) for k in ['TIME','SAP_FLUX','PDCSAP_FLUX','PDCSAP_FLUX_ERR','QUALITY']},
        'last_retained_time': float(tt[-1]),
        'largest_gap_days': float(np.diff(tt).max()),
        'gap_bounds_btjd': [float(tt[np.argmax(np.diff(tt))]), float(tt[np.argmax(np.diff(tt))+1])],
        'quality_values': {str(int(k)): int(v) for k, v in zip(*np.unique(d['QUALITY'], return_counts=True))},
        'settings': {'period_range_days': [0.5, 10], 'samples_per_peak': 30,
                     'weighting': 'unweighted', 'model': 'offset + one sine/cosine pair',
                     'detrending': 'none for period search', 'normalization': 'flux/median - 1',
                     'clipping_sensitivity': '151-sample segment-wise median; absolute residual <= 5*1.4826*MAD; no iteration'},
        'searches': tests,
        'repeat_check': {'bin_width_days': 0.1, 'best_local_max_lag_days': float(lags[best]*0.1),
                         'correlation': float(acf[best]), 'paired_bins': pairs[best],
                         'local_maxima': [{'lag_days': float(lags[i]*0.1), 'r': float(acf[i])} for i in local_max]},
    }
    (out/'results.json').write_text(json.dumps(report, indent=2) + '\n')
    plt.rcParams.update({'font.size': 13, 'axes.labelsize': 14, 'axes.titlesize': 14})
    fig, ax = plt.subplots(figsize=(7, 4.8), layout='constrained')
    ax.plot(tt-tt.min(), ff/np.median(ff), '.', markersize=1.4, color='#174a75', rasterized=True)
    ax.set(xlabel='Days since first retained measurement', ylabel='Flux / median flux',
           title='AU Mic · TESS Sector 1 · PDCSAP')
    ax.grid(alpha=0.2)
    fig.savefig(out/'au-mic-lightcurve.png', dpi=180)
    plt.close(fig)
    fig, axes = plt.subplots(2, 1, figsize=(7, 7), layout='constrained')
    axes[0].plot(1/freq, power, color='#174a75')
    axes[0].axvline(base['period_days'], color='#943b14', linestyle='--', label=f"Peak: {base['period_days']:.3f} d")
    axes[0].set(xlabel='Trial period (days)', ylabel='Lomb–Scargle power', xlim=(0.5, 10))
    axes[0].legend()
    axes[1].plot(lags*0.1, acf, color='#174a75')
    axes[1].set(xlabel='Time shift (days)', ylabel='Correlation of binned flux', xlim=(0.5, 10))
    for ax in axes:
        ax.grid(alpha=0.2)
    fig.savefig(out/'au-mic-period-check.png', dpi=180)
    plt.close(fig)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
