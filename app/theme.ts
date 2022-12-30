// or if you want to "extend" standard colors
import type { Tuple, DefaultMantineColor, MantineThemeOverride } from '@mantine/core';

type ExtendedCustomColors = 'brand' | DefaultMantineColor;

declare module '@mantine/core' {
    export interface MantineThemeColorsOverride {
        colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
    }
}

export enum ColorScheme {
    Dark = 'dark',
    Light = 'light'
}

export const lightTheme: MantineThemeOverride = {
    colorScheme: 'light',
    colors: {
        brand: [
            '#edf0ff',
            '#ced1e7',
            '#aeb3d1',
            '#8e94bd',
            '#6e76aa',
            '#545c90',
            '#424871',
            '#2f3352',
            '#1b1f33',
            '#070917'
        ]
    },
    primaryColor: 'brand'
};

export const darkTheme: MantineThemeOverride = {
    colorScheme: ColorScheme.Dark,
    primaryColor: 'orange'
};
