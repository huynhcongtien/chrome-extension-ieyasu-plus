'use strict';

/**
 * Minify js files
 */
module.exports = function () {

    return {
        options       : {
            compress: {
                drop_console: false
            },
            report  : 'min',
            mangle  : true
        },
        main_dev      : {
            files: {
                '<%= theme.dist %>/js/main.core.min.js': [
                    '<%= theme.build %>/js/jquery.min.js',
                    '<%= theme.build %>/js/moment.min.js',
                    '<%= theme.src %>/js/font-awesome.js'
                ]
            }
        },
        main_pro      : {
            files: {
                '<%= theme.dist %>/js/main.min.js': [
                    '<%= theme.build %>/js/jquery.min.js',
                    '<%= theme.build %>/js/moment.min.js',
                    '<%= theme.src %>/js/font-awesome.js',
                    '<%= theme.src %>/js/content-script.js'
                ]
            }
        },
        background_dev: {
            files: {
                '<%= theme.dist %>/js/background.core.min.js': [
                    '<%= theme.build %>/js/jquery.min.js',
                    '<%= theme.build %>/js/moment.min.js'
                ]
            }
        },
        background_pro: {
            files: {
                '<%= theme.dist %>/js/background.min.js': [
                    '<%= theme.build %>/js/jquery.min.js',
                    '<%= theme.build %>/js/moment.min.js',
                    '<%= theme.src %>/js/background.js'
                ]
            }
        },
        popup_min     : {
            files: {
                '<%= theme.dist %>/js/popup.min.js': [
                    '<%= theme.src %>/js/popup.js'
                ]
            }
        },
        popup_core    : {
            files: {
                '<%= theme.dist %>/js/popup.core.min.js': [
                    '<%= theme.build %>/js/jquery.min.js',
                    '<%= theme.build %>/js/bootstrap.min.js',
                    '<%= theme.build %>/js/moment.min.js',
                    '<%= theme.build %>/js/notify.js',
                    '<%= theme.build %>/js/vue.min.js'
                ]
            }
        },
        setting_min   : {
            files: {
                '<%= theme.dist %>/js/setting.min.js': [
                    '<%= theme.src %>/js/setting.js'
                ]
            }
        },
        setting_core  : {
            files: {
                '<%= theme.dist %>/js/setting.core.min.js': [
                    '<%= theme.build %>/js/jquery.min.js',
                    '<%= theme.build %>/js/bootstrap.min.js',
                    '<%= theme.build %>/js/moment.min.js',
                    '<%= theme.build %>/js/notify.js',
                    '<%= theme.build %>/js/vue.min.js'
                ]
            }
        }
    };

};
