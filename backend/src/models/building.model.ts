import { Schema, model, type InferSchemaType } from "mongoose";

type BuildingSchemaProperties = InferSchemaType<typeof BuildingSchema>;

const BuildingSchema = new Schema(
    {
        campus: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: true,
        },
        univName: {
            type: String,
            required: true,
        },
        alias: {
            type: String,
            required: false,
        },
        reviewed: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { versionKey: false },
);

const Building = model("Building", BuildingSchema);

export { Building, type BuildingSchemaProperties };
