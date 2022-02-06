import { ActionFunction, Form, Link, LoaderFunction, useTransition } from 'remix';
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
        <main className='main'>
            <div className='container'>
                <p>To begin ranking your albums you must first sync your spotify library with this app.</p>
                <Form method='post'>
                    <button type='submit'>Sync Spotify Library</button>
                </Form>
            </div>
        </main>
    );
}
