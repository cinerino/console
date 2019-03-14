$(function () {
    var table = $("#invoices-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/invoices?' + $('form').serialize(),
            data: function (d) {
                d.limit = d.length;
                d.page = (d.start / d.length) + 1;
                // d.name = d.search.value;
                d.format = 'datatable';
            }
        },
        searching: false,
        order: [[0, 'asc']], // デフォルトソート
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var accountId = '---';
                    if (data.accountId !== undefined && data.accountId !== null && data.accountId !== '') {
                        accountId = data.accountId;
                    }

                    return '<ul class="list-unstyled">'
                        + '<li>' + accountId + '<li>'
                        + '<li>' + data.confirmationNumber + '<li>'
                        + '<li><span class="badge ' + data.paymentMethod + '">' + data.paymentMethod + '</span></li>'
                        + '<li><span>' + data.paymentMethodId + '</span></li>'
                        + '<li><span class="badge badge-secondary ' + data.paymentStatus + '">' + data.paymentStatus + '</span></li>'
                        // + data.paymentMethods.map(function (payment) {
                        //     var listHtml = '<li><span class="badge ' + payment.typeOf + '">' + payment.typeOf + '</span></li>'
                        //         + '<li><span>' + payment.paymentMethodId + '</span></li>';

                        //     if (payment.totalPaymentDue !== undefined) {
                        //         listHtml += '<li><span>' + payment.totalPaymentDue.value + ' ' + payment.totalPaymentDue.currency + '</span></li>'
                        //     }

                        //     return listHtml;
                        // }).join('')
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><textarea class="form-control" placeholder="" disabled="" rows="8">' + JSON.stringify(data.totalPaymentDue, null, '\t') + '</textarea></li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var userPoolId = '';
                    var tokenIssuer = '';
                    if (Array.isArray(data.customer.identifier)) {
                        var tokenIssuerIdentifier = data.customer.identifier.find((i) => i.name === 'tokenIssuer');
                        if (tokenIssuerIdentifier !== undefined) {
                            tokenIssuer = tokenIssuerIdentifier.value;
                            userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
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
                        + '<li>' + data.customer.telephone + '</li>';

                    if (Array.isArray(data.customer.identifier)) {
                        data.customer.identifier.slice(0, 2).forEach(function (i) {
                            html += '<li>' + '<span class="badge badge-secondary">' + i.name + '</span> ' + i.value.toString() + '</li>';
                        });

                        html += '...'
                            + '<li><a href="javascript:void(0)" class="btn btn-default btn-sm showCustomerIdentifier" data-orderNumber="' + data.referencesOrder.orderNumber + '">識別子をより詳しく見る</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'

                    if (data.referencesOrder !== undefined) {
                        html += '<li><a target="_blank" href="/orders/' + data.referencesOrder.orderNumber + '">' + data.referencesOrder.orderNumber + '</a></li>'
                    }

                    html += '</ul>';

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#createdAtRange,#reservationForInSessionRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })

    $(document).on('click', '.showCustomerIdentifier', function () {
        var orderNumber = $(this).data('ordernumber');
        console.log('showing... orderNumber:', orderNumber);

        showCustomerIdentifier(orderNumber);
    });

    /**
     * 注文のCustomer Identifierを表示する
     */
    function showCustomerIdentifier(orderNumber) {
        var invoices = table
            .rows()
            .data()
            .toArray();
        var order = invoices.find(function (invoice) {
            return invoice.referencesOrder.orderNumber === orderNumber
        })

        var modal = $('#modal-customer-identifier');
        var title = 'Order `' + order.orderNumber + '` Customer Identifier';
        var body = '<textarea ="40" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.customer.identifier, null, '\t');
        + '</textarea>'
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});