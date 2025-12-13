import jwt from "jsonwebtoken";
import { compare } from "bcrypt";

import { Account } from "../models/account.model.js";
import { config } from "../configs/app.config.js";
import { Token } from "models/token.model.js";
import { ApiError } from "middlewares/error.middleware.js";

class AccountsService {
    /**
     * Login user
     */
    async login(
        username: string,
        password: string,
    ): Promise<{
        account: {
            id: string;
            username: string;
            name: string;
            lastname: string;
        };
        accessToken: string;
        refreshToken: string;
    }> {
        // Check username and password
        const account = await Account.findOne({ username }).select("+password");
        if (!account) {
            throw new ApiError(401, "Invalid credentials");
        }

        const isValid = await compare(password, account.password);
        if (!isValid) {
            throw new ApiError(401, "Invalid credentials");
        }

        // We generate a new refresh and access token
        const accessToken = account.generateAccessToken();
        const refreshToken = account.generateRefreshToken();

        await Token.create({
            accountId: account._id,
            token: refreshToken,
            issuedAt: new Date(),
            // Seconds to milliseconds
            expiresAt: new Date(Date.now() + config.jwt.refreshExpire * 1000),
        });

        return {
            account: {
                id: account._id.toString(),
                username: account.username,
                name: account.name,
                lastname: account.lastname,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Generate a new access token and rotate the refresh token
     */
    async refreshTokens(oldToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        // Check JWT signature
        jwt.verify(oldToken, config.jwt.refreshSecret);

        // Search our DB for the stored refresh token and its corresponding account
        const savedToken = await Token.findOne({ token: oldToken });
        if (!savedToken || savedToken.revoked) {
            throw new ApiError(401, "Invalid or revoked refresh token");
        }

        const account = await Account.findOne({ _id: savedToken.accountId });
        if (!account) {
            throw new ApiError(401, "No account found for this refresh token");
        }

        // If the token was already used, it may be a replay attack
        if (savedToken.used) {
            // Invalidate all refresh tokens for this user
            await Token.updateMany(
                { accountId: savedToken.accountId },
                { revoked: true },
            );
            throw new ApiError(401, "Refresh token already used");
        }

        // Else we mark it as used
        savedToken.used = true;
        await savedToken.save();

        // We generate a new refresh and access token
        const accessToken = account.generateAccessToken();
        const refreshToken = account.generateRefreshToken();

        // Save the new refresh token
        await Token.create({
            accountId: account._id,
            token: refreshToken,
            issuedAt: new Date(),
            // Seconds to milliseconds
            expiresAt: new Date(Date.now() + config.jwt.refreshExpire * 1000),
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Logout user
     */
    async logout(refreshToken: string): Promise<void> {
        await Token.updateOne({ token: refreshToken }, { revoked: true });
    }
}

const accountsService = new AccountsService();

export { accountsService };
