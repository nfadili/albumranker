import { getSpotifyClient } from './auth.server';


export async function isSpotifyAccountLinked(request: Request) {
	const client = await getSpotifyClient(request);
    return !!client;
}

export async function getAlbumsByYear(request: Request, year: string) {
    const client = await getSpotifyClient(request);
    const t = await client!.getMySavedTracks();
    return t.body.items;
}
