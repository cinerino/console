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
                    return '<a target="_blank" href="/projects/' + PROJECT_ID + '/transactions/returnOrder/' + data.id + '">'
                        + '表示<i class="fa fa-external-link-alt ml-1"></i>'
                        + '</a>';
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
                    var agentName = String(data.agent.familyName) + ' ' + String(data.agent.givenName);
                    if (agentName.length > 8) {
                        agentName = agentName.slice(0, 8) + '...';
                    }

                    var html = '<a target="_blank" href="' + url + '"><span class="badge badge-light ' + data.agent.typeOf + '">' + data.agent.typeOf + '</span></a>'
                        + ' <a target="_blank" href="/projects/' + PROJECT_ID + '/applications/' + clientId + '"><span class="badge badge-light">Application</span></a>'
                        + '<br><a href="javscript:void(0);" class="showAgent" data-id="' + data.id + '">' + agentName + '</a>';

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.seller.typeOf + '/' + data.seller.id;
                    var sellerName = data.seller.name.ja;
                    if (sellerName.length > 8) {
                        sellerName = sellerName.slice(0, 8) + '...';
                    }

                    var html = '<span class="badge badge-light ' + data.seller.typeOf + '">' + data.seller.typeOf + '</span>'
                        + '<br><a target="_blank" href="' + url + '">' + sellerName + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.object !== undefined && data.object.order !== undefined) {
                        if (Array.isArray(data.object.order)) {
                            data.object.order.forEach(function (o) {
                                html += '<a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + o.orderNumber + '">' + o.orderNumber + '</a><br>';
                            });
                        } else {
                            html += '<a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + data.object.order.orderNumber + '">' + data.object.order.orderNumber + '</a>';
                        }
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<span class="badge badge-light ' + data.tasksExportationStatus + '">' + data.tasksExportationStatus + '</span>';
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
        var url = '/projects/' + PROJECT_ID + '/transactions/returnOrder?' + $('form').serialize() + '&format=text/csv';
        window.open(url, '_blank');
    });

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
