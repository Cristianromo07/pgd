/** @type {import('tailwindcss').Config} */

// Paleta "retro admin" estilo paneles PHP de los 2000: azules sobrios,
// grises acero, verdes/rojos desaturados. Se sobreescribe la paleta usada
// en el proyecto (slate, blue, emerald, rose, red, amber, indigo, purple,
// orange, gray) para que toda la app cambie de tema con las mismas clases.
const steel = {
    50: '#f2f4f6',
    100: '#e5e9ed',
    200: '#d0d7de',
    300: '#b1bcc7',
    400: '#8b9aa8',
    500: '#6b7c8d',
    600: '#51606f',
    700: '#3f4b58',
    800: '#2b3540',
    900: '#1c242e',
    950: '#11161d',
};

const classicBlue = {
    50: '#edf3fa',
    100: '#dbe7f4',
    200: '#b6cdea',
    300: '#8aacd9',
    400: '#5787c4',
    500: '#316aaf',
    600: '#20518f',
    700: '#183f70',
    800: '#143357',
    900: '#112741',
    950: '#0a1a2c',
};

const mutedGreen = {
    50: '#eef7f0',
    100: '#dceee0',
    200: '#b9dcc3',
    300: '#8cc39c',
    400: '#5ba676',
    500: '#3c8a58',
    600: '#2b6f44',
    700: '#245a39',
    800: '#1d4a2f',
    900: '#183d27',
    950: '#0c2415',
};

const mutedRose = {
    50: '#fdf2f3',
    100: '#fbe5e8',
    200: '#f6cbd2',
    300: '#eda3ae',
    400: '#e17084',
    500: '#cd4a64',
    600: '#b0324f',
    700: '#8e2741',
    800: '#732036',
    900: '#611d2f',
    950: '#380e1b',
};

const mutedRed = {
    50: '#fdf3f1',
    100: '#fbe5e1',
    200: '#f6ccc4',
    300: '#eea79b',
    400: '#e37969',
    500: '#d14f3a',
    600: '#b23827',
    700: '#932e21',
    800: '#78281e',
    900: '#63251d',
    950: '#371209',
};

const mutedAmber = {
    50: '#fdf9ee',
    100: '#fbefcf',
    200: '#f6df9f',
    300: '#efc866',
    400: '#e7ad3a',
    500: '#d9922a',
    600: '#b87324',
    700: '#935820',
    800: '#77481f',
    900: '#653d1e',
    950: '#3a200e',
};

const mutedIndigo = {
    50: '#f0f1fb',
    100: '#e3e5f6',
    200: '#c6caee',
    300: '#9ea4df',
    400: '#727acc',
    500: '#5259b6',
    600: '#3f4597',
    700: '#34387b',
    800: '#2c2f64',
    900: '#292b54',
    950: '#171833',
};

const mutedPurple = {
    50: '#f9f1fc',
    100: '#f3e2f9',
    200: '#e8c5f3',
    300: '#d99cea',
    400: '#c46cde',
    500: '#ac46cf',
    600: '#902fb4',
    700: '#752593',
    800: '#5f1f79',
    900: '#4f1c66',
    950: '#2f0d3d',
};

const mutedOrange = {
    50: '#fef7ee',
    100: '#fdecd5',
    200: '#fad8ab',
    300: '#f6bc76',
    400: '#f19940',
    500: '#ed7d1a',
    600: '#d15f10',
    700: '#a94810',
    800: '#873a14',
    900: '#6e3013',
    950: '#3c1808',
};

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Tahoma', '"Trebuchet MS"', 'Verdana', 'Geneva', 'Arial', 'sans-serif'],
                mono: ['"Courier New"', 'Courier', 'monospace'],
            },
            colors: {
                slate: steel,
                gray: steel,
                blue: classicBlue,
                emerald: mutedGreen,
                green: mutedGreen,
                rose: mutedRose,
                red: mutedRed,
                amber: mutedAmber,
                indigo: mutedIndigo,
                purple: mutedPurple,
                violet: mutedPurple,
                orange: mutedOrange,
            },
        },
    },
    plugins: [],
}
