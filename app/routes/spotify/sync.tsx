import { ActionFunction, Form, LoaderFunction, useTransition } from 'remix';
import { redirect } from 'remix';
import { getAllAlbumsForUser } from '~/spotify/client.server';

export let action: ActionFunction = async ({ request }) => {
    const albums = await getAllAlbumsForUser(request);

    console.log(albums.length);
    return redirect('/');
};

export default function Sync() {
    const transition = useTransition();

    if (transition.submission) {
        return <p>Syncing...</p>;
    }

    return (
        <div>
            <Form method='post'>
                <button type='submit'>Sync Spotify Library</button>
            </Form>
        </div>
    );
}
