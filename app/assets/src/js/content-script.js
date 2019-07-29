'use strict';

$(function () {

    /**
     * Set class of check-in/checkout time
     * @param cellTime
     * @returns {string}
     */
    function setClassLateEarlyTime(cellTime) {
        var checkInActual = $.trim(cellTime.find('.item02').text()),
            checkInEdited = $.trim(cellTime.find('.item01').text()),
            cellTimeClass = 'not-change'
        ;

        if (!checkInActual && !checkInEdited) {
            return;
        }

        if (checkInActual !== checkInEdited) {  // had update time
            cellTimeClass = 'is-change';
        } else if (checkInEdited > '10:00' && cellTime.hasClass('cellTime01')) { // working is late
            cellTimeClass = 'is-late';
        } else if (checkInEdited < '19:00' && cellTime.hasClass('cellTime02')) { // working is early
            cellTimeClass = 'is-early';
        }

        return cellTimeClass;
    }

    /**
     * Create button approval all
     */
    function createBtnApprovalAll() {
        var boxHeader = $('#mainInner .reportHeader .box'),
            btnNew    = '' +
                '<a class="btn btnSubmit" href="javascript:void(0);"' +
                '   id="approval_all_8_hours"' +
                '>' +
                '   Approval all full time' +
                '</a>'
        ;

        boxHeader.append(btnNew);
    }

    /**
     * Check day is working day
     * @param {Object} workingDays
     * @param {string} day
     * @returns {boolean}
     */
    function checkDayIsWorking(workingDays, day) {
        var monthlySelected = $('.monthly [name="select"]').find('option:selected').val(),
            dayText         = monthlySelected + '-' + day,
            date            = new Date(dayText),
            dayInWeek       = date.getDay()
        ;

        return workingDays.indexOf(dayInWeek) !== -1;
    }

    chrome.storage.sync.get(['isUseNewStyle', 'isMoveActionButton', 'test'], function (result) {
        if (!$('.workTable').length) {
            return;
        }

        var isUseNewStyle      = result.isUseNewStyle,
            isMoveActionButton = result.isMoveActionButton,
            rowTime            = $('.workTable tbody tr')
        ;

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

                    var cellTime01Class = setClassLateEarlyTime(cellTime);

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
                var cellTotalWorkTime = $(tr)
                    .find('.cellTime07:not(.cellBtime)');

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

            $('.workTable tbody tr:first th:nth-child(6)')
                .after(thLast.clone());
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

    /**
     * Show log check-in/check out time on table approval
     */
    function showTimeOnTableApproval(workingDays) {
        var elCellMonth      = tableApproval.find('tr .cellMonth'),
            linksObject      = [],
            numberLinkObject = 0
        ;

        elCellMonth.each(function () {
            var cellMonth      = $(this),
                cellComment    = cellMonth.parent('tr').find('.cellComment'),
                elLinkApproval = cellMonth.find('a')
            ;

            if (elLinkApproval.length) {
                numberLinkObject++;
            }
        });

        var numberAjaxComplete = 0;

        elCellMonth.each(function () {
            var cellMonth      = $(this),
                cellComment    = cellMonth.parent('tr').find('.cellComment'),
                elLinkApproval = cellMonth.find('a')
            ;

            if (elLinkApproval.length) {
                var linkApproval = elLinkApproval.get(0).href;
                $.ajax({
                    url     : linkApproval,
                    type    : 'GET',
                    dataType: 'html',
                    success : function (result) {
                        var contentHtml  = $(result),
                            tableWorkRow = contentHtml.find('#editGraphTable tbody tr'),
                            childTable   = ''
                        ;

                        $.each(tableWorkRow, function () {
                            var row         = $(this),
                                btnApproval = row.find('.view_work .btnApproval')
                            ;

                            if (btnApproval.length) {
                                var classRow       = row.attr('class'),
                                    boxBtnApproval = btnApproval.parent(),
                                    cellType       = row.find('.cellType'),
                                    dateTypeText   = $.trim(cellType.find('.item01').text()),
                                    cellDate       = row.find('.cellDate'),
                                    dateValue      = cellDate.find('span.date').text(),
                                    cellTimeStart  = row.find('.cellTime.cellTime01.cellBreak'),
                                    cellTimeEnd    = row.find('.cellTime.cellTime02'),
                                    cellTimeTotal  = row.find('.cellTime.cellTime07.cellBreak'),
                                    cellMemo       = row.find('.cellMemo'),
                                    workTimeTotal  = $.trim(cellTimeTotal.text()),
                                    classWorkTime  = ''
                                ;

                                if (workTimeTotal !== '0:00') {
                                    classWorkTime = 'time-full';

                                    if (workTimeTotal !== '8:00') {
                                        classWorkTime = 'time-not-full';
                                    }
                                }

                                var classCheckIn  = setClassLateEarlyTime(cellTimeStart),
                                    classCheckOut = setClassLateEarlyTime(cellTimeEnd),
                                    classMemo     = 'not-empty'
                                ;

                                // check day is valid working time
                                if ((classCheckIn === 'not-change' && classCheckOut === 'not-change' &&
                                    classWorkTime === 'time-full') ||
                                    (!checkDayIsWorking(workingDays, dateValue) && dateTypeText === 'Public holiday')
                                ) {
                                    classRow += ' time-is-valid';
                                }

                                cellDate.find('.view_work').remove();

                                if (!cellMemo.find('div:first-child').text()) {
                                    classMemo = 'empty';
                                } else if (cellMemo.find('div:last-child').text()) {
                                    classMemo = 'is-approval';
                                }

                                childTable += '' +
                                    '<tr class="' + classRow + '">' +
                                    '   <td class="date">' + cellDate.html() + '</td>' +
                                    '   <td class="day-type">' + cellType.html() + '</td>' +
                                    '   <td class="time time-check ' + classCheckIn + '">' + cellTimeStart.html() + '</td>' +
                                    '   <td class="time time-check ' + classCheckOut + '">' + cellTimeEnd.html() + '</td>' +
                                    '   <td class="time ' + classWorkTime + '" nowrap>' + cellTimeTotal.html() + '</td>' +
                                    '   <td class="memo ' + classMemo + '">' + cellMemo.html() + '</td>' +
                                    '   <td class="btn-group">' + boxBtnApproval.html() + '</td>' +
                                    '</tr>';
                            }
                        });

                        childTable = '<div class="box-tb-child"><table class="child-table-approval">' + childTable + '</table></div>';
                        cellComment.append(childTable);
                    },
                    error   : function (xhr) {
                        console.log(xhr);
                    },
                    complete: function () {
                        numberAjaxComplete++;

                        if (numberAjaxComplete === numberLinkObject) {
                            createBtnApprovalAll();
                        }
                    }
                });
            }
        });
    }

    chrome.storage.sync.get(['workingDays'], function (result) {
        if (tableApproval.length) {
            showTimeOnTableApproval(result.workingDays);
        }
    });

    $('#mainInner').on('click', '#approval_all_8_hours', function () {
        var elTimeValid = tableApproval.find('.child-table-approval .time-is-valid');

        $.each(elTimeValid, function () {
            var elRow         = $(this),
                elBtnApproval = elRow.find('.btnApproval'),
                linkApproval  = elBtnApproval.attr('href')
            ;

            console.log(linkApproval);
            // elBtnApproval.trigger('click');
        });
    });

    /**
     * Remove row after approval
     */
    $('.dailyList.tableApproval')
        .on('click', '.child-table-approval .btn-group .btn', function () {
            $(this).closest('tr').remove();
        })
    ;

});
