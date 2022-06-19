import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { AppShell, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { Header } from '~/components/Header';
import { getUser } from './session.server';
import { theme } from './theme';

export const links: LinksFunction = () => {
    return [
        {
            href: '/site.webmanifest',
            rel: 'manifest'
        },
        {
            href: '/favicon-16x16.png',
            rel: 'icon',
            sizes: '16x16'
        },
        {
            href: '/favicon-32x32.png',
            rel: 'icon',
            sizes: '32x32'
        },
        {
            href: '/apple-touch-icon.png',
            rel: 'apple-touch-icon',
            sizes: '180x180'
        }
    ];
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
                <MantineProvider theme={theme}>
                    <NotificationsProvider>
                        <AppShell padding='md' header={<Header />}>
                            <Outlet />
                        </AppShell>
                    </NotificationsProvider>
                </MantineProvider>

                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
