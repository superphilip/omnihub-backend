import jwt from 'jsonwebtoken'; 
import type { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || "default_secret_key_change_in_production";
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_change_in_production";

const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '15d') as SignOptions['expiresIn'];

export interface TokenPayload {
    userId: string;
    userName: string;
    roleId: string;
}

export interface DecodedToken extends TokenPayload {
    iat: number;
    exp: number;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): DecodedToken => {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

export const verifyRefreshToken = (token: string): DecodedToken => {
    return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
};

export const generateTokenPair = (payload: TokenPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwt.decode(token) as DecodedToken;
    } catch {
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        return Date.now() >= decoded.exp * 1000;
    } catch {
        return true;
    }
};