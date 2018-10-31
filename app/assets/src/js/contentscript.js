'use strict';

$(function () {

    if ($('.workTable').length) {
        var rowTime = $('.workTable tbody tr');

        rowTime.each(function (index, tr) {
            // time check-in/check-out
            var cellTimeList = ['.cellTime01', '.cellTime02'];

            // check check-in/check-out time
            cellTimeList.forEach(function (cellTime) {
                var cellTime = $(tr).find(cellTime);

                if (!cellTime.find('.item02').length) {
                    return;
                }

                var checkInActual   = $.trim(cellTime.find('.item02').text()),
                    checkInEdited   = $.trim(cellTime.find('.item01').text()),
                    cellTime01Class = 'not-change'
                ;

                if (!checkInActual && !checkInEdited) {
                    return;
                }

                if (checkInActual !== checkInEdited) {  // had update time
                    cellTime01Class = 'is-change';
                } else if (checkInEdited > '10:00' && cellTime.hasClass('cellTime01')) { // working is late
                    cellTime01Class = 'is-late';
                } else if (checkInEdited < '19:00' && cellTime.hasClass('cellTime02')) { // working is early
                    cellTime01Class = 'is-early';
                }

                cellTime.addClass(cellTime01Class);
            });

            // // check type of day
            // $(tr).find(.cellType)
            //     var cellType      = $(element),
            //         cellTotalTime = cellType.closest('tr').find('.cellTime07'),
            //         totalTime     = $.trim(cellTotalTime.text());
            //
            //     console.log(totalTime);
            // });

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

                            // get working type
                            var cellType = $(tr).find('.cellType'),
                                typeText = $.trim(cellType.text());

                            if (typeText === 'workday:残業無') {
                                cellType.addClass('warning');
                            }
                        }

                        cellTime.addClass(cellTotalWorkTimeClass);
                    }
                }
            });

            // move td last of body
            var tdLast = $(tr).find('td:last-child');

            if (tdLast.length) {
                $(tr).find('td:nth-child(6)').after(tdLast.clone());
                tdLast.remove();
            }
        });

        // move th last of header
        var rowFirst = $('.workTable tbody tr:first'),
            thLast   = rowFirst.find('th:last-child');

        $('.workTable tbody tr:first th:nth-child(6)').after(thLast.clone());
        thLast.remove();
    }

    var btnApprovalAll = $('.approval-all');

    if (btnApprovalAll.length) {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();

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
