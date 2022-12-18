import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { Header } from '~/components/Header';

import {
    AppShell,
    createEmotionCache,
    MantineProvider,
    ColorSchemeProvider,
    ColorScheme
} from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { StylesPlaceholder } from '@mantine/remix';
import { json } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { getUser } from './session.server';
import { lightTheme, darkTheme } from './theme';
import { useState } from 'react';

const emotionCache = createEmotionCache({ key: 'mantine' });

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
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const toggleColorScheme = (value?: ColorScheme) => {
        setColorScheme(value || colorScheme === 'dark' ? 'light' : 'dark');
    };
    return (
        <html lang='en'>
            <head>
                <StylesPlaceholder />
                <Meta />
                <Links />
            </head>
            <body>
                <ColorSchemeProvider
                    colorScheme={colorScheme}
                    toggleColorScheme={toggleColorScheme}
                >
                    <MantineProvider
                        withGlobalStyles
                        withNormalizeCSS
                        emotionCache={emotionCache}
                        theme={colorScheme === 'dark' ? darkTheme : lightTheme}
                    >
                        <NotificationsProvider>
                            <AppShell padding='md' header={<Header />}>
                                <Outlet />
                            </AppShell>
                        </NotificationsProvider>
                    </MantineProvider>
                </ColorSchemeProvider>

                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
