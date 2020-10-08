$(function () {
    var table = $("#sellers-table").DataTable({
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
        order: [[1, 'asc']],
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<span class="badge badge-light ' + data.typeOf + '">' + data.typeOf + '</span>';

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<a href="/projects/' + PROJECT_ID + '/sellers/' + data.id + '">' + data.id + '</a>';

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var name = data.name.ja;
                    if (typeof name === 'string' && name.length > 10) {
                        name = String(name).slice(0, 10) + '...';
                    }

                    var html = name;

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (typeof data.telephone === 'string') {
                        html += data.telephone;
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (typeof data.url === 'string') {
                        html += '<a target="_blank" href="' + data.url + '">' + data.url.slice(0, 10) + '...<i class="fa fa-external-link-alt ml-1"></i></a>';
                    }

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var numPaymentMethods = 0;
                    if (Array.isArray(data.paymentAccepted)) {
                        numPaymentMethods = data.paymentAccepted.length;
                    }
                    var html = '';

                    html += '<a href="javascript:void(0)" class="showPaymentAccepted" data-id="' + data.id + '">' + numPaymentMethods + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.location !== undefined && data.location !== null) {
                        var name = data.location.name.ja;
                        if (typeof name === 'string' && name.length > 10) {
                            name = String(name).slice(0, 10) + '...';
                        }

                        html += '<span class="badge badge-light">' + data.location.typeOf + '</span>'
                            + '<br>' + name;
                    }
                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';
                    if (Array.isArray(data.makesOffer)) {
                        html += data.makesOffer.map(function (offer) {
                            var branchCode = '';
                            if (offer.itemOffered !== undefined
                                && offer.itemOffered.reservationFor !== undefined
                                && offer.itemOffered.reservationFor.location !== undefined) {
                                branchCode = offer.itemOffered.reservationFor.location.branchCode;
                            }

                            return '<span class="mr-1 badge badge-light">' + offer.offeredThrough.identifier + '</span>'
                                + ' <a href="javascript:void(0)" class="showMakesOffer" data-id="' + data.id + '">' + branchCode + '</a>'
                                + '';
                        }).join('')
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    var numPolicy = 0;
                    if (Array.isArray(data.hasMerchantReturnPolicy)) {
                        numPolicy = data.hasMerchantReturnPolicy.length;
                    }
                    html += '<a href="javascript:void(0)" class="showReturnPolicy" data-id="' + data.id + '">' + numPolicy + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (Array.isArray(data.additionalProperty)) {
                        html += '<a href="javascript:void(0)" class="showAdditionalProperty" data-id="' + data.id + '">表示</a>';
                    }

                    html += '';

                    return html;
                }
            }
        ]
    });

    $(document).on('click', '.btn.search', function () {
        $('form').submit();
    });

    $(document).on('click', '.showAdditionalProperty', function () {
        var id = $(this).data('id');
        showAdditionalProperty(id);
    });

    $(document).on('click', '.showPaymentAccepted', function () {
        var id = $(this).data('id');
        showPaymentAccepted(id);
    });

    $(document).on('click', '.showMakesOffer', function () {
        var id = $(this).data('id');
        showMakesOffer(id);
    });

    $(document).on('click', '.showReturnPolicy', function () {
        var id = $(this).data('id');
        showReturnPolicy(id);
    });

    function showAdditionalProperty(id) {
        var sellers = table
            .rows()
            .data()
            .toArray();
        var seller = sellers.find(function (s) {
            return s.id === id
        })

        var modal = $('#modal-seller');
        var title = 'Seller `' + seller.id + '` Additional Property';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(seller.additionalProperty, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showMakesOffer(id) {
        var sellers = table
            .rows()
            .data()
            .toArray();
        var seller = sellers.find(function (s) {
            return s.id === id
        })

        var modal = $('#modal-seller');
        var title = 'Seller `' + seller.id + '` Makes Offer';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(seller.makesOffer, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showPaymentAccepted(id) {
        var sellers = table
            .rows()
            .data()
            .toArray();
        var seller = sellers.find(function (s) {
            return s.id === id
        })

        var modal = $('#modal-seller');
        var title = 'Seller `' + seller.id + '` Payment Accepted';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(seller.paymentAccepted, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showReturnPolicy(id) {
        var sellers = table
            .rows()
            .data()
            .toArray();
        var seller = sellers.find(function (s) {
            return s.id === id
        })

        var modal = $('#modal-seller');
        var title = 'Seller `' + seller.id + '` Return Policy';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(seller.hasMerchantReturnPolicy, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});