import { Form, Link, LoaderFunction, useLoaderData } from 'remix';
import { getUser, getUserSpotifyCredentials } from '~/utils/sessions.server';
import type { User } from '@prisma/client';

type LoaderData = {
    user: User | null | undefined;
    spotifyCreds: any; // TODO: Remove
};

export let loader: LoaderFunction = async ({ request }) => {
    let user = await getUser(request);
    const spotifyCreds = await getUserSpotifyCredentials(request);

    let data: LoaderData = {
        user,
        spotifyCreds
    };

    return data;
};

export default function Index() {
    let data = useLoaderData<LoaderData>();

    const sp = () => {
        console.log(data.spotifyCreds);
        return <div>Creds are loaded!!</div>;
    };

    return (
        <div>
            <header className='jokes-header'>
                <div className='container'>
                    <h1 className='home-link'>
                        <Link to='/'>Home</Link>
                    </h1>
                    {data.user ? (
                        <div className='user-info'>
                            <span>{`Hi ${data.user.username}`}</span>
                            <Link to='/spotify/login'>Login to spotify</Link>
                            <Form action='/logout' method='post'>
                                <button type='submit' className='button'>
                                    Logout
                                </button>
                            </Form>
                        </div>
                    ) : (
                        <Link to='/login'>Login</Link>
                    )}
                    {data.spotifyCreds ? sp() : null}
                </div>
            </header>
            <main className='jokes-main'>
                <div className='container'>TODO</div>
            </main>
            <footer className='jokes-footer'>
                <div className='container'>FOOTER</div>
            </footer>
        </div>
    );
}
