import assert from "node:assert/strict";
import { describe, it } from "node:test";

await describe("example", async () => {
    await it("should be ok", () => {
        assert.ok(true);
    });
});
