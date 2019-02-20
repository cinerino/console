$(function () {
    $("#orders-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/orders?' + $('form').serialize(),
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
                        + '<li><a target="_blank" href="/orders/' + data.orderNumber + '">' + data.orderNumber + '</a></li>'
                        + '<li><span class="text-muted">' + data.confirmationNumber + '</span></li>'
                        + '<li>' + data.orderDate + '</li>'
                        + '<li><span class="badge ' + data.orderStatus + '">' + data.orderStatus + '</span></li>'
                        + '</ul>';

                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var userPoolId = '';
                    var tokenIssuer = '';
                    var clientId = '';
                    if (Array.isArray(data.customer.identifier)) {
                        var tokenIssuerIdentifier = data.customer.identifier.find((i) => i.name === 'tokenIssuer');
                        var clienIdIdentifier = data.customer.identifier.find((i) => i.name === 'clientId');
                        if (tokenIssuerIdentifier !== undefined) {
                            tokenIssuer = tokenIssuerIdentifier.value;
                            userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                        }
                        if (clienIdIdentifier !== undefined) {
                            clientId = clienIdIdentifier.value;
                        }
                    }

                    var html = '<ul class="list-unstyled">';

                    html += '<li><span class="badge badge-info">' + data.customer.typeOf + '</span></li>';

                    if (data.customer.memberOf !== undefined) {
                        html += '<li><a target="_blank" href="/userPools/' + userPoolId + '/people/' + data.customer.id + '">' + data.customer.id + '</a></li>';
                    } else {
                        html += '<li><a target="_blank" href="/userPools/' + userPoolId + '/clients/' + data.customer.id + '">' + data.customer.id + '</a></li>';
                    }

                    html += '<li><span class="badge badge-warning">' + ((data.customer.memberOf !== undefined) ? data.customer.memberOf.membershipNumber : '') + '</span></li>'
                        + '<li>' + data.customer.name + '</li>'
                        + '<li>' + data.customer.email + '</li>'
                        + '<li>' + data.customer.telephone + '</li>'
                        + '<li>Issuer: <a target="_blank" href="/userPools/' + userPoolId + '">' + tokenIssuer + '</a></li>'
                        + '<li>Client: <a target="_blank" href="/userPools/' + userPoolId + '/clients/' + clientId + '">' + clientId + '</a></li>';

                    if (Array.isArray(data.customer.identifier)) {
                        data.customer.identifier.forEach(function (i) {
                            html += '<li>' + '<span class="badge badge-secondary">' + i.name + '</span> ' + i.value.toString() + '</li>';
                        });
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-info">' + data.seller.typeOf + '</span></li>'
                        + '<li><a target="_blank" href="/sellers/' + data.seller.id + '">' + data.seller.id + '</a></li>'
                        + '<li>' + data.seller.name + '</li>'
                        + '<li>' + data.seller.url + '</li>'
                        + '<li>' + data.seller.telephone + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.price + ' ' + data.priceCurrency + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + data.paymentMethods.map(function (payment) {
                            var listHtml = '<li><span class="badge ' + payment.typeOf + '">' + payment.typeOf + '</span></li>'
                                + '<li><span>' + payment.paymentMethodId + '</span></li>';

                            if (payment.totalPaymentDue !== undefined) {
                                listHtml += '<li><span>' + payment.totalPaymentDue.value + ' ' + payment.totalPaymentDue.currency + '</span></li>'
                            }

                            return listHtml;
                        }).join('')
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + JSON.stringify(data.discounts) + '</li>'
                        + '</ul>';
                }
            }
        ]
    });

    // Date range picker
    $('#orderDateRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })
});