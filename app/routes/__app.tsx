import { LoaderFunction, Outlet, useLoaderData } from 'remix';
import { User, getUser } from '~/utils/sessions.server';
import NavBar from '~/components/navbar';

type LoaderData = {
    user: User | null;
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request);
    const data: LoaderData = {
        user
    };
    return data;
};

export default function Index() {
    const data = useLoaderData<LoaderData>();

    return (
        <>
            <NavBar user={data.user} />
            <Outlet />
        </>
    );
}
