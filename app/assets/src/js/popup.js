'use strict';

// get variables in background
const bkg = chrome.extension.getBackgroundPage();

$(function () {

    $('a[data-href]').click(function () {
        var link       = $(this).data('href'),
            samplePage = chrome.extension.getURL(link);

        window.open(samplePage, '_blank');
    });

    console.log(bkg.countdownCheckout);

});
