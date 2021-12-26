import { Form, Link, LoaderFunction, useLoaderData } from 'remix';
import type { User } from '@prisma/client';
import { getUser } from '~/utils/sessions.server';
import { isSpotifyAccountLinked } from '~/spotify/client.server';

type LoaderData = {
    user?: User | null;
    spotifyEnabled: boolean;
};

export let loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request);
    const spotifyEnabled = await isSpotifyAccountLinked(request);
    const data: LoaderData = {
        user,
        spotifyEnabled
    };

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
                            { !data.spotifyEnabled && <Link to='/spotify/login'>Login to spotify</Link> }
                            <Form action='/logout' method='post'>
                                <button type='submit' className='button'>
                                    Logout
                                </button>
                            </Form>
                        </div>
                    ) : (
                        <Link to='/login'>Login</Link>
                    )}
                    {data.spotifyEnabled ? <div>Logged into spotify!</div> : null}
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
