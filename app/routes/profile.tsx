import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react';
import { Button, Container, Loader, Stack, Text } from '@mantine/core';
import { getUser } from '~/session.server';
import type { User } from '~/models/user.server';
import { isSpotifyAccountLinked, syncAllAlbumsForUser } from '~/spotify/client.server';
import { LinkButton } from '~/components/LinkButton';

export const meta: MetaFunction = () => {
    return {
        title: 'Profile'
    };
};

export let action: ActionFunction = async ({ request }) => {
    await syncAllAlbumsForUser(request);
    return redirect('/');
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
    const transition = useTransition();
    const { user, spotifyEnabled } = useLoaderData<LoaderData>();
    if (transition.submission) {
        return (
            <Container>
                <Loader />
            </Container>
        );
    }

    return (
        <Container>
            <Stack align='flex-start'>
                {user ? (
                    <>
                        <Text>{`Hi ${user.email}!`}</Text>
                        {spotifyEnabled && (
                            <Form method='post'>
                                <Button type='submit'>Sync Spotify Albums</Button>
                            </Form>
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
