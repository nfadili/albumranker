import { Form, Link, LoaderFunction, redirect, useLoaderData } from 'remix';
import { User, getUser } from '~/utils/sessions.server';
import { getAllUserAlbumsByYear, isSpotifyAccountLinked } from '~/spotify/client.server';

type LoaderData = {
    user?: User | null;
    spotifyEnabled: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
    const a = await getAllUserAlbumsByYear(request, '1992');
    return a;
};

export default function Index() {
    const data = useLoaderData<LoaderData>();

    console.log(data)

    return (
        <div>
            <header className='header'>{}</header>
            <main className='main'>
                <div>Hello World!</div>
            </main>
            <footer className='footer'>
                <div className='container'>FOOTER</div>
            </footer>
        </div>
    );
}
