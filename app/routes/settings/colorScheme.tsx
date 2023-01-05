import type { ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { updateUserColorScheme } from '~/models/user.server';
import { getUser } from '~/session.server';

export const action: ActionFunction = async ({ request }) => {
    const user = await getUser(request);
    if (!user) {
        throw redirect('/auth/login');
    }
    await updateUserColorScheme(user.id);
    return redirect('/');
};
