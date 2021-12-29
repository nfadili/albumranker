import type { LoaderFunction } from 'remix';
import { redirect } from 'remix';
import { completeSpotifyAuthorization } from '~/spotify/auth.server';

export let loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');

    // TODO: Handle this better
    if (error) {
        throw error;
    }

    // TODO: Handle this better
    if (!code) {
        const message = 'missing code';
        throw Error(message);
    }

    // TODO: Check the state param to ensure it matches
    // if (state !== savedState) {}

    await completeSpotifyAuthorization(request, code);

    return redirect('/');
};
