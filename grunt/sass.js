'use strict';

/**
 * Compile sass to css
 */
module.exports = function () {

    return {
        dist: {
            options: {
                sourcemap: 'none',
                style    : 'expanded'
            },
            files  : {
                '<%= theme.build %>/css/main.css'  : '<%= theme.src %>/sass/main.scss',
                '<%= theme.build %>/css/popup.css' : '<%= theme.src %>/sass/popup.scss'
            }
        }
    };

};
