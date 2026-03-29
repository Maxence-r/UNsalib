import { Schema, model, type InferSchemaType } from "mongoose";

type BuildingSchemaProperties = InferSchemaType<typeof BuildingSchema>;

const BuildingSchema = new Schema(
    {
        _id: {
            // We use the building name as an id
            type: String,
            required: true,
        },
        campusId: {
            type: String,
            ref: "Campus",
            required: true,
        },
        univName: {
            type: String,
            required: true,
        },
        alias: {
            type: String,
        },
    },
    { versionKey: false },
);

const Building = model("Building", BuildingSchema);

export { Building, type BuildingSchemaProperties };
