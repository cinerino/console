$(function () {
    var table = $("#ownershipInfos-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/ownershipInfos?' + $('form').serialize(),
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
                    return '<ul class="list-unstyled">'
                        + '<li><a href="#">' + data.id + '</a></li>'
                        + '<li>' + data.ownedFrom + '</li>'
                        + '<li>' + data.ownedThrough + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var userPoolId = '';
                    var tokenIssuer = '';
                    var clientId = '';
                    if (Array.isArray(data.ownedBy.identifier)) {
                        var tokenIssuerIdentifier = data.ownedBy.identifier.find((i) => i.name === 'tokenIssuer');
                        var clienIdIdentifier = data.ownedBy.identifier.find((i) => i.name === 'clientId');
                        if (tokenIssuerIdentifier !== undefined) {
                            tokenIssuer = tokenIssuerIdentifier.value;
                            userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                        }
                        if (clienIdIdentifier !== undefined) {
                            clientId = clienIdIdentifier.value;
                        }
                    }

                    var html = '<ul class="list-unstyled">';

                    html += '<li><span class="badge badge-info">' + data.ownedBy.typeOf + '</span></li>'
                        + '<li><span class="badge badge-warning">' + ((data.ownedBy.memberOf !== undefined) ? data.ownedBy.memberOf.membershipNumber : '') + '</span></li>'
                        + '<li>'
                        + '<a target="_blank" href="/userPools/' + userPoolId + '"><span class="badge badge-secondary">Issuer</span></a>'
                        + ' <a target="_blank" href="/userPools/' + userPoolId + '/clients/' + clientId + '"><span class="badge badge-secondary">Client</span></a>'
                        + '</li>';

                    if (data.ownedBy.memberOf !== undefined) {
                        html += '<li><a target="_blank" href="/userPools/' + userPoolId + '/people/' + data.ownedBy.id + '">' + data.ownedBy.id + '</a></li>';
                    } else {
                        html += '<li><a target="_blank" href="/userPools/' + userPoolId + '/clients/' + data.ownedBy.id + '">' + data.ownedBy.id + '</a></li>';
                    }

                    html += '<li>' + data.ownedBy.name + '</li>'
                        + '<li>' + data.ownedBy.email + '</li>'
                        + '<li>' + data.ownedBy.telephone + '</li>';

                    if (Array.isArray(data.ownedBy.identifier)) {
                        // data.customer.identifier.slice(0, 2).forEach(function (i) {
                        //     html += '<li>' + '<span class="badge badge-secondary">' + i.name + '</span> ' + i.value.toString() + '</li>';
                        // });

                        // html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showCustomerIdentifier" data-orderNumber="' + data.orderNumber + '">識別子をより詳しく見る</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-primary">' + data.typeOfGood.typeOf + '</span></li>'
                        + '<li><span class="badge badge-secondary">' + data.typeOfGood.id + '</span></li>'
                        + '<li>' + JSON.stringify(data.typeOfGood) + '</li>'
                        + '</ul>';
                }
            }
        ]
    });

    // Date range picker
    $('#ownedRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    });
});