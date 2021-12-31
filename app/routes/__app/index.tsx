import {
    ActionFunction,
    Form,
    json,
    Link,
    LoaderFunction,
    redirect,
    useActionData,
    useLoaderData,
    useSearchParams,
    useSubmit
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

type LoaderData = {
    data: UserSpotifyAlbum[];
    columns: Column[];
    years: string[];
};

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const year = getYearOrDefaultFromSearchParams(url.searchParams);

    console.log('YEAR', year);
    const years = await getAllUserAlbumYears(request);
    const data = await getAllUserAlbumsByYear(request, year);
    const columns = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Artist', accessor: 'artist' },
        { Header: 'Release Date', accessor: 'releaseDate' }
    ];
    return { data, columns, years };
};

type ActionData = {
    success: boolean;
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const year = form.get('year');
    const albums = form.get('albums');
    const parsedAlbums: UserSpotifyAlbum[] = JSON.parse(albums as string);
    const rankedAlbums = parsedAlbums.map((album, i) => ({ ...album, rank: i }));
    
    await saveUserAlbumsForYear(request, rankedAlbums);
    return redirect(`/?year=${year}`);
};

export default function Index() {
    const actionData = useActionData<ActionData>();
    const { data, columns, years } = useLoaderData<LoaderData>();
    const [orderedAlbums, setOrderedAlbums] = useState(data);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedYear = getYearOrDefaultFromSearchParams(searchParams);

    const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSearchParams({ year: e.target.value });
    };

    const handleAlbumChange = (albums: UserSpotifyAlbum[]) => {
        setOrderedAlbums(albums);
    };

    return (
        <div>
            <header className='header'>{}</header>
            <main className='main'>
                <div className='select'>
                    <select name='year' value={selectedYear} onChange={handleYearChange}>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
                <AlbumTable
                    key={selectedYear}
                    columns={columns}
                    data={data}
                    onChange={handleAlbumChange}
                />
                <Form method='post'>
                    <input hidden readOnly name='albums' value={JSON.stringify(orderedAlbums)} />
                    <input hidden readOnly name='year' value={selectedYear} />
                    <button className='button is-primary'>Save</button>
                </Form>
            </main>
            <footer className='footer'>
                {actionData?.success && <div className='container'>Successfully Updated</div>}
            </footer>
        </div>
    );
}
