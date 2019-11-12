$(function () {
    var table = $("#orders-table").DataTable({
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

                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-light">' + projectId + '</span></li>'
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + data.orderNumber + '">' + data.orderNumber + '</a></li>'
                        + '<li><span class="badge ' + data.orderStatus + '">' + data.orderStatus + '</span></li>'
                        + '<li><span class="text-muted">' + data.confirmationNumber + '</span></li>'
                        + '<li>' + data.orderDate + '</li>'
                        + '<li>' + data.dateReturned + '</li>';

                    html += '<li>';
                    if (Array.isArray(data.identifier)) {
                        html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showIdentifier" data-orderNumber="' + data.orderNumber + '">識別子</a>';
                    }
                    html += '</li>';

                    html += '</ul>';

                    return html;

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

                    html += '<li><span class="badge badge-info">' + data.customer.typeOf + '</span></li>'
                        + '<li><span class="badge badge-warning">' + ((data.customer.memberOf !== undefined) ? data.customer.memberOf.membershipNumber : '') + '</span></li>'
                        + '<li>'
                        + '<a target="_blank" href="/projects/' + PROJECT_ID + '/userPools/' + userPoolId + '"><span class="badge badge-secondary">Issuer</span></a>'
                        + ' <a target="_blank" href="/projects/' + PROJECT_ID + '/userPools/' + userPoolId + '/clients/' + clientId + '"><span class="badge badge-secondary">Client</span></a>'
                        + '</li>';

                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.customer.typeOf + '/' + data.customer.id + '?userPoolId=' + userPoolId;
                    html += '<li><a target="_blank" href="' + url + '">' + data.customer.id + '</a></li>'
                        + '<li>' + data.customer.name + '</li>'
                        + '<li>' + data.customer.email + '</li>'
                        + '<li>' + data.customer.telephone + '</li>';

                    html += '<li>'
                        + '<a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showCustomer" data-orderNumber="' + data.orderNumber + '">詳細</a>';
                    if (Array.isArray(data.customer.identifier)) {
                        html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showCustomerIdentifier" data-orderNumber="' + data.orderNumber + '">識別子</a>';
                    }
                    if (Array.isArray(data.customer.additionalProperty)) {
                        html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showCustomerAdditionalProperty" data-orderNumber="' + data.orderNumber + '">追加特性</a>';
                    }
                    html += '</li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.seller.typeOf + '/' + data.seller.id;
                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-info">' + data.seller.typeOf + '</span></li>'
                        + '<li><a target="_blank" href="' + url + '">' + data.seller.id + '</a></li>'
                        + '<li>' + data.seller.name + '</li>'
                        + '<li><a target="_blank" href="' + data.seller.url + '">' + data.seller.url + '</a></li>'
                        + '<li>' + data.seller.telephone + '</li>'
                        + '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showSeller" data-orderNumber="' + data.orderNumber + '">詳細</a></li>'
                        + '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var numItems = '';
                    if (Array.isArray(data.acceptedOffers)) {
                        numItems = data.acceptedOffers.length;
                    }

                    return '<ul class="list-unstyled">'
                        + '<li>' + data.price + ' ' + data.priceCurrency + '</li>'
                        + '<li>' + numItems + ' items</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + data.paymentMethods.map(function (payment) {
                            var listHtml = '<li><span class="badge badge-secondary ' + payment.typeOf + '">' + payment.typeOf + '</span></li>'
                                + '<li><span>' + payment.name + '</span></li>'
                                + '<li><span>' + payment.accountId + '</span></li>'
                                + '<li><span>' + payment.paymentMethodId + '</span></li>';

                            if (payment.totalPaymentDue !== undefined) {
                                listHtml += '<li><span>' + payment.totalPaymentDue.value + ' ' + payment.totalPaymentDue.currency + '</span></li>'
                            }

                            listHtml += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showPaymentMethods" data-orderNumber="' + data.orderNumber + '">詳細</a></li>';

                            return listHtml;
                        }).join('')
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.returner !== undefined && data.returner !== null) {
                        var userPoolId = '';
                        var tokenIssuer = '';
                        var clientId = '';
                        if (Array.isArray(data.returner.identifier)) {
                            var tokenIssuerIdentifier = data.returner.identifier.find((i) => i.name === 'tokenIssuer');
                            var clienIdIdentifier = data.returner.identifier.find((i) => i.name === 'clientId');
                            if (tokenIssuerIdentifier !== undefined) {
                                tokenIssuer = tokenIssuerIdentifier.value;
                                userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                            }
                            if (clienIdIdentifier !== undefined) {
                                clientId = clienIdIdentifier.value;
                            }
                        }

                        html += '<li><span class="badge badge-info">' + data.returner.typeOf + '</span></li>'
                            + '<li><span class="badge badge-warning">' + ((data.returner.memberOf !== undefined) ? data.returner.memberOf.membershipNumber : '') + '</span></li>'
                            + '<li>'
                            + '<a target="_blank" href="/projects/' + PROJECT_ID + '/userPools/' + userPoolId + '"><span class="badge badge-secondary">Issuer</span></a>'
                            + ' <a target="_blank" href="/projects/' + PROJECT_ID + '/userPools/' + userPoolId + '/clients/' + clientId + '"><span class="badge badge-secondary">Client</span></a>'
                            + '</li>';

                        var url = '/projects/' + PROJECT_ID + '/resources/' + data.returner.typeOf + '/' + data.returner.id + '?userPoolId=' + userPoolId;
                        html += '<li><a target="_blank" href="' + url + '">' + data.returner.id + '</a></li>'
                            + '<li>' + data.returner.name + '</li>'
                            + '<li>' + data.returner.email + '</li>'
                            + '<li>' + data.returner.telephone + '</li>';

                        html += '<li>'
                            + '<a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showReturner" data-orderNumber="' + data.orderNumber + '">詳細</a>';
                        if (Array.isArray(data.returner.identifier)) {
                            html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showReturnerIdentifier" data-orderNumber="' + data.orderNumber + '">識別子</a>';
                        }
                        html += '</li>';
                    }

                    html += '</ul>';

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#orderDateRange,#reservationForInSessionRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })

    $('.search').click(function () {
        $('form').submit();
    });
    $('.downloadCSV').click(function () {
        var url = '/projects/' + PROJECT_ID + '/orders?' + $('form').serialize() + '&format=text/csv';
        window.open(url, '_blank');
    });
    $('.downloadJson').click(function () {
        var url = '/projects/' + PROJECT_ID + '/orders?' + $('form').serialize() + '&format=application/json';
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

    $(document).on('click', '.showIdentifier', function () {
        showIdentifier($(this).data('ordernumber'));
    });
    $(document).on('click', '.showCustomerIdentifier', function () {
        showCustomerIdentifier($(this).data('ordernumber'));
    });
    $(document).on('click', '.showCustomerAdditionalProperty', function () {
        showCustomerAdditionalProperty($(this).data('ordernumber'));
    });
    $(document).on('click', '.showCustomer', function () {
        showCustomer($(this).data('ordernumber'));
    });
    $(document).on('click', '.showSeller', function () {
        showSeller($(this).data('ordernumber'));
    });
    $(document).on('click', '.showPaymentMethods', function () {
        showPaymentMethods($(this).data('ordernumber'));
    });
    $(document).on('click', '.showReturnerIdentifier', function () {
        showReturnerIdentifier($(this).data('ordernumber'));
    });
    $(document).on('click', '.showReturner', function () {
        showReturner($(this).data('ordernumber'));
    });

    function showIdentifier(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Identifier';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.identifier, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    /**
     * 注文のCustomer Identifierを表示する
     */
    function showCustomerIdentifier(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Customer Identifier';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.customer.identifier, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showCustomerAdditionalProperty(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Customer AdditionalProperty';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.customer.additionalProperty, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showCustomer(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Customer';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.customer, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
    function showSeller(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Seller';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.seller, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
    function showPaymentMethods(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Payment Methods';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.paymentMethods, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
    function showReturnerIdentifier(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Returner Identifier';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.returner.identifier, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
    function showReturner(orderNumber) {
        var orders = table
            .rows()
            .data()
            .toArray();
        var order = orders.find(function (order) {
            return order.orderNumber === orderNumber
        })

        var modal = $('#modal-order');
        var title = 'Order `' + order.orderNumber + '` Returner';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(order.returner, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});