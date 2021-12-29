import { ActionFunction, Form, LoaderFunction, useTransition } from 'remix';
import { redirect } from 'remix';
import { syncAllAlbumsForUser } from '~/spotify/client.server';

export let action: ActionFunction = async ({ request }) => {
    await syncAllAlbumsForUser(request);
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
