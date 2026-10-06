import { UAParser } from "ua-parser-js";
import { isValidObjectId } from "mongoose";

import { User } from "../models/user.model.js";

class UsersService {
    /**
     * Save a new user and return its UUID
     */
    async addNew(userAgent: string): Promise<string> {
        const userInfos: {
            os?: string;
            browser?: string;
            device?: string;
        } = {};

        const parsingResults = UAParser(userAgent);
        if (parsingResults.browser.name)
            userInfos.browser = parsingResults.browser.name;
        if (parsingResults.os.name) userInfos.os = parsingResults.os.name;
        if (parsingResults.device.type)
            userInfos.device = parsingResults.device.type;

        return (await User.create(userInfos))._id.toString();
    }

    /**
     * Check if the database contains a user with the given UUID
     */
    async isValidUser(userId: string): Promise<boolean> {
        return isValidObjectId(userId) && !!(await User.findById(userId));
    }

    async setNotABot(userId: string): Promise<void> {
        await User.findOneAndUpdate({ _id: userId }, { isBot: false }, {});
    }

    async setFromQrCode(userId: string): Promise<void> {
        await User.findOneAndUpdate({ _id: userId }, { fromQrCode: true }, {});
    }
}

const usersService = new UsersService();

export { usersService };
