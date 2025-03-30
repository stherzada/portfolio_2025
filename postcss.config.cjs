module.exports = {
    plugins: {
        'postcss-import': {},
        'tailwindcss/nesting': {},
        tailwindcss: {},
        autoprefixer: {},
        ...(process.env.NODE_ENV === 'production'
            ? {
                cssnano: {
                    preset: ['advanced', {
                        discardComments: { removeAll: true },
                        reduceIdents: true,
                        minifyFontValues: true,
                        minifyGradients: true,
                        minifyParams: true,
                        minifySelectors: true,
                        normalizeWhitespace: true,
                        normalizeUrl: true,
                        mergeRules: true,
                        mergeLonghand: true,
                        mergeIdents: true,
                        discardDuplicates: true,
                        discardEmpty: true,
                        discardUnused: true,
                        zindex: false
                    }]
                }
            }
            : {})
    },
} 