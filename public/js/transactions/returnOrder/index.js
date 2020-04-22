$(function () {
    $("#transactions-table").DataTable({
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
                    return '<a target="_blank" href="/projects/' + PROJECT_ID + '/transactions/returnOrder/' + data.id + '">' + data.id + '</a>';
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
                    return data.startDate;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.endDate;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.expires;
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

                    var html = '<span class="badge badge-light ' + data.agent.typeOf + '">' + data.agent.typeOf + '</span>'
                        + ' <span class="badge badge-light">' + ((data.agent.memberOf !== undefined) ? data.agent.memberOf.membershipNumber : '') + '</span>'
                        + ' <a target="_blank" href="/projects/' + PROJECT_ID + '/applications/' + clientId + '"><span class="badge badge-light">Application</span></a>'
                        + '<br><a target="_blank" href="' + url + '">' + data.agent.id + '</a>'
                        + '<br>' + String(data.agent.familyName) + ' ' + String(data.agent.givenName);

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var seller = {};
                    if (data.object.order !== undefined) {
                        seller = data.object.order.seller;
                    }

                    var url = '/projects/' + PROJECT_ID + '/resources/' + seller.typeOf + '/' + seller.id;

                    var html = '<span class="badge badge-light ' + seller.typeOf + '">' + seller.typeOf + '</span>'
                        + '<br><a target="_blank" href="' + url + '">' + seller.name + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    if (data.object !== undefined && data.object.order !== undefined) {
                        return '<ul class="list-unstyled">'
                            + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + data.object.order.orderNumber + '">' + data.object.order.orderNumber + '</a></li>'
                            + '</ul>';
                    } else {
                        return '<ul class="list-unstyled">'
                            + '<li>No Object</li>'
                            + '</ul>';
                    }
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
                    return data.tasksExportedAt;
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
});