'use strict';

console.log('\'Allo \'Allo! Event Page for Browser Action');

chrome.storage.sync.clear();

// the extension has been installed/updated
chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);

    var storageVars = [
        'workingDays',
        'workTimeStart',
        'workTimeEnd',
        'isNotification',
        'isUseNewStyle',
        'isMoveActionButton'
    ];

    chrome.storage.sync.get(storageVars, function (result) {
        if (result.workingDays) {
            console.log('Working days: ' + result.workingDays + ' (0 (for Sunday) through 6 (for Saturday)');
        } else {
            // 0 (for Sunday) through 6 (for Saturday)
            var workingDays = [1, 2, 3, 4, 5];
            chrome.storage.sync.set({workingDays: workingDays}, function () {
                console.log('Working days is set to: ' + workingDays);
            });
        }

        // setting start time working days
        if (result.workTimeStart) {
            console.log('Working time start: ' + result.workTimeStart);
        } else {
            // save working time end if not set
            var workTimeStart = '08:00:00';
            chrome.storage.sync.set({workTimeStart: workTimeStart}, function () {
                console.log('Value of working start is set to: ' + workTimeStart);
            });
        }

        // setting end time working days
        if (result.workTimeEnd) {
            console.log('Working time end: ' + result.workTimeEnd);
        } else {
            // save working time end if not set
            var workTimeEnd = '17:00:00';
            chrome.storage.sync.set({workTimeEnd: workTimeEnd}, function () {
                console.log('Value of working end is set to: ' + workTimeEnd);
            });
        }

        // setting desktop notification
        if (typeof result.isNotification !== 'undefined') {
            console.log('Desktop notifications is: ' + (result.isNotification ? 'yes' : 'no'));
        } else {
            // setting desktop notification default is allow
            chrome.storage.sync.set({isNotification: 1}, function () {
                console.log('Desktop notifications is set to: yes');
            });
        }

        // use new style
        if (typeof result.isUseNewStyle !== 'undefined') {
            console.log('Use new style is: ' + (result.isUseNewStyle ? 'yes' : 'no'));
        } else {
            // setting desktop notification default is allow
            chrome.storage.sync.set({isUseNewStyle: 1}, function () {
                console.log('Use new style is set to: yes');
            });
        }

        // use new style
        if (typeof result.isMoveActionButton !== 'undefined') {
            console.log('Move action button is: ' + (result.isMoveActionButton ? 'yes' : 'no'));
        } else {
            // setting desktop notification default is allow
            chrome.storage.sync.set({isMoveActionButton: 1}, function () {
                console.log('Move action button is set to: yes');
            });
        }
    });
});

//chrome.browserAction.setBadgeText({text: 'Notice'});

// add notification for check-in
var noticeCheckIn = function () {
    var opt = {
        type              : 'basic',
        title             : 'Ieyasu Plus',
        message           : 'Begin of working hours. Check-in! :)',
        iconUrl           : '../assets/dist/img/icon-128.png',
        buttons           : [
            {
                title: 'Open the site'
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
        title             : 'Ieyasu Plus',
        message           : 'End of working hours. Checkout! :)',
        iconUrl           : '../assets/dist/img/icon-128.png',
        buttons           : [
            {
                title: 'Open the site'
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

var isWorkingDate = function () {
    var date    = new Date(),
        weekday = date.getDay();

    // set notification checkout only workdays: 1 to 5 is Monday to Friday
    if (weekday === 0 || weekday > 5) {
        return false;
    }

    return true;
};

/**
 * Check check-in
 */
chrome.storage.sync.get(['checkInTime', 'workTimeEnd', 'isNotification'], function (result) {
    if (!result.isNotification || !isWorkingDate() || moment().format('HH:mm:ss') > result.workTimeEnd) {
        return;
    }

    if (!result.checkInTime ||
        moment(result.checkInTime, 'x').format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')
    ) {
        noticeCheckIn();
    }
});

/**
 * Check check-out
 */
chrome.storage.sync.get(['checkInTime', 'checkOutTime', 'workTimeEnd', 'isNotification'], function (result) {
    // not is working date or check-in
    if (!result.isNotification || !isWorkingDate() || !result.checkInTime ||
        moment(result.checkInTime, 'x').format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD') // today is not check-in
    ) {
        return;
    }

    // not check out in today
    if (!result.checkOutTime ||
        (moment(result.checkOutTime, 'x').format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD') &&
            moment().format('HH:mm:ss') > result.workTimeEnd
        )
    ) {
        noticeCheckOut();
    }
});

/**
 * Open link checkout
 */
chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
    if (buttonIndex === 0) {
        chrome.tabs.create({url: 'https://ieyasu.co/timestamp'});
    }
});

var countdownCheckout = null;

/**
 * Set notification checkout only workdays
 */
var timeoutCheckout = function () {
    chrome.storage.sync.get(['checkInTime', 'checkOutTime', 'workTimeEnd', 'isNotification'], function (result) {
        var today = moment().format('YYYY-MM-DD');

        // today is check-in and is checkout
        if (!result.isNotification || !isWorkingDate() || !result.checkInTime ||
            moment(result.checkInTime, 'x').format('YYYY-MM-DD') !== today ||
            (result.checkOutTime &&  moment(result.checkOutTime, 'x').format('YYYY-MM-DD') === today)
        ) {
            return;
        }

        var now         = moment(),
            workEndTime = moment().format('YYYY-MM-DD ' + result.workTimeEnd);

        // milliseconds from now to work time end
        var ms = moment(workEndTime, 'YYYY-MM-DD HH:mm:ss').diff(now);

        if (ms > 0) {
            var timeCountDown = moment.utc(ms).format('HH:mm:ss');
            countdownCheckout = setTimeout(noticeCheckOut, ms);
            console.log('Notification checkout is countdown: ' + timeCountDown);
        }
    });
};

timeoutCheckout();

// chrome.tabs.onRemoved.addListener(function (tabid, removed) {
//     alert("tab closed");
// });

// chrome.windows.onRemoved.addListener(function (windowid) {
//     alert("window closed");
// });

