import { Schema, model, type InferSchemaType } from "mongoose";

type CampusSchemaProperties = InferSchemaType<typeof CampusSchema>;

const CampusSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        sectorIds: {
            type: [String],
            required: true,
        },
    },
    { versionKey: false },
);

const Campus = model("Campus", CampusSchema);

export { Campus, type CampusSchemaProperties };
