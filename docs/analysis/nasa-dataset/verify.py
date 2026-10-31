"""Run analysis regression checks without changing the input or generating images."""
import hashlib
import json
import subprocess
import sys
import unittest
from pathlib import Path

import numpy as np
from astropy.io import fits
from scipy.signal import lombscargle
from analyze import EXPECTED, period_search

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]


class AnalysisChecks(unittest.TestCase):
    def test_synthetic_known_period_with_gap(self):
        rng = np.random.default_rng(42)
        t = np.sort(rng.uniform(0, 27, 1200))
        t = t[(t < 12) | (t > 14)]
        y = 100 + 2*np.sin(2*np.pi*t/3.7) + rng.normal(0, 0.05, len(t))
        result = period_search(t, y)[0]
        self.assertAlmostEqual(result['period_days'], 3.7, delta=0.003)

    def test_original_article_prefix(self):
        baseline = subprocess.check_output(['git', 'show', 'a439461:_wiki/nasa-dataset.md'], cwd=REPO)
        current = (REPO/'_wiki/nasa-dataset.md').read_bytes()
        self.assertTrue(current.startswith(baseline))
        self.assertEqual(current.count(b'https://github.com/user-attachments/assets/'), 4)
        for chapter in range(1, 8):
            self.assertEqual(current.count(f'## {chapter}.'.encode()), 1)

    def test_counts_and_independent_implementation(self):
        path = Path(INPUT)
        self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), EXPECTED)
        r = json.loads((HERE/'results.json').read_text())
        with fits.open(path) as h:
            d = h['LIGHTCURVE'].data
            t = np.asarray(d['TIME'], dtype=float)
            f = np.asarray(d['PDCSAP_FLUX'], dtype=float)
            invalid = ~np.isfinite(t) | ~np.isfinite(f)
            quality = d['QUALITY'] != 0
            keep = ~(invalid | quality)
            self.assertEqual(int(keep.sum()), r['counts']['kept'])
            self.assertEqual(int(invalid.sum()+quality.sum()-(invalid & quality).sum()),
                             r['counts']['excluded_union'])
            self.assertEqual(len(d), r['counts']['total'])
            tt, ff = t[keep], f[keep]
        # Independent SciPy implementation, dense local grid around the reported peak.
        trial = np.linspace(4.7, 5.0, 1001)
        p = lombscargle(tt-tt.min(), ff/np.median(ff)-1, 2*np.pi/trial,
                       floating_mean=True, normalize=True)
        self.assertAlmostEqual(float(trial[np.argmax(p)]),
                               r['searches']['PDCSAP_quality_zero']['period_days'], delta=0.0003)

    def test_refuse_repository_image_output(self):
        process = subprocess.run([sys.executable, str(HERE/'analyze.py'),
                                  INPUT, str(HERE/'forbidden-output')],
                                 capture_output=True, text=True)
        self.assertNotEqual(process.returncode, 0)
        self.assertIn('outside the repository', process.stderr)
        self.assertFalse((HERE/'forbidden-output').exists())


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python verify.py INPUT.fits')
    INPUT = sys.argv.pop()
    unittest.main()
