import { Form, useLoaderData, useSearchParams, useTransition } from '@remix-run/react';
import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useState } from 'react';
import { Button, Container, Group, Loader, Select, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
    isSpotifyAccountLinked,
    syncAllAlbumsForUser,
    UserSpotifyAlbum
} from '~/spotify/client.server';
import {
    getAllUserAlbumsByYear,
    getAllUserAlbumYears,
    saveUserAlbumsForYear
} from '~/spotify/client.server';
import { AlbumTable } from '~/components/AlbumTable';
import { LinkText } from '~/components/LinkText';

export const meta: MetaFunction = () => {
    return {
        title: 'AlbumRanker'
    };
};

function getYearOrDefaultFromSearchParams(searchParams: URLSearchParams) {
    return searchParams.get('year') ?? new Date().getFullYear().toString();
}

function getErrorFromSearchParams(searchParams: URLSearchParams) {
    return !!searchParams.get('error');
}

type LoaderData = {
    data: UserSpotifyAlbum[];
    years: string[];
    spotifyDisabled: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const year = getYearOrDefaultFromSearchParams(url.searchParams);

    const spotifyDisabled = !(await isSpotifyAccountLinked(request));
    const years = await getAllUserAlbumYears(request);

    // If the use has no albums from the current year, add the current year as an option
    const currentYear = new Date().getFullYear().toString();
    if (!years.includes(currentYear)) {
        years.unshift(currentYear);
    }

    const albums = await getAllUserAlbumsByYear(request, year);

    const data = albums.map((a) => ({
        ...a,
        releaseDate:
            a.releaseDate.getMonth() +
            1 +
            '/' +
            a.releaseDate.getDate() +
            '/' +
            a.releaseDate.getFullYear()
    }));

    return { data, years, spotifyDisabled };
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const year = form.get('year');
    const albums = form.get('albums');
    const intent = form.get('intent');

    if (intent === 'sync') {
        await syncAllAlbumsForUser(request);
        return redirect(`/ranker?year=${year}`);
    }

    try {
        const parsedAlbums: UserSpotifyAlbum[] = JSON.parse(albums as string);
        const rankedAlbums = parsedAlbums.map((album, i) => ({ ...album, rank: i }));

        await saveUserAlbumsForYear(request, rankedAlbums);

        return redirect(`/ranker?year=${year}`);
    } catch (error) {
        return redirect(`/ranker?year=${year}&error=1`); // TODO: Maybe use a custom header to convey error messages
    }
};

export default function Ranker() {
    const transition = useTransition();
    const { data, years, spotifyDisabled } = useLoaderData<LoaderData>();
    const [orderedAlbums, setOrderedAlbums] = useState(data);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedYear = getYearOrDefaultFromSearchParams(searchParams);
    const error = getErrorFromSearchParams(searchParams);

    const handleYearChange = (y: string) => {
        setSearchParams({ year: y });
    };

    const handleAlbumChange = (albums: UserSpotifyAlbum[]) => {
        setOrderedAlbums(albums);
    };

    const handleShareClick = () => {
        const content = orderedAlbums
            .filter((a) => !a.isHidden)
            .map((a, i) => `${i + 1}. ${a.name}`)
            .join('\n');
        navigator?.clipboard?.writeText(content);

        showNotification({
            title: 'List copied',
            message: 'Your album list has been copied to the clipboard'
        });
    };

    const handleSaveClick = () => {
        showNotification({
            title: 'Changes saved',
            message: 'Your new albums ranking has been saved'
        });
    };

    const isSyncing = transition.submission?.formData.get('intent') === 'sync';
    if (isSyncing) {
        return (
            <Container>
                <Loader />
            </Container>
        );
    }

    return (
        <Form method='post'>
            <Container>
                <Stack align='flex-start'>
                    <Group>
                        <Select
                            name='year'
                            value={selectedYear}
                            onChange={handleYearChange}
                            data={years}
                        />
                        <Button
                            onClick={handleSaveClick}
                            type='submit'
                            name='intent'
                            value='save'
                            disabled={spotifyDisabled}
                        >
                            Save
                        </Button>
                        <Button
                            variant='light'
                            type='submit'
                            name='intent'
                            value='sync'
                            disabled={spotifyDisabled}
                        >
                            Sync
                        </Button>
                        <Button
                            variant='light'
                            onClick={handleShareClick}
                            type='button'
                            disabled={spotifyDisabled}
                        >
                            Share
                        </Button>
                    </Group>
                    {data.length === 0 ? (
                        <>
                            {spotifyDisabled ? (
                                <Text>
                                    To begin ranking albums, you must first link your spotify
                                    account from the{' '}
                                    <LinkText color='anchor' to='/profile'>
                                        profile page
                                    </LinkText>
                                    .
                                </Text>
                            ) : (
                                <Text>
                                    You have no albums for this year. You might need to sync your
                                    library!
                                </Text>
                            )}
                        </>
                    ) : (
                        <>
                            <AlbumTable
                                key={selectedYear}
                                data={data}
                                onChange={handleAlbumChange}
                            />
                        </>
                    )}
                </Stack>
            </Container>
            {/* Hidden form input synced with state tracked in react */}
            <input hidden readOnly name='albums' value={JSON.stringify(orderedAlbums)} />
            <footer>{error && <Text>Something went wrong</Text>}</footer>
        </Form>
    );
}
