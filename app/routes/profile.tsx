import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { LinkButton } from '~/components/LinkButton';
import { getUser } from '~/session.server';
import { unlinkSpotifyAccountForUser } from '~/spotify/auth.server';
import { isSpotifyAccountLinked, syncAllAlbumsForUser } from '~/spotify/client.server';

import { Button, Container, Group, Loader, Stack, Text } from '@mantine/core';
import { redirect } from '@remix-run/node';
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react';

import type { User } from '~/models/user.server';
const INTENT = 'intent';
const INTENT_SYNC = 'sync';
const INTENT_UNLINK = 'unlink;';

export const meta: MetaFunction = () => {
    return {
        title: 'Profile'
    };
};

export let action: ActionFunction = async ({ request }) => {
    const user = await getUser(request);
    const formData = await request.formData();
    const intent = formData.get(INTENT);

    if (intent === INTENT_SYNC) {
        await syncAllAlbumsForUser(request);
        return redirect('/');
    }
    if (intent === INTENT_UNLINK) {
        await unlinkSpotifyAccountForUser(user!.id);
        return redirect('/');
    }
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
                                <Group>
                                    <Button name={INTENT} value={INTENT_SYNC} type='submit'>
                                        Sync Spotify Albums
                                    </Button>
                                    <Button
                                        name={INTENT}
                                        value={INTENT_UNLINK}
                                        type='submit'
                                        variant='outline'
                                        color='red'
                                    >
                                        Unlink Spotify Account
                                    </Button>
                                </Group>
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
