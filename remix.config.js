/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
    cacheDirectory: './node_modules/.cache/remix',
    ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
    serverDependenciesToBundle: [
        'react-dnd',
        'react-dnd-html5-backend',
        'dnd-core',
        '@react-dnd/invariant',
        '@react-dnd/asap',
        '@react-dnd/shallowequal'
    ]
};
