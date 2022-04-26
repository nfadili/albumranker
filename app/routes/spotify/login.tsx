import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getAuthorizeUrl } from '~/spotify/auth.server';

export let loader: LoaderFunction = async () => {
    const authorizeUrl = getAuthorizeUrl();
    return redirect(authorizeUrl);
};
