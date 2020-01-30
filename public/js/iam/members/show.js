var member = JSON.parse($('#jsonViewer textarea.person').val());
var orders = [];
var reservations = [];
var programMemberships = [];
var searchedAllOrders = false;
var searchedAllReservations = false;
var searchedAllProgramMemberships = false;
var limit = 10;
var lineChart;
var now = new Date();

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
        var validValue = (String($(this).val()) === String($(this).data('expected')));
        if (validValue) {
            updateProfileButton.prop('disabled', false);
            updateProfileButton.removeClass('disabled');
        } else {
            updateProfileButton.prop('disabled', true);
            updateProfileButton.addClass('disabled');
        }
    });
    updateProfileButton.click(function () {
        $.ajax({
            url: '/projects/' + PROJECT_ID + '/iam/members/' + member.member.id + '/profile',
            type: 'PUT',
            data: $('#profile form').serialize(),
        }).done(function () {
            alert('プロフィールを更新しました');
            location.href = '/projects/' + PROJECT_ID + '/iam/members/' + member.member.id;
        }).fail(function () {
            alert('更新できませんでした');
        }).always(function () {
        });
    });

    // ロール更新
    var updateButton = $('button.update');
    $('#modal-update').on('shown.bs.modal', function () {
        $('#confirmUpdate').val('');
        updateButton.prop('disabled', true);
        updateButton.addClass('disabled');
    });
    $('#confirmUpdate').keyup(function () {
        var validValue = (String($(this).val()) === String($(this).data('expected')));
        if (validValue) {
            updateButton.prop('disabled', false);
            updateButton.removeClass('disabled');
        } else {
            updateButton.prop('disabled', true);
            updateButton.addClass('disabled');
        }
    });
    updateButton.click(function () {
        $.ajax({
            url: '/projects/' + PROJECT_ID + '/iam/members/' + member.member.id,
            type: 'PUT',
            data: $('#settings form').serialize(),
        }).done(function () {
            alert('ロールを更新しました');
            location.href = '/projects/' + PROJECT_ID + '/iam/members/' + member.member.id;
        }).fail(function () {
            alert('更新できませんでした');
        }).always(function () {
        });
    });
});

function searchOrders(page, cb) {
    // page += 1;
    $.getJSON(
        '/projects/' + PROJECT_ID + '/iam/members/' + member.member.id + '/orders',
        {
            limit: limit, page: page,
            orderDateFrom: moment(now)
                .add(-1, 'month')
                .toISOString(),
            orderDateThrough: moment(now)
                .toISOString(),
        }
    ).done(function (data) {
        searchedAllOrders = (data.data.length < limit);
        $.each(data.data, function (key, order) {
            orders.push(order);

            var numDisplayItems = 4;

            $('<tr>').html(
                '<td>' + '<a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + order.orderNumber + '">' + order.orderNumber + '</a>' + '</td>'
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
            // 件数表示
            $('#orderCount').html(orders.length.toString());
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
                url: '/projects/' + PROJECT_ID + '/iam/members/' + member.member.id,
                type: 'DELETE'
            }).done(function () {
                alert('削除しました');
                location.href = '/projects/' + PROJECT_ID + '/iam/members';
            }).fail(function () {
                alert('削除できませんでした');
            }).always(function () {
            });
        } else {
        }
    });
});