import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import * as React from 'react';
import {
    Button,
    Checkbox,
    Container,
    Group,
    PasswordInput,
    Stack,
    Text,
    TextInput
} from '@mantine/core';
import { safeRedirect, validateEmail } from '~/utils';
import { getUserId, createUserSession } from '~/session.server';
import { createUser, getUserByEmail } from '~/models/user.server';
import { LinkText } from '~/components/LinkText';

export const meta: MetaFunction = () => {
    return {
        title: 'Sign Up'
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await getUserId(request);
    if (userId) return redirect('/');
    return json({});
};

interface ActionData {
    errors: {
        email?: string;
        password?: string;
    };
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const redirectTo = safeRedirect(formData.get('redirectTo'), '/profile');

    if (!validateEmail(email)) {
        return json<ActionData>({ errors: { email: 'Email is invalid' } }, { status: 400 });
    }

    if (typeof password !== 'string') {
        return json<ActionData>({ errors: { password: 'Password is required' } }, { status: 400 });
    }

    if (password.length < 8) {
        return json<ActionData>({ errors: { password: 'Password is too short' } }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return json<ActionData>(
            { errors: { email: 'A user already exists with this email' } },
            { status: 400 }
        );
    }

    const user = await createUser(email, password);

    return createUserSession({
        request,
        userId: user.id,
        remember: false,
        redirectTo
    });
};

export default function Join() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') ?? undefined;
    const actionData = useActionData() as ActionData;
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (actionData?.errors?.email) {
            emailRef.current?.focus();
        } else if (actionData?.errors?.password) {
            passwordRef.current?.focus();
        }
    }, [actionData]);

    return (
        <Container size='xs'>
            <Form method='post'>
                <Stack align='left' justify='center'>
                    <TextInput
                        name='email'
                        label='Email'
                        type='email'
                        ref={emailRef}
                        error={actionData?.errors?.email}
                        autoFocus
                        required
                    />
                    <PasswordInput
                        name='password'
                        label='Password'
                        description='Password must include at least one letter, number and special character'
                        ref={passwordRef}
                        error={actionData?.errors?.password}
                        required
                    />
                    <input type='hidden' name='redirectTo' value={redirectTo} />
                    <Button type='submit'>Sign Up</Button>
                    <div>
                        <Checkbox name='remember' label='Remember me' />
                        <Group>
                            <Text>Already have an account?</Text>
                            <LinkText
                                to={{
                                    pathname: '/auth/login',
                                    search: searchParams.toString()
                                }}
                            >
                                Login
                            </LinkText>
                        </Group>
                    </div>
                </Stack>
            </Form>
        </Container>
    );
}
