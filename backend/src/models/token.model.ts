import { Schema, model, type InferSchemaType } from "mongoose";

type TokenSchemaProperties = InferSchemaType<typeof TokenSchema>;

const TokenSchema = new Schema({
    accountId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    issuedAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    used: {
        type: Boolean,
        required: false,
        default: false,
    },
    revoked: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const Token = model("Token", TokenSchema);

export { Token, type TokenSchemaProperties };
