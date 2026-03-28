import assert from "node:assert/strict";
import { describe, test, before, after } from "node:test";
import { connect } from "mongoose";

// import {
//     extractGroupsFromTimetablePage,
//     processExtractedGroups,
// } from "./groups.js";
// import { Campus } from "models/campus.model.js";
import { Group } from "models/group.model.js";
import { groupsService } from "./groups.service.js";

await describe("groups service", async () => {
    let conn: typeof import("mongoose");

    before(async () => {
        conn = await connect("mongodb://localhost:27017/unsalib-test");
    });

    await test("groups extraction", async (t) => {
        await t.test("merge", async (t) => {
            await t.test("should return an empty array", () => {
                assert.deepEqual(groupsService.mergeExtracted([], []), []);
            });

            await t.test("should return the Celcat array", () => {
                const celcatArray = [{ name: "Gp", celcatId: 1234 }];
                assert.deepEqual(
                    groupsService.mergeExtracted(celcatArray, []),
                    celcatArray,
                );
            });

            await t.test("should return the univ array", () => {
                const univArray = [{ name: "Gp", univId: 1234 }];
                assert.deepEqual(
                    groupsService.mergeExtracted([], univArray),
                    univArray,
                );
            });

            await t.test("should perfectly merge the two arrays", () => {
                const celcatArray = [{ name: "Gp", celcatId: 1234 }];
                const univArray = [{ name: "Gp", univId: 5678 }];
                const mergedArray = [
                    { name: "Gp", celcatId: 1234, univId: 5678 },
                ];
                assert.deepEqual(
                    groupsService.mergeExtracted(celcatArray, univArray),
                    mergedArray,
                );
            });

            await t.test(
                "should merge the two arrays and add the additionnal Celcat groups",
                () => {
                    const celcatArray = [
                        { name: "Gp", celcatId: 1234 },
                        { name: "Gp2", celcatId: 4321 },
                    ];
                    const univArray = [{ name: "Gp", univId: 5678 }];
                    const mergedArray = [
                        { name: "Gp", celcatId: 1234, univId: 5678 },
                        { name: "Gp2", celcatId: 4321 },
                    ];
                    assert.deepEqual(
                        groupsService.mergeExtracted(celcatArray, univArray),
                        mergedArray,
                    );
                },
            );

            await t.test(
                "should merge the two arrays and add the additionnal univ groups",
                () => {
                    const celcatArray = [{ name: "Gp", celcatId: 1234 }];
                    const univArray = [
                        { name: "Gp", univId: 5678 },
                        { name: "Gp2", univId: 8765 },
                    ];
                    const mergedArray = [
                        { name: "Gp", celcatId: 1234, univId: 5678 },
                        { name: "Gp2", univId: 8765 },
                    ];
                    assert.deepEqual(
                        groupsService.mergeExtracted(celcatArray, univArray),
                        mergedArray,
                    );
                },
            );

            await t.test(
                "should merge the two arrays and add the additionnal univ and Celcat groups",
                () => {
                    const celcatArray = [
                        { name: "Gp", celcatId: 1234 },
                        { name: "Gp2", celcatId: 4321 },
                    ];
                    const univArray = [
                        { name: "Gp", univId: 5678 },
                        { name: "Gp3", univId: 8765 },
                    ];
                    const mergedArray = [
                        { name: "Gp", celcatId: 1234, univId: 5678 },
                        { name: "Gp3", univId: 8765 },
                        { name: "Gp2", celcatId: 4321 },
                    ];
                    assert.deepEqual(
                        groupsService.mergeExtracted(celcatArray, univArray),
                        mergedArray,
                    );
                },
            );
        });

        await t.test("process", async (t) => {
            await new Group({
                _id: "Gp1",
                celcatId: 1234,
                univId: 5678,
                sectorId: "sec",
            }).save();
            await new Group({
                _id: "Gp2",
                celcatId: 4321,
                sectorId: "sec",
            }).save();
            await new Group({
                _id: "Gp3",
                univId: 8765,
                sectorId: "sec",
            }).save();

            await t.test("should not add or update any group", async () => {
                const mergedGroups = [
                    { name: "Gp1", celcatId: 1234, univId: 5678 },
                    { name: "Gp2", celcatId: 4321 },
                    { name: "Gp3", univId: 8765 },
                ];

                const result = await groupsService.processMergedGroups(
                    "sec",
                    await Group.find({}),
                    mergedGroups,
                );

                assert.equal(result.added, 0);
                assert.equal(result.updated, 0);
                assert.equal(result.existingGroups.length, 0);
                assert.equal((await Group.find({})).length, 3);
            });

            await t.test("should add 3 groups", async () => {
                const mergedGroups = [
                    { name: "Gp1", celcatId: 1234, univId: 5678 },
                    { name: "Gp2", celcatId: 4321 },
                    { name: "Gp3", univId: 8765 },
                    { name: "Gp4", celcatId: 3421, univId: 7856 },
                    { name: "Gp5", celcatId: 2143 },
                    { name: "Gp6", univId: 6587 },
                ];

                const result = await groupsService.processMergedGroups(
                    "sec",
                    await Group.find({}),
                    mergedGroups,
                );

                assert.equal(result.added, 3);
                assert.equal(result.updated, 0);
                assert.equal(result.existingGroups.length, 0);
                assert.equal((await Group.find({})).length, 6);
            });

            await t.test("should update 3 groups", async () => {
                const mergedGroups = [
                    { name: "Gp1", celcatId: 1234, univId: 5678 },
                    { name: "Gp2", celcatId: 4321 },
                    { name: "Gp3", univId: 8765 },
                    { name: "Gp4", celcatId: 7856, univId: 3421 },
                    { name: "Gp5", celcatId: 6587 },
                    { name: "Gp6", univId: 2143 },
                ];

                const result = await groupsService.processMergedGroups(
                    "sec",
                    await Group.find({}),
                    mergedGroups,
                );

                assert.equal(result.added, 0);
                assert.equal(result.updated, 3);
                assert.equal(result.existingGroups.length, 0);
                assert.deepEqual(
                    (await Group.findOne({ _id: "Gp4" }))?.toObject(),
                    {
                        _id: "Gp4",
                        celcatId: 7856,
                        univId: 3421,
                        sectorId: "sec",
                    },
                );
                assert.deepEqual(
                    (await Group.findOne({ _id: "Gp5" }))?.toObject(),
                    {
                        _id: "Gp5",
                        celcatId: 6587,
                        sectorId: "sec",
                    },
                );
                assert.deepEqual(
                    (await Group.findOne({ _id: "Gp6" }))?.toObject(),
                    {
                        _id: "Gp6",
                        univId: 2143,
                        sectorId: "sec",
                    },
                );
                assert.equal((await Group.find({})).length, 6);
            });
        });
    });

    after(async () => {
        await conn.connection.db?.dropDatabase();
        await conn.connection.close();
    });
});
