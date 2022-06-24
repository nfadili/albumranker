import { Container, Stack, Text, Group } from '@mantine/core';
import { LinkButton } from '~/components/LinkButton';
import { useOptionalUser } from '~/utils';

export default function Index() {
    const user = useOptionalUser();

    return (
        <Container>
            <Stack align='flex-start'>
                <Text size='lg'>Welcome to AlbumRanker!</Text>
                <Text>
                    This app let's you sync your spotify library and rank the albums into lists
                    grouped by year.
                </Text>
                <Group spacing='sm'>
                    <LinkButton to='/ranker'>Rank your albums</LinkButton>
                    {user && <LinkButton to='/users'>See other users</LinkButton>}
                </Group>
            </Stack>
        </Container>
    );
}
