import { ActionFunction, HeadersFunction, Link, LinksFunction, MetaFunction } from 'remix';
import { useActionData, Form } from 'remix';
import { login, createUserSession, doesUserExist, register } from '~/utils/sessions.server';
import stylesUrl from '~/styles/login.css';

type ActionData = {
    formError?: string;
    fieldErrors?: { username: string | undefined; password: string | undefined };
    fields?: { loginType: string; username: string; password: string };
};

function validateUsername(username: unknown) {
    if (typeof username !== 'string' || username.length < 3) {
        return `Usernames must be at least 3 characters long`;
    }
}

function validatePassword(password: unknown) {
    if (typeof password !== 'string' || password.length < 6) {
        return `Passwords must be at least 6 characters long`;
    }
}

export let meta: MetaFunction = () => {
    return {
        title: 'Login',
        description: 'Login to get started!'
    };
};

export let links: LinksFunction = () => {
    return [{ rel: 'stylesheet', href: stylesUrl }];
};

export let headers: HeadersFunction = () => {
    return {
        'Cache-Control': `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24 * 30}`
    };
};

export let action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
    let { loginType, username, password } = Object.fromEntries(await request.formData());
    if (
        typeof loginType !== 'string' ||
        typeof username !== 'string' ||
        typeof password !== 'string'
    ) {
        return { formError: `Form not submitted correctly.` };
    }

    let fields = { loginType, username, password };
    let fieldErrors = {
        username: validateUsername(username),
        password: validatePassword(password)
    };
    if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, fields };

    switch (loginType) {
        case 'login': {
            const user = await login({ username, password });
            if (!user) {
                return {
                    fields,
                    formError: `Username/Password combination is incorrect`
                };
            }
            return createUserSession(user.id, '/');
        }
        case 'register': {
            const userExists = await doesUserExist(username);
            if (userExists) {
                return {
                    fields,
                    formError: `User with username ${username} already exists`
                };
            }
            const user = await register({ username, password });
            if (!user) {
                return {
                    fields,
                    formError: `Something went wrong trying to create a new user.`
                };
            }
            return createUserSession(user.id, '/');
        }
        default: {
            return { fields, formError: `Login type invalid` };
        }
    }
};

export default function Login() {
    const actionData = useActionData<ActionData | undefined>();
    return (
        <div className='page'>
            <div className='box has-text-centered'>
                <Form method='post' className='control'>
                    <fieldset className='field'>
                        <legend>Login or Register?</legend>
                        <label className='radio'>
                            <input
                                type='radio'
                                name='loginType'
                                value='login'
                                defaultChecked={
                                    !actionData?.fields?.loginType ||
                                    actionData?.fields?.loginType === 'login'
                                }
                            />{' '}
                            Login
                        </label>
                        <label className='radio'>
                            <input
                                type='radio'
                                name='loginType'
                                value='register'
                                defaultChecked={actionData?.fields?.loginType === 'register'}
                            />{' '}
                            Register
                        </label>
                    </fieldset>
                    <div className='field'>
                        <input
                            type='text'
                            id='username-input'
                            name='username'
                            required
                            defaultValue={actionData?.fields?.username}
                            placeholder='Username'
                            className='input is-medium'
                        />
                        {actionData?.fieldErrors?.username ? (
                            <p role='alert' id='username-error'>
                                {actionData.fieldErrors.username}
                            </p>
                        ) : null}
                    </div>
                    <div className='field'>
                        <input
                            id='password-input'
                            name='password'
                            required
                            defaultValue={actionData?.fields?.password}
                            type='password'
                            placeholder='Password'
                            className='input is-medium'
                        />
                        {actionData?.fieldErrors?.password ? (
                            <p role='alert' id='password-error'>
                                {actionData.fieldErrors.password}
                            </p>
                        ) : null}
                    </div>
                    <div id='form-error-message'>
                        {actionData?.formError ? <p role='alert'>{actionData.formError}</p> : null}
                    </div>
                    <button
                        type='submit'
                        className='button is-block is-fullwidth is-primary is-medium'
                    >
                        Submit
                    </button>
                </Form>
                <br />
                <div>
                    <Link to='/'>Back home</Link>
                </div>
            </div>
        </div>
    );
}
