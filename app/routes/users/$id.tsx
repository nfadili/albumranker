import { useLoaderData, useSearchParams } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime';
import { Container, Group, Select, Stack, Text } from '@mantine/core';
import { getAllUserAlbumsByYearByUserId, getAllUserAlbumYears } from '~/spotify/client.server';
import { AlbumTable } from '~/components/AlbumTable';
import { getYearOrDefaultFromSearchParams } from '~/utils';

export const loader: LoaderFunction = async ({ request, params }) => {
    const userId = params.id;
    if (!userId) {
        return redirect('/');
    }

    const url = new URL(request.url);
    const year = getYearOrDefaultFromSearchParams(url.searchParams);
    const years = await getAllUserAlbumYears(userId as string);

    const albums = await getAllUserAlbumsByYearByUserId(userId as string, year);
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

export default function User() {
    const { data, years } = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedYear = getYearOrDefaultFromSearchParams(searchParams);

    const handleYearChange = (y: string) => {
        setSearchParams({ year: y });
    };

    if (data.length === 0 || years.length === 0) {
        // TODO: Make a nicer error page
        return <Text>This user has no albums.</Text>;
    }

    return (
        <Container>
            <Stack align='flex-start'>
                <Group>
                    <Select
                        name='year'
                        value={selectedYear}
                        onChange={handleYearChange}
                        data={years}
                    />
                </Group>
                <AlbumTable disableEdit key={selectedYear} data={data} onChange={() => null} />
            </Stack>
        </Container>
    );
}
