'use strict';

/**
 * Watch for changes in live edit
 */
module.exports = function () {

    return {
        options      : {
            livereload: 35729
        },
        sass_main    : {
            files: [
                '<%= theme.src %>/sass/main.scss'
            ],
            tasks: [
                'sass:main',
                'notify:watch_sass'
            ]
        },
        sass_popup   : {
            files: [
                '<%= theme.src %>/sass/popup.scss'
            ],
            tasks: [
                'sass:popup',
                'notify:watch_sass'
            ]
        },
        sass_setting : {
            files: [
                '<%= theme.src %>/sass/setting.scss'
            ],
            tasks: [
                'sass:setting',
                'notify:watch_sass'
            ]
        },
        js_main      : {
            files: [
                '<%= theme.src %>/js/content-script.js'
            ]
        },
        js_popup     : {
            files: [
                '<%= theme.src %>/js/popup.js'
            ]
        },
        js_setting   : {
            files: [
                '<%= theme.src %>/js/setting.js'
            ]
        },
        js_background: {
            files: [
                '<%= theme.src %>/js/background.js'
            ]
        },
        grunt        : {
            files  : ['Gruntfile.js'],
            options: {
                reload: true
            }
        }
    };

};
