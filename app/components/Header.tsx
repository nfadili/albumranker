import { Header as MHeader } from '@mantine/core';
import { Button, Group, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { Sun, MoonStars } from 'tabler-icons-react';
import { Form } from '@remix-run/react';
import { LinkButton } from '~/components/LinkButton';
import { LinkText } from '~/components/LinkText';
import { useOptionalUser } from '~/utils';

export const Header = () => {
    const user = useOptionalUser();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

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
                            <ActionIcon
                                variant='outline'
                                color={dark ? 'yellow' : 'blue'}
                                onClick={() => toggleColorScheme()}
                                title='Toggle color scheme'
                            >
                                {dark ? <Sun /> : <MoonStars />}
                            </ActionIcon>
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
