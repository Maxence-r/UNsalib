import assert from "node:assert/strict";
import { describe, test, before, after } from "node:test";
import { connect, Types } from "mongoose";

import {
    extractGroupsFromTimetablePage,
    processExtractedGroups,
} from "./groups.js";
import { Campus } from "models/campus.model.js";
import { Group, type GroupSchemaProperties } from "models/group.model.js";

await describe("groups processing", async () => {
    let conn: typeof import("mongoose");

    before(async () => {
        conn = await connect("mongodb://localhost:27017/unsalib-test");
    });

    await test("timetable page groups extraction", async (t) => {
        await t.test("should extract more than one group", async () => {
            const extractedGroups = await extractGroupsFromTimetablePage(
                "https://edt-v2.univ-nantes.fr/sciences/educational_groups",
            );

            assert.equal(extractedGroups.length > 0, true);
        });
    });

    await test("extracted groups processing", async (t) => {
        const campus = new Campus({ name: "Test" });
        await campus.save();

        let existingGroups: (GroupSchemaProperties & { _id: Types.ObjectId })[] = []

        await t.test("should add 3 groups", async () => {
            const results = await processExtractedGroups(
                campus._id,
                existingGroups,
                [
                    { name: "Group 1", id: "1" },
                    { name: "Group 2", id: "2" },
                    { name: "Group 3", id: "3" },
                ],
            );

            existingGroups = await Group.find({});

            assert.equal(results.added, 3);
            assert.equal(results.updated, 0);
            assert.equal(results.existingGroups.length, 0);
            assert.equal(existingGroups.length, 3);
        });

        await t.test("should add and update 0 group", async () => {
            const results = await processExtractedGroups(
                campus._id,
                existingGroups,
                [
                    { name: "Group 1", id: "1" },
                    { name: "Group 2", id: "2" },
                    { name: "Group 3", id: "3" },
                ],
            );

            const groups = await Group.find({});

            assert.equal(groups.length, 3);
            assert.equal(results.added, 0);
            assert.equal(results.updated, 0);
            assert.equal(results.existingGroups.length, 0);
        });
    });

    after(async () => {
        await conn.connection.db?.dropDatabase();
        await conn.connection.close();
    });
});
