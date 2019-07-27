'use strict';

/**
 * Replace text patterns with applause
 */
module.exports = function () {

    return {
        dev: {
            options: {
                usePrefix: false,
                patterns : [
                    {
                        match      : 'assets/dist/js/popup.min.js',
                        replacement: 'assets/src/js/popup.js'
                    },
                    {
                        match      : 'assets/dist/js/setting.min.js',
                        replacement: 'assets/src/js/setting.js'
                    }
                ]
            },
            files  : [
                {
                    expand : true,
                    flatten: true,
                    src    : [
                        '<%= theme.pages %>/popup.html',
                        '<%= theme.pages %>/setting.html'
                    ],
                    dest   : '<%= theme.pages %>/'
                }
            ]
        },
        pro: {
            options: {
                usePrefix: false,
                patterns : [
                    {
                        match      : 'assets/src/js/popup.js',
                        replacement: 'assets/dist/js/popup.min.js'
                    },
                    {
                        match      : 'assets/src/js/setting.js',
                        replacement: 'assets/dist/js/setting.min.js'
                    }
                ]
            },
            files  : [
                {
                    expand : true,
                    flatten: true,
                    src    : [
                        '<%= theme.pages %>/popup.html',
                        '<%= theme.pages %>/setting.html'
                    ],
                    dest   : '<%= theme.pages %>/'
                }
            ]
        }
    };

};
