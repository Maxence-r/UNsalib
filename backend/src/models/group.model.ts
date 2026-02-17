import { Schema, model, type InferSchemaType } from "mongoose";
import { coursesService } from "../services/courses.service.js";

type GroupSchemaProperties = InferSchemaType<typeof GroupSchema>;

const GroupSchema = new Schema(
    {
        univId: {
            type: Number,
        },
        celcatId: {
            type: Number,
        },
        name: {
            type: String,
            required: true,
        },
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: true,
        },
    },
    { versionKey: false },
);

GroupSchema.pre(
    "deleteOne",
    { document: true, query: false },
    async function () {
        // Clear group references from courses
        await coursesService.clearGroupReferences(this._id);
    },
);

const Group = model("Group", GroupSchema);

export { Group, type GroupSchemaProperties };
