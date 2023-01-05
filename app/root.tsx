import { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { Header } from '~/components/Header';

import { AppShell, ColorSchemeProvider, createEmotionCache, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { StylesPlaceholder } from '@mantine/remix';
import { json } from '@remix-run/node';
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useSubmit
} from '@remix-run/react';

import { getUser } from './session.server';
import { ColorScheme, useColorScheme } from './theme';

import type { User, UserSettings } from '@prisma/client';
import { getUserSettings } from './models/user.server';

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
    userSettings: Partial<UserSettings>;
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request);
    const defaultUserSettings = { colorScheme: ColorScheme.Light };

    if (!user) {
        return json<LoaderData>({
            user: null,
            userSettings: defaultUserSettings
        });
    }

    const userSettings = (await getUserSettings(user.id)) ?? defaultUserSettings;

    return json<LoaderData>({
        user,
        userSettings
    });
};

export default function Document() {
    const submit = useSubmit();
    const { userSettings } = useLoaderData<LoaderData>();
    const { theme, colorScheme, toggleColorScheme, handleToggleColorScheme } = useColorScheme(
        userSettings.colorScheme,
        submit
    );
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
                        theme={theme}
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
