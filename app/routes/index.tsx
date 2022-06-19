import { Container, Stack, Text } from '@mantine/core';
import { LinkButton } from '~/components/LinkButton';
import { useOptionalUser } from '~/utils';

export default function Index() {
    const user = useOptionalUser();
    return (
        <Container>
            <Stack align='flex-start'>
                <Text size='lg'>Hello {user?.email ?? 'World'}!</Text>
                <LinkButton to='/ranker'>Rank your albums</LinkButton>
            </Stack>
        </Container>
    );
}
