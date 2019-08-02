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
            return null;
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
                '<a class="btn btnSubmit disabled" href="javascript:void(0);"' +
                '   id="approval_all_8_hours"' +
                '>' +
                '   Approval all full time' +
                '</a>'
        ;

        boxHeader.append(btnNew);
    }

    /**
     * Create button get all log time
     */
    function createBtnGetAllLogTime() {
        var boxHeader = $('#mainInner .reportHeader .box'),
            btnNew    = '' +
                '<a class="btn btnSubmit disabled" href="javascript:void(0);"' +
                '   id="get_all_log_time"' +
                '>' +
                '   Get all log time' +
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

    chrome.storage.sync.get(['isUseNewStyle', 'isMoveActionButton'], function (result) {
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
        var isHasLogTimeOK     = false,
            elRows             = tableApproval.find('tbody tr'),
            numberRow          = elRows.length,
            numberAjaxComplete = 0
        ;

        if (!numberRow) {
            loadingIconGetLog.removeIconLoading().removeDisabled();
        }

        elRows.each(function () {
            var elRow          = $(this),
                cellName       = elRow.find('.cellEname'),
                cellComment    = elRow.find('.cellComment'),
                elLinkApproval = cellName.find('a')
            ;

            if (!elLinkApproval.length) {
                return true;    // break;
            }

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
                                classMemo     = 'not-empty',
                                isValidTime   = false
                            ;

                            // check day is valid working time
                            if ((classCheckIn === 'not-change' && classCheckOut === 'not-change' &&
                                classWorkTime === 'time-full') ||
                                (!checkDayIsWorking(workingDays, dateValue) && dateTypeText === 'Public holiday')
                            ) {
                                isValidTime = true;
                                classRow += ' time-is-valid';
                            }

                            cellDate.find('.view_work').remove();

                            if (!cellMemo.find('div:first-child').text()) {
                                classMemo = 'empty';
                            } else if (cellMemo.find('div:last-child').text()) {
                                classMemo = 'is-approval';
                            }

                            var checkIconClass = 'status-ok fa-check-circle';

                            if (!isValidTime) {
                                checkIconClass = 'status-warning fa-exclamation-triangle';
                            } else {
                                isHasLogTimeOK = true;
                            }

                            childTable += '' +
                                '<tr class="' + classRow + '">' +
                                '   <td class="date">' +
                                '       <div class="date-day">' + cellDate.html() + '</div>' +
                                '       <div class="date-status">' +
                                '           <i class="fa ' + checkIconClass + '" aria-hidden="true"></i>' +
                                '       </div>' +
                                '   </td>' +
                                '   <td class="day-type">' + cellType.html() + '</td>' +
                                '   <td class="time time-check ' + classCheckIn + '">' + cellTimeStart.html() + '</td>' +
                                '   <td class="time time-check ' + classCheckOut + '">' + cellTimeEnd.html() + '</td>' +
                                '   <td class="time time-total ' + classWorkTime + '" nowrap>' +
                                '       <div class="time-working">' + cellTimeTotal.html() + '</div>' +
                                '   </td>' +
                                '   <td class="memo ' + classMemo + '">' + cellMemo.html() + '</td>' +
                                '   <td class="btn-group">' + boxBtnApproval.html() + '</td>' +
                                '</tr>';
                        }
                    });

                    childTable = '<div class="box-tb-child"><table class="child-table-approval">' + childTable + '</table></div>';
                    cellComment.append(childTable);
                },
                error   : function (xhr) {
                    console.info(xhr);
                },
                complete: function () {
                    numberAjaxComplete++;

                    if (numberAjaxComplete === numberRow) {
                        loadingIconGetLog.removeIconLoading().removeDisabled();

                        if (isHasLogTimeOK) {
                            loadingIconApproval.removeDisabled();
                        }
                    }
                }
            });
        });
    }

    let loadingIconApproval = new LoadingIcon({
            element       : '#approval_all_8_hours',
            autoCreateIcon: false
        }),
        loadingIconGetLog   = new LoadingIcon({
            element       : '#get_all_log_time',
            autoCreateIcon: false
        })
    ;

    chrome.storage.sync.get(['workingDays'], function (result) {
        if (tableApproval.length) {
            createBtnApprovalAll();
            createBtnGetAllLogTime();
            loadingIconGetLog.addIconLoading();
            showTimeOnTableApproval(result.workingDays);
        }
    });

    /**
     * Approval all request
     */
    $('#mainInner').on('click', '#approval_all_8_hours:not(.disabled)', function () {
        var elTimeValid        = tableApproval.find('.child-table-approval .time-is-valid'),
            numberLink         = elTimeValid.length,
            numberAjaxComplete = 0
        ;

        if (numberLink) {
            loadingIconApproval.addIconLoading().addDisabled();
        }

        $.each(elTimeValid, function () {
            var elRow         = $(this),
                elBtnApproval = elRow.find('.btnApproval'),
                linkApproval  = elBtnApproval.attr('href')
            ;

            $.ajax({
                url     : linkApproval,
                type    : 'GET',
                dataType: 'html',
                success : function (result) {
                    elRow.remove();
                },
                error   : function (xhr) {
                    console.info(xhr);
                },
                complete: function () {
                    numberAjaxComplete++;

                    if (numberAjaxComplete === numberLink) {
                        loadingIconApproval.removeIconLoading();
                    }
                }
            });
        });
    }).on('click', '#get_all_log_time:not(.disabled)', function () {
        // remove all child table in log
        $('.box-tb-child').remove();

        chrome.storage.sync.get(['workingDays'], function (result) {
            loadingIconApproval.addDisabled();
            loadingIconGetLog.addIconLoading().addDisabled();
            showTimeOnTableApproval(result.workingDays);
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

var LoadingIcon = function (configs) {
    this.init(configs);

    if (this.options.autoCreateIcon) {
        this.addIconLoading();
    }

    if (this.options.autoDisabled) {
        this.addDisabled();
    }
};

LoadingIcon.prototype.init = function (configs) {
    var _defaults = {
        element       : '.loading',
        autoCreateIcon: true,
        autoDisabled  : true
    };
    this.options  = $.extend(_defaults, configs);
    return this;
};

LoadingIcon.prototype.addIconLoading = function () {
    var element   = $(this.options.element),
        elSpinner = element.find('.fa-spinner')
    ;

    if (elSpinner.length) {
        elSpinner.show();
    } else {
        var textOld = element.text(),
            textNew = '<i class="fa fa-spinner fa-pulse fa-fw"></i> ' + textOld
        ;

        element.html(textNew);
    }

    return this;
};

LoadingIcon.prototype.removeIconLoading = function () {
    $(this.options.element).find('.fa-spinner').remove();
    return this;
};

LoadingIcon.prototype.addDisabled = function () {
    $(this.options.element).addClass('disabled');
    return this;
};

LoadingIcon.prototype.removeDisabled = function () {
    $(this.options.element).removeClass('disabled');
    return this;
};
