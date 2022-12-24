import { Header as MHeader } from '@mantine/core';
import { Button, Group, ActionIcon } from '@mantine/core';
import { Sun, MoonStars } from 'tabler-icons-react';
import { Form } from '@remix-run/react';
import { LinkButton } from '~/components/LinkButton';
import { LinkText } from '~/components/LinkText';
import { useOptionalUser } from '~/utils';
import { Theme, useTheme } from '~/theme-provider';

export const Header = () => {
    const user = useOptionalUser();
    const [theme, setTheme] = useTheme();
    const isDarkTheme = theme === 'dark';
    const toggleColorScheme = () => {
        setTheme((prevTheme) => (prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
    };

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
                    <ActionIcon
                        variant='outline'
                        color={isDarkTheme ? 'yellow' : 'blue'}
                        onClick={toggleColorScheme}
                        title='Toggle color scheme'
                    >
                        {isDarkTheme ? <Sun /> : <MoonStars />}
                    </ActionIcon>
                </Group>
            </Group>
        </MHeader>
    );
};
