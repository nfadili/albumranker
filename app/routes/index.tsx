import { Container, Stack, Text } from '@mantine/core';
import { LinkText } from '~/components/LinkText';
import { useOptionalUser } from '~/utils';

export default function Index() {
    const user = useOptionalUser();
    return (
        <Container>
            <Stack align='flex-start'>
                <Text size='lg'>Hello {user?.email ?? 'World'}!</Text>
                <LinkText to='/ranker' color='blue'>
                    Rank your albums
                </LinkText>
            </Stack>
        </Container>
    );
}
