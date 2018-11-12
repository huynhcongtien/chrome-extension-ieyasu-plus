'use strict';

// get variables in background
const bkg = chrome.extension.getBackgroundPage();

$(function () {

    $('[data-href]').click(function () {
        var link       = $(this).data('href'),
            samplePage = chrome.extension.getURL(link);

        window.open(samplePage, '_blank');
    });

});

// variables of chrome storage
const storageVar = [
    'workTimeStart',
    'workTimeEnd',
    'isNotification',
    'isUseNewStyle',
    'isMoveActionButton',
    'checkInTime',
    'checkOutTime'
];

chrome.storage.sync.get(storageVar, function (result) {
    new Vue({
        el     : '#app',
        data   : function () {
            var data  = {
                checkInTime      : 'N/A',
                checkOutTime     : 'N/A',
                countdownCheckout: 'N/A'
            };
            var today = moment().format('YYYY-MM-DD');

            if (result.checkInTime && moment(result.checkInTime, 'x').format('YYYY-MM-DD') === today) {
                data.checkInTime = moment(result.checkInTime, 'x').format('YYYY-MM-DD HH:mm:ss');
            }

            if (result.checkOutTime && moment(result.checkOutTime, 'x').format('YYYY-MM-DD') === today) {
                data.checkOutTime = moment(result.checkOutTime, 'x').format('YYYY-MM-DD HH:mm:ss');
            }

            return data;
        },
        mounted: function () {
            var appVar = this;

            chrome.storage.sync.get(['workTimeEnd'], function (result) {
                console.log(result);
                // var eventTime   = moment(result.workTimeEnd, 'HH:mm:ss').format('x'),
                //     currentTime = moment().format('x'),
                //     diffTime    = eventTime - currentTime,
                //     duration    = moment.duration(diffTime, 'milliseconds'),

                var now         = null,
                    ms          = null,
                    workEndTime = moment().format('YYYY-MM-DD ' + result.workTimeEnd),
                    interval    = 1000;

                setInterval(function () {
                    now = moment();
                    // milliseconds from now to work time end
                    ms  = moment(workEndTime, 'YYYY-MM-DD HH:mm:ss').diff(now);

                    appVar.countdownCheckout = moment.utc(ms).format('HH:mm:ss');
                }, interval);
            });
console.log(bkg);
            if (bkg.countdownCheckout) {
                // setInterval(function () {
                //     console.log(1313);
                // }, 1000);
            }
        }
    });
});
