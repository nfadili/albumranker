import { prisma } from '~/db.server';
import { getUser } from '~/session.server';
import { getSpotifyClient } from '~/spotify/auth.server';

import { redirect } from '@remix-run/node';

import type { User as _User } from '@prisma/client';
import type { UserSpotifyAlbum } from '~/types';

export type User = _User;

export async function isSpotifyAccountLinked(request: Request) {
    const client = await getSpotifyClient(request);
    return !!client;
}

export async function getAllSavedAlbumsForUser(request: Request) {
    const client = await getSpotifyClient(request);

    const limit = 50;
    const allAlbums = [];

    // Build a list of all albums in the user's library
    let albums = await client!.getMySavedAlbums({ limit });
    allAlbums.push(...albums.body.items);
    for (let i = 1; i < Math.ceil(albums.body.total / limit); i++) {
        albums = await client!.getMySavedAlbums({
            limit,
            offset: limit * i
        });
        allAlbums.push(...albums.body.items);
    }

    return allAlbums;
}

export async function getAllUserAlbumsByYear(request: Request, year: string) {
    // User must be logged in
    const user = await getUser(request);
    if (!user) {
        throw redirect('/auth/login');
    }

    const albums = await prisma.userSpotifyAlbum.findMany({
        where: {
            userId: user.id,
            year
        },
        orderBy: {
            rank: 'asc'
        }
    });

    const hiddenLast = [...albums].sort((a, b) => Number(a.isHidden) - Number(b.isHidden));
    return hiddenLast;
}

export async function getAllUserAlbumYears(userId: string) {
    const years = await prisma.userSpotifyAlbum.findMany({
        select: {
            year: true
        },
        where: {
            userId
        },
        orderBy: {
            year: 'desc'
        },
        distinct: ['year']
    });

    return years.map((y) => y.year);
}

export async function saveUserAlbumsForYear(request: Request, albums: UserSpotifyAlbum[]) {
    // User must be logged in
    const user = await getUser(request);
    if (!user) {
        throw redirect('/auth/login');
    }

    for (const album of albums) {
        await prisma.userSpotifyAlbum.update({
            where: {
                userId_spotifyId: {
                    userId: user.id,
                    spotifyId: album.spotifyId
                }
            },
            data: {
                rank: album.rank,
                isHidden: album.isHidden
            }
        });
    }
}
export async function syncAllAlbumsForUser(request: Request) {
    // User must be logged in
    const user = await getUser(request);
    if (!user) {
        throw redirect('/auth/login');
    }

    // Retrieve all of the user's saved albums
    const albums = await getAllSavedAlbumsForUser(request);

    // Attempt to create a record of each album. Ignore errors
    for (const { album } of albums) {
        try {
            await prisma.userSpotifyAlbum.upsert({
                where: {
                    userId_spotifyId: {
                        userId: user.id,
                        spotifyId: album.id
                    }
                },
                create: {
                    // Unique
                    userId: user.id,
                    spotifyId: album.id,

                    // May update
                    artist: album.artists.map((a) => a.name).join(', '),
                    name: album.name,
                    releaseDate: new Date(album.release_date),
                    year: new Date(album.release_date).getFullYear().toString(),
                    images: JSON.stringify(album.images),
                    uri: album.uri,

                    // Ensure the album is ranked last in existing lists
                    rank: albums.length
                },
                update: {
                    artist: album.artists.map((a) => a.name).join(', '),
                    name: album.name,
                    releaseDate: new Date(album.release_date),
                    year: new Date(album.release_date).getFullYear().toString(),
                    images: JSON.stringify(album.images),
                    uri: album.uri
                }
            });
            console.log('success syncing album', album.name);
        } catch (error) {
            console.log('error creating album', album.name, (error as Error).message);
        }
    }
}

export async function getAllUserAlbumsByYearByUserId(userId: string, year: string) {
    return prisma.userSpotifyAlbum.findMany({
        where: {
            userId,
            year
        },
        orderBy: {
            rank: 'asc'
        }
    });
}
