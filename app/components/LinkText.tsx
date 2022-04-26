import type { TextProps as _TextProps } from '@mantine/core';
import { Text } from '@mantine/core';
import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';

type TextProps = Omit<_TextProps<LinkProps>, 'component'>;

export const LinkText = ({ to, children, ...props }: TextProps & LinkProps) => {
    return (
        <Text<typeof Link> component={Link} to={to} {...props}>
            {children}
        </Text>
    );
};
