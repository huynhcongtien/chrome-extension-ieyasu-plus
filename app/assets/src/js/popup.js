'use strict';

$(function () {

    $('a[data-href]').click(function () {
        var link       = $(this).data('href'),
            samplePage = chrome.extension.getURL(link);

        window.open(samplePage, '_blank');
    });

});
