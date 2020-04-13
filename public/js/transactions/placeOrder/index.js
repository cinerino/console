var table;

$(function () {
    table = $("#transactions-table").DataTable({
        processing: true,
        serverSide: true,
        pagingType: 'simple',
        language: {
            info: 'Showing page _PAGE_',
            infoFiltered: ''
        },
        ajax: {
            url: '?' + $('form').serialize(),
            data: function (d) {
                d.limit = d.length;
                d.page = (d.start / d.length) + 1;
                // d.name = d.search.value;
                d.format = 'datatable';
            }
        },
        lengthChange: false,
        searching: false,
        order: [[1, 'asc']], // デフォルトは枝番号昇順
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var projectId = (data.project !== undefined && data.project !== null) ? data.project.id : 'undefined';

                    return '<a target="_blank" href="/projects/' + PROJECT_ID + '/transactions/placeOrder/' + data.id + '">' + data.id + '</a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<span class="badge ' + data.status + '">' + data.status + '</span>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return moment(data.startDate).utc().format();
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var endDate = '';
                    if (typeof data.endDate === 'string') {
                        endDate = moment(data.endDate).utc().format();
                    }

                    return endDate;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var expires = '';
                    if (typeof data.expires === 'string') {
                        expires = moment(data.expires).utc().format();
                    }

                    return expires;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var userPoolId = '';
                    var tokenIssuer = '';
                    var clientId = '';
                    if (Array.isArray(data.agent.identifier)) {
                        var tokenIssuerIdentifier = data.agent.identifier.find((i) => i.name === 'tokenIssuer');
                        var clienIdIdentifier = data.agent.identifier.find((i) => i.name === 'clientId');
                        if (tokenIssuerIdentifier !== undefined) {
                            tokenIssuer = tokenIssuerIdentifier.value;
                            userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                        }
                        if (clienIdIdentifier !== undefined) {
                            clientId = clienIdIdentifier.value;
                        }
                    }

                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.agent.typeOf + '/' + data.agent.id + '?userPoolId=' + userPoolId;

                    var html = '<a target="_blank" href="' + url + '"><span class="badge badge-secondary ' + data.agent.typeOf + '">' + data.agent.typeOf + '</span></a>'
                        + ' <span class="badge badge-warning">' + ((data.agent.memberOf !== undefined) ? data.agent.memberOf.membershipNumber : '') + '</span>'
                        + '<br><a target="_blank" href="/projects/' + PROJECT_ID + '/applications/' + clientId + '"><span class="badge badge-secondary">Application</span></a>'
                        + '<br><a href="javscript:void(0);" class="showAgent" data-id="' + data.id + '">' + String(data.agent.familyName) + ' ' + String(data.agent.givenName) + '</a>';

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.seller.typeOf + '/' + data.seller.id;
                    var html = '<span class="badge badge-secondary ' + data.seller.typeOf + '">' + data.seller.typeOf + '</span>'
                        + '<br><a target="_blank" href="' + url + '">' + data.seller.name.ja + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    if (data.result !== undefined) {
                        return '<a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + data.result.order.orderNumber + '">' + data.result.order.orderNumber + '</a>';
                    } else {
                        return 'No Result';
                    }
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (typeof data.endDate === 'string') {
                        html += moment.duration(moment(data.endDate).diff(data.startDate)).asSeconds() + ' s';
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<span class="badge badge-secondary ' + data.tasksExportationStatus + '">' + data.tasksExportationStatus + '</span>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var tasksExportedAt = '';
                    if (typeof data.tasksExportedAt === 'string') {
                        tasksExportedAt = moment(data.tasksExportedAt).utc().format();
                    }

                    return tasksExportedAt;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (typeof data.endDate === 'string') {
                        html += moment.duration(moment(data.tasksExportedAt).diff(data.endDate)).asMilliseconds() + ' ms';
                    }

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#startRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    });

    $('.search').click(function () {
        $('form').submit();
    });
    $('.downloadCSV').click(function () {
        var url = '/projects/' + PROJECT_ID + '/transactions/placeOrder?' + $('form').serialize() + '&format=text/csv';
        window.open(url, '_blank');
    });
    $('.downloadJson').click(function () {
        var url = '/projects/' + PROJECT_ID + '/transactions/placeOrder?' + $('form').serialize() + '&format=application/json';
        window.open(url, '_blank');
    });

    $('form .card-footer .btn-group')
        .popover({
            title: '検索方法',
            content: 'ドロップダウンメニューから出力フォーマットを選択できます。ストリーミングダウンロードの場合、全件出力が可能です。',
            placement: 'top',
            trigger: 'hover'
        })
        .popover('show');

    $(document).on('click', '.showAgent', function () {
        showDetails($(this).data('id'), 'agent');
    });

});

function showDetails(id, propertyName) {
    var transactions = table
        .rows()
        .data()
        .toArray();
    var transaction = transactions.find(function (t) {
        return t.id === id
    })

    var modal = $('#modal-transaction');
    var title = 'Transaction `' + transaction.id + '`';
    var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
        + JSON.stringify(transaction[propertyName], null, '\t')
        + '</textarea>';
    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}
