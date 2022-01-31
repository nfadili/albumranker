import {
    ActionFunction,
    Form,
    LoaderFunction,
    redirect,
    useLoaderData,
    useSearchParams,
} from 'remix';
import {
    getAllUserAlbumsByYear,
    getAllUserAlbumYears,
    saveUserAlbumsForYear,
    UserSpotifyAlbum
} from '~/spotify/client.server';
import { AlbumTable } from '~/components/albumTable';
import { Column } from 'react-table';
import { ChangeEvent, useState } from 'react';

function getYearOrDefaultFromSearchParams(searchParams: URLSearchParams) {
    return searchParams.get('year') ?? new Date().getFullYear().toString();
}

function getErrorFromSearchParams(searchParams: URLSearchParams) {
    return !!searchParams.get('error');
}

type LoaderData = {
    data: UserSpotifyAlbum[];
    columns: Column[];
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

    const data = await getAllUserAlbumsByYear(request, year);
    const columns = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Artist', accessor: 'artist' },
        { Header: 'Release Date', accessor: 'releaseDate' }
    ];
    return { data, columns, years };
};

type ActionData = {};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const year = form.get('year');
    const albums = form.get('albums');

    try {
        const parsedAlbums: UserSpotifyAlbum[] = JSON.parse(albums as string);
        const rankedAlbums = parsedAlbums.map((album, i) => ({ ...album, rank: i }));

        await saveUserAlbumsForYear(request, rankedAlbums);

        return redirect(`/?year=${year}`);
    } catch (error) {
        return redirect(`/?year=${year}&error=1`); // TODO: Maybe use a custom header to convey error messages
    }
};

export default function Index() {
    const { data, columns, years } = useLoaderData<LoaderData>();
    const [orderedAlbums, setOrderedAlbums] = useState(data);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedYear = getYearOrDefaultFromSearchParams(searchParams);
    const error = getErrorFromSearchParams(searchParams);

    const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSearchParams({ year: e.target.value });
    };

    const handleAlbumChange = (albums: UserSpotifyAlbum[]) => {
        setOrderedAlbums(albums);
    };

    return (
        <Form method='post'>
            <main className='container'>
                <div className='field is-grouped'>
                    <div className='control'>
                        <div className='select'>
                            <select name='year' value={selectedYear} onChange={handleYearChange}>
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='control'>
                        {/* Hidden form input synced with state tracked in react */}
                        <input
                            hidden
                            readOnly
                            name='albums'
                            value={JSON.stringify(orderedAlbums)}
                        />
                        <button className='button is-primary'>Save</button>
                    </div>
                </div>

                {data.length === 0 ? (
                    <h3>You have no albums for this year</h3>
                ) : (
                    <>
                        <AlbumTable
                            key={selectedYear}
                            columns={columns}
                            data={data}
                            onChange={handleAlbumChange}
                        />
                    </>
                )}
            </main>
            <footer className='footer'>
                {error && <div className='notification'>Something went wrong</div>}
            </footer>
        </Form>
    );
}
