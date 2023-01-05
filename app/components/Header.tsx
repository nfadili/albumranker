import { MoonStars as IconMoonStars, Sun as IconSun } from 'tabler-icons-react';
import { LinkButton } from '~/components/LinkButton';
import { LinkText } from '~/components/LinkText';
import { useColorScheme } from '~/theme';
import { useOptionalUser } from '~/utils';

import { ActionIcon, Button, Group, Header as MHeader } from '@mantine/core';
import { Form } from '@remix-run/react';

export const Header = ({ onToggleColorScheme }: any) => {
    const user = useOptionalUser();
    const { isDarkTheme } = useColorScheme();

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
                <ActionIcon
                    variant='outline'
                    color={isDarkTheme ? 'yellow' : 'blue'}
                    onClick={() => onToggleColorScheme()}
                    title='Toggle color scheme'
                >
                    {isDarkTheme ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                </ActionIcon>
            </Group>
        </MHeader>
    );
};
