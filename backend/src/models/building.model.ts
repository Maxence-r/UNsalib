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
            // The building is assigned to the first campus 
            // where it appears
        },
        alias: {
            type: String,
        },
    },
    { versionKey: false },
);

const Building = model("Building", BuildingSchema);

export { Building, type BuildingSchemaProperties };
