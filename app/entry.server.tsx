import { renderToString } from 'react-dom/server';

import { createStylesServer, injectStyles } from '@mantine/remix';
import { RemixServer } from '@remix-run/react';

import { emotionCache } from './emotionCache';

import type { EntryContext } from '@remix-run/node';
const server = createStylesServer(emotionCache);

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) {
    let markup = renderToString(<RemixServer context={remixContext} url={request.url} />);
    responseHeaders.set('Content-Type', 'text/html');

    return new Response(`<!DOCTYPE html>${injectStyles(markup, server)}`, {
        status: responseStatusCode,
        headers: responseHeaders
    });
}
