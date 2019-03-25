'use strict';

$(function () {

    chrome.storage.sync.get(['isUseNewStyle', 'isMoveActionButton', 'test'], function (result) {
        if (!$('.workTable').length) {
            return;
        }

        var isUseNewStyle      = result.isUseNewStyle,
            isMoveActionButton = result.isMoveActionButton,
            rowTime            = $('.workTable tbody tr');

        rowTime.each(function (index, tr) {
            if (isUseNewStyle) {
                // time check-in/check-out
                var cellTimeList = ['.cellTime01', '.cellTime02'];

                // check check-in/check-out time
                cellTimeList.forEach(function (cellTimeElement) {
                    var cellTime = $(tr).find(cellTimeElement);

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
            }

            // move td last of body
            if (isMoveActionButton) {
                var tdLast = $(tr).find('td:last-child');

                if (tdLast.length) {
                    $(tr).find('td:nth-child(6)').after(tdLast.clone());
                    tdLast.remove();
                }
            }
        });

        if (isMoveActionButton) {
            // move th last of header
            var rowFirst = $('.workTable tbody tr:first'),
                thLast   = rowFirst.find('th:last-child');

            $('.workTable tbody tr:first th:nth-child(6)').after(thLast.clone());
            thLast.remove();
        }
    });

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

    // save check-in/checkout time to storage
    $('#stamping').on('click', '#btnIN1.ON', function () {
        var checkInTime = +moment(); // Unix Millisecond Timestamp

        chrome.storage.sync.set({checkInTime: checkInTime}, function () {
            console.info('Check-in time:' + checkInTime);
        });

        // call function set timeout check out
        chrome.runtime.sendMessage({action: 'setTimeoutCheckout'}, function (response) {
            console.info(response.message);
        });
    }).on('click', '#btnIN2.ON', function () {
        var checkOutTime = +moment(); // Unix Millisecond Timestamp
        chrome.storage.sync.set({checkOutTime: checkOutTime}, function () {
            console.info('Checkout time:' + checkOutTime);
        });

        // call function clear timeout check out
        chrome.runtime.sendMessage({action: 'clearTimeoutCheckout'}, function (response) {
            console.info(response.message);
        });
    });

    var tableApproval = $('.tableApproval');

    if (tableApproval.length) {
        tableApproval.find('tr .cellMonth').each(function () {
            var cellMonth    = $(this),
                cellComment  = cellMonth.parent('tr').find('.cellComment'),
                elLinkApproval = cellMonth.find('a');

            if (elLinkApproval.length) {
                var linkApproval = elLinkApproval.get(0).href;

                $.ajax({
                    url:      linkApproval,
                    type:     'GET',
                    dataType: 'html',
                    success:  function (result) {
                        var contentHtml  = $(result),
                            tableWorkRow = contentHtml.find('#editGraphTable tbody tr'),
                            childTable   = '';

                        $.each(tableWorkRow, function () {
                            var row         = $(this),
                                btnApproval = row.find('.view_work .btnApproval');

                            if (btnApproval.length) {
                                var classRow       = row.attr('class'),
                                    boxBtnApproval = btnApproval.parent(),
                                    cellDate       = row.find('.cellDate'),
                                    cellTimeTotal  = row.find('.cellTime.cellTime07.cellBreak')
                                ;

                                console.log(cellTimeTotal);

                                cellDate.find('.view_work').remove();

                                childTable += '' +
                                    '<tr class="' + classRow + '">' +
                                    '   <td>' + cellDate.html() + '</td>' +
                                    '   <td>' + cellTimeTotal.html() + '</td>' +
                                    '   <td class="btn-group">' + boxBtnApproval.html() + '</td>' +
                                    '</tr>';
                            }
                        });

                        childTable = '<table class="child-table-approval">' + childTable + '</table>';
                        cellComment.append(childTable);
                    },
                    error:    function (xhr, status, error) {
                        console.log(xhr);
                    }
                });
            }
        });
    }

});
