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
        <div>
            <header className='header'>{}</header>
            <main className='main'>
                <div className='container'>
                    <div className='container'>
                        <h1 className='home-link'>
                            <Link to='/'>Home</Link>
                        </h1>
                        {user ? (
                            <div className='user-info'>
                                <span>{`Hi ${user.username}`}</span>
                                {!spotifyEnabled && (
                                    <Link to='/spotify/login'>Login to spotify</Link>
                                )}
                                <Form action='/auth/logout' method='post'>
                                    <button type='submit' className='button'>
                                        Logout
                                    </button>
                                </Form>
                            </div>
                        ) : (
                            <Link to='/auth/login'>Login</Link>
                        )}
                        {spotifyEnabled ? <div>Logged into spotify!</div> : null}
                    </div>
                </div>
            </main>
            <footer className='footer'>
                <div className='container'>FOOTER</div>
            </footer>
        </div>
    );
}
