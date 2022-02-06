import { Form, Link, LoaderFunction, redirect, useLoaderData } from 'remix';
import { User, getUser } from '~/utils/sessions.server';
import { isSpotifyAccountLinked } from '~/spotify/client.server';

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
        <main className='main'>
            <div className='container'>
                {user ? (
                    <div className='user-info'>
                        <h1>{`Hi ${user.username}`}</h1>
                        {spotifyEnabled ? <a href='/spotify/sync'>Sync spotify albums</a> : null}
                        {!spotifyEnabled && <Link to='/spotify/login'>Login to spotify</Link>}
                        <Form action='/auth/logout' method='post'>
                            <button type='submit' className='button'>
                                Logout
                            </button>
                        </Form>
                    </div>
                ) : (
                    <Link to='/auth/login'>Login</Link>
                )}
            </div>
        </main>
    );
}
