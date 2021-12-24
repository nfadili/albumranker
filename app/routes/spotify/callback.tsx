import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import { getSpotifyTokens } from "~/utils/spotify.server";

export let loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');
	const state = url.searchParams.get('state');

	// TODO: Handle this better
	if (error) {
		console.error(error);
		throw error;
	}

	// TODO: Handle this better
	if (!code) {
		const message = 'missing code';
		console.error(message);
		throw Error(message);
	}

	// TODO: Check the state param to ensure it matches
	// if (state !== savedState) {}

	const tokens = await getSpotifyTokens(code);

	// TODO: Set tokens in session somehow
	console.log(tokens);

	return redirect('/');
};