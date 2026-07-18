import {
    createHash,
    randomBytes,
} from 'node:crypto';

import jwt, {
    type JwtPayload,
    type SignOptions,
} from 'jsonwebtoken';

import { env } from '../../config/environment.js';

import {
    UserRole,
} from '../../generated/prisma/enums.js';

import {
    AUTH_CONSTANTS,
} from './auth.constants.js';

import type {
    AccessTokenClaims,
} from './auth.types.js';

function isAccessTokenClaims(
    payload: string | JwtPayload,
): payload is JwtPayload & AccessTokenClaims {
    if (typeof payload === 'string') {
        return false;
    }

    if (typeof payload.sub !== 'string') {
        return false;
    }

    return (
        payload.role === UserRole.ADMIN ||
        payload.role === UserRole.STAFF
    );
}

export function signAccessToken(
    claims: AccessTokenClaims,
): string {
    const options: SignOptions = {
        algorithm:
            AUTH_CONSTANTS.ACCESS_TOKEN_ALGORITHM,

        expiresIn:
            env.JWT_ACCESS_EXPIRES_IN as
                SignOptions['expiresIn'],

        subject: claims.sub,
    };

    return jwt.sign(
        {
            role: claims.role,
        },
        env.JWT_ACCESS_SECRET,
        options,
    );
}

export function verifyAccessToken(
    token: string,
): AccessTokenClaims {
    const payload = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET,
        {
            algorithms: [
                AUTH_CONSTANTS.ACCESS_TOKEN_ALGORITHM,
            ],
        },
    );

    if (!isAccessTokenClaims(payload)) {
        throw new Error(
            'Access token contains invalid claims.',
        );
    }

    return {
        sub: payload.sub,
        role: payload.role,
    };
}

export function generateOpaqueToken(): string {
    return randomBytes(
        AUTH_CONSTANTS.OPAQUE_TOKEN_BYTES,
    ).toString('hex');
}

export function hashOpaqueToken(
    token: string,
): string {
    return createHash('sha256')
        .update(token)
        .digest('hex');
}