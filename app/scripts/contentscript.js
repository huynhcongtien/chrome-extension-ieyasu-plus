'use strict';

$(function() {

    var link    = document.createElement('link');
    link.href   = chrome.extension.getURL('assets/css/main.min.css');
    link.type   = 'text/css';
    link.rel    = 'stylesheet';
    (document.head || document.documentElement).appendChild(link);

    if ($('.workTable').length) {
        var rowTime = $('.workTable tbody tr');

        rowTime.each(function (index, tr) {
            // check-in/check-out time
            var cellTimeList = ['.cellTime01', '.cellTime02'];

            cellTimeList.forEach(function (cellTime) {
                var cellTime01 = $(tr).find(cellTime);

                if (!cellTime01.find('.item02').length) {
                    return;
                }

                var checkInActual   = $.trim(cellTime01.find('.item02').text()),
                    checkInEditted  = $.trim(cellTime01.find('.item01').text()),
                    cellTime01Class = 'not-change'
                ;

                if (checkInActual == '') {
                    return;
                }

                if (checkInActual !== checkInEditted) {
                    cellTime01Class = 'is-change';
                }

                cellTime01.addClass(cellTime01Class);
            });

            // check memo
            var cellMemo = $(tr).find('.cellMemo');

            if (cellMemo.children('div:first-child').text()) {
                var cellMemoClass = 'is-approval';

                if (!cellMemo.children('div.red').text()) {
                    cellMemoClass = 'miss-approval';
                }

                $(tr).addClass(cellMemoClass);
            }

            // check total working hours
            var cellTotalWorkTime = $(tr).find('.cellTime07:not(.cellBtime)');

            cellTotalWorkTime.each(function (index, cell) {
                var cellTime = $(cell);

                if (!cellTime.find('.item01').length) {
                    var totalWorkTime = $.trim(cellTime.text());

                    if (totalWorkTime !== '0:00') {
                        var cellTotalWorkTimeClass = 'time-full';

                        if (totalWorkTime !== '8:00') {
                            cellTotalWorkTimeClass = 'time-not-full';
                        }

                        cellTime.addClass(cellTotalWorkTimeClass);
                    }
                }
            });

            // get button
            var cellBtn = $(tr).find('.cellBtn'),
                buttons = cellBtn.children('span').clone();


            // add button approval
            var cellTimeNum = $(tr).find('.cellTimeNum');
            buttons.addClass('buttons');
            cellTimeNum
                .addClass('cellBtn')
                .append(buttons);
        });

        // add button approval all
        //var buttonApprovalAll = '<button type="button" class="approval-all">Approval all</button>';
        //$('.workTable').parent().prepend(buttonApprovalAll);
    }

    var btnApprovalAll = $('.approval-all');

    if (btnApprovalAll.length) {
        $(window).scroll(function () {
            var scroll      = $(window).scrollTop();

            if (scroll > 220) {
                btnApprovalAll.addClass('fixed');
            } else {
                btnApprovalAll.removeClass('fixed');
            }
        });

        // action approval all
        btnApprovalAll.on('click', function () {
            var btnApproval = $('.workTable').find('.btnApproval');

            if (btnApproval) {
                btnApproval.each(function (index, btn) {
                    $(btn).click();
                });
            }
        });
    }

});
