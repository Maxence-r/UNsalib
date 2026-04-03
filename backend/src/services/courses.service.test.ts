import assert from "node:assert/strict";
import { describe, test, before, after } from "node:test";
import { connect } from "mongoose";

import { coursesService } from "./courses.service.js";
import { Course, CourseSchemaProperties } from "models/course.model.js";
import { getHexHashFromString } from "utils/misc.js";
import { findClosestPaletteColorId } from "utils/color.js";

const testData1__normalized = [
    {
        celcatId: 1,
        category: "Test Category",
        start: new Date(2026, 0, 1, 8),
        end: new Date(2026, 0, 1, 9),
        color: "#ff0000",
        rooms: ["TestRoom"],
        teachers: ["Jean Dupont"],
        groups: ["TestGroup"],
        modules: ["TestModule"],
    },
    {
        celcatId: 2,
        start: new Date(2026, 0, 2, 8),
        end: new Date(2026, 0, 2, 9),
        color: "#ff0000",
        rooms: ["TestRoom"],
        teachers: [],
        groups: ["TestGroup"],
        modules: [],
    },
    {
        celcatId: 3,
        category: "Test Category 1",
        start: new Date(2026, 0, 3, 8),
        end: new Date(2026, 0, 3, 9),
        color: "#ff0000",
        rooms: ["TestRoom1", "TestRoom2"],
        teachers: ["Jean Dupont", "Micheline Durand", "Marcel Dupond"],
        groups: ["TestGroup", "TestGroup2"],
        modules: ["TestModule1", "TestModule2", "TestModule3"],
    },
];

const testData1__db = testData1__normalized.map((c) => ({
    celcatId: c.celcatId,
    ...(c.category && { category: c.category }),
    start: c.start,
    end: c.end,
    teachers: c.teachers,
    modules: c.modules,
    roomIds: c.rooms.map((r) => getHexHashFromString(r)),
    groupIds: c.groups,
    colorId: findClosestPaletteColorId(c.color),
}));

const testData2__normalized = [
    {
        celcatId: 2231220,
        category: "Indisponible",
        start: new Date("2026-06-02T05:30:00.000Z"),
        end: new Date("2026-06-02T20:00:00.000Z"),
        color: "#ff0000",
        rooms: ["231 (Droit Bât A)"],
        teachers: [],
        groups: ["DU Classe Prépa Talents ENA/INET (IPAG)"],
        modules: [],
    },
];

const testData2__db = testData2__normalized.map((c) => ({
    celcatId: c.celcatId,
    ...(c.category && { category: c.category }),
    start: c.start,
    end: c.end,
    teachers: c.teachers,
    modules: c.modules,
    roomIds: c.rooms.map((r) => getHexHashFromString(r)),
    groupIds: c.groups,
    colorId: findClosestPaletteColorId(c.color),
}));

function getWithoutKeys<T extends { [key: string]: unknown }>(
    obj: T,
    keysToRemove: string[],
): T {
    for (const key of keysToRemove) {
        delete obj[key];
    }
    return structuredClone(obj);
}

function sortCourses<
    T extends { celcatId: number } & { [key: string]: unknown },
>(courses: T[]): T[] {
    courses.sort((a, b) => {
        if (a.celcatId > b.celcatId) return 1;
        if (a.celcatId < b.celcatId) return -1;
        return 0;
    });
    for (let i = 0; i < courses.length; i++) {
        for (const key of Object.keys(courses[i])) {
            if (Array.isArray(courses[i][key])) {
                (courses[i][key] as unknown[]).sort();
            }
        }
    }
    return courses;
}

async function setupDb(data: Omit<CourseSchemaProperties, "createdAt" | "updatedAt">[]): Promise<void> {
    await Course.deleteMany();
    for (const course of data) {
        await new Course(course).save();
    }
}

await describe("courses service", async () => {
    let conn: typeof import("mongoose");

    before(async () => {
        conn = await connect("mongodb://localhost:27017/unsalib-test");
        await Course.deleteMany();
    });

    await test("courses sync", async (t) => {
        await t.test("process", async (t) => {
            await t.test(
                "should not add anything nor throw an error",
                async () => {
                    await coursesService.processGroupCourses(
                        [],
                        [],
                        "Test Group",
                        "Test Campus",
                    );
                    assert((await Course.find()).length === 0);
                },
            );

            await t.test(
                "should remove 2 documents and update groups of 1 document",
                async () => {
                    await setupDb(testData1__db);
                    await coursesService.processGroupCourses(
                        [],
                        await Course.find(),
                        "TestGroup",
                        "Test Campus",
                    );
                    const docsAfter = await Course.find().lean();
                    assert.equal(docsAfter.length, 1);

                    assert.deepEqual(
                        getWithoutKeys(docsAfter[0], [
                            "_id",
                            "createdAt",
                            "updatedAt",
                        ]),
                        {
                            ...testData1__db[2],
                            groupIds: testData1__db[2].groupIds.filter(
                                (g) => g !== "TestGroup",
                            ),
                        },
                    );
                },
            );

            await t.test("should not update any document", async () => {
                await setupDb(testData1__db);
                await coursesService.processGroupCourses(
                    testData1__normalized,
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                let docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, testData1__db.length);

                assert.deepEqual(
                    sortCourses(
                        docsAfter.map((d) =>
                            getWithoutKeys(d, [
                                "_id",
                                "createdAt",
                                "updatedAt",
                            ]),
                        ),
                    ),
                    sortCourses(testData1__db),
                );

                await setupDb(testData2__db);
                await coursesService.processGroupCourses(
                    testData2__normalized,
                    await Course.find(),
                    "DU Classe Prépa Talents ENA/INET (IPAG)",
                    "Test Campus",
                );
                docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, testData2__db.length);

                assert.deepEqual(
                    sortCourses(
                        docsAfter.map((d) =>
                            getWithoutKeys(d, [
                                "_id",
                                "createdAt",
                                "updatedAt",
                            ]),
                        ),
                    ),
                    sortCourses(testData2__db),
                );
            });

            await t.test("should update a document modules", async () => {
                await setupDb(testData1__db);
                await coursesService.processGroupCourses(
                    testData1__normalized.map((v, i) =>
                        i === 0
                            ? { ...v, modules: [...v.modules, "AddedModule"] }
                            : v,
                    ),
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                const docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, testData1__db.length);

                assert.deepEqual(
                    sortCourses(
                        docsAfter.map((d) =>
                            getWithoutKeys(d, [
                                "_id",
                                "createdAt",
                                "updatedAt",
                            ]),
                        ),
                    ),
                    sortCourses(
                        testData1__db.map((v, i) =>
                            i === 0
                                ? {
                                      ...v,
                                      modules: [...v.modules, "AddedModule"],
                                  }
                                : v,
                        ),
                    ),
                );
            });

            await t.test("should update a document teachers", async () => {
                await setupDb(testData1__db);
                await coursesService.processGroupCourses(
                    testData1__normalized.map((v, i) =>
                        i === 0
                            ? {
                                  ...v,
                                  teachers: [...v.teachers, "Beatrice Jean"],
                              }
                            : v,
                    ),
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                const docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, testData1__db.length);

                assert.deepEqual(
                    sortCourses(
                        docsAfter.map((d) =>
                            getWithoutKeys(d, [
                                "_id",
                                "createdAt",
                                "updatedAt",
                            ]),
                        ),
                    ),
                    sortCourses(
                        testData1__db.map((v, i) =>
                            i === 0
                                ? {
                                      ...v,
                                      teachers: [
                                          ...v.teachers,
                                          "Beatrice Jean",
                                      ],
                                  }
                                : v,
                        ),
                    ),
                );
            });

            await t.test("should update a document rooms", async () => {
                await setupDb(testData1__db);
                await coursesService.processGroupCourses(
                    testData1__normalized.map((v, i) =>
                        i === 0
                            ? {
                                  ...v,
                                  rooms: [...v.rooms, "Added Room"],
                              }
                            : v,
                    ),
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                const docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, testData1__db.length);

                assert.deepEqual(
                    sortCourses(
                        docsAfter.map((d) =>
                            getWithoutKeys(d, [
                                "_id",
                                "createdAt",
                                "updatedAt",
                            ]),
                        ),
                    ),
                    sortCourses(
                        testData1__db.map((v, i) =>
                            i === 0
                                ? {
                                      ...v,
                                      roomIds: [
                                          ...v.roomIds,
                                          getHexHashFromString("Added Room"),
                                      ],
                                  }
                                : v,
                        ),
                    ),
                );
            });
        });
    });

    after(async () => {
        await conn.connection.db?.dropDatabase();
        await conn.connection.close();
    });
});
