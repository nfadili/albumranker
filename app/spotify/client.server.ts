import { redirect } from '@remix-run/node';
import { getSpotifyClient } from '~/spotify/auth.server';
import { prisma } from '~/db.server';
import { getUser } from '~/session.server';
import type { UserSpotifyAlbum as _UserSpotifyAlbum } from '@prisma/client';

export type UserSpotifyAlbum = _UserSpotifyAlbum;

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

    return prisma.userSpotifyAlbum.findMany({
        where: {
            userId: user.id,
            year
        },
        orderBy: {
            rank: 'asc'
        }
    });
}

export async function getAllUserAlbumYears(request: Request) {
    // User must be logged in
    const user = await getUser(request);
    if (!user) {
        throw redirect('/auth/login');
    }

    const years = await prisma.userSpotifyAlbum.findMany({
        select: {
            year: true
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
                rank: album.rank
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
            const a = await prisma.userSpotifyAlbum.create({
                data: {
                    userId: user.id,
                    artist: album.artists.map((a) => a.name).join(', '),
                    name: album.name,
                    releaseDate: new Date(album.release_date),
                    year: new Date(album.release_date).getFullYear().toString(),
                    rank: null,
                    spotifyId: album.id
                }
            });
            console.log('success creating album', a.name);
        } catch (error) {
            console.log('error creating album', album.name);
        }
    }
}
