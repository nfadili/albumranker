import { Form, useTransition } from '@remix-run/react';
import type { ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Button, Container, Stack, Text, Loader } from '@mantine/core';
import { syncAllAlbumsForUser } from '~/spotify/client.server';

export let action: ActionFunction = async ({ request }) => {
    await syncAllAlbumsForUser(request);
    return redirect('/');
};

export default function Sync() {
    const transition = useTransition();

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
                <Text>
                    To begin ranking your albums you must first sync your spotify library with this
                    app.
                </Text>
                <Form method='post'>
                    <Button type='submit'>Sync Spotify Library</Button>
                </Form>
            </Stack>
        </Container>
    );
}
