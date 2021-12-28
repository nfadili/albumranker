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
    useCatch
} from 'remix';
import type { MetaFunction } from 'remix';
import globalStylesUrl from './styles/global.css';

export let links: LinksFunction = () => {
    return [
        { rel: 'stylesheet', href: globalStylesUrl },
        {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css'
        }
    ];
};

export const meta: MetaFunction = () => {
    return { title: 'AlbumRanker', viewport: 'width=device-width,initial-scale=1' };
};

export let loader: LoaderFunction = ({ request }) => {
    // upgrade people to https automatically

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
    return {};
};

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <Meta />
                {title ? <title>{title}</title> : null}
                <Links />
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
    return (
        <Document title='Album Ranker'>
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
    return (
        <Document title='Something went wrong'>
            <div className='container'>
                <h1>Application Error</h1>
                <pre>{error.message}</pre>
            </div>
        </Document>
    );
}
