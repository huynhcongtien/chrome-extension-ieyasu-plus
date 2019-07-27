'use strict';

/**
 * Compile sass to css
 */
module.exports = function () {

    return {
        main   : {
            options: {
                sourcemap: 'none',
                style    : 'compressed'
            },
            files  : {
                '<%= theme.dist %>/css/main.min.css': '<%= theme.src %>/sass/main.scss'
            }
        },
        popup  : {
            options: {
                sourcemap: 'none',
                style    : 'compressed'
            },
            files  : {
                '<%= theme.dist %>/css/popup.min.css': '<%= theme.src %>/sass/popup.scss'
            }
        },
        setting: {
            options: {
                sourcemap: 'none',
                style    : 'compressed'
            },
            files  : {
                '<%= theme.dist %>/css/setting.min.css': '<%= theme.src %>/sass/setting.scss'
            }
        }
    };

};
