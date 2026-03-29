import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
    extractCoursesFromCelcatXml,
    extractCoursesFromUnivJson,
    extractGroupsFromCelcatHtml,
    extractGroupsFromUnivHtml,
} from "./extractors.js";
import { dataConfig } from "configs/data.config.js";

await describe("extractors", async () => {
    const univPageResponse = await fetch(
        `${dataConfig.baseUrl}/sciences/educational_groups`,
    );
    const celcatPageResponse = await fetch(
        `${dataConfig.baseUrlCelcat}/sciences/gindex.html`,
    );

    const celcatGroups = extractGroupsFromCelcatHtml(
        await celcatPageResponse.text(),
    );
    const univGroups = extractGroupsFromUnivHtml(await univPageResponse.text());

    await test("groups extraction", async (t) => {
        await t.test("should extract more than one group", () => {
            assert.equal(univGroups.length > 0, true);
        });

        await t.test("should extract more than one group (Celcat)", () => {
            assert.equal(celcatGroups.length > 0, true);
        });

        await t.test("should extract the same groups as Celcat", () => {
            assert.deepEqual(
                univGroups.map((g) => g.name).sort(),
                celcatGroups.map((g) => g.name).sort(),
            );
        });
    });

    await test("courses extraction", async (t) => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const startTestDate =
            currentMonth > 8
                ? new Date(currentYear, 10, 2)
                : new Date(currentYear, 1, 2);
        const endTestDate = new Date(
            currentYear,
            startTestDate.getMonth() + 1,
            startTestDate.getDate(),
        );

        console.log(startTestDate, endTestDate);

        const univResponse = await fetch(
            `${dataConfig.baseUrl}/events?start=${startTestDate.toISOString().split("T")[0]}&end=${endTestDate.toISOString().split("T")[0]}&timetables%5B%5D=${univGroups.find((g) => g.name === "M1ALMA")?.univId}`,
        );
        const celcatResponse = await fetch(
            `${dataConfig.baseUrlCelcat}/sciences/g${celcatGroups.find((g) => g.name === "M1ALMA")?.celcatId}.xml`,
        );

        const celcatCourses = (
            await extractCoursesFromCelcatXml(await celcatResponse.text())
        ).filter((c) => c.start >= startTestDate && c.end <= endTestDate);
        const univCourses = extractCoursesFromUnivJson(
            await univResponse.text(),
        );

        await t.test("should extract more than one course", () => {
            assert.equal(univCourses.length > 0, true);
        });

        await t.test("should extract more than one course (Celcat)", () => {
            assert.equal(celcatCourses.length > 0, true);
        });

        await t.test("should extract courses with more than one room", () => {
            assert.equal(univCourses.filter((c) => c.rooms.length > 0).length > 0, true);
        });

        await t.test("should extract courses with more than one room (Celcat)", () => {
            assert.equal(celcatCourses.filter((c) => c.rooms.length > 0).length > 0, true);
        });

        await t.test("should extract courses with more than one teacher", () => {
            assert.equal(univCourses.filter((c) => c.teachers.length > 0).length > 0, true);
        });

        await t.test("should extract courses with more than one teacher (Celcat)", () => {
            assert.equal(celcatCourses.filter((c) => c.teachers.length > 0).length > 0, true);
        });

        await t.test("should extract courses with more than one module", () => {
            assert.equal(univCourses.filter((c) => c.modules.length > 0).length > 0, true);
        });

        await t.test("should extract courses with more than one module (Celcat)", () => {
            assert.equal(celcatCourses.filter((c) => c.modules.length > 0).length > 0, true);
        });

        await t.test("should extract the same courses as Celcat", () => {
            assert.deepEqual(
                univCourses
                    .map((c) => ({
                        celcatId: c.celcatId,
                        start: c.start,
                        end: c.end,
                        category: c.category,
                        roomsNumber: c.rooms.length,
                        teachers: c.teachers.sort(),
                        modules: c.modules.sort(),
                    }))
                    .filter((c) => c.category !== "Indisponible")
                    .sort((a, b) => {
                        if (a.celcatId > b.celcatId) return 1;
                        if (b.celcatId > a.celcatId) return -1;
                        return 0;
                    }),
                celcatCourses
                    .map((c) => ({
                        celcatId: c.celcatId,
                        start: c.start,
                        end: c.end,
                        category: c.category,
                        roomsNumber: c.rooms.length,
                        teachers: c.teachers.sort(),
                        modules: c.modules.sort(),
                    }))
                    .sort((a, b) => {
                        if (a.celcatId > b.celcatId) return 1;
                        if (b.celcatId > a.celcatId) return -1;
                        return 0;
                    }),
            );
        });
    });
});
