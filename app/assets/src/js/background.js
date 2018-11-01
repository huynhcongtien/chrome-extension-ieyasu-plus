'use strict';

console.log('\'Allo \'Allo! Event Page for Browser Action');

// chrome.storage.sync.clear();

// the extension has been installed/updated
chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);

    chrome.storage.sync.get(['workTimeEnd'], function (result) {
        if (!result.workTimeEnd) {
            var workTimeEnd = '19:00:00';
            chrome.storage.sync.set({workTimeEnd: workTimeEnd}, function () {
                console.log('Value is set to ' + workTimeEnd);
            });
        }
    });
});

//chrome.browserAction.setBadgeText({text: 'Notice'});

// add notification for check-in
var noticeCheckIn = function () {
    var opt = {
        type              : 'basic',
        title             : 'Lampart',
        message           : 'Begin of working hours. Check-in! :)',
        iconUrl           : '../assets/dist/img/icon-128.png',
        buttons           : [
            {
                title: 'Agree'
            },
            {
                title: 'Close'
            }
        ],
        requireInteraction: true
    };

    chrome.notifications.create('warningCheckIn', opt, function (id) {
        if (chrome.runtime.lastError) {
            console.error(id + ':' + chrome.runtime.lastError.message);
        }
    });
};

// add notification for checkout
var noticeCheckOut = function () {
    var opt = {
        type              : 'basic',
        title             : 'Lampart',
        message           : 'End of working hours. Checkout! :)',
        iconUrl           : '../assets/dist/img/icon-128.png',
        buttons           : [
            {
                title: 'Agree'
            },
            {
                title: 'Close'
            }
        ],
        requireInteraction: true
    };

    chrome.notifications.create('warningCheckOut', opt, function (id) {
        if (chrome.runtime.lastError) {
            console.error(id + ':' + chrome.runtime.lastError.message);
        }
    });
};

// check check-in
chrome.storage.sync.get(['checkInTime'], function (result) {
    if (!result.checkInTime || result.checkInTime.format('YYYY:MM:DD') !== moment().format('YYYY:MM:DD')) {
        noticeCheckIn();
    }
});

// check check-out
chrome.storage.sync.get(['checkOutTime'], function (resultCheckOut) {
    chrome.storage.sync.get(['checkInTime'], function (resultCheckIn) {
        // not check-in
        if (!resultCheckIn.checkInTime) {
            return;
        }

        // not check out in today
        if (!resultCheckOut.checkOutTime ||
            resultCheckOut.checkOutTime.format('YYYY:MM:DD') !== moment().format('YYYY:MM:DD')
        ) {
            noticeCheckOut();
        }
    });
});

// open link checkout
chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
    if (buttonIndex === 0) {
        chrome.tabs.create({url: 'https://ieyasu.co/timestamp'});
    }
});

var date    = new Date(),
    weekday = date.getDay();

// only show notification in workdays
if (weekday > 0 && weekday < 6) {
    chrome.storage.sync.get(['workTimeEnd'], function (result) {
        var now         = moment(),
            workEndTime = moment().format('YYYY:MM:DD ' + result.workTimeEnd);

        var ms = moment(workEndTime, 'YYYY:MM:DD HH:mm:ss').diff(now);

        if (ms > 0) {
            setTimeout(noticeCheckOut, ms);
        }
    });
}

// chrome.tabs.onRemoved.addListener(function (tabid, removed) {
//     alert("tab closed");
// });

// chrome.windows.onRemoved.addListener(function (windowid) {
//     alert("window closed");
// });

