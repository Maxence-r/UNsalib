import { Schema, model, type InferSchemaType } from "mongoose";

type CampusSchemaProperties = InferSchemaType<typeof CampusSchema>;

const CampusSchema = new Schema(
    {
        _id: {
            type: String,
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
