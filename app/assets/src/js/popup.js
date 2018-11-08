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
    console.log(result);
    new Vue({
        el     : '#app',
        data   : function () {
            var data  = {
                    checkInTime : 'N/A',
                    checkOutTime: 'N/A'
                },
                today = moment().format('YYYY-MM-DD');

            if (result.checkInTime && moment(result.checkInTime, 'x').format('YYYY-MM-DD') === today) {
                data.checkInTime = moment(result.checkInTime, 'x').format('YYYY-MM-DD HH:mm:ss');
            }

            if (result.checkOutTime && moment(result.checkOutTime, 'x').format('YYYY-MM-DD') === today) {
                data.checkOutTime = moment(result.checkOutTime, 'x').format('YYYY-MM-DD HH:mm:ss');
            }

            return data;
        },
        mounted: function () {
        }
    });
});
