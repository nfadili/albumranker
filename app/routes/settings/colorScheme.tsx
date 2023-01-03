import type { ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { updateUserColorScheme } from '~/models/user.server';

export const action: ActionFunction = async ({ request }) => {
    await updateUserColorScheme(request);
    return redirect('/');
};
