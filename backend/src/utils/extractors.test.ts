import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
    extractGroupsFromCelcatHtml,
    extractGroupsFromUnivHtml,
} from "./extractors.js";
import { dataConfig } from "configs/data.config.js";

await describe("extractors", async () => {
    await test("groups extraction", async (t) => {
        const univPageResponse = await fetch(
            `${dataConfig.baseUrl}/sciences/educational_groups`,
        );
        const celcatPageResponse = await fetch(
            `${dataConfig.baseUrlCelcat}/sciences/gindex.html`,
        );

        const celcatGroups = extractGroupsFromCelcatHtml(
            await celcatPageResponse.text(),
        );
        const univGroups = extractGroupsFromUnivHtml(
            await univPageResponse.text(),
        );

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
});
