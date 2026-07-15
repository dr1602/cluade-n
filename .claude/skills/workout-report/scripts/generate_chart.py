#!/usr/bin/env python3
"""Query the workouts table for the past year and export a monthly bar chart.

Usage:
    python generate_chart.py [--db-url URL] [--out PATH] [--months N]

If --db-url is not given, reads DATABASE_URL from a .env file (searched
starting at the current directory and walking up to the repo root).
"""

import argparse
import os
import sys
from pathlib import Path


def find_env_var(name: str, start: Path) -> str | None:
    """Walk upward from `start` looking for a .env file defining `name`."""
    current = start.resolve()
    for directory in [current, *current.parents]:
        env_path = directory / ".env"
        if env_path.is_file():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                if key.strip() == name:
                    return value.strip().strip('"').strip("'")
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db-url", help="Postgres connection string (overrides .env)")
    parser.add_argument(
        "--out",
        default="workouts_by_month.png",
        help="Output image path (default: workouts_by_month.png)",
    )
    parser.add_argument(
        "--months",
        type=int,
        default=12,
        help="How many months back to include (default: 12)",
    )
    args = parser.parse_args()

    db_url = args.db_url or os.environ.get("DATABASE_URL") or find_env_var(
        "DATABASE_URL", Path.cwd()
    )
    if not db_url:
        print(
            "error: could not find DATABASE_URL (pass --db-url, set the env var, "
            "or run from a directory with a .env file above it)",
            file=sys.stderr,
        )
        return 1

    try:
        import psycopg2
    except ImportError:
        print(
            "error: psycopg2 is not installed. Install it with:\n"
            "  pip install psycopg2-binary",
            file=sys.stderr,
        )
        return 1

    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print(
            "error: matplotlib is not installed. Install it with:\n"
            "  pip install matplotlib",
            file=sys.stderr,
        )
        return 1

    query = """
        SELECT
            date_trunc('month', date)::date AS month,
            count(*) AS workout_count
        FROM workouts
        WHERE date >= (current_date - interval '%s months')
        GROUP BY 1
        ORDER BY 1;
    """

    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(query, (args.months,))
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        print("No workout entries found in the requested period.", file=sys.stderr)
        return 1

    months = [row[0].strftime("%b %Y") for row in rows]
    counts = [row[1] for row in rows]

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(months, counts, color="#4C72B0")
    ax.set_xlabel("Month")
    ax.set_ylabel("Number of workouts")
    ax.set_title(f"Workouts per month (last {args.months} months)")
    ax.set_ylim(bottom=0)
    for i, count in enumerate(counts):
        ax.text(i, count, str(count), ha="center", va="bottom")
    plt.xticks(rotation=45, ha="right")
    fig.tight_layout()
    fig.savefig(args.out, dpi=150)

    print(f"Saved chart to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
