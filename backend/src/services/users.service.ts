import { UAParser } from "ua-parser-js";
import { isBot, isAIBot } from "ua-parser-js/helpers";
import { isValidObjectId } from "mongoose";

import { User } from "models/user.model.js";

class UsersService {
    /**
     * Save a new user and return its UUID
     */
    async addNew(lastActivity: Date, userAgent: string): Promise<string> {
        const userInfos: {
            lastActivity: Date;
            os?: string;
            browser?: string;
            device?: string;
            isBot?: boolean;
        } = { lastActivity: lastActivity };

        const parsingResults = UAParser(userAgent);
        const bot = isBot(userAgent) || isAIBot(userAgent);

        if (
            bot ||
            (!parsingResults.browser.name &&
                !parsingResults.os.name &&
                !!parsingResults.device.type)
        ) {
            userInfos.isBot = true;
        } else {
            if (parsingResults.browser.name)
                userInfos.browser = parsingResults.browser.name;
            if (parsingResults.os.name) userInfos.os = parsingResults.os.name;
            if (parsingResults.device.type)
                userInfos.device = parsingResults.device.type;
        }

        return (await User.create(userInfos))._id.toString();
    }

    /**
     * Check if the database contains a user with the given UUID
     */
    async isValidUser(uuid: string): Promise<boolean> {
        if (isValidObjectId(uuid)) {
            if (await User.findById(uuid)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Update the lastActivity field of a valid user
     */
    async updateLastActivity(uuid: string, lastActivity: Date): Promise<void> {
        // Handle invalid UUID: if no document with the corresponding UUID is
        // found, nothing is done and there is no error
        if (isValidObjectId(uuid)) {
            await User.findOneAndUpdate(
                { _id: uuid },
                { lastActivity: lastActivity },
                {},
            );
        }
    }
}

const usersService = new UsersService();

export { usersService };
