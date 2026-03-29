import { Schema, model, type InferSchemaType } from "mongoose";

import { coursesService } from "../services/courses.service.js";

type GroupSchemaProperties = InferSchemaType<typeof GroupSchema>;

const GroupSchema = new Schema(
    {
        _id: {
            // We use the group name as an id
            type: String,
            required: true,
        },
        univId: {
            type: Number,
        },
        celcatId: {
            type: Number,
        },
        sectorId: {
            type: String,
            ref: "Sector",
            required: true,
        },
    },
    { versionKey: false },
);

GroupSchema.pre(
    "save",
    { document: true },
    function () {
        // Check that at least one ID is defined
        if (!this.univId && !this.celcatId) {
            throw new Error("At least one ID must be defined")
        }
    },
);

GroupSchema.pre(
    "deleteOne",
    { document: true },
    async function () {
        // Clear group references from courses
        await coursesService.clearGroupReferences(this._id);
    },
);

const Group = model("Group", GroupSchema);

export { Group, type GroupSchemaProperties };
