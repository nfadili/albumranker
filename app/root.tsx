import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { AppShell } from '@mantine/core';
import { Header } from '~/components/Header';
import { getUser } from './session.server';

export const links: LinksFunction = () => {
    return [];
};

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'Albumranker',
    viewport: 'width=device-width,initial-scale=1'
});

type LoaderData = {
    user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    return json<LoaderData>({
        user: await getUser(request)
    });
};

export default function Document() {
    return (
        <html lang='en'>
            <head>
                <Meta />
                <Links />
            </head>
            <body>
                <AppShell padding='md' header={<Header />}>
                    <Outlet />
                </AppShell>
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
