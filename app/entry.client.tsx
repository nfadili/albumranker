import { hydrate } from 'react-dom';

import { ClientProvider } from '@mantine/remix';
import { RemixBrowser } from '@remix-run/react';

hydrate(
    <ClientProvider>
        <RemixBrowser />
    </ClientProvider>,
    document
);
