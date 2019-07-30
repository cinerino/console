$(function () {
    var table = $("#reservations-table").DataTable({
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
                    var orderFrom = moment(data.bookingTime).add(-1, 'day').toISOString();
                    var orderThrough = moment(data.bookingTime).add(1, 'minute').toISOString();

                    var orderUrl = '/projects/' + PROJECT_ID + '/orders?'
                        + 'acceptedOffers[itemOffered][ids]=' + data.id
                        + '&orderDateRange=' + orderFrom + ' - ' + orderThrough;

                    var orderUrl4reservationNumber = '/projects/' + PROJECT_ID + '/orders?'
                        + 'acceptedOffers[itemOffered][reservationNumbers]=' + data.reservationNumber
                        + '&orderDateRange=' + orderFrom + ' - ' + orderThrough;

                    var html = '<ul class="list-unstyled">'
                        + '<li><a target="_blank" href="' + orderUrl + '">' + data.id + '</a></li>'
                        + '<li><a target="_blank" href="' + orderUrl4reservationNumber + '">' + data.reservationNumber + '</a></li>'
                        + '<li><span class="badge badge-secondary ' + data.reservationStatus + '">' + data.reservationStatus + '</span></li>'
                        + '<li>' + data.bookingTime + '</li>'
                        + '<li>' + data.modifiedTime + '</li>'
                        + '<li><span class="text-muted">' + data.additionalTicketText + '</span></li>';

                    html += '<li>'
                    if (Array.isArray(data.additionalProperty)) {
                        html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showAdditionalProperty" data-id="' + data.id + '">追加特性</a>';
                    }
                    if (data.price !== undefined) {
                        html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showPrice" data-id="' + data.id + '">価格仕様</a>';
                    }
                    html += '<li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    html += '<li><span class="badge badge-secondary">' + data.reservationFor.typeOf + '</span></li>'
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/events/screeningEvent/' + data.reservationFor.id + '">' + data.reservationFor.name.ja + '</a></li>'
                        + '<li>' + data.reservationFor.startDate + '</li>'
                        + '<li>' + data.reservationFor.superEvent.location.name.ja + '</li>'
                        + '<li>' + data.reservationFor.location.name.ja + '</li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {


                    // name="reservedTicket.typeOf__ticketType.name__reservedTicket.ticketType.id__reservedTicket.ticketType.name.ja__reservedTicket.ticketType.name.en__unitPriceSpec.price__unitPriceSpec.referenceQuantity.value__unitPriceSpec.priceCurrency__ticketedSeat">
                    // <p class="badge badge-secondary">$reservedTicket.typeOf$</p>
                    // <p class="font-weight-bold"><a target="_blank"
                    //         href="/ticketTypes/$reservedTicket.ticketType.id$/update">$reservedTicket.ticketType.name.ja$
                    //         <br>$reservedTicket.ticketType.name.en$</a></p>
                    // <p class="badge badge-info">$ticketType.name$</p>
                    // <p>$unitPriceSpec.price$ / $unitPriceSpec.referenceQuantity.value$
                    //     $unitPriceSpec.priceCurrency$</p>
                    // <p>$ticketedSeat$</p>

                    var seatNumber = 'Non Reserved Seat';
                    if (data.reservedTicket.ticketedSeat !== undefined) {
                        seatNumber = data.reservedTicket.ticketedSeat.seatNumber;
                    }

                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary ' + data.reservedTicket.typeOf + '">' + data.reservedTicket.typeOf + '</span></li>'
                        + '<li><span class="text-muted">' + data.reservedTicket.ticketType.id + '</span></li>'
                        + '<li>' + data.reservedTicket.ticketType.identifier + '</li>'
                        + '<li>' + data.reservedTicket.ticketType.name.ja + '</li>'
                        + '<li class="font-italic">' + data.reservedTicket.ticketType.name.en + '</li>'
                        + '<li>' + seatNumber + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary ' + data.underName.typeOf + '">' + data.underName.typeOf + '</span></li>'
                        + '<li><span class="text-muted">' + data.underName.id + '</span></li>'
                        + '<li>' + data.underName.givenName + ' ' + data.underName.familyName + '</li>'
                        + '<li>' + data.underName.email + '</li>'
                        + '<li>' + data.underName.telephone + '</li>';

                    if (Array.isArray(data.underName.identifier)) {
                        html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showUnderNameIdentifier" data-id="' + data.id + '">識別子を見る</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.checkedIn + '</li>'
                        + '<li>' + data.attended + '</li>'
                        + '</ul>';
                }
            }
        ]
    });

    // Date range picker
    $('#bookingTimeRange,#modifiedTimeRange,#reservationForInSessionRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })

    $(document).on('click', '.showUnderNameIdentifier', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showUnderNameIdentifier(id);
    });

    $(document).on('click', '.showAdditionalProperty', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showAdditionalProperty(id);
    });

    $(document).on('click', '.showPrice', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showPrice(id);
    });

    /**
     * 予約者識別子を表示する
     */
    function showUnderNameIdentifier(id) {
        var reservations = table
            .rows()
            .data()
            .toArray();
        var reservation = reservations.find(function (r) {
            return r.id === id
        })

        var modal = $('#modal-underName-identifier');
        var title = 'Reservation `' + reservation.id + '` Under Name Identifier';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(reservation.underName.identifier, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    /**
     * 予約追加特性を表示する
     */
    function showAdditionalProperty(id) {
        var reservations = table
            .rows()
            .data()
            .toArray();
        var reservation = reservations.find(function (r) {
            return r.id === id
        })

        var modal = $('#modal-additionalProperty');
        var title = 'Reservation `' + reservation.id + '` Additional Property';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(reservation.additionalProperty, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
    /**
     * 予約価格仕様を表示する
     */
    function showPrice(id) {
        var reservations = table
            .rows()
            .data()
            .toArray();
        var reservation = reservations.find(function (r) {
            return r.id === id
        })

        var modal = $('#modal-price');
        var title = 'Reservation `' + reservation.id + '` Price';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(reservation.price, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});