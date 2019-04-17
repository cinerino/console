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

    // プロフィール更新
    var updateProfileButton = $('button.updateProfile');
    $('#modal-updateProfile').on('shown.bs.modal', function () {
        $('#confirmUpdateProfile').val('');
        updateProfileButton.prop('disabled', true);
        updateProfileButton.addClass('disabled');
    });
    $('#confirmUpdateProfile').keyup(function () {
        var validValue = ($(this).val() === $(this).data('expected'));
        if (validValue) {
            updateProfileButton.prop('disabled', false);
            updateProfileButton.removeClass('disabled');
        } else {
            updateProfileButton.prop('disabled', true);
            updateProfileButton.addClass('disabled');
        }
    });
    updateProfileButton.click(function () {
        $('#settings form').submit();
    });
});

function searchOrders(page, cb) {
    // page += 1;
    $.getJSON(
        '/iam/users/' + person.id + '/orders',
        { limit: limit, page: page }
    ).done(function (data) {
        $('#orderCount').html(data.totalCount.toString());
        searchedAllOrders = (data.data.length < limit);
        $.each(data.data, function (key, order) {
            orders.push(order);

            var numDisplayItems = 4;

            $('<tr>').html(
                '<td>' + '<a target="_blank" href="/orders/' + order.orderNumber + '">' + order.orderNumber + '</a>' + '</td>'
                + '<td>' + moment(order.orderDate).format('lllZ') + '</td>'
                + '<td>'
                + order.acceptedOffers.slice(0, numDisplayItems).map(function (o) {
                    if (o.itemOffered.reservedTicket !== undefined && o.itemOffered.reservedTicket.ticketedSeat !== undefined) {
                        return o.itemOffered.reservedTicket.ticketedSeat.seatNumber
                    }
                    return o.itemOffered.typeOf;
                }).join('<br>')
                + order.acceptedOffers.slice(numDisplayItems, numDisplayItems + 1).map(() => '<br>...').join('')
                + '</td>'
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
