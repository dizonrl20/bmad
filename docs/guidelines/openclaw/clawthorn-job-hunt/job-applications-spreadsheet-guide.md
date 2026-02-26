# Job applications spreadsheet — traceability guide

The job-application spreadsheet is the **single place** to see what you applied for, which role and company, the URL, and whether it was successful. Use it to trace back every application and avoid double-applying.

---

## File location

- **Path (config):** `spreadsheet_path` in `job-hunt-config.yaml` (default: `_bmad/_memory/job-applications.csv`).
- **Created by:** `npm run clawthorn:init` (or init script with `--directory`).

---

## Columns (order matters for CSV)

| Column          | Purpose — trace back |
|-----------------|----------------------|
| **Job title**   | Role / position (e.g. "QA Analyst", "SDET"). |
| **Company**     | Employer or posting source (e.g. "Government of Canada", "Acme Corp"). |
| **Source**      | Where you applied: Indeed / LinkedIn / Workday / GC Jobs / Ontario / St. Catharines / NRCan / Other. |
| **URL**         | Full job posting URL — use this to reopen the posting and to detect duplicates. |
| **Date attempted** | **Application date and time** — when you submitted the application. Use YYYY-MM-DD and, for successful applications, include time (e.g. YYYY-MM-DD HH:MM) so you know exactly when you applied. For Status=Applied, this is when you successfully applied. |
| **Status**      | **Applied** (submitted successfully), **Failed** (could not submit), **Blocked** (e.g. captcha, login). |
| **Notes**       | What went wrong, follow-up, or anything to remember. |

Clawthorn (and you) use **Job title + Company + Source** to describe the application, and **URL** to trace back and to avoid applying twice to the same posting.

---

## How to use it to trace back

1. **What did I apply for?** — Sort or filter by **Date attempted** or **Source**. Each row is one attempt; **Job title** and **Company** tell you the role and employer.
2. **Which were successful?** — Filter **Status** = `Applied` for successful submissions; `Failed` or `Blocked` for ones that need follow-up.
3. **Reopen a posting** — Use the **URL** column to open the job page again.
4. **Avoid double application** — Before applying, check if that **URL** (or same Job title + Company + Source) already appears in the sheet. Clawthorn does this check; you can too.

---

## Learning what you applied for

- **Review the spreadsheet** regularly (e.g. open `_bmad/_memory/job-applications.csv` in Excel, Google Sheets, or a text editor).
- Clawthorn reads this file to: (1) count daily applications (cap), (2) detect duplicates by URL/title+company, (3) add new rows after each attempt.
- You can export or copy the sheet for your own records; keep the CSV in place so Clawthorn stays in sync.

---

## Template header (do not change column order)

```text
Job title,Company,Source,URL,Date attempted,Status,Notes
```

If you create the file by hand, use this exact header. The init script (`npm run clawthorn:init`) creates it for you.
