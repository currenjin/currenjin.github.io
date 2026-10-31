# AU Mic Sector 1 분석 재현 기록

공개 본문은 `_wiki/nasa-dataset.md`다. 이 디렉터리는 Jekyll의 `docs` 제외 규칙에 따라 사이트에 복사하지 않지만, 공개 GitHub 저장소에서 읽을 수 있다.

## 입력과 범위

- 대상: AU Microscopii, TIC 441420236, TESS Sector 1.
- MAST 조회 조건: `obs_collection=TESS`, `target_name=441420236`, `provenance_name=SPOC`; 선택된 `obsid=60835816`.
- 제품: `tess2018206045859-s0001-0000000441420236-0120-s_lc.fits`.
- [공개 다운로드](https://stpubdata.s3.us-east-1.amazonaws.com/tess/public/tid/s0001/0000/0004/4142/0236/tess2018206045859-s0001-0000000441420236-0120-s_lc.fits).
- 크기: 2,039,040바이트.
- SHA-256: `fe601f0f82b7d89c4d303e3c3acaa43efb61e38976b47482efce577e0029c9c3`.
- `DATA_REL=42`, `PROCVER=spoc-5.0.10-20200904`. 관측 날짜와 처리 버전의 날짜를 구분한다.
- 관측 경계는 UTC로 2018-07-26T09:35:51.908~2018-08-22T15:59:07.067이다. 무결측 관측 길이가 아니다.

AU Mic은 사전지식 기반 후보를 외부 검색으로 확인한 대상이다. Resources에서 연속 클릭하여 직접 발견했다고 서술하지 않는다. 알려진 자전 사례를 해석하는 학습이며, 새로운 발견이나 해커톤 제출 프로젝트가 아니다.

## 재현

Python 3.14.3에서 실행했으며 정확한 패키지 버전은 `requirements.txt`에 고정했다. 프로젝트 생산 의존성이나 전역 환경은 바꾸지 않는다. 다음 명령은 저장소 루트에서 실행한다.

```sh
python3 -m venv /path/outside-repo/nasa-venv
/path/outside-repo/nasa-venv/bin/pip install -r docs/analysis/nasa-dataset/requirements.txt
/path/outside-repo/nasa-venv/bin/python docs/analysis/nasa-dataset/analyze.py /path/to/tess2018206045859-s0001-0000000441420236-0120-s_lc.fits /path/outside-repo/nasa-output
/path/outside-repo/nasa-venv/bin/python docs/analysis/nasa-dataset/verify.py /path/to/tess2018206045859-s0001-0000000441420236-0120-s_lc.fits
```

`analyze.py`는 원본을 읽기 전용으로 열고 입력 해시를 검사한다. 결과 JSON과 PNG 두 개를 출력하며, 저장소 내부의 이미지 출력 경로는 거부한다. 원본 FITS와 그래프 파일은 이 디렉터리에 넣지 않는다.

## 분석 조건

- 기본 마스크: 유한한 `TIME`, 유한한 `PDCSAP_FLUX`, `QUALITY == 0`의 교집합.
- 주기 계산: 모든 남은 행을 사용한다. 플롯용 다운샘플링이나 시간 보간을 하지 않는다.
- 정규화: 유효 flux의 중앙값으로 나눈 뒤 1을 뺀다. 별의 무흑점 밝기 추정이나 장기 추세 제거가 아니다.
- Lomb–Scargle: Astropy `nterms=1`, `fit_mean=True`, `center_data=True`, `normalization='standard'`, `method='cython'`, 측정별 동일 가중치.
- 주파수 범위: 하루당 0.1~2회, 주기로 0.5~10일. `samples_per_peak=30`; 기본 자료에서 1,546개 지점. 최고점 양옆 구간에서 bounded scalar optimization으로 좁힌다.
- 측정 불확실성 열은 확인했지만 가중치나 주기 신뢰구간 계산에 사용하지 않는다. 행 수가 많다고 상관된 시간 변동이 독립 잡음이 되는 것은 아니다.
- 민감도 비교: 유한값 전체, SAP, 국소 잔차 제외, 시간 중앙점으로 나눈 앞뒤 절반. 절반 구분은 행 수 반분이 아니며 첫 측정과 마지막 측정 시각의 중간값을 사용한다.
- 국소 잔차 제외: 0.01일보다 큰 관측 간격에서 자료를 분리한다. 각 연속 구간에서 151표본 중앙값을 빼고, 잔차 중앙값으로부터 `5 × 1.4826 × MAD`를 넘는 점을 한 번 제거한다. 양쪽 잔차를 제외하며 실제 플레어/통과 분류는 하지 않는다.
- 대안적 반복 검사: 0.1일 bin의 중앙값을 만든 뒤 0.5~10일만큼 이동한 쌍의 Pearson 상관을 구한다. 빈 bin은 유지하고 각 지연에서 양쪽이 유한한 쌍만 쓴다. 겹치는 쌍의 수는 지연마다 달라지므로 상관의 최고점 하나로 기본 주기를 정하지 않는다.

## 실제 결과와 해석

전체 20,076행 중 17,687행을 사용했다. 비유한 TIME 815행은 비유한 PDCSAP 2,355행에 포함되고, 이 2,355행도 품질 표시가 있는 2,389행에 모두 포함된다. 따라서 총 제외는 4,744행이 아니라 2,389행이다.

기본 LS 최고점은 4.847286276일이다. 국소 잔차 제외 4.844776700일, 품질 조건 해제 4.847417107일, SAP 4.849969999일, 앞 절반 4.864015497일, 뒤 절반 4.949667645일이었다. 시간 이동 비교에서는 4.9일과 9.7일 근처에서 높은 상관이 나타난다.

이는 약 4.85일 부근의 반복을 지지하지만 정확한 자전 주기나 통계적 신뢰구간의 측정이 아니다. 동일한 관측에 대한 여러 계산은 독립 관측 검증이 아니며, 계통오차와 흑점 진화, 플레어와 통과를 모두 모델링하지 않았다. 문헌의 4.872일은 다른 방법인 systematics-insensitive periodogram의 결과로 별도 인용했다.

## 원본 무결성 경고

Astropy FITS의 내부 CHECKSUM 검사는 PRIMARY에서 통과하고 LIGHTCURVE와 APERTURE에서 실패했다. DATASUM은 세 HDU 모두 없으며, `verify_datasum()`의 반환 2는 통과가 아니라 키가 없다는 의미다.

2026-10-31 공식 공개 S3 URL에서 새로 받은 바이트와 보관 원본을 비교했을 때 크기와 SHA-256이 일치했다. 새 파일에서도 같은 CHECKSUM 결과가 나왔고 FITS 구조 검사 `verify('exception')`는 통과했다. 따라서 이번 다운로드 과정에서 생긴 차이는 관측되지 않았지만, 공개 원본의 내부 체크섬 실패 원인을 규명하거나 과학적 무결성을 완전히 보증한 것은 아니다. 원본이나 헤더를 수정하지 않았다.

## 근거별 확인 위치

- [TESS Science Data Products Description, 2018-07-31 Rev D](https://archive.stsci.edu/missions/tess/doc/EXP-TESS-ARC-ICD-TM-0014.pdf): 5.1~5.2절(본문30/뷰어31), Table13(본문32/뷰어33), Table14 시간 헤더(본문35/뷰어36). 실제 FITS의 20개 열과 단위를 대조했다. 표의 예시 숫자를 이번 관측값으로 사용하지 않았다.
- [NASA AU Mic 기사, 2020-06-24](https://www.nasa.gov/universe/nasas-tess-spitzer-missions-discover-a-world-orbiting-a-unique-young-star/): `Detecting planets`, `In July and August 2018`, `When a planet crosses` 문단. 흑점·플레어·행성 통과의 존재와 구분에 사용했다.
- [Ikuta et al. 2023 원논문](https://iopscience.iop.org/article/10.3847/1538-4357/acbd36/pdf): 2.1절 PDF2쪽의 TIC 대응, PDC-SAP/SAP 비교와 Cycle1 SIP 4.872일; 초록과 1절의 흑점 및 관측시기별 파형 변화. 논문 전체의 흑점 모형을 재현한 것은 아니다.
- [HEASARC LightCurveFile 튜토리얼](https://heasarc.gsfc.nasa.gov/docs/tess/LightCurveFile-Object-Tutorial.html): `What is Pre-search Data Conditioning SAP flux?`. 오래된 튜토리얼의 임무 총 구간 수나 API 예제를 최신 사실로 사용하지 않았다.
- [Astropy Lomb–Scargle 문서](https://docs.astropy.org/en/stable/timeseries/lombscargle.html): `The Lomb-Scargle Model`, `Standard Normalization`, `RR Lyrae Example`. 이동하는 stable 문서와 실행 패키지 버전은 별도로 구분한다.

## 검수 범위

`verify.py`는 불규칙 시각·공백을 가진 합성 사인파의 알려진 주기 복원, 보존 원문의 바이트 비교, 실제 행 수/제외 중복 계산, 별도 SciPy 구현과의 최고점 비교, 저장소 내부 이미지 출력 거부를 검사한다. 합성 입력은 시험용이며 본문 그래프에는 사용하지 않았다.

과학 검토에서는 실제 FITS로 결과를 재계산하고 공식 문서 및 논문과 단위·조건·해석을 대조했다. 문체 검토는 추가된 5~7장에 한정했고, 1~4장 및 frontmatter는 원격 기준 커밋 `a439461`의 원문 바이트를 보존한다. 독자의 이해나 저자의 학습 완료를 검증했다고 보지 않는다.

본문 그림의 실제 Issue 연결과 바이트 대응은 `images.json`을 참고한다. 원본 두 이미지도 보존하고, 새 그래프 두 개는 공개 Issue #30에 첨부했다.
