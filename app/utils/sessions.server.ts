import bcrypt from 'bcrypt';
import { createCookieSessionStorage, redirect } from 'remix';
import { db } from '~/utils/db.server';

import type { User as _User } from '@prisma/client';

export type User = _User;

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
    if (!userId || typeof userId !== 'string') throw redirect('/auth/login');
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
    return redirect('/auth/login', {
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
