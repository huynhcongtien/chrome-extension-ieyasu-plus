'use strict';

const checkTimeValid = function (time) {
    return moment(time, 'HH:mm:ss', true).isValid();
};

// get variables in background
const bkg = chrome.extension.getBackgroundPage();

// variables of chrome storage
const storageVar = [
    'workTimeStart',
    'workTimeEnd',
    'isNotification',
    'isUseNewStyle',
    'isMoveActionButton'
];

chrome.storage.sync.get(storageVar, function (result) {
    new Vue({
        el     : '#app',
        data   : function () {
            return {
                workTimeStart   : result.workTimeStart,
                workTimeEnd     : result.workTimeEnd,
                workStartHours  : null,
                workStartMinutes: null,
                workEndHours    : null,
                workEndMinutes  : null,
                errors          : {
                    workTimeStart: null,
                    workTimeEnd  : null
                },
                hoursOptions    : [],
                minutesOptions  : [],
                isNotification  : result.isNotification,
                isUseNewStyle   : result.isUseNewStyle,
                isMoveActionButton: result.isMoveActionButton
            };
        },
        mounted: function () {
            // setting hours options
            for (var hours = 0; hours < 24; hours++) {
                if (hours < 10) {
                    hours = '0' + hours;
                }
                this.hoursOptions.push({
                    text : hours,
                    value: hours
                });
            }

            // setting minutes options
            for (var minutes = 0; minutes < 60; minutes++) {
                if (minutes < 10) {
                    minutes = '0' + minutes;
                }
                this.minutesOptions.push({
                    text : minutes,
                    value: minutes
                });
            }

            // format HH:mm:ss to moment object
            var workTimeStart = moment(this.workTimeStart, 'HH:mm:ss');
            var workTimeEnd   = moment(this.workTimeEnd, 'HH:mm:ss');

            // set select option value
            this.workStartHours   = workTimeStart.format('HH');
            this.workStartMinutes = workTimeStart.format('mm');
            this.workEndHours     = workTimeEnd.format('HH');
            this.workEndMinutes   = workTimeEnd.format('mm');
        },
        methods: {
            saveSetting: function () {
                var isError = false;

                if (!checkTimeValid(this.workTimeStart)) {
                    isError                   = true;
                    this.errors.workTimeStart = 'The time is not correct';
                }

                if (!checkTimeValid(this.workTimeEnd)) {
                    isError                 = true;
                    this.errors.workTimeEnd = 'The time is not correct';
                }

                if (!isError) {
                    // reset message errors
                    this.errors.workTimeStart = null;
                    this.errors.workTimeEnd   = null;

                    // save work time start
                    var workTimeStartNew = this.workStartHours + ':' + this.workStartMinutes + ':00';
                    chrome.storage.sync.set({workTimeStart: workTimeStartNew}, function () {
                        console.log('Value of working start is set to: ' + workTimeStartNew);
                    });

                    // save work time end
                    var workTimeEndNew = this.workEndHours + ':' + this.workEndMinutes + ':00';
                    chrome.storage.sync.set({workTimeEnd: workTimeEndNew}, function () {
                        console.log('Value of working end is set to: ' + workTimeEndNew);
                    });

                    // save desktop notification
                    var isNotification = parseInt(this.isNotification);
                    chrome.storage.sync.set({isNotification: isNotification}, function () {
                        console.log('Desktop notification is set to: ' + (isNotification ? 'yes' : 'no'));
                    });

                    // save set use new style
                    var isUseNewStyle = parseInt(this.isUseNewStyle);
                    chrome.storage.sync.set({isUseNewStyle: isUseNewStyle}, function () {
                        console.log('Use new style is set to: ' + (isUseNewStyle ? 'yes' : 'no'));
                    });

                    // save move action button
                    var isMoveActionButton = parseInt(this.isMoveActionButton);
                    chrome.storage.sync.set({isMoveActionButton: isMoveActionButton}, function () {
                        console.log('Move action button is set to: ' + (isMoveActionButton ? 'yes' : 'no'));
                    });

                    // reset timeout checkout
                    clearTimeout(bkg.countdownCheckout);
                    bkg.timeoutCheckout();

                    $.notify('Save successful', 'success');
                } else {
                    $.notify('An error occurred', 'error');
                }
            }
        }
    });
});

$(function () {

});
