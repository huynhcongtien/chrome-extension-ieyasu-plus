'use strict';

/**
 * Minify css files
 */
module.exports = function () {

    return {
        options     : {
            keepSpecialComments: 0
        },
        popup_core  : {
            dest: '<%= theme.dist %>/css/popup.core.min.css',
            src : [
                '<%= theme.build %>/css/bootstrap.css',
                '<%= theme.build %>/css/font-awesome.min.css',
                '<%= theme.src %>/css/switcher.css',
                '<%= theme.build %>/css/popup.css'
            ]
        },
        setting_core: {
            dest: '<%= theme.dist %>/css/setting.core.min.css',
            src : [
                '<%= theme.build %>/css/bootstrap.css',
                '<%= theme.build %>/css/font-awesome.min.css',
                '<%= theme.build %>/css/setting.css'
            ]
        }
    };

};
