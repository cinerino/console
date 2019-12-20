$(function () {
    var table = $("#sellers-table").DataTable({
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
        order: [[1, 'asc']],
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var projectId = (data.project !== undefined && data.project !== null) ? data.project.id : 'undefined';

                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-light">' + projectId + '</span></li>'
                        + '<li><a href="/projects/' + PROJECT_ID + '/sellers/' + data.id + '">' + data.id + '</a></li>'
                        + '<li><span class="badge badge-info ' + data.typeOf + '">' + data.typeOf + '</span></li>'
                        + '<li>' + data.name.ja + '</li>'
                        + '<li>' + data.name.en + '</li>'
                        + '<li>' + data.telephone + '</li>'
                        + '<li><a target="_blank" href="' + data.url + '">' + data.url + '</a></li>';

                    html += '<li>';
                    if (Array.isArray(data.additionalProperty)) {
                        html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showAdditionalProperty" data-id="' + data.id + '">追加特性</a>';
                    }
                    html += '</li>';

                    html += '</ul>';

                    return html;
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

                    html += '<li><a href="javascript:void(0)" class="mt-2 btn btn-outline-primary btn-sm showPaymentAccepted" data-id="' + data.id + '">詳しく見る</a></li>'
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

                    html += '<li><a href="javascript:void(0)" class="mt-2 btn btn-outline-primary btn-sm showMakesOffer" data-id="' + data.id + '">詳しく見る</a></li>'

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
                            var url = '/projects/' + PROJECT_ID + '/applications/' + area.id;
                            return '<li>'
                                + '<span class="mr-1 badge badge-secondary">' + area.typeOf + '</span>'
                                + '<a target="_blank" href="' + url + '">' + area.name + '</a>'
                                + '</li>';
                        }).join('')
                    }

                    html += '<li><a href="javascript:void(0)" class="mt-2 btn btn-outline-primary btn-sm showAreaServed" data-id="' + data.id + '">対応店舗を詳しく見る</a></li>'
                        + '</ul>';

                    return html;
                }
            }
        ]
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

    $(document).on('click', '.showAreaServed', function () {
        var id = $(this).data('id');
        showAreaServed(id);
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

    function showAreaServed(id) {
        var sellers = table
            .rows()
            .data()
            .toArray();
        var seller = sellers.find(function (s) {
            return s.id === id
        })

        var modal = $('#modal-seller');
        var title = 'Seller `' + seller.id + '` Area Served';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(seller.areaServed, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});