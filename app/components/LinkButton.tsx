import type { ButtonProps as _ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import { Link } from '@remix-run/react';

import type { LinkProps } from '@remix-run/react';
export const LinkButton = ({
    to,
    children,
    ...props
}: _ButtonProps & React.ComponentPropsWithoutRef<'button'> & { label: string } & LinkProps) => {
    return (
        <Button<typeof Link> component={Link} to={to} {...props}>
            {children}
        </Button>
    );
};
