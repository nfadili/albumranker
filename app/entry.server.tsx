import { renderToString } from 'react-dom/server';
import { RemixServer } from '@remix-run/react';
import type { EntryContext } from '@remix-run/node';
import { injectStylesIntoStaticMarkup } from '@mantine/ssr';

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) {
    const markup = renderToString(<RemixServer context={remixContext} url={request.url} />);
    const markupWithMantine = injectStylesIntoStaticMarkup(markup);
    responseHeaders.set('Content-Type', 'text/html');

    return new Response(`<!DOCTYPE html>${markupWithMantine}`, {
        status: responseStatusCode,
        headers: responseHeaders
    });
}
