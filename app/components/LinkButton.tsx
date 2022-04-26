import type { ButtonProps as _ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';

type ButtonProps = Omit<_ButtonProps<LinkProps>, 'component'>;

export const LinkButton = ({ to, children, ...props }: ButtonProps & LinkProps) => {
    return (
        <Button<typeof Link> component={Link} to={to} {...props}>
            {children}
        </Button>
    );
};
