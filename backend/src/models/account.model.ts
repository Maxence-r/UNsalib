import { Schema, Types, model, type InferSchemaType } from "mongoose";
import jwt from "jsonwebtoken";

import { config } from "configs/app.config.js";

type AccountSchemaProperties = InferSchemaType<typeof AccountSchema>;

const AccountSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 30,
    },
    lastname: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 30,
    },
    username: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        select: false, // Don't return password by default
    },
    icon: {
        type: String,
        default: "",
    },
});

// Generate access token
AccountSchema.methods.generateAccessToken = function (
    this: AccountSchemaProperties & {
        _id: Types.ObjectId;
    },
): string {
    return jwt.sign({ sub: this._id }, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpire,
    });
};

// Generate refresh token
AccountSchema.methods.generateRefreshToken = function (
    this: AccountSchemaProperties & {
        _id: Types.ObjectId;
    },
): string {
    return jwt.sign({ sub: this._id }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpire,
    });
};

interface AccountSchemaWithMethods extends AccountSchemaProperties {
    generateAccessToken: () => string;
    generateRefreshToken: () => string;
}

const Account = model<AccountSchemaWithMethods>("Account", AccountSchema);

export { Account, type AccountSchemaProperties };
