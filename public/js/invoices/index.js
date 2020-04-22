var table;
$(function () {
    table = $("#invoices-table").DataTable({
        processing: true,
        serverSide: true,
        pagingType: 'simple',
        language: {
            info: 'Showing page _PAGE_',
            infoFiltered: ''
        },
        // paging: false,
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
        order: [[0, 'asc']], // デフォルトソート
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var accountId = 'なし';
                    if (typeof data.accountId === 'string') {
                        accountId = data.accountId;
                    }

                    return accountId;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.confirmationNumber;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.paymentMethod;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.paymentMethodId;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<span class="badge badge-light ' + data.paymentStatus + '">' + data.paymentStatus + '</span>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<a href="javascript:void(0)" class="showTotalPaymentDue" data-orderNumber="' + data.referencesOrder.orderNumber + '">表示</a>';
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

                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.customer.typeOf + '/' + data.customer.id + '?userPoolId=' + userPoolId;

                    var html = '';

                    html += '<a target="_blank" href="' + url + '"><span class="badge badge-light">' + data.customer.typeOf + '</span></a>';

                    html += ' <span class="badge badge-light">' + ((data.customer.memberOf !== undefined) ? data.customer.memberOf.membershipNumber : '') + '</span>'
                        + '<br><a href="javascript:void(0)" class="showCustomer" data-orderNumber="' + data.referencesOrder.orderNumber + '">' + data.customer.name + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (data.referencesOrder !== undefined) {
                        html += '<a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + data.referencesOrder.orderNumber + '">' + data.referencesOrder.orderNumber + '</a>'
                    }

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#createdAtRange,#reservationForInSessionRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    })

    $(document).on('click', '.showTotalPaymentDue', function () {
        var orderNumber = $(this).data('ordernumber');
        console.log('showing... orderNumber:', orderNumber);

        showTotalPaymentDue(orderNumber);
    });

    $(document).on('click', '.showCustomer', function () {
        var orderNumber = $(this).data('ordernumber');
        console.log('showing... orderNumber:', orderNumber);

        showCustomer(orderNumber);
    });

});

function showTotalPaymentDue(orderNumber) {
    var invoices = table
        .rows()
        .data()
        .toArray();
    var invoice = invoices.find(function (invoice) {
        return invoice.referencesOrder.orderNumber === orderNumber
    })

    var modal = $('#modal-invoice');
    var title = 'Invoice `' + invoice.id + '`';
    var body = '<textarea rows="20" class="form-control" placeholder="" disabled="">'
        + JSON.stringify(invoice.totalPaymentDue, null, '\t')
        + '</textarea>';
    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}

function showCustomer(orderNumber) {
    var invoices = table
        .rows()
        .data()
        .toArray();
    var invoice = invoices.find(function (invoice) {
        return invoice.referencesOrder.orderNumber === orderNumber
    })

    var modal = $('#modal-invoice');
    var title = 'Invoice `' + invoice.id + '` Customer';
    var body = '<textarea rows="40" class="form-control" placeholder="" disabled="">'
        + JSON.stringify(invoice.customer, null, '\t')
        + '</textarea>';
    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}