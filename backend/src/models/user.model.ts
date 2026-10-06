import { Schema, model, type InferSchemaType } from "mongoose";

type UserSchemaProperties = InferSchemaType<typeof UserSchema>;

const UserSchema = new Schema(
    {
        os: {
            type: String,
        },
        browser: {
            type: String,
        },
        device: {
            type: String,
        },
        isBot: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    { versionKey: false },
);

const User = model("User", UserSchema);

export { User, type UserSchemaProperties };
