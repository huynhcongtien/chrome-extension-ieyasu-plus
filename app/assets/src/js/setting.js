'use strict';

chrome.storage.sync.get(['workTimeStart', 'workTimeEnd'], function (result) {
    new Vue({
        el     : '#app',
        data   : function () {
            return {
                workTimeStart: result.workTimeStart,
                workTimeEnd  : result.workTimeEnd
            };
        },
        mounted: function () {

        },
        methods: {
            saveSetting: function (event) {
                console.log(this.workTimeStart);
            }
        }
    });
});

$(function () {
    $('.datetime-picker').datetimepicker();
});
