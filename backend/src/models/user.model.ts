import { Schema, model, type InferSchemaType } from "mongoose";

type UserSchemaProperties = InferSchemaType<typeof UserSchema>;

const UserSchema = new Schema({
    os: {
        type: String,
        required: false,
    },
    browser: {
        type: String,
        required: false,
    },
    device: {
        type: String,
        required: false,
    },
    isBot: {
        type: Boolean,
        required: false,
    },
    lastActivity: {
        type: Date,
        required: true,
    },
});

const User = model("User", UserSchema);

export { User, type UserSchemaProperties };
