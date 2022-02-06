import {
    Links,
    LinksFunction,
    LiveReload,
    LoaderFunction,
    Meta,
    Outlet,
    redirect,
    Scripts,
    ScrollRestoration,
    useCatch, useLoaderData
} from 'remix';
import type { MetaFunction } from 'remix';
import NavBar from '~/components/navbar';
import {getUser, User} from '~/utils/sessions.server';
import globalStylesUrl from './styles/global.css';

export const handle = {
    id: 'root',
}

export const links: LinksFunction = () => {
    return [
        { rel: 'stylesheet', href: globalStylesUrl }
    ];
};

export const meta: MetaFunction = () => {
    return { title: 'AlbumRanker', viewport: 'width=device-width,initial-scale=1' };
};

export type LoaderData = {
    user: User | null;
};

export const loader: LoaderFunction = async ({ request }) => {
    // Upgrade people to https automatically
    let url = new URL(request.url);
    let hostname = url.hostname;
    let proto = request.headers.get('X-Forwarded-Proto') ?? url.protocol;

    url.host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host') ?? url.host;
    url.protocol = 'https:';

    if (proto === 'http' && hostname !== 'localhost') {
        return redirect(url.toString(), {
            headers: {
                'X-Forwarded-Proto': 'https'
            }
        });
    }

    // Get user
    const user = await getUser(request);

    return {
        user
    };
};

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <Meta />
                {title ? <title>{title}</title> : null}
                <Links />
                <script
                    src='https://kit.fontawesome.com/a6d10f2d20.js'
                    crossOrigin='anonymous'
                ></script>
            </head>
            <body>
                {children}
                <Scripts />
                {process.env.NODE_ENV === 'development' && <LiveReload />}
            </body>
        </html>
    );
}

export default function App() {
    const data = useLoaderData<LoaderData>()
    return (
        <Document title='Album Ranker'>
            <NavBar />
            <Outlet />
        </Document>
    );
}

export function CatchBoundary() {
    let caught = useCatch();

    return (
        <Document title={`${caught.status} ${caught.statusText}`}>
            <div className='container'>
                <h1>
                    {caught.status} {caught.statusText}
                </h1>
            </div>
        </Document>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.log(error);
    return (
        <Document title='Something went wrong'>
            <div className='container'>
                <h1>Application Error</h1>
                <pre>{error.message}</pre>
            </div>
        </Document>
    );
}
