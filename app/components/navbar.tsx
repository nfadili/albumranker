import { Link } from 'remix';
import { User } from '~/utils/sessions.server';

interface IProps {
    user: User | null;
}

export default function NavBar({ user }: IProps) {
    return (
        <nav className='navbar' role='navigation'>
            <div className='navbar-brand'>
                <a className='navbar-item' href='/'>
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
                            {user ? (
                                <Link to='/profile'>Profile</Link>
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
