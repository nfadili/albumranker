import { Link, LoaderFunction, useLoaderData } from 'remix';
import { getUser, User } from '~/utils/sessions.server';

type LoaderData = {
    user: User | null;
};

export const loader: LoaderFunction = async ({ request }) => {
	console.log(':LKJSDF:LKJSDF:LKJ')
    const user = await getUser(request);
    const data: LoaderData = {
        user
    };
    return data;
};

export default function NavBar() {
    const data = useLoaderData();
    console.log('LOADER DATA', data);

    return (
        <nav className='navbar' role='navigation'>
            <div className='navbar-brand'>
                <a className='navbar-item' href='https://bulma.io'>
                    <img src='/img/logo.png' width='112' height='28' />
                </a>
            </div>
            <div className='navbar-menu'>
                <div className='navbar-start'>
                    <Link to='/' className='navbar-item'>
                        Home
                    </Link>
                    <div className='navbar-item has-dropdown is-hoverable'>
                        <a className='navbar-link'>Support</a>
                        <div className='navbar-dropdown'>
                            <Link to='/support/about' className='navbar-item'>
                                About
                            </Link>
                            <Link to='/support/contact' className='navbar-item'>
                                Contact
                            </Link>
                            <hr className='navbar-divider' />
                            <Link to='/support/report' className='navbar-item'>
                                Report an issue
                            </Link>
                        </div>
                    </div>
                </div>

                <div className='navbar-end'>
                    <div className='navbar-item'>
                        <div className='buttons'>
                            {data.user ? (
                                <Link to='/logout'>Logout</Link>
                            ) : (
                                <>
                                    <Link to='/register' className='button is-light'>
                                        <strong>Sign up</strong>
                                    </Link>
                                    <Link to='login' className='button is-primary'>
                                        Log in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
