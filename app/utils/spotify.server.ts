import SpotifyWebApi from 'spotify-web-api-node';
import logger from './logger.server';

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

const EXPIRES_IN_MARGIN_MS = 5 * 60 * 1000; // 5min

if (
    !process.env.SPOTIFY_REDIRECT_URI ||
    !process.env.SPOTIFY_CLIENT_ID ||
    !process.env.SPOTIFY_CLIENT_SECRET
) {
    throw Error('Missing required SPOTIFY_* environment variables.');
}

const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

export const getAuthorizeUrl = () => {
    const state = 'FAKE'; // TODO: Make this change per request
    return spotifyApi.createAuthorizeURL(SCOPES, state, false);
};

export const getSpotifyTokens = async (code: string) => {
    try {
        const {
            body: { access_token, refresh_token, expires_in }
        } = await spotifyApi.authorizationCodeGrant(code);

        // Calcuate an ISO8601 timestamp for when the access token will expire.
        const expiresInMs = expires_in * 1000 - EXPIRES_IN_MARGIN_MS;
        const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

        return {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt
        };
    } catch (error) {
        const message = 'failed to get spotify tokens';
        logger.error(message, { error });
        throw Error(message);
    }
};

export const getSpotifyClient = ({
    accessToken,
    refreshToken
}: {
    accessToken: string;
    refreshToken: string;
}): SpotifyWebApi => {
    const client = new SpotifyWebApi({ accessToken, refreshToken });
    return client;
};
