import SpotifyWebApi from 'spotify-web-api-node';
import type _SpotifyClient from 'spotify-web-api-node';
import { db } from './db.server';
import logger from './logger.server';
import { getUserId, logout } from './sessions.server';

/********************************************************
 * Types
 *********************************************************/
export type SpotifyClient = _SpotifyClient;
export type SpotifyCredentials = {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt: string; // ISO8601 timestamp
};

interface ITokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
}

/********************************************************
 * Setup
 *********************************************************/
const SCOPES = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-email',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-read',
    'user-read-recently-played',
    'user-follow-read'
];
const EXPIRES_IN_MARGIN_MS = 5 * 60 * 1000; // 15min

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectUri) {
    throw Error('Missing required SPOTIFY_* environment variables.');
}

const spotifyServerClient = new SpotifyWebApi({
    clientId,
    clientSecret,
    redirectUri
});

/********************************************************
 * Utils
 *********************************************************/
const formatCredentials = ({
    access_token,
    refresh_token,
    expires_in
}: ITokenResponse): SpotifyCredentials => {
    // Calcuate an ISO8601 timestamp for when the access token will expire.
    const expiresInMs = expires_in * 1000 - EXPIRES_IN_MARGIN_MS;
    const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

    return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt
    };
};

const refreshCredentials = async (credentials: SpotifyCredentials) => {
    const expiresAt = new Date(credentials.expiresAt);
    const now = new Date();
    if (expiresAt.getTime() >= now.getTime()) {
        logger.info('reusing spotify credentials', {
            expiresAt: expiresAt.toISOString(),
            now: now.toISOString()
        });
        return credentials;
    }

    const spotifyRefreshClient = new SpotifyWebApi({
        clientId,
        clientSecret,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken ? credentials.refreshToken : undefined
    });
    const { body } = await spotifyRefreshClient.refreshAccessToken();

    logger.info('refreshed spotify credentials', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString()
    });

    return formatCredentials(body);
};

/********************************************************
 * DB Interactions
 *********************************************************/
async function saveSpotifyCredentials(request: Request, credentials: SpotifyCredentials) {
    const userId = await getUserId(request);
    if (!userId) {
        throw logout(request); // TODO: See if there is a better way
    }

    return db.userSpotifyCredential.create({
        data: {
            userId,
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken as string,
            expiresAt: credentials.expiresAt
        }
    });
}

async function updateSpotifyCredentials(request: Request, credentials: SpotifyCredentials) {
    const userId = await getUserId(request);
    if (!userId) {
        throw logout(request);
    }

    const existingCredentials = db.userSpotifyCredential.findUnique({ where: { userId } });
    if (!existingCredentials) {
        return null;
    }

    return db.userSpotifyCredential.update({
        where: {
            userId
        },
        data: {
            accessToken: credentials.accessToken,
            expiresAt: credentials.expiresAt
        }
    });
}

async function getUserSpotifyCredentials(
    request: Request
): Promise<SpotifyCredentials | null> {
    const userId = await getUserId(request);
    if (!userId) {
        return null;
    }

    const credentials = await db.userSpotifyCredential.findUnique({ where: { userId } });
    if (!credentials) {
        return null;
    }

    return {
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken ? credentials.refreshToken : null,
        expiresAt: credentials.expiresAt.toISOString()
    };
}

/********************************************************
 * Authorization Flow and Client
 *********************************************************/
export const getAuthorizeUrl = () => {
    const state = 'FAKE'; // TODO: Make this change per request
    return spotifyServerClient.createAuthorizeURL(SCOPES, state, false);
};

export const completeSpotifyAuthorization = async (request: Request, code: string) => {
    try {
        // Complete the authorization flow after the user has granted access.
        const { body } = await spotifyServerClient.authorizationCodeGrant(code);
        const credentials = formatCredentials(body);

        // Save the user's credentials for future use and to prevent having to re-login.
        await saveSpotifyCredentials(request, credentials);
    } catch (error) {
        const message = 'failed to get spotify tokens';
        logger.error(message, { error });
        throw Error(message);
    }
};

export const getSpotifyClient = async (request: Request) => {
    // If the user has not linked their spotify account a client cannot be used
    const credentials = await getUserSpotifyCredentials(request);
    if (!credentials) {
        return null;
    }

    // Ensure credentials are valid and updated
    const refreshedCredentials = await refreshCredentials(credentials);
    await updateSpotifyCredentials(request, refreshedCredentials);

    // Return a spotofy client instance with valid credentials
    const client = new SpotifyWebApi({
        accessToken: refreshedCredentials.accessToken,
        refreshToken: refreshedCredentials.refreshToken
            ? refreshedCredentials.refreshToken
            : undefined
    });
    return client;
};
