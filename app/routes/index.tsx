import { Container, Stack, Text } from '@mantine/core';
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
                <LinkButton to='/ranker'>Rank your albums</LinkButton>
            </Stack>
        </Container>
    );
}
