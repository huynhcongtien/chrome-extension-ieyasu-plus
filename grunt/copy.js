'use strict';

/**
 * Copy files and folders
 */
module.exports = function () {

    return {
        pro: {
            files: [
                {
                    expand : true,
                    flatten: true,
                    cwd    : 'node_modules',
                    dest   : '<%= theme.build %>/css/',
                    src    : [
                        'bootstrap/dist/css/bootstrap.css'
                    ]
                },
                {
                    expand : true,
                    flatten: true,
                    cwd    : 'node_modules',
                    dest   : '<%= theme.build %>/js/',
                    src    : [
                        'bootstrap/dist/js/bootstrap.min.js',
                        'jquery/dist/jquery.js',
                        'moment/min/moment.min.js',
                        'vue/dist/vue.min.js',
                        'bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js'
                    ]
                },
                {
                    expand : true,
                    flatten: true,
                    cwd    : 'app',
                    dest   : '<%= theme.dist %>/img/',
                    src    : [
                        'assets/src/img/*'
                    ]
                }
            ]
        }
    };

};
