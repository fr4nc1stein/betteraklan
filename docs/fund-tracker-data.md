# School and Disaster Fund Tracker data

The tracker covers the School and Disaster Fund quarters listed in [Aklan Province's Full Disclosure archive](https://aklan.gov.ph/full-disclosures/), from 2012 to 2026. Each year links back to the provincial disclosure page.

## Coverage

| Years | Digitized tables | Linked PDFs | Wrong file | Reports absent from the listing |
| --- | ---: | ---: | ---: | ---: |
| 2012–2014 | 0 | 12 | 0 | 12 |
| 2015 | 2 | 6 | 0 | 0 |
| 2016–2018 | 24 | 0 | 0 | 0 |
| 2019 | 7 | 0 | 1 | 0 |
| 2020–2025 | 48 | 0 | 0 | 0 |
| 2026 | 6 | 0 | 0 | 2 |
| **Total** | **87** | **18** | **1** | **14** |

The live 2026 index listed reports through Q3 when checked on 23 November 2026. The [2019 Q1 disaster fund listing](https://aklan.gov.ph/full-disclosures/2019-full-disclosure/) opens a 20% Internal Revenue Allotment utilization workbook. The 2013 annual item labeled Special Education Fund Utilization opens a proposed budget resolution.

## Source and figures

- `fundReports2025.json` retains the original 2025 extraction. `fundReportsArchive.json` holds digitized tables and PDF or mismatched source records for other years.
- Select the worksheet whose report heading identifies Aklan, the fund, the calendar year, and the reporting quarter. Some archived files contain worksheets for other periods. Use the heading inside the worksheet to identify the report.
- Each structured row contains its one-based source row, the published label, and the amount or amounts in Philippine pesos. Blank cells use `null`. Workbook totals are preserved to two decimal places, with a note where the label and amount are on different rows.
- Charts use the reported total from each source. All quarters shows the latest digitized summary and the individual reports, including gaps.
- Older PDF reports link to the full source. Their figures are excluded from dashboard totals, charts, and CSV exports pending table verification.
