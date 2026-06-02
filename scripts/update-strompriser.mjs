/**
 * Fetches monthly average spot prices from hvakosterstrommen.no (free, no API key)
 * and updates public/data/strompriser.json.
 *
 * Run manually:  node scripts/update-strompriser.mjs
 * Run for year:  node scripts/update-strompriser.mjs 2026
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dir, "../public/data/strompriser.json");
const ZONE = "NO3";

async function fetchDayPrices(year, month, day) {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${m}-${d}_${ZONE}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const avg = data.reduce((s, h) => s + (h.NOK_per_kWh ?? 0), 0) / data.length;
    return Math.round(avg * 1000) / 1000;
  } catch {
    return null;
  }
}

async function getMonthlyAverage(year, month) {
  const days = new Date(year, month, 0).getDate(); // days in month
  const prices = [];
  for (let d = 1; d <= days; d++) {
    const p = await fetchDayPrices(year, month, d);
    if (p !== null) prices.push(p);
    // Brief pause to be polite to the API
    await new Promise((r) => setTimeout(r, 50));
  }
  if (prices.length < days * 0.8) return null; // need at least 80% of days
  return Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 1000) / 1000;
}

async function main() {
  const now = new Date();
  const targetYear = parseInt(process.argv[2] ?? now.getFullYear());
  const currentMonth = now.getMonth() + 1; // 1-based

  console.log(`Updating spot prices for ${targetYear}, zone ${ZONE}...`);

  let data;
  try {
    data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch {
    data = { months: [] };
  }

  // Reset if year changed
  if (data.year !== targetYear) {
    data.year = targetYear;
    data.months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: ["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"][i],
      spotAvg: null,
      norgespris: 0.40,
    }));
  }

  // Fetch all completed months (those before the current month)
  for (const entry of data.months) {
    const isPastMonth = targetYear < now.getFullYear() ||
      (targetYear === now.getFullYear() && entry.month < currentMonth);

    if (!isPastMonth) {
      // Future month: ensure norgespris default, clear spot
      entry.spotAvg = null;
      entry.norgespris = 0.40;
      continue;
    }

    // Past month: fetch if we don't have data yet
    if (entry.spotAvg !== null) {
      console.log(`  ${entry.name}: already have ${entry.spotAvg} kr/kWh — skipping`);
      continue;
    }

    console.log(`  ${entry.name}: fetching...`);
    const avg = await getMonthlyAverage(targetYear, entry.month);
    if (avg !== null) {
      entry.spotAvg = avg;
      console.log(`  ${entry.name}: ${avg} kr/kWh`);
    } else {
      console.log(`  ${entry.name}: could not fetch data`);
    }
  }

  data.lastUpdated = now.toISOString().slice(0, 10);
  data.zone = ZONE;
  data.note = "spotAvg = monthly average spot price in NOK/kWh (excl. VAT). Updated by GitHub Action.";

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log(`\nDone. Written to ${DATA_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
