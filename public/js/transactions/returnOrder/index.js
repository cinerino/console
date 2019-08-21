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
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/transactions/returnOrder/' + data.id + '">' + data.id + '</a></li>'
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
                        + '<li><a target="_blank" href="' + url + '">' + data.agent.id + '</a></li>'
                        + '<li>' + String(data.agent.familyName) + ' ' + String(data.agent.givenName) + '</li>'
                        + '<li>' + String(data.agent.email) + '</li>'
                        + '<li>' + String(data.agent.telephone) + '</li>'
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/userPools/' + userPoolId + '">' + tokenIssuer + '</a></li>'
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/userPools/' + userPoolId + '/clients/' + clientId + '">' + clientId + '</a></li>';

                    html += '</ul>';

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

                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary ' + seller.typeOf + '">' + seller.typeOf + '</span></li>'
                        + '<li><a target="_blank" href="' + url + '">' + seller.name + '</a></li>'
                        + '<li>' + seller.telephone + '</li>'
                        + '<li>' + seller.url + '</li>'
                        + '</ul>';

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
                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary ' + data.tasksExportationStatus + '">' + data.tasksExportationStatus + '</span></li>'
                        + '<li>' + data.tasksExportedAt + '</li>'
                        + '</ul>';
                }
            }
        ]
    });

    // Date range picker
    $('#startRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    });

    $('.search').click(function () {
        $('form').submit();
    });
    $('.downloadCSV').click(function () {
        var url = '/projects/' + PROJECT_ID + '/transactions/returnOrder?' + $('form').serialize() + '&format=text/csv';
        window.open(url, '_blank');
    });
});