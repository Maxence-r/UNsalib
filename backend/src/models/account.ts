import { Schema, model } from "mongoose";

const AccountSchema = Schema({
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
    },
    icon: {
        type: String,
        default: "",
    },
});

const Account = model("Account", AccountSchema);
export default Account;
