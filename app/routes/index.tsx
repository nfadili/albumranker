import { Form, Link, LoaderFunction, useLoaderData } from 'remix';
import { getUser } from '~/utils/sessions.server';
import type { User } from '@prisma/client';
import { getSpotifyClient, SpotifyClient } from '~/utils/spotify.server';

type LoaderData = {
    user?: User | null;
    spotify?: SpotifyClient | null;
};

export let loader: LoaderFunction = async ({ request }) => {
    let user = await getUser(request);
    let data: LoaderData = {
        user
    };

    const spotify = await getSpotifyClient(request);
    if (spotify) {
        const t = await spotify.getMySavedTracks();
        console.log(t.body.items.length)
        data.spotify = spotify;
    }

    return data;
};

export default function Index() {
    const data = useLoaderData<LoaderData>();

    return (
        <div>
            <header className='header'>
                <div className='container'>
                    <h1 className='home-link'>
                        <Link to='/'>Home</Link>
                    </h1>
                    {data.user ? (
                        <div className='user-info'>
                            <span>{`Hi ${data.user.username}`}</span>
                            { !data.spotify && <Link to='/spotify/login'>Login to spotify</Link> }
                            <Form action='/logout' method='post'>
                                <button type='submit' className='button'>
                                    Logout
                                </button>
                            </Form>
                        </div>
                    ) : (
                        <Link to='/login'>Login</Link>
                    )}
                    {data.spotify ? <div>Logged into spotify!</div> : null}
                </div>
            </header>
            <main className='main'>
                <div className='container'>TODO</div>
            </main>
            <footer className='footer'>
                <div className='container'>FOOTER</div>
            </footer>
        </div>
    );
}
