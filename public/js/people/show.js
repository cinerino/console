var person = JSON.parse($('#jsonViewer textarea.person').val());
var orders = [];
var reservations = [];
var programMemberships = [];
var searchedAllOrders = false;
var searchedAllReservations = false;
var searchedAllProgramMemberships = false;
var limit = 10;
var lineChart;

$(function () {
    // 注文検索
    console.log('searching orders...');
    searchOrders(1, function () {
    });

    // 予約検索
    console.log('searching reservations...');
    searchReservations(1, function () {
    });

    // 会員プログラム検索
    console.log('searching programMemberships...');
    searchProgramMemberships(1, function () {
    });
});

function searchOrders(page, cb) {
    // page += 1;
    $.getJSON(
        '/people/' + person.id + '/orders',
        { limit: limit, page: page }
    ).done(function (data) {
        $('#orderCount').html(data.totalCount.toString());
        searchedAllOrders = (data.data.length < limit);
        $.each(data.data, function (key, order) {
            orders.push(order);
            $('<tr>').html(
                '<td>' + '<a target="_blank" href="/orders/' + order.orderNumber + '">' + order.orderNumber + '</a>' + '</td>'
                + '<td>' + moment(order.orderDate).format('lllZ') + '</td>'
                + '<td>' + order.acceptedOffers.map(function (o) {
                    if (o.itemOffered.reservedTicket !== undefined) {
                        return o.itemOffered.reservedTicket.ticketedSeat.seatNumber
                    }
                    return o.itemOffered.typeOf;
                }).join('<br>') + '</td>'
                + '<td>' + order.paymentMethods.map(function (paymentMethod) {
                    return '<span class="badge badge-secondary ' + paymentMethod.typeOf + '">' + paymentMethod.typeOf + '</span>';
                }).join('&nbsp;') + '</td>'
                + '<td>' + '<span class="badge badge-secondary  ' + order.orderStatus + '">' + order.orderStatus + '</span>' + '</td>'
            ).appendTo("#orders tbody");
        });
        if (!searchedAllOrders) {
            searchOrders(page + 1, cb);
        } else {
            cb();
        }
    }).fail(function () {
        console.error('注文履歴を取得できませんでした')
    });
}

function searchReservations(page, cb) {
    // page += 1;
    $.getJSON(
        '/people/' + person.id + '/reservations',
        { limit: limit, page: page }
    ).done(function (data) {
        // $('#orderCount').html(data.totalCount.toString());
        searchedAllReservations = (data.data.length < limit);
        $.each(data.data, function (key, ownershipInfo) {
            var reservation = ownershipInfo.typeOfGood;
            reservations.push(reservation);

            var html = '<td>' + '<a href="#">' + reservation.reservationNumber + '</a>' + '</td>'
                + '<td>' + moment(reservation.modifiedTime).format('lllZ') + '</td>';
            if (reservation.reservationFor !== undefined) {
                html += '<td>' + '<a target="_blank" href="/events/' + reservation.reservationFor.typeOf + '/' + reservation.reservationFor.id + '">' + reservation.reservationFor.name.ja + '</a>' + '</td>';
            } else {
                html += '<td></td>';
            }
            html += '<td>' + '<span class="badge badge-secondary  ' + reservation.reservationStatus + '">' + reservation.reservationStatus + '</span>' + '</td>';
            $('<tr>').html(html).appendTo("#reservations tbody");
        });
        if (!searchedAllReservations) {
            searchReservations(page + 1, cb);
        } else {
            cb();
        }
    }).fail(function () {
        console.error('予約を検索できませんでした')
    });
}

function searchProgramMemberships(page, cb) {
    // page += 1;
    $.getJSON(
        '/people/' + person.id + '/programMemberships',
        { limit: limit, page: page }
    ).done(function (data) {
        // $('#orderCount').html(data.totalCount.toString());
        searchedAllProgramMemberships = (data.data.length < limit);
        $.each(data.data, function (key, ownershipInfo) {
            var programMembership = ownershipInfo.typeOfGood;
            programMemberships.push(programMembership);

            var html = '<td>' + '<a href="#">' + programMembership.id + '</a>' + '</td>'
                + '<td>' + programMembership.programName + '</td>'
                + '<td>' + moment(ownershipInfo.ownedFrom).format('lllZ') + '</td>'
                + '<td>' + moment(ownershipInfo.ownedThrough).format('lllZ') + '</td>';
            $('<tr>').html(html).appendTo("#programMemberships tbody");
        });
        if (!searchedAllProgramMemberships) {
            searchProgramMemberships(page + 1, cb);
        } else {
            cb();
        }
    }).fail(function () {
        console.error('会員プログラムを検索できませんでした')
    });
}
