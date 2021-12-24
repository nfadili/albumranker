import type { ActionFunction, LoaderFunction } from 'remix';
import { redirect } from 'remix';
import { getAuthorizeUrl } from '~/utils/spotify.server';

export let loader: LoaderFunction = async () => {
    const authorizeUrl = getAuthorizeUrl();
    return redirect(authorizeUrl);
};
