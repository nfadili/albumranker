// or if you want to "extend" standard colors
import { Tuple, DefaultMantineColor, MantineThemeOverride } from '@mantine/core';
import { useState } from 'react';

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

const lightTheme: MantineThemeOverride = {
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

const darkTheme: MantineThemeOverride = {
    colorScheme: ColorScheme.Dark,
    primaryColor: 'orange'
};

export const useColorScheme = (userColorScheme?: ColorScheme, onToggleColorScheme?: any) => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>(
        userColorScheme ?? ColorScheme.Light
    );

    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(
            value || (colorScheme === ColorScheme.Dark ? ColorScheme.Light : ColorScheme.Dark)
        );
    const handleToggleColorScheme = () => {
        onToggleColorScheme(null, {
            method: 'post',
            action: '/settings/colorScheme',
            replace: true
        });
        toggleColorScheme();
    };
    const isDarkTheme = colorScheme === ColorScheme.Dark;
    const isLightTheme = colorScheme === ColorScheme.Light;

    return {
        isDarkTheme,
        isLightTheme,
        colorScheme,
        toggleColorScheme,
        handleToggleColorScheme,
        theme: isDarkTheme ? darkTheme : lightTheme
    };
};
