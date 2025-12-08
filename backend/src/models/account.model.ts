import { Schema, model, type InferSchemaType } from "mongoose";

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

const Account = model("Account", AccountSchema);

export { Account, type AccountSchemaProperties };
