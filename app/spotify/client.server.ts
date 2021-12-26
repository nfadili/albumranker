import { getSpotifyClient } from './auth.server';


export async function isSpotifyAccountLinked(request: Request) {
	const client = await getSpotifyClient(request);
	console.log(client)
    return !!client;
}

export async function getAllAlbums(request: Request) {
    const client = await getSpotifyClient(request);

    const limit = 50;
    const allAlbums = [];
	
	// Build a list of all talbums in the user's library
    let albums = await client!.getMySavedAlbums({ limit });
    allAlbums.push(...albums.body.items);
    for (let i = 1; i < Math.ceil(albums.body.total / limit); i++) {
        albums = await client!.getMySavedAlbums({
            limit,
            offset: limit * i,
        });
        allAlbums.push(...albums.body.items);
    }

	return allAlbums;
}
