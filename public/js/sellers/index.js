$(function () {
    var table = $("#sellers-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/sellers?' + $('form').serialize(),
            data: function (d) {
                d.limit = d.length;
                d.page = (d.start / d.length) + 1;
                // d.name = d.search.value;
                d.format = 'datatable';
            }
        },
        searching: false,
        order: [[1, 'asc']],
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><a href="/sellers/' + data.id + '">' + data.id + '</a></li>'
                        + '<li><span class="badge badge-info ' + data.typeOf + '">' + data.typeOf + '</span></li>'
                        + '<li>' + data.name.ja + '</li>'
                        + '<li>' + data.name.en + '</li>'
                        + '<li>' + data.telephone + '</li>'
                        + '<li><a target="_blank" href="' + data.url + '">' + data.url + '</a></li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';
                    if (data.location !== undefined && data.location !== null) {
                        html += '<li><span class="badge badge-info ' + data.location.typeOf + '">' + data.location.typeOf + '</span></li>'
                            + '<li>' + data.location.branchCode + '</li>'
                            + '<li>' + data.location.name.ja + '</li>'
                            + '<li>' + data.location.name.en + '</li>';
                    }
                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li>'
                        + data.paymentAccepted.map(function (payment) {
                            return '<span class="mr-1 badge badge-secondary ' + payment.paymentMethodType + '">' + payment.paymentMethodType + '</span>';
                        }).join('')
                        + '</li>';

                    html += '<li><a href="javascript:void(0)" class="mt-2 btn btn-outline-primary btn-sm showPaymentAccepted" data-id="' + data.id + '">対応決済方法を詳しく見る</a><li>'
                        + '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';
                    if (Array.isArray(data.makesOffer)) {
                        html += data.makesOffer.map(function (offer) {
                            var branchCode = '';
                            if (offer.itemOffered !== undefined
                                && offer.itemOffered.reservationFor !== undefined
                                && offer.itemOffered.reservationFor.location !== undefined) {
                                branchCode = offer.itemOffered.reservationFor.location.branchCode;
                            }

                            return '<li><span class="mr-1 badge badge-secondary">' + offer.offeredThrough.identifier + '</span>' + branchCode + '</li>';
                        }).join('')

                    }
                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';
                    if (Array.isArray(data.areaServed)) {
                        html += data.areaServed.map(function (area) {
                            return '<li><span class="mr-1 badge badge-secondary">' + area.typeOf + '</span>' + area.name + '</li>';
                        }).join('')
                    }

                    html += '<li><a href="javascript:void(0)" class="mt-2 btn btn-outline-primary btn-sm showAreaServed" data-id="' + data.id + '">対応店舗を詳しく見る</a><li>'
                        + '</ul>';

                    return html;
                }
            }
        ]
    });

    $(document).on('click', '.showPaymentAccepted', function () {
        var id = $(this).data('id');
        showPaymentAccepted(id);
    });

    $(document).on('click', '.showAreaServed', function () {
        var id = $(this).data('id');
        showAreaServed(id);
    });

    function showPaymentAccepted(id) {
        var sellers = table
            .rows()
            .data()
            .toArray();
        var seller = sellers.find(function (s) {
            return s.id === id
        })

        var modal = $('#modal-seller-paymentAccepted');
        var title = 'Seller `' + seller.id + '` Payment Accepted';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(seller.paymentAccepted, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showAreaServed(id) {
        var sellers = table
            .rows()
            .data()
            .toArray();
        var seller = sellers.find(function (s) {
            return s.id === id
        })

        var modal = $('#modal-seller-areaServed');
        var title = 'Seller `' + seller.id + '` Area Served';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(seller.areaServed, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});