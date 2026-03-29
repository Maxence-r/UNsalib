import assert from "node:assert/strict";
import { describe, test, before, after } from "node:test";
import { connect } from "mongoose";

import { coursesService } from "./courses.service.js";
import { Course } from "models/course.model.js";

const processTestData = [
    {
        celcatId: 1000,
        category: "Test Category",
        start: new Date(2026, 0, 1, 8),
        end: new Date(2026, 0, 1, 9),
        colorRef: "#ff7675",
        roomIds: ["TestRoom"],
        teachers: ["Jean Dupont"],
        groupIds: ["TestGroup"],
        modules: ["TestModule"],
    },
    {
        celcatId: 2000,
        start: new Date(2026, 0, 2, 8),
        end: new Date(2026, 0, 2, 9),
        colorRef: "#ff7675",
        roomIds: ["TestRoom"],
        teachers: [],
        groupIds: ["TestGroup"],
        modules: [],
    },
    {
        celcatId: 3000,
        category: "Test Category 1",
        start: new Date(2026, 0, 3, 8),
        end: new Date(2026, 0, 3, 9),
        colorRef: "#ff7675",
        roomIds: ["TestRoom1", "TestRoom2"],
        teachers: ["Jean Dupont", "Micheline Durand", "Marcel Dupond"],
        groupIds: ["TestGroup", "TestGroup2"],
        modules: ["TestModule1", "TestModule2", "TestModule3"],
    },
];

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

async function setupProcess(): Promise<void> {
    await Course.deleteMany();
    for (const course of processTestData) {
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
                    await setupProcess();
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
                            ...processTestData[2],
                            groupIds: processTestData[2].groupIds.filter(
                                (g) => g !== "TestGroup",
                            ),
                        },
                    );
                },
            );

            await t.test("should not update any document", async () => {
                await setupProcess();
                await coursesService.processGroupCourses(
                    processTestData.map((c) => ({
                        color: c.colorRef,
                        rooms: c.roomIds,
                        ...c,
                    })),
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                const docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, processTestData.length);

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
                    sortCourses(processTestData),
                );
            });

            await t.test("should update a document modules", async () => {
                const processTestDataWithNewModule = structuredClone(processTestData);
                (processTestDataWithNewModule[0].modules as string[]).push(
                    "AddedModule",
                );
                await coursesService.processGroupCourses(
                    processTestDataWithNewModule.map((c) => ({
                        color: c.colorRef,
                        rooms: c.roomIds,
                        ...c,
                    })),
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                const docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, processTestData.length);

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
                    sortCourses(processTestDataWithNewModule),
                );
            });

            await t.test("should update a document teachers", async () => {
                const processTestDataWithNewTeacher = structuredClone(processTestData);
                (processTestDataWithNewTeacher[0].teachers as string[]).push(
                    "AddedTeacher",
                );
                await coursesService.processGroupCourses(
                    processTestDataWithNewTeacher.map((c) => ({
                        color: c.colorRef,
                        rooms: c.roomIds,
                        ...c,
                    })),
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                const docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, processTestData.length);

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
                    sortCourses(processTestDataWithNewTeacher),
                );
            });

            await t.test("should update a document rooms", async () => {
                const processTestDataWithNewRoom = structuredClone(processTestData);
                processTestDataWithNewRoom[0].roomIds.push("AddedRoom");
                await coursesService.processGroupCourses(
                    processTestDataWithNewRoom.map((c) => ({
                        color: c.colorRef,
                        rooms: c.roomIds,
                        ...c,
                    })),
                    await Course.find(),
                    "TestGroup",
                    "Test Campus",
                );
                const docsAfter = await Course.find().lean();
                assert.equal(docsAfter.length, processTestData.length);

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
                    sortCourses(processTestDataWithNewRoom),
                );
            });
        });
    });

    after(async () => {
        await conn.connection.db?.dropDatabase();
        await conn.connection.close();
    });
});
