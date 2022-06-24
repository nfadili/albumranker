import { Container, List, Text, ThemeIcon } from '@mantine/core';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/server-runtime';
import { getAllUsers } from '~/models/user.server';
import { LinkText } from '~/components/LinkText';
import { User } from '~/spotify/client.server';
import { User as UserIcon } from 'tabler-icons-react';
import { useOptionalUser } from '~/utils';

type LoaderData = {
    users: User[];
};
export const loader: LoaderFunction = async ({ request }) => {
    const users = await getAllUsers();
    return { users };
};

export default function Index() {
    const { users } = useLoaderData<LoaderData>();

    return (
        <Container>
            <Text size='xl'>Users</Text>
            <List
                spacing='xs'
                size='sm'
                center
                icon={
                    <ThemeIcon color='brand' size={24} radius='md'>
                        <UserIcon size={16} />
                    </ThemeIcon>
                }
            >
                {users.map((user) => (
                    <List.Item key={user.id}>
                        <LinkText to={`/users/${user.id}`} color='brand'>
                            {user.email}
                        </LinkText>
                    </List.Item>
                ))}
            </List>
        </Container>
    );
}
