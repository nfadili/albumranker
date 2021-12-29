import { redirect } from 'remix';
import { getSpotifyClient } from '~/spotify/auth.server';
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/sessions.server';

export async function isSpotifyAccountLinked(request: Request) {
    const client = await getSpotifyClient(request);
    return !!client;
}

export async function getAllAlbumsForUser(request: Request) {
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

export async function syncAllAlbumsForUser(request: Request) {
    // User must be logged in
    const user = await getUser(request);
    if (!user) {
        throw redirect('/auth/login');
    }

    // Retrieve all of the user's saved albums
    const albums = await getAllAlbumsForUser(request);

    // Attempt to create a record of each album. Ignore errors
    for (const { album } of albums) {
        try {
            const a = await db.userSpotifyAlbum.create({
                data: {
                    userId: user.id,
                    artist: album.artists.join(', '),
                    name: album.name,
                    releaseDate: album.release_date,
                    rank: null,
                    spotifyId: album.id
                }
            });
            console.log('success creating album', a.name)
        } catch (error) {
            console.log('error creating album', album.name);
        }
    }
}
