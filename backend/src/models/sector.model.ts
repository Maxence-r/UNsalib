import { Schema, model, type InferSchemaType } from "mongoose";

type SectorSchemaProperties = InferSchemaType<typeof SectorSchema>;

const SectorSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        univId: {
            type: String,
            required: true,
        },
        celcatId: {
            type: String,
            // some sectors don't have a Celcat timetable
        },
        campusId: {
            type: String,
            ref: "Campus",
            required: true,
        },
    },
    { versionKey: false },
);

const Sector = model("Sector", SectorSchema);

export { Sector, type SectorSchemaProperties };
