/*
 * ダッシュボードを表現するためのjs
 **/
var WAITER_ENDPOINT = $('input[name="waiterEndpoint"]').val();
var TELEMETRY_API_ENDPOINT = $('input[name="telemetryEndpoint"]').val();
var PROJECT_ID = $('input[name="projectId"]').val();
var waiterDatasets = [];
var waiterRules = [];

var orders = [];
var searchedAllOrders = false;
var timlines = [];
var searchingRecentActions = false;
var searchingLatestOrders = false;
var limit = 10;
var page = 0;
var numVisitorsChart;

var initialChartStartDate = moment().subtract(29, 'days');
var initialChartEndDate = moment();

$(function () {
    'use strict'

    // Make the dashboard widgets sortable Using jquery UI
    $('.connectedSortable').sortable({
        placeholder: 'sort-highlight',
        connectWith: '.connectedSortable',
        handle: '.card-header, .nav-tabs',
        forcePlaceholderSize: true,
        zIndex: 999999
    })
    $('.connectedSortable .card-header, .connectedSortable .nav-tabs-custom').css('cursor', 'move')

    // jQuery UI sortable for the todo list
    $('.todo-list').sortable({
        placeholder: 'sort-highlight',
        handle: '.handle',
        forcePlaceholderSize: true,
        zIndex: 999999
    })

    // bootstrap WYSIHTML5 - text editor
    // $('.textarea').wysihtml5()

    $('#salesAmount .daterange').daterangepicker({
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: initialChartStartDate,
        endDate: initialChartEndDate
    }, function (start, end) {
        updateSalesAmountChart();
    });

    $('#numTransactions2salesAmount .daterange').daterangepicker({
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: initialChartStartDate,
        endDate: initialChartEndDate
    }, function (start, end) {
        // console.log('You chose: ' + start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'))
        updateNumTransactions2salesAmountChart();
    });

    $('#numOrderItems .daterange').daterangepicker({
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: initialChartStartDate,
        endDate: initialChartEndDate
    }, function (start, end) {
        // console.log('You chose: ' + start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        updateNumOrderItemsChart();
    });

    $('#numPlaceOrder .daterange').daterangepicker({
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: initialChartStartDate,
        endDate: initialChartEndDate
    }, function (start, end) {
        searchNumPlaceOrder(
            createNumPlaceOrderChart
        );
    });

    // The Calender
    $('#calendar').datepicker()

    // Fix for charts under tabs
    $('.box ul.nav a').on('shown.bs.tab', function () {
        // area.redraw()
        // donut.redraw()
        // line.redraw()
    })

    /* jQueryKnob */
    $('#salesAmount .knob.byClient').knob();
    $('#salesAmount .knob.byPaymentMethod').knob();
    $('#salesAmount .knob.bySeller').knob();
    $('#numOrderItems .knob.byClient').knob();
    $('#numOrderItems .knob.byPaymentMethod').knob();
    $('#numOrderItems .knob.bySeller').knob();

    updateCharts();
    setInterval(
        function () {
            updateCharts();
        },
        30000
    );

    updateActivities();
    setInterval(
        function () {
            updateActivities();
        },
        10000
    );

    $.getJSON(
        WAITER_ENDPOINT + '/projects/' + PROJECT_ID + '/rules',
        {}
    ).done(function (data) {
        waiterRules = data;
        startMonitoringWaiter();
    }).fail(function () {
    });
});

function updateCharts() {
    updateDbStats(function () {
    });
    updateHealth(function () {
    });
    updateSalesAmountChart();
    updateNumTransactions2salesAmountChart();
    updateNumOrderItemsChart();
}

function updateActivities() {
    countNewOrder(function () {
    });
    aggregateExitRate(function () {
    });
    countNewUser(function () {
    });
    countNewTransaction(function () {
    });
    updateQueueCount(function () {
    });
    searchLatestOrders(function () {
    });
    searchRecentActions(function () {
    });
}

function updateSalesAmountChart() {
    searchSalesAmount(createSalesAmountChart);
    searchSalesAmountByClient(createSalesAmountByClientChart);
    searchSalesAmountByPaymentMethod(createSalesAmountByPaymentMethodChart);
    searchSalesAmountBySeller(createSalesAmountBySellerChart);
}
function updateNumTransactions2salesAmountChart() {
    searchNumStartedTransactionsByType(createSalesAmountNumTransactionsChart);
}
function updateNumOrderItemsChart() {
    searchNumOrderItems(createNumOrderItemsChart);
    searchNumOrderItemsByClient(createNumOrderItemsByClientChart);
    searchNumOrderItemsByPaymentMethod(createNumOrderItemsByPaymentMethodChart);
    searchNumOrderItemsBySeller(createNumOrderItemsBySellerChart);
    searchNumPlaceOrder(createNumPlaceOrderChart);
}
function searchSalesAmount(cb) {
    $('#salesAmount .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/SalesAmount',
        {
            measureFrom: $('#salesAmount .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#salesAmount .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('売上集計を取得できませんでした')
    }).always(function () {
        $('#salesAmount .overlay').hide();
    });
}
function searchNumStartedTransactionsByType(cb) {
    $('#numTransactions2salesAmount .overlay').show();

    var datasSalesAmount;
    var datasNumStartedTransactions;
    var next = function () {
        if (datasSalesAmount !== undefined && datasNumStartedTransactions !== undefined) {
            cb(datasSalesAmount, datasNumStartedTransactions);
        }
    }

    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/SalesAmount',
        {
            measureFrom: $('#numTransactions2salesAmount .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#numTransactions2salesAmount .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        datasSalesAmount = data;
        next();
    }).fail(function () {
        console.error('売上集計を取得できませんでした')
    }).always(function () {
        $('#numTransactions2salesAmount .overlay').hide();
    });

    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/NumStartedTransactionsByType',
        {
            measureFrom: $('#numTransactions2salesAmount .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#numTransactions2salesAmount .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        datasNumStartedTransactions = data;
        next();
    }).fail(function () {
        console.error('取引タイプごとの開始取引数を取得できませんでした')
    }).always(function () {
        $('#numTransactions2salesAmount .overlay').hide();
    });
}
function searchSalesAmountByClient(cb) {
    $('#salesAmount .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/SalesAmountByClient',
        {
            measureFrom: $('#salesAmount .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#salesAmount .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('売上集計を取得できませんでした')
    }).always(function () {
        $('#salesAmount .overlay').hide();
    });
}
function searchSalesAmountByPaymentMethod(cb) {
    $('#salesAmount .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/SalesAmountByPaymentMethod',
        {
            measureFrom: $('#salesAmount .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#salesAmount .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('売上集計を取得できませんでした')
    }).always(function () {
        $('#salesAmount .overlay').hide();
    });
}
function searchSalesAmountBySeller(cb) {
    $('#salesAmount .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/SalesAmountBySeller',
        {
            measureFrom: $('#salesAmount .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#salesAmount .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('売上集計を取得できませんでした')
    }).always(function () {
        $('#salesAmount .overlay').hide();
    });
}

function searchNumOrderItems(cb) {
    $('#numOrderItems .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/NumOrderItems',
        {
            measureFrom: $('#numOrderItems .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#numOrderItems .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('注文アイテム数集計を取得できませんでした')
    }).always(function () {
        $('#numOrderItems .overlay').hide();
    });
}

function searchNumOrderItemsByClient(cb) {
    $('#numOrderItems .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/NumOrderItemsByClient',
        {
            measureFrom: $('#numOrderItems .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#numOrderItems .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('注文アイテム数集計を取得できませんでした')
    }).always(function () {
        $('#numOrderItems .overlay').hide();
    });
}

function searchNumOrderItemsByPaymentMethod(cb) {
    $('#numOrderItems .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/NumOrderItemsByPaymentMethod',
        {
            measureFrom: $('#numOrderItems .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#numOrderItems .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('注文アイテム数集計を取得できませんでした')
    }).always(function () {
        $('#numOrderItems .overlay').hide();
    });
}

function searchNumOrderItemsBySeller(cb) {
    $('#numOrderItems .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/NumOrderItemsBySeller',
        {
            measureFrom: $('#numOrderItems .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#numOrderItems .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
    }).fail(function () {
        console.error('注文アイテム数集計を取得できませんでした')
    }).always(function () {
        $('#numOrderItems .overlay').hide();
    });
}

function searchNumPlaceOrder(cb) {
    $('#numPlaceOrder .overlay').show();
    $.getJSON(
        TELEMETRY_API_ENDPOINT + '/organizations/project/' + PROJECT_ID + '/telemetry/NumPlaceOrderByStatus',
        {
            measureFrom: $('#numPlaceOrder .daterange').data('daterangepicker').startDate.toISOString(),
            measureThrough: $('#numPlaceOrder .daterange').data('daterangepicker').endDate.toISOString()
        }
    ).done(function (data) {
        cb(data);
        $('#numPlaceOrder .overlay').hide();
    }).fail(function () {
        console.error('取引数を取得できませんでした')
    });
}

function createNumPlaceOrderChart(datas) {
    var statuses = ['Confirmed', 'Canceled', 'Expired'];
    // var colors = ['#79f67d', '#fad684', '#e96c6c'];
    var colors = ['#28a745', '#ffc107', '#dc3545'];

    // new Morris.Line({
    //     element: 'numPlaceOrderChart',
    //     resize: true,
    //     data: datas.map(function (data) {
    //         var data4chart = { y: moment(data.measureDate).toISOString() };
    //         statuses.forEach(function (status) {
    //             data4chart[status] = (data.value[status] !== undefined) ? data.value[status] : 0
    //         });

    //         return data4chart;
    //     }),
    //     xkey: 'y',
    //     ykeys: statuses,
    //     labels: statuses,
    //     lineColors: ['#79f67d', '#fad684', '#e96c6c'],
    //     // lineColors: ['#ffc107', '#dc3545', '#28a745'],
    //     lineWidth: 2,
    //     hideHover: 'auto',
    //     gridTextColor: '#fff',
    //     gridStrokeWidth: 0.4,
    //     pointSize: 0,
    //     pointStrokeColors: ['#fad684', '#e96c6c', '#79f67d'],
    //     gridLineColor: '#efefef',
    //     gridTextFamily: 'Open Sans',
    //     gridTextSize: 10,
    //     smooth: false
    // });

    // Sales graph chart
    var salesGraphChartCanvas = $('#numPlaceOrderChart').get(0).getContext('2d');
    //$('#revenue-chart').get(0).getContext('2d');

    var salesGraphChartData = {
        // labels: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4', '2013 Q1', '2013 Q2'],
        datasets: statuses.map(function (status, key) {
            return {
                label: status,
                fill: false,
                borderWidth: 1.5,
                lineTension: 0,
                spanGaps: true,
                borderColor: colors[key],
                pointRadius: 0,
                pointHoverRadius: 7,
                pointColor: '#efefef',
                pointBackgroundColor: '#efefef',
                data: datas.map(function (data) {
                    return {
                        x: moment(data.measureDate).toDate(),
                        y: (data.value[status] !== undefined) ? data.value[status] : 0
                    }
                })
            };
        })
    }

    var salesGraphChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
            display: false,
        },
        scales: {
            xAxes: [{
                type: 'time',
                ticks: {
                    // fontColor: '#fff',
                    fontColor: '#6c757d',
                    // fontFamily: 'Open Sans',
                    fontSize: 10
                },
                gridLines: {
                    display: false,
                    color: '#efefef',
                    drawBorder: false,
                }
            }],
            yAxes: [{
                ticks: {
                    // stepSize: 5000,
                    // fontColor: '#fff',
                    fontColor: '#6c757d',
                    // fontFamily: 'Open Sans',
                    fontSize: 10,
                    padding: 8,
                },
                gridLines: {
                    display: true,
                    // color: '#555c62',
                    color: '#efefef',
                    // zeroLineColor: '#555c62',
                    zeroLineColor: '#efefef',
                    drawBorder: false,
                }
            }]
        }
    }

    // This will get the first returned node in the jQuery collection.
    new Chart(salesGraphChartCanvas, {
        type: 'line',
        data: salesGraphChartData,
        options: salesGraphChartOptions
    });
}

function createSalesAmountChart(datas) {
    // var line = new Morris.Line({
    //     element: 'salesAmountChart',
    //     resize: true,
    //     data: datas.map(function (data) {
    //         return { y: moment(data.measureDate).toISOString(), salesAmount: data.value }
    //     }),
    //     xkey: 'y',
    //     ykeys: ['salesAmount'],
    //     labels: ['売上高'],
    //     lineColors: ['#efefef'],
    //     lineWidth: 2,
    //     hideHover: 'auto',
    //     gridTextColor: '#fff',
    //     gridStrokeWidth: 0.4,
    //     pointSize: 0,
    //     pointStrokeColors: ['#efefef'],
    //     gridLineColor: '#efefef',
    //     gridTextFamily: 'Open Sans',
    //     gridTextSize: 10,
    //     smooth: false
    // });

    // This will get the first returned node in the jQuery collection.
    new Chart($('#salesAmountChart').get(0).getContext('2d'), {
        type: 'line',
        data: {
            // labels: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4', '2013 Q1', '2013 Q2'],
            datasets: [
                {
                    label: status,
                    fill: false,
                    borderWidth: 1.5,
                    lineTension: 0,
                    spanGaps: true,
                    borderColor: '#007bff',
                    pointRadius: 0,
                    pointHoverRadius: 7,
                    pointColor: '#efefef',
                    pointBackgroundColor: '#efefef',
                    data: datas.map(function (data) {
                        return {
                            x: moment(data.measureDate).toDate(),
                            y: data.value
                        }
                    })
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10,
                        maxTicksLimit: 6,
                    },
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        // stepSize: 5000,
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10,
                        padding: 8,
                    },
                    gridLines: {
                        display: true,
                        // color: '#555c62',
                        // color: '#efefef',
                        lineWidth: 1,
                        drawBorder: false,
                    }
                }]
            }
        }
    });
}
function createSalesAmountByClientChart(datas) {
    var salesAmountByClient = {};
    datas.forEach(function (data) {
        const value = data.value;
        Object.keys(value).forEach(function (clientId) {
            if (salesAmountByClient[clientId] === undefined) {
                salesAmountByClient[clientId] = 0;
            }
            salesAmountByClient[clientId] += value[clientId];
        });
    });

    var totalAmount = Object.keys(salesAmountByClient).reduce(
        function (a, b) {
            return a + salesAmountByClient[b];
        },
        0
    );
    $('#salesAmount input.knob.byClient').map(function () {
        var clientId = $(this).attr('data-clientId');
        var ratio = 0;
        if (salesAmountByClient[clientId] !== undefined && totalAmount > 0) {
            ratio = (salesAmountByClient[clientId] / totalAmount * 100).toFixed(1);
        }
        $(this).val(ratio).trigger('change');
    });
}
function createSalesAmountByPaymentMethodChart(datas) {
    var salesAmountByPaymentMethod = {};
    datas.forEach(function (data) {
        const value = data.value;
        Object.keys(value).forEach(function (paymentMethod) {
            if (salesAmountByPaymentMethod[paymentMethod] === undefined) {
                salesAmountByPaymentMethod[paymentMethod] = 0;
            }
            salesAmountByPaymentMethod[paymentMethod] += value[paymentMethod];
        });
    });

    var totalAmount = Object.keys(salesAmountByPaymentMethod).reduce(
        function (a, b) {
            return a + salesAmountByPaymentMethod[b];
        },
        0
    );
    $('#salesAmount input.knob.byPaymentMethod').map(function () {
        var paymentMethod = $(this).attr('data-paymentMethod');
        var ratio = 0;
        if (salesAmountByPaymentMethod[paymentMethod] !== undefined && totalAmount > 0) {
            ratio = (salesAmountByPaymentMethod[paymentMethod] / totalAmount * 100).toFixed(1);
        }
        $(this).val(ratio).trigger('change');
    });
}
function createSalesAmountBySellerChart(datas) {
    var salesAmountBySeller = {};
    datas.forEach(function (data) {
        const value = data.value;
        Object.keys(value).forEach(function (sellerId) {
            if (salesAmountBySeller[sellerId] === undefined) {
                salesAmountBySeller[sellerId] = 0;
            }
            salesAmountBySeller[sellerId] += value[sellerId];
        });
    });

    var totalAmount = Object.keys(salesAmountBySeller).reduce(
        function (a, b) {
            return a + salesAmountBySeller[b];
        },
        0
    );
    $('#salesAmount input.knob.bySeller').map(function () {
        var sellerId = $(this).attr('data-sellerId');
        var ratio = 0;
        if (salesAmountBySeller[sellerId] !== undefined && totalAmount > 0) {
            ratio = (salesAmountBySeller[sellerId] / totalAmount * 100).toFixed(1);
        }
        $(this).val(ratio).trigger('change');
    });
}
function createNumOrderItemsChart(datas) {
    // var line = new Morris.Line({
    //     element: 'numOrderItemsChart',
    //     resize: true,
    //     data: datas.map(function (data) {
    //         return { y: moment(data.measureDate).toISOString(), numOrderItems: data.value }
    //     }),
    //     xkey: 'y',
    //     ykeys: ['numOrderItems'],
    //     labels: ['注文アイテム数'],
    //     lineColors: ['#efefef'],
    //     lineWidth: 2,
    //     hideHover: 'auto',
    //     gridTextColor: '#fff',
    //     gridStrokeWidth: 0.4,
    //     pointSize: 0,
    //     pointStrokeColors: ['#efefef'],
    //     gridLineColor: '#efefef',
    //     gridTextFamily: 'Open Sans',
    //     gridTextSize: 10,
    //     smooth: false
    // });

    // This will get the first returned node in the jQuery collection.
    new Chart($('#numOrderItemsChart').get(0).getContext('2d'), {
        type: 'line',
        data: {
            // labels: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4', '2013 Q1', '2013 Q2'],
            datasets: [
                {
                    label: status,
                    fill: false,
                    borderWidth: 1.5,
                    lineTension: 0,
                    spanGaps: true,
                    borderColor: '#007bff',
                    pointRadius: 0,
                    pointHoverRadius: 7,
                    pointColor: '#efefef',
                    pointBackgroundColor: '#efefef',
                    data: datas.map(function (data) {
                        return {
                            x: moment(data.measureDate).toDate(),
                            y: data.value
                        }
                    })
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        // fontColor: '#fff',
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10,
                        maxTicksLimit: 6,
                    },
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        // stepSize: 5000,
                        // fontColor: '#fff',
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10,
                        padding: 8,
                    },
                    gridLines: {
                        display: true,
                        // color: '#555c62',
                        // color: '#efefef',
                        lineWidth: 1,
                        drawBorder: false,
                    }
                }]
            }
        }
    });
}

function createNumOrderItemsByClientChart(datas) {
    var numOrderItemsByClient = {};
    datas.forEach(function (data) {
        const value = data.value;
        Object.keys(value).forEach(function (clientId) {
            if (numOrderItemsByClient[clientId] === undefined) {
                numOrderItemsByClient[clientId] = 0;
            }
            numOrderItemsByClient[clientId] += value[clientId];
        });
    });

    var totalNumOrderItems = Object.keys(numOrderItemsByClient).reduce(
        function (a, b) {
            return a + numOrderItemsByClient[b];
        },
        0
    );
    $('#numOrderItems input.knob.byClient').map(function () {
        var clientId = $(this).attr('data-clientId');
        var ratio = 0;
        if (numOrderItemsByClient[clientId] !== undefined && totalNumOrderItems > 0) {
            ratio = (numOrderItemsByClient[clientId] / totalNumOrderItems * 100).toFixed(1);
        }
        $(this).val(ratio).trigger('change');
    });
}
function createNumOrderItemsByPaymentMethodChart(datas) {
    var numOrderItemsByPaymentMethod = {};
    datas.forEach(function (data) {
        const value = data.value;
        Object.keys(value).forEach(function (paymentMethod) {
            if (numOrderItemsByPaymentMethod[paymentMethod] === undefined) {
                numOrderItemsByPaymentMethod[paymentMethod] = 0;
            }
            numOrderItemsByPaymentMethod[paymentMethod] += value[paymentMethod];
        });
    });

    var totalNumOrderItems = Object.keys(numOrderItemsByPaymentMethod).reduce(
        function (a, b) {
            return a + numOrderItemsByPaymentMethod[b];
        },
        0
    );
    $('#numOrderItems input.knob.byPaymentMethod').map(function () {
        var paymentMethod = $(this).attr('data-paymentMethod');
        var ratio = 0;
        if (numOrderItemsByPaymentMethod[paymentMethod] !== undefined && totalNumOrderItems > 0) {
            ratio = (numOrderItemsByPaymentMethod[paymentMethod] / totalNumOrderItems * 100).toFixed(1);
        }
        $(this).val(ratio).trigger('change');
    });
}
function createNumOrderItemsBySellerChart(datas) {
    var numOrderItemsBySeller = {};
    datas.forEach(function (data) {
        const value = data.value;
        Object.keys(value).forEach(function (sellerId) {
            if (numOrderItemsBySeller[sellerId] === undefined) {
                numOrderItemsBySeller[sellerId] = 0;
            }
            numOrderItemsBySeller[sellerId] += value[sellerId];
        });
    });

    var totalNumOrderItems = Object.keys(numOrderItemsBySeller).reduce(
        function (a, b) {
            return a + numOrderItemsBySeller[b];
        },
        0
    );
    $('#numOrderItems input.knob.bySeller').map(function () {
        var sellerId = $(this).attr('data-sellerId');
        var ratio = 0;
        if (numOrderItemsBySeller[sellerId] !== undefined && totalNumOrderItems > 0) {
            ratio = (numOrderItemsBySeller[sellerId] / totalNumOrderItems * 100).toFixed(1);
        }
        $(this).val(ratio).trigger('change');
    });
}

function createSalesAmountNumTransactionsChart(datasSalesAmount, datasNumStartedTransactionsByType) {
    // 売上散布チャート
    var chartDate = datasSalesAmount.map(function (dataSalesAmount) {
        var dataNumStartedTransactions = datasNumStartedTransactionsByType.find(function (data) {
            return data.measureDate === dataSalesAmount.measureDate;
        });
        var x = (dataNumStartedTransactions !== undefined)
            ? (dataNumStartedTransactions.value.PlaceOrder !== undefined) ? dataNumStartedTransactions.value.PlaceOrder : 0
            : 0;

        return {
            x: x,
            y: dataSalesAmount.value
        };
    });

    new Chart($('#numTransactions2salesAmountChart'), {
        type: 'scatter',
        data: {
            // labels: ['12時間前', '9時間前', '6時間前', '3時間前', '0時間前'],
            datasets: [
                {
                    data: chartDate,
                    backgroundColor: 'transparent',
                    // borderColor: '#DAA8F5',
                    borderColor: '#007bff',

                    borderWidth: 1,
                    pointRadius: 2,
                    pointBorderColor: '#007bff',
                    pointBackgroundColor: '#007bff',
                    fill: false
                },
            ]
        },
        options: {
            pointDot: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    // type: 'time',
                    // time: {
                    //     unit: 'hour',
                    //     stepSize: 1
                    // },
                    display: true,
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        // fontColor: '#a1a6a9',
                        // fontColor: '#fff',
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10
                    }
                }],
                yAxes: [{
                    display: true,
                    gridLines: {
                        display: true,
                        lineWidth: 1,
                        // color: '#555c62',
                        color: '#efefef',
                        // zeroLineColor: '#555c62',
                        zeroLineColor: '#efefef',
                        padding: 8,
                    },
                    ticks: {
                        beginAtZero: true,
                        // fontColor: '#a1a6a9',
                        // fontColor: '#fff',
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10
                    }
                }]
            }
        }
    });
}

function searchRecentActions(cb) {
    if (searchingRecentActions) {
        return cb();
    }

    $.ajax({
        url: '/projects/' + PROJECT_ID + '/home/timelines',
        data: {
            startFrom: moment()
                .add(-1, 'day')
                .toISOString(),
            startThrough: moment()
                .toISOString()
        },
        dataType: 'json',
        beforeSend: function () {
            searchingRecentActions = true;
        }
    })
        .done(function (data) {
            timlines = data;

            $('.products-list').empty();
            $.each(data, function (_, timeline) {

                var html = '<div class="product-img">'
                    // + '<img src="/img/cinerino.png" alt="Product Image" class="img-size-50">'
                    + '</div>'
                    + '<div class="product-info ml-2">'
                    + '<a target="_blank" href="' + timeline.agent.url + '" class="product-title">' + timeline.agent.name
                    + '<span class="badge ' + timeline.action.actionStatus + ' float-right">' + moment(timeline.action.startDate).fromNow() + '</span>'
                    + '</a>が';

                html += '<span class="product-description overflow-auto" style="white-space: normal;">';

                if (timeline.recipient !== undefined) {
                    var recipientName = String(timeline.recipient.name);
                    if (recipientName.length > 40) {
                        recipientName = String(timeline.recipient.name).slice(0, 40) + '...';
                    }
                    html += '<a href="' + timeline.recipient.url + '" target="_blank">'
                        + '<span>' + recipientName + '</span>'
                        + '</a> に';
                }

                if (timeline.purpose !== undefined) {
                    html += '<a href="' + timeline.purpose.url + '" target="_blank">'
                        + '<span>' + timeline.purpose.name + '</span>'
                        + '</a> のために';
                }

                html += '<a href="' + timeline.object.url + '" target="_blank">'
                    + '<span>' + timeline.object.name + '</span>'
                    + '</a> を'
                    + '<span>' + timeline.actionName + '</span>'
                    + '<span>' + timeline.actionStatusDescription + '</span>'
                    + '</span>'
                    + '</div>';
                $('<li>').html(html).addClass('item').appendTo('.products-list');
            });
            cb();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error('最近のアクションを取得できませんでした', errorThrown)
        })
        .always(function () {
            searchingRecentActions = false;
        });
}

function searchLatestOrders(cb) {
    if (searchingLatestOrders) {
        return cb();
    }

    $.ajax({
        url: '/projects/' + PROJECT_ID + '/home/orders',
        data: {
            limit: 10,
            page: 1,
            sort: { orderDate: -1 },
            orderDateFrom: moment()
                .add(-1, 'day')
                .toISOString(),
            orderDateThrough: moment()
                .toISOString()
        },
        dataType: 'json',
        beforeSend: function () {
            searchingLatestOrders = true;
        }
    })
        .done(function (data) {
            orders = data.data;

            $('.latestOrders tbody').empty();
            $.each(data.data, function (_, order) {
                var numDisplayItems = 4;

                $('<tr>').html(
                    '<td>' + '<a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + order.orderNumber + '">' + order.orderNumber + '</a>' + '</td>'
                    + '<td>' + moment(order.orderDate).format('lllZ') + '</td>'
                    + '<td>'
                    + order.acceptedOffers.slice(0, numDisplayItems).map(function (o) {
                        if (o.itemOffered.reservedTicket !== undefined && o.itemOffered.reservedTicket.ticketedSeat !== undefined) {
                            return o.itemOffered.reservedTicket.ticketedSeat.seatNumber
                        }
                        return o.itemOffered.typeOf;
                    }).join('<br>')
                    + order.acceptedOffers.slice(numDisplayItems, numDisplayItems + 1).map(() => '<br>...').join('')
                    + '</td>'
                    + '<td>' + order.paymentMethods.map(function (paymentMethod) {
                        return '<span class="badge badge-secondary ' + paymentMethod.typeOf + '">' + paymentMethod.typeOf + '</span>';
                    }).join('&nbsp;') + '</td>'
                    + '<td>' + '<span class="badge badge-secondary  ' + order.orderStatus + '">' + order.orderStatus + '</span>' + '</td>'
                ).appendTo('.latestOrders tbody');
            });
            cb();
        })
        .fail(function () {
            console.error('最近の注文を取得できませんでした')
        })
        .always(function () {
            searchingLatestOrders = false;
        });
}

function countNewOrder(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/home/countNewOrder',
        {}
    ).done(function (data) {
        $('#newOrderCount').html(data.totalCount.toString());
        cb();
    }).fail(function () {
        console.error('新規注文数を取得できませんでした')
    });
}
function aggregateExitRate(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/home/aggregateExitRate',
        {}
    ).done(function (data) {
        $('.exitRate').html(data.rate.toString());
        cb();
    }).fail(function () {
        console.error('離脱率を取得できませんでした')
    });
}
function countNewUser(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/home/countNewUser',
        {}
    ).done(function (data) {
        $('#newUserCount').html(data.totalCount.toString());
        cb();
    }).fail(function () {
        console.error('新規ユーザー数を取得できませんでした')
    });
}
function countNewTransaction(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/home/countNewTransaction',
        {}
    ).done(function (data) {
        $('.newTransactionCount').html(data.totalCount.toString());
        cb();
    }).fail(function () {
        console.error('新規取引数を取得できませんでした')
    });
}

function initializeVisitorsChart() {
    var colorChoices = ['#daa8f5', '#3399FF', '#fad684', '#79f67d', '#79ccf5', '#e96c6c', '#efefef'];
    waiterDatasets = waiterRules.map(function (rule) {
        return {
            scope: rule.scope,
            name: rule.name,
            data: [],
            numberOfIssuedPassports: 0,
        };
    });

    // numVisitorsChart = new Morris.Line({
    //     element: 'visitorsChart',
    //     resize: true,
    //     data: [],
    //     xkey: 'y',
    //     ykeys: waiterRules.map(function (rule) {
    //         return rule.scope
    //     }),
    //     labels: waiterRules.map(function (rule) {
    //         return rule.name
    //     }),
    //     lineColors: waiterRules.map(function (_, index) {
    //         return colorChoices[index % colorChoices.length];
    //     }),
    //     lineWidth: 2,
    //     hideHover: 'auto',
    //     gridTextColor: '#fff',
    //     gridStrokeWidth: 0.4,
    //     pointSize: 0,
    //     pointStrokeColors: waiterRules.map(function (_, index) {
    //         return colorChoices[index % colorChoices.length];
    //     }),
    //     gridLineColor: '#efefef',
    //     gridTextFamily: 'Open Sans',
    //     gridTextSize: 10,
    //     smooth: false
    // });
}

function updateWaiterChart() {
    // numVisitorsChart.setData(waiterDatasets[0].data.map(function (d, index) {
    //     var data = {
    //         y: moment(d.x).toISOString()
    //     };
    //     waiterRules.forEach(function (rule) {
    //         var dataset4scope = waiterDatasets.find(function (dataset) {
    //             return dataset.scope === rule.scope;
    //         });
    //         if (dataset4scope !== undefined) {
    //             data[rule.scope] = dataset4scope.data[index].y
    //         } else {
    //             data[rule.scope] = 0;
    //         }
    //     });

    //     return data;
    // }));

    var colorChoices = ['#daa8f5', '#3399FF', '#fad684', '#79f67d', '#79ccf5', '#e96c6c', '#efefef'];

    // This will get the first returned node in the jQuery collection.
    new Chart($('#visitorsChart').get(0).getContext('2d'), {
        type: 'line',
        data: {
            // labels: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4', '2013 Q1', '2013 Q2'],
            datasets: waiterRules.map(function (rule, index) {
                var dataset4scope = waiterDatasets.find(function (dataset) {
                    return dataset.scope === rule.scope;
                });

                var data4chart = [];
                if (dataset4scope !== undefined) {
                    data4chart = dataset4scope.data.map(function (data) {
                        return {
                            x: moment(data.x).toDate(),
                            y: data.y
                        }
                    })
                };

                return {
                    label: status,
                    fill: false,
                    borderWidth: 1.5,
                    lineTension: 0,
                    spanGaps: true,
                    borderColor: colorChoices[index % colorChoices.length],
                    pointRadius: 0,
                    pointHoverRadius: 7,
                    pointColor: '#efefef',
                    pointBackgroundColor: '#efefef',
                    data: data4chart
                };
            })
        },
        options: {
            animation: {
                easing: 'linear',
            },
            maintainAspectRatio: false,
            responsive: true,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'second',
                        stepSize: 10,
                        displayFormats: {
                            second: 'h:mm:ss'
                        }
                    },
                    ticks: {
                        // maxTicksLimit: 6,
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10,
                    },
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 6,
                        min: 0,
                        // stepSize: 5000,
                        fontColor: '#6c757d',
                        // fontFamily: 'Open Sans',
                        fontSize: 10,
                        padding: 8,
                    },
                    gridLines: {
                        display: true,
                        // color: '#555c62',
                        color: '#efefef',
                        zeroLineColor: '#efefef',
                        lineWidth: 1,
                        drawBorder: false,
                    }
                }]
            }
        }
    });
}

function startMonitoringWaiter() {
    initializeVisitorsChart();

    var numberOfDatapoints = 30;
    setInterval(
        function () {
            const now = new Date();
            waiterDatasets.map(function (_, index) {
                // 時点での発行数データでチャートを更新
                waiterDatasets[index].data.push({
                    x: now,
                    y: waiterDatasets[index].numberOfIssuedPassports
                });
                waiterDatasets[index].data = waiterDatasets[index].data.slice(-numberOfDatapoints);
            });

            updateWaiterChart();
        },
        2000
    );

    setInterval(
        function () {
            waiterDatasets.map(function (dataset, index) {
                $.getJSON(
                    WAITER_ENDPOINT + '/projects/' + PROJECT_ID + '/passports/' + dataset.scope + '/currentIssueUnit',
                    {}
                ).done(function (data) {
                    // 時点での発行数データを追加
                    waiterDatasets[index].numberOfIssuedPassports = data.numberOfRequests;
                }).fail(function () {
                });
            });
        },
        2000
    );
}

function updateHealth(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/home/health',
        {}
    ).done(function (data) {
        $('.health').removeClass('text-danger').text(data.status);
        $('.version').text('v' + data.version);

        cb();
    }).fail(function (jqXHR, textStatus, error) {
        console.error('ヘルス情報を検索できませんでした', jqXHR);
        $('.health').addClass('text-danger').text(textStatus);
    });
}

function updateDbStats(cb) {
    var GB = 1000000000;
    $.getJSON(
        '/projects/' + PROJECT_ID + '/home/dbStats',
        {}
    ).done(function (data) {
        var usedSpaceStr = Math.floor(Number(data.fsUsedSize) / GB)
            + '/'
            + Math.floor(Number(data.fsTotalSize) / GB);
        var dbText = data.db + ' has ' + data.objects + ' objects';

        $('.usedSpace').removeClass('text-danger').text(usedSpaceStr);
        $('.dbText').text(dbText);

        cb();
    }).fail(function (jqXHR, textStatus, error) {
        console.error('DB統計を検索できませんでした', jqXHR);
        $('.usedSpace').addClass('text-danger').text(textStatus);
    });
}

function updateQueueCount(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/home/queueCount',
        {}
    ).done(function (data) {
        $('.queueCount').removeClass('text-danger').text(data.totalCount);

        cb();
    }).fail(function (jqXHR, textStatus, error) {
        console.error('キューを検索できませんでした', jqXHR);
        $('.queueCount').addClass('text-danger').text(textStatus);
    });
}
