$(function () {
    $("#transactions-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '?' + $('form').serialize(),
            data: function (d) {
                d.limit = d.length;
                d.page = (d.start / d.length) + 1;
                // d.name = d.search.value;
                d.format = 'datatable';
            }
        },
        searching: false,
        order: [[1, 'asc']], // デフォルトは枝番号昇順
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var projectId = (data.project !== undefined && data.project !== null) ? data.project.id : 'undefined';

                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-light">' + projectId + '</span></li>'
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/transactions/placeOrder/' + data.id + '">' + data.id + '</a></li>'
                        + '<li><span class="badge ' + data.status + '">' + data.status + '</span></li>'
                        + '<li>' + data.startDate + '</li>'
                        + '<li>' + data.endDate + '</li>'
                        + '<li>' + data.expires + '</li>'
                        + '</ul>';
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

                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary ' + data.agent.typeOf + '">' + data.agent.typeOf + '</span></li>'
                        + '<li><span class="badge badge-warning">' + ((data.agent.memberOf !== undefined) ? data.agent.memberOf.membershipNumber : '') + '</span></li>'
                        + '<li>'
                        + '<a target="_blank" href="/projects/' + PROJECT_ID + '/applications/' + clientId + '"><span class="badge badge-secondary">Application</span></a>'
                        + '</li>'
                        + '<li><a target="_blank" href="' + url + '">' + data.agent.id + '</a></li>'
                        + '<li>' + String(data.agent.familyName) + ' ' + String(data.agent.givenName) + '</li>'
                        + '<li>' + String(data.agent.email) + '</li>'
                        + '<li>' + String(data.agent.telephone) + '</li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.seller.typeOf + '/' + data.seller.id;
                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary ' + data.seller.typeOf + '">' + data.seller.typeOf + '</span></li>'
                        + '<li><a target="_blank" href="' + url + '">' + data.seller.name.ja + '</a></li>'
                        + '<li>' + data.seller.telephone + '</li>'
                        + '<li>' + data.seller.url + '</li>'
                        + '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    if (data.result !== undefined) {
                        return '<ul class="list-unstyled">'
                            + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + data.result.order.orderNumber + '">' + data.result.order.orderNumber + '</a></li>'
                            + '</ul>';
                    } else {
                        return '<ul class="list-unstyled">'
                            + '<li>No Result</li>'
                            + '</ul>';
                    }
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary ' + data.tasksExportationStatus + '">' + data.tasksExportationStatus + '</span></li>'
                        + '<li>' + data.tasksExportedAt + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.endDate !== undefined) {
                        html += '<li>' + moment.duration(moment(data.endDate).diff(data.startDate)).asSeconds() + ' s</li>';
                        html += '<li>' + moment.duration(moment(data.tasksExportedAt).diff(data.endDate)).asMilliseconds() + ' ms</li>';
                    }

                    html += '</ul>';

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
});