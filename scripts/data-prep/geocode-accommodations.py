#!/usr/bin/env python3
"""One-time geocoding pass for Aklan tourist accommodation listings.

Reads scripts/data-prep/accommodations-raw.json (scraped from aklan.gov.ph's
"Authorized Accommodation Establishments" pages: mainland + Boracay), geocodes
each address via Nominatim (OpenStreetMap), and writes
src/data/tourism/accommodations.json for the app to consume as static data.

Respects Nominatim's usage policy: max 1 req/sec, identifying User-Agent.
Progressive fallback per address: full address -> barangay+municipality ->
municipality only, so every entry gets *some* placement even if imprecise.
Each output entry carries `geocodePrecision` so the UI/reviewer can see how
confident a placement is.

Run once: python3 scripts/data-prep/geocode-accommodations.py
"""
import json
import re
import time
import urllib.parse
import urllib.request

RAW_PATH = "scripts/data-prep/accommodations-raw.json"
OUT_PATH = "src/data/tourism/accommodations.json"
USER_AGENT = "BetterAklan-civic-portal/1.0 (https://betteraklan.org; one-time geocoding of public accommodation listings)"

MUNICIPALITIES = [
    "Altavas", "Balete", "Banga", "Batan", "Buruanga", "Ibajay", "Kalibo",
    "Lezo", "Libacao", "Madalag", "Makato", "Malay", "Malinao", "Nabas",
    "New Washington", "Numancia", "Tangalan",
]


def guess_municipality(address: str) -> str | None:
    for m in MUNICIPALITIES:
        if re.search(re.escape(m), address, re.IGNORECASE):
            return m
    return None


def barangay_fallback(address: str, municipality: str) -> str | None:
    m = re.search(r"(Brgy\.?\s*[A-Za-zÑñ.\- ]+)", address)
    if m:
        return f"{m.group(1).strip()}, {municipality}, Aklan, Philippines"
    return None


def nominatim_search(query: str):
    url = (
        "https://nominatim.openstreetmap.org/search?"
        + urllib.parse.urlencode(
            {"q": query, "format": "json", "limit": 1, "countrycodes": "ph"}
        )
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if data:
        return float(data[0]["lat"]), float(data[0]["lon"])
    return None


def geocode(entry: dict) -> dict:
    address = entry["address"]
    municipality = guess_municipality(address)
    attempts = [(f"{address}, Aklan, Philippines", "exact")]
    if municipality:
        bgy = barangay_fallback(address, municipality)
        if bgy:
            attempts.append((bgy, "barangay"))
        attempts.append((f"{municipality}, Aklan, Philippines", "municipality"))

    for query, precision in attempts:
        try:
            result = nominatim_search(query)
        except Exception as exc:  # noqa: BLE001 - report and keep going
            print(f"  ! error geocoding '{query}': {exc}")
            result = None
        time.sleep(1.1)  # Nominatim usage policy: max 1 req/sec
        if result:
            lat, lon = result
            entry["lat"] = lat
            entry["lon"] = lon
            entry["geocodePrecision"] = precision
            entry["municipality"] = municipality
            return entry

    entry["lat"] = None
    entry["lon"] = None
    entry["geocodePrecision"] = "failed"
    entry["municipality"] = municipality
    return entry


def main():
    raw = json.load(open(RAW_PATH, encoding="utf-8"))
    results = []
    for i, entry in enumerate(raw, 1):
        geocoded = geocode(entry)
        status = geocoded["geocodePrecision"]
        print(f"[{i}/{len(raw)}] {entry['name'][:40]:40s} -> {status}")
        results.append(geocoded)

    json.dump(results, open(OUT_PATH, "w", encoding="utf-8"), indent=2, ensure_ascii=False)

    precisions = {}
    for r in results:
        precisions[r["geocodePrecision"]] = precisions.get(r["geocodePrecision"], 0) + 1
    print("\nDone. Precision breakdown:", precisions)
    print(f"Wrote {len(results)} entries to {OUT_PATH}")


if __name__ == "__main__":
    main()
