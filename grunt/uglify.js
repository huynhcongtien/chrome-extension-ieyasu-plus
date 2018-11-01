'use strict';

/**
 * Minify js files
 */
module.exports = function () {

    return {
        options   : {
            compress: {
                warnings: false
            },
            report  : 'min',
            mangle  : true
        },
        main      : {
            files: {
                '<%= theme.dist %>/js/main.min.js': [
                    '<%= theme.build %>/js/jquery.js',
                    '<%= theme.build %>/js/moment.min.js',
                    '<%= theme.src %>/js/contentscript.js'
                ]
            }
        },
        popup     : {
            files: {
                '<%= theme.dist %>/js/popup.min.js': [
                    '<%= theme.build %>/js/jquery.js',
                    '<%= theme.src %>/js/popup.js'
                ]
            }
        },
        sample    : {
            files: {
                '<%= theme.dist %>/js/sample.min.js': [
                    '<%= theme.build %>/js/jquery.js',
                    '<%= theme.src %>/js/sample.js'
                ]
            }
        },
        background: {
            files: {
                '<%= theme.dist %>/js/background.min.js': [
                    '<%= theme.build %>/js/jquery.js',
                    '<%= theme.build %>/js/moment.min.js',
                    '<%= theme.src %>/js/background.js'
                ]
            }
        }
    };

};
