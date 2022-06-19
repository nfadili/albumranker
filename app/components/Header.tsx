import { Header as MHeader } from '@mantine/core';
import { Button, Group } from '@mantine/core';
import { Form } from '@remix-run/react';
import { LinkButton } from '~/components/LinkButton';
import { LinkText } from '~/components/LinkText';
import { useOptionalUser } from '~/utils';

export const Header = () => {
    const user = useOptionalUser();

    return (
        <MHeader height={60} p='xs'>
            <Group position='apart'>
                <Group>
                    <LinkText size='lg' weight='bold' to='/'>
                        AlbumRanker
                    </LinkText>
                </Group>
                <Group>
                    {user ? (
                        <>
                            <LinkButton variant='light' to='/profile'>
                                Profile
                            </LinkButton>
                            <Form action='/auth/logout' method='post'>
                                <Button variant='outline' type='submit'>
                                    Logout
                                </Button>
                            </Form>
                        </>
                    ) : (
                        <>
                            <LinkButton to='/auth/login'>Login</LinkButton>
                            <LinkButton variant='light' to='/auth/join'>
                                Sign Up
                            </LinkButton>
                        </>
                    )}
                </Group>
            </Group>
        </MHeader>
    );
};
