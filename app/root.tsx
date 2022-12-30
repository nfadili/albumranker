import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { Header } from '~/components/Header';

import { AppShell, ColorSchemeProvider, createEmotionCache, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { StylesPlaceholder } from '@mantine/remix';
import { json } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { getUser } from './session.server';
import { ColorScheme, darkTheme, lightTheme } from './theme';

import type { User } from '@prisma/client';

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
    user: User | null;
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request);
    return json<LoaderData>({
        user
    });
};

export default function Document() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>(ColorScheme.Light); // TODO: This value should come from the database
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(
            value || (colorScheme === ColorScheme.Dark ? ColorScheme.Light : ColorScheme.Dark)
        );
    const isDarkTheme = colorScheme === ColorScheme.Dark;

    const handleToggleColorScheme = () => {
        console.log('hello!'); // TODO: Tell the database to toggle the scheme for this user
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
                        key={colorScheme}
                        withGlobalStyles
                        withNormalizeCSS
                        emotionCache={emotionCache}
                        theme={isDarkTheme ? darkTheme : lightTheme}
                    >
                        <NotificationsProvider>
                            <AppShell
                                padding='md'
                                header={<Header onToggleColorScheme={handleToggleColorScheme} />}
                            >
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
