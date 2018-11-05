'use strict';

const checkTimeValid = function (time) {
    return moment(time, 'HH:mm:ss', true).isValid();
}

chrome.storage.sync.get(['workTimeStart', 'workTimeEnd'], function (result) {
    new Vue({
        el     : '#app',
        data   : function () {
            return {
                workTimeStart: result.workTimeStart,
                workTimeEnd  : result.workTimeEnd,
                errors: {
                    workTimeStart: null
                }
            };
        },
        mounted: function () {

        },
        methods: {
            saveSetting: function () {
                console.log(this.workTimeStart);

                console.log(checkTimeValid(this.workTimeStart));

                if (checkTimeValid(this.workTimeStart)) {
                    var workTimeStartNew = this.workTimeStart;
                    chrome.storage.sync.set({workTimeStart: workTimeStartNew}, function () {
                        console.log('Value of working start is set to: ' + workTimeStartNew);
                    });
                } else {
                    this.errors.workTimeStart = 'The time is not correct';
                    console.log(this.errors);
                }
            }
        }
    });
});

$(function () {
    // $('.datetime-picker').datetimepicker();
    console.log(121313);
});
