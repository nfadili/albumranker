import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Container, Stack, Text } from '@mantine/core';
import { getUser } from '~/session.server';
import type { User } from '~/models/user.server';
import { isSpotifyAccountLinked } from '~/spotify/client.server';
import { LinkButton } from '~/components/LinkButton';

export const meta: MetaFunction = () => {
    return {
        title: 'Profile'
    };
};

type LoaderData = {
    user?: User | null;
    spotifyEnabled: boolean;
};

export let loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request);
    if (!user) {
        return redirect('/auth/login');
    }

    const spotifyEnabled = await isSpotifyAccountLinked(request);
    const data: LoaderData = {
        user,
        spotifyEnabled
    };

    return data;
};

export default function Index() {
    const { user, spotifyEnabled } = useLoaderData<LoaderData>();

    return (
        <Container>
            <Stack align='flex-start'>
                {user ? (
                    <>
                        <Text>{`Hi ${user.email}`}</Text>
                        {spotifyEnabled && (
                            <LinkButton to='/spotify/sync'>Sync spotify albums</LinkButton>
                        )}
                        {!spotifyEnabled && (
                            <LinkButton to='/spotify/login'>Login to spotify</LinkButton>
                        )}
                    </>
                ) : (
                    <Link to='/auth/login'>Login</Link>
                )}
            </Stack>
        </Container>
    );
}
