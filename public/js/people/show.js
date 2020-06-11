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

    // メンバーシップ検索
    console.log('searching programMemberships...');
    searchProgramMemberships(1, function () {
    });

    // クレジットカード検索
    console.log('searching creditCards...');
    searchCreditCards(function () {
    });

    // 口座検索
    console.log('searching creditCards...');
    searchAccounts(function () {
    });

    // プロフィール更新
    var updateProfileButton = $('button.updateProfile');
    $('#modal-updateProfile').on('shown.bs.modal', function () {
        $('#confirmUpdateProfile').val('');
        updateProfileButton.prop('disabled', true);
        updateProfileButton.addClass('disabled');
    });
    $('#confirmUpdateProfile').keyup(function () {
        console.log('comparing...input:', $(this).val(), ' expected:', $(this).data('expected'));
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
        $('#settings form').submit();
    });

    // 削除
    var deleteButton = $('button.delete');
    $('#modal-confirmDelete').on('shown.bs.modal', function () {
        $('#confirmDelete').val('');
        deleteButton.prop('disabled', true);
        deleteButton.addClass('disabled');
    });
    $('#confirmDelete').keyup(function () {
        var validValue = ($(this).val() === $(this).data('expected'));
        if (validValue) {
            deleteButton.prop('disabled', false);
            deleteButton.removeClass('disabled');
        } else {
            deleteButton.prop('disabled', true);
            deleteButton.addClass('disabled');
        }
    });
    deleteButton.click(function () {
        var button = $(this);

        // クレジットカード所有確認
        searchCreditCards(function (creditCards) {
            // if (Array.isArray(creditCards) && creditCards.length > 0) {
            //     alert('会員を削除する前にクレジットカードを削除してください');

            //     return;
            // }

            button.addClass('disabled');

            $.ajax({
                url: '/projects/' + PROJECT_ID + '/people/' + person.id,
                type: 'DELETE',
                // dataType: 'json',
                data: $('form', $('#modal-confirmDelete')).serialize()
            }).done(function () {
                alert('削除しました');
                location.href = '/projects/' + PROJECT_ID + '/people';
            }).fail(function (xhr) {
                var res = $.parseJSON(xhr.responseText);
                alert('処理を開始できませんでした\n' + res.error.message);
            }).always(function () {
                button.removeClass('disabled');
            });
        });
    });

    $(document).on('click', 'a.deleteCreditCard', function () {
        var cardNo = $(this).data('cardno');
        var cardSeq = $(this).data('cardseq');
        console.log('deleting...', cardNo, cardSeq);

        if (window.confirm('元には戻せません。本当に ' + cardNo + ' を削除しますか？')) {
            $.ajax({
                url: '/projects/' + PROJECT_ID + '/people/' + person.id + '/creditCards/' + cardSeq,
                type: 'DELETE'
            }).done(function () {
                alert('削除しました');
                location.reload();
            }).fail(function () {
                alert('削除できませんでした');
            }).always(function () {
            });
        } else {
        }
    });

    $('.nav-link.creditCards')
        .popover({
            title: '',
            content: 'クレジットカード管理が可能です',
            placement: 'bottom',
            trigger: 'hover'
        });

    $('.nav-link.accounts')
        .popover({
            title: '',
            content: '口座管理',
            placement: 'bottom',
            trigger: 'hover'
        });

    $('.nav-link.settings')
        .popover({
            title: '設定',
            content: '会員の基本情報を編集することができます',
            placement: 'bottom',
            trigger: 'hover'
        });

    $('.nav-link.others')
        .popover({
            html: true,
            title: '<span class="badge badge-danger right">New</span>',
            content: '会員の削除が可能になりました',
            placement: 'bottom',
            trigger: 'hover'
        })
        .popover('show');
});

function searchOrders(page, cb) {
    // page += 1;
    $.getJSON(
        '/projects/' + PROJECT_ID + '/people/' + person.id + '/orders',
        { limit: limit, page: page }
    ).done(function (data) {
        searchedAllOrders = (data.data.length < limit);
        $.each(data.data, function (key, order) {
            orders.push(order);

            var numDisplayItems = 4;

            $('<tr>').html(
                '<td>' + '<a target="_blank" href="/projects/' + PROJECT_ID + '/orders/' + order.orderNumber + '">' + order.orderNumber + '</a>' + '</td>'
                + '<td>' + moment(order.orderDate).utc().format() + '</td>'
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
                    return '<span class="badge badge-light ' + paymentMethod.typeOf + '">' + paymentMethod.typeOf + '</span>';
                }).join('&nbsp;') + '</td>'
                + '<td>' + '<span class="badge badge-light ' + order.orderStatus + '">' + order.orderStatus + '</span>' + '</td>'
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

function searchReservations(page, cb) {
    // page += 1;
    $.getJSON(
        '/projects/' + PROJECT_ID + '/people/' + person.id + '/reservations',
        { limit: limit, page: page }
    ).done(function (data) {
        searchedAllReservations = (data.data.length < limit);
        $.each(data.data, function (key, ownershipInfo) {
            var reservation = ownershipInfo.typeOfGood;
            reservations.push(reservation);

            var bookingTimeStr = '';
            if (typeof reservation.bookingTime === 'string') {
                bookingTimeStr = moment(reservation.bookingTime).utc().format();
            }

            var html = '<td>' + '<a href="#">' + reservation.reservationNumber + '</a>' + '</td>'
                + '<td>' + bookingTimeStr + '</td>';
            if (reservation.reservationFor !== undefined) {
                html += '<td>' + '<a target="_blank" href="/projects/' + PROJECT_ID + '/events/' + reservation.reservationFor.typeOf + '/' + reservation.reservationFor.id + '">' + reservation.reservationFor.name.ja + '</a>' + '</td>';
            } else {
                html += '<td></td>';
            }
            html += '<td>' + '<span class="badge badge-light ' + reservation.reservationStatus + '">' + reservation.reservationStatus + '</span>' + '</td>';
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
        '/projects/' + PROJECT_ID + '/people/' + person.id + '/programMemberships',
        { limit: limit, page: page }
    ).done(function (data) {
        searchedAllProgramMemberships = (data.data.length < limit);
        $.each(data.data, function (key, ownershipInfo) {
            var programMembership = ownershipInfo.typeOfGood;
            programMemberships.push(programMembership);

            var nameStr = programMembership.name;
            if (typeof nameStr !== 'string' && nameStr !== undefined && nameStr !== null) {
                nameStr = nameStr.ja;
            }

            var membershipServiceId = programMembership.membershipFor.id;

            var html = '<td>' + programMembership.identifier + '</td>'
                + '<td>' + nameStr + '</td>'
                + '<td>' + '<a target="_blank" href="/projects/' + PROJECT_ID + '/programMemberships/' + membershipServiceId + '">' + membershipServiceId + '</a>' + '</td>'
                + '<td>' + moment(ownershipInfo.ownedFrom).utc().format() + '</td>'
                + '<td>' + moment(ownershipInfo.ownedThrough).utc().format() + '</td>';
            $('<tr>').html(html).appendTo("#programMemberships tbody");
        });
        if (!searchedAllProgramMemberships) {
            searchProgramMemberships(page + 1, cb);
        } else {
            cb();
        }
    }).fail(function () {
        console.error('メンバーシップを検索できませんでした')
    });
}

function searchCreditCards(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/people/' + person.id + '/creditCards'
    ).done(function (data) {
        $("#creditCards tbody").empty();
        $.each(data, function (key, creditCard) {
            var html = '<td>' + '<a href="#">' + creditCard.cardName + '</a>' + '</td>'
                + '<td>' + creditCard.holderName + '</td>'
                + '<td>' + creditCard.cardNo + '</td>'
                + '<td>' + creditCard.expire + '</td>'
                + '<td><a href="javascript:void(0)" class="text-muted deleteCreditCard" data-cardSeq="' + creditCard.cardSeq + '" data-cardNo="' + creditCard.cardNo + '"><i class="fas fa-trash-alt"></i></a></td>';
            $('<tr>').html(html).appendTo("#creditCards tbody");
        });

        cb(data);
    }).fail(function () {
        console.error('クレジットカードを検索できませんでした')
    });
}

function searchAccounts(cb) {
    $.getJSON(
        '/projects/' + PROJECT_ID + '/people/' + person.id + '/accounts'
    ).done(function (data) {
        $("#accounts tbody").empty();
        $.each(data, function (key, ownershipInfo) {
            var account = ownershipInfo.typeOfGood;

            var href = '/projects/' + PROJECT_ID + '/accounts/' + account.accountType + '/' + account.accountNumber;
            var html = '<td>'
                + '<span class="badge badge-secondary ' + account.accountType + '">'
                + account.accountType
                + '</span>'
                + '</td>'
                + '<td>'
                + '<a target="_blank" href="' + href + '">'
                + account.accountNumber
                + '</a>'
                + '</td>'
                + '<td>'
                + account.name
                + '</td>'
                + '<td>'
                + '<span class="badge badge-secondary ' + account.status + '">'
                + account.status
                + '</span>'
                + '</td>'
                + '<td>'
                + account.availableBalance
                + '</td>'
                + '<td></td>';
            // var html = '<td>' + '<a href="#">' + account.accountType + '</a>' + '</td>'
            //     + '<td>' + account.accountNumber + '</td>'
            //     + '<td>' + account.name + '</td>'
            //     + '<td>' + account.status + '</td>'
            //     + '<td></td>';
            $('<tr>').html(html).appendTo("#accounts tbody");
        });

        cb(data);
    }).fail(function () {
        console.error('口座を検索できませんでした')
    });
}
