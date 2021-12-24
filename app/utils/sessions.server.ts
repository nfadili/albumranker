import bcrypt from 'bcrypt';
import { createCookieSessionStorage, redirect } from 'remix';

import { db } from './db.server';

type SpotifyCredentials = {
    accessToken: string;
    refreshToken: string;
    expiresAt: string; // ISO8601 timestamp
};

type LoginForm = {
    username: string;
    password: string;
};

export async function register({ username, password }: LoginForm) {
    const passwordHash = await bcrypt.hash(password, 10);
    return db.user.create({
        data: { username, passwordHash }
    });
}

export async function login({ username, password }: LoginForm) {
    const user = await db.user.findUnique({ where: { username } });
    if (!user) return null;
    const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isCorrectPassword) return null;
    return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set');
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: 'albumranker',
        secure: true,
        secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true
    }
});

export function getUserSession(request: Request) {
    return getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get('userId');
    if (!userId || typeof userId !== 'string') return null;
    return userId;
}

export async function requireUserId(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get('userId');
    if (!userId || typeof userId !== 'string') throw redirect('/login');
    return userId;
}

export async function getUser(request: Request) {
    const userId = await getUserId(request);
    if (typeof userId !== 'string') return null;

    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        return user;
    } catch {
        throw logout(request);
    }
}

export async function logout(request: Request) {
    const session = await getSession(request.headers.get('Cookie'));
    return redirect('/login', {
        headers: { 'Set-Cookie': await destroySession(session) }
    });
}

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await getSession();
    session.set('userId', userId);
    return redirect(redirectTo, {
        headers: { 'Set-Cookie': await commitSession(session) }
    });
}

export async function saveSpotifyCredentials(request: Request, credentials: SpotifyCredentials) {
    const userId = await getUserId(request);
    if (!userId) {
        throw logout(request); // TODO: See if there is a better way
    }

    return db.userSpotifyCredentials.create({
        data: {
            userId,
            ...credentials
        }
    });
}

export async function updateSpotifyCredentials(request: Request, credentials: SpotifyCredentials) {
    const userId = await getUserId(request);
    if (!userId) {
        throw logout(request);
    }

    const existingCredentials = db.userSpotifyCredentials.findUnique({ where: { userId } });
    if (!existingCredentials) {
        return null;
    }

    return db.userSpotifyCredentials.update({
        where: {
            userId
        },
        data: {
            ...credentials
        }
    });
}

export async function getUserSpotifyCredentials(request: Request) {
    const userId = await getUserId(request);
    if (!userId) {
        return null;
    }

    const credentials = await db.userSpotifyCredentials.findUnique({ where: { userId } });
    return credentials;
}
