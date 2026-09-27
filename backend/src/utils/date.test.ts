import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
    getDateFromTimestampString,
    getDateFromFrenchDatestring,
    getWeekInfos,
    setDateTimeFromTimestring,
    getBoundDates,
    getISODateString
} from "./date.js";

await describe("date", async () => {
    await test("getDateFromTimestampString", async (t) => {
        await t.test("invalid timestamp", () => {
            assert.throws(() => getDateFromTimestampString("not a date"));
        });

        await t.test("valid timestamp", () => {
            assert.deepStrictEqual(
                getDateFromTimestampString("1789201416707"),
                new Date(1789201416707),
            );
        });
    });

    await test("getDateFromFrenchDatestring", async (t) => {
        await t.test("invalid date", () => {
            assert.throws(() => getDateFromFrenchDatestring("not a date"));
            assert.throws(() => getDateFromFrenchDatestring("8614642962964"));
            assert.throws(() => getDateFromFrenchDatestring("12/55/2026"));
        });

        await t.test("valid date", () => {
            assert.deepStrictEqual(
                getDateFromFrenchDatestring("12/09/2026"),
                new Date(2026, 8, 12),
            );
        });
    });

    await test("setDateTimeFromTimestring", async (t) => {
        await t.test("invalid time string", () => {
            // General
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "111:111"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), ":"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "1:1"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "01:01:01"),
            );
            // Hours
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "01:"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), ":01"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "01:1"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "not a date"),
            );
            // Minutes
            assert.throws(() =>
                setDateTimeFromTimestring(
                    new Date(2026, 8, 12),
                    "01:not a minute",
                ),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "01:-1"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "01:60"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(
                    new Date(2026, 8, 12),
                    "not an hour:01",
                ),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "-1:01"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "1:01"),
            );
            assert.throws(() =>
                setDateTimeFromTimestring(new Date(2026, 8, 12), "24:01"),
            );
        });

        await t.test("valid date and time string", () => {
            assert.deepStrictEqual(
                setDateTimeFromTimestring(new Date(2026, 8, 12), "01:01"),
                new Date(2026, 8, 12, 1, 1),
            );
            assert.deepStrictEqual(
                setDateTimeFromTimestring(new Date(2026, 8, 12), "23:59"),
                new Date(2026, 8, 12, 23, 59),
            );
        });
    });

    await test("getBoundDates", async (t) => {
        await t.test("edge case", () => {
            const bounds = getBoundDates(0);
            assert.strictEqual(bounds.start.getDate(), bounds.end.getDate());
            assert.strictEqual(bounds.start.getMonth(), bounds.end.getMonth());
            assert.strictEqual(
                bounds.start.getFullYear(),
                bounds.end.getFullYear(),
            );
        });
    });

    await test("getISODateString", async (t) => {
        await t.test("misc", () => {
            assert.strictEqual(getISODateString(new Date(2026, 8, 12, 23, 59)), "2026-09-12");
            assert.strictEqual(getISODateString(new Date(2026, 8, 12)), "2026-09-12");
        });
    });

    await test("getWeekInfos", async (t) => {
        await t.test("correct Monday and Sunday of a week", () => {
            assert.deepStrictEqual(getWeekInfos(10, 2026), {
                start: new Date(2026, 2, 2),
                end: new Date(2026, 2, 8, 23, 59, 59),
                number: 10,
            });
        });

        await t.test("first and last supported week edge cases", () => {
            assert.deepStrictEqual(getWeekInfos(1, 2026), {
                start: new Date(2025, 11, 29),
                end: new Date(2026, 0, 4, 23, 59, 59),
                number: 1,
            });
            assert.deepStrictEqual(getWeekInfos(52, 2027), {
                start: new Date(2027, 11, 27),
                end: new Date(2028, 0, 2, 23, 59, 59),
                number: 52,
            });
            assert.deepStrictEqual(getWeekInfos(53, 2026), {
                start: new Date(2026, 11, 28),
                end: new Date(2027, 0, 3, 23, 59, 59),
                number: 53,
            });
        });

        await t.test("year is increased if weekIndex > max weeks of this year", () => {
            assert.deepStrictEqual(getWeekInfos(54, 2026), {
                start: new Date(2027, 0, 4),
                end: new Date(2027, 0, 10, 23, 59, 59),
                number: 1,
            });
        });
    });
});
