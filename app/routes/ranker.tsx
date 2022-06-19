import { Form, useLoaderData, useSearchParams } from '@remix-run/react';
import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useState } from 'react';
import { Button, Container, Group, Select, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import type { UserSpotifyAlbum } from '~/spotify/client.server';
import {
    getAllUserAlbumsByYear,
    getAllUserAlbumYears,
    saveUserAlbumsForYear
} from '~/spotify/client.server';
import { AlbumTable } from '~/components/AlbumTable';

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
};

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const year = getYearOrDefaultFromSearchParams(url.searchParams);

    const years = await getAllUserAlbumYears(request);

    // If the use has not albums from the current year, add the current year as an option
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

    return { data, years };
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const year = form.get('year');
    const albums = form.get('albums');

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
    const { data, years } = useLoaderData<LoaderData>();
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
        const content = orderedAlbums.map((a, i) => `${i + 1}. ${a.name}`).join('\n');
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
                        <Button onClick={handleSaveClick} type='submit'>
                            Save
                        </Button>
                        <Button variant='light' onClick={handleShareClick} type='submit'>
                            Share
                        </Button>
                    </Group>
                    {data.length === 0 ? (
                        <Text>You have no albums for this year</Text>
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
