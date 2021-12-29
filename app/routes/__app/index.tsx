import {
    Form,
    Link,
    LoaderFunction,
    redirect,
    useLoaderData,
    useSearchParams,
    useSubmit
} from 'remix';
import { User, getUser } from '~/utils/sessions.server';
import {
    getAllUserAlbumsByYear,
    getAllUserAlbumYears,
    UserSpotifyAlbum
} from '~/spotify/client.server';
import { AlbumTable } from '~/components/albumTable';
import { Column } from 'react-table';
import { ChangeEvent } from 'react';

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

    const years = await getAllUserAlbumYears(request);
    const data = await getAllUserAlbumsByYear(request, year);
    const columns = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Artist', accessor: 'artist' },
        { Header: 'Release Date', accessor: 'releaseDate' }
    ];
    return { data, columns, years };
};

export default function Index() {
    const { data, columns, years } = useLoaderData<LoaderData>();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedYear = getYearOrDefaultFromSearchParams(searchParams);

    const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSearchParams({ year: e.target.value });
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
                <AlbumTable columns={columns} data={data} />
            </main>
            <footer className='footer'>
                <div className='container'>FOOTER</div>
            </footer>
        </div>
    );
}
