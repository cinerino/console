var seller = JSON.parse($('#jsonViewer textarea').val());
var orders = [];
var searchedAllOrders = false;
var limit = 10;
var page = 0;
var lineChart;
$(function () {
    // 注文検索
    console.log('searching orders...', page);
    searchOrders(function () {
    });
});
function searchOrders(cb) {
    page += 1;
    $.getJSON(
        '/projects/' + PROJECT_ID + '/sellers/' + seller.id + '/orders',
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
            searchOrders(cb);
        } else {
            cb();
        }
    }).fail(function () {
        console.error('注文履歴を取得できませんでした')
    });
}

$(function () {
    $('button.delete').click(function () {
        if (window.confirm('元には戻せません。本当に削除しますか？')) {
            $.ajax({
                url: '/projects/' + PROJECT_ID + '/sellers/' + seller.id,
                type: 'DELETE'
            }).done(function () {
                alert('削除しました');
                location.href = '/projects/' + PROJECT_ID + '/sellers';
            }).fail(function () {
                alert('削除できませんでした');
            }).always(function () {
            });
        } else {
        }
    });
});