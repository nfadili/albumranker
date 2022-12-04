import type { UserSpotifyAlbum as _UserSpotifyAlbum } from '@prisma/client';

export type Modify<T, R> = Omit<T, keyof R> & R;

export type UserSpotifyAlbum = Modify<
    _UserSpotifyAlbum,
    {
        createdAt: string;
        updatedAt: string;
        releaseDate: string;
    }
>;
