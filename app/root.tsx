import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Header } from '~/components/Header';

import { AppShell, createEmotionCache, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { StylesPlaceholder } from '@mantine/remix';
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData
} from '@remix-run/react';
import { getUser, getThemeSession } from './session.server';
import {
    Theme,
    ThemeBody,
    ThemeHead,
    ThemeProvider,
    useTheme,
    lightTheme,
    darkTheme
} from '~/theme-provider';

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
    theme: Theme | null;
};

export const loader: LoaderFunction = async ({ request }) => {
    const themeSession = await getThemeSession(request);
    return json<LoaderData>({ theme: themeSession.getTheme(), user: await getUser(request) });
};

function Document() {
    const [theme] = useTheme();
    const data = useLoaderData();

    return (
        <html lang='en'>
            <head>
                <StylesPlaceholder />
                <Meta />
                <Links />
                <ThemeHead ssrTheme={Boolean(data.theme)} />
            </head>
            <body>
                <ThemeBody ssrTheme={Boolean(data.theme)} />
                <MantineProvider
                    withGlobalStyles
                    withNormalizeCSS
                    emotionCache={emotionCache}
                    theme={theme === 'dark' ? darkTheme : lightTheme}
                >
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

export default function WithProviders() {
    const data = useLoaderData();
    return (
        <ThemeProvider specifiedTheme={data.theme}>
            <Document />
        </ThemeProvider>
    );
}
