---
name: workout-report
description: Generate a bar chart of monthly workout counts for the past year by querying the app's Postgres database (workouts table) using the DATABASE_URL from a project .env file. Use this whenever the user asks for a workout summary, workout trends, a chart/graph of workouts over time, "how many workouts per month", or a visual report of training activity pulled from the database.
---

# Workout Report

Query the `workouts` table for the past year and render a bar chart of
workout counts per month (x axis = month, y axis = number of workouts),
exported as a PNG image.

## When to use

Trigger this skill when the user wants a chart/report of workout activity
over time sourced from the live database — not from static data they paste
in. Typical phrasings: "chart my workouts for the past year", "how many
workouts did I do each month", "make a bar graph of workout counts".

## How it works

The data lives in the `workouts` table (see `app/db/schema.ts`), one row per
workout with a `date` column. The bundled script queries and plots it in one
step — no need to write ad hoc SQL or plotting code.

1. Confirm the DB connection: `DATABASE_URL` should be in a `.env` file at
   the project root (never print or log the value — it contains credentials).
2. Ensure Python dependencies are available: `psycopg2-binary` and
   `matplotlib`. If missing, install with:
   ```bash
   pip install psycopg2-binary matplotlib
   ```
3. Run the script from (or below) the project root so it can find `.env`:
   ```bash
   python3 .claude/skills/workout-report/scripts/generate_chart.py --out workouts_by_month.png
   ```
   - `--months N` changes the lookback window (default 12).
   - `--out PATH` changes the output image path.
   - `--db-url URL` overrides `.env` discovery if needed.
4. Tell the user where the image was saved. If they're working in a chat
   surface that can render images, show it to them; otherwise just point to
   the file path.

## Notes

- The script walks upward from the current directory looking for a `.env`
  file with `DATABASE_URL`, so it works from any subdirectory of the repo.
- Never echo the connection string back to the user or into commit
  messages/logs — treat it as a secret.
- If the query returns no rows, the script exits with an error rather than
  producing an empty chart — surface that message to the user rather than
  guessing at a fix.
