module.exports = {
    plugins: [
        /*require('postcss-inline-svg')({removeFill: false}),             require('postcss-pxtorem')({
            replace: process.env.NODE_ENV === 'production',
            rootValue: 750 / 16,
            minPixelValue: 1.1,
            propWhiteList: [],
            unitPrecision: 5
        }),*/
        require('autoprefixer')({
            browsers: [
                'iOS>7',
                'Android>4',
                "> 1%",
                "last 5 versions",
                "not ie <= 8"
            ]
        })]
};