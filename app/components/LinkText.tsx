import type { TextProps as _TextProps } from '@mantine/core';
import { Text } from '@mantine/core';
import { Link } from '@remix-run/react';

import type { LinkProps } from '@remix-run/react';

export const LinkText = ({ to, children, ...props }: _TextProps & LinkProps) => {
    return (
        <Text<typeof Link> component={Link} to={to} {...props}>
            {children}
        </Text>
    );
};
