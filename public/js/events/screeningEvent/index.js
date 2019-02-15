
$(function () {
    $("#events-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/events/screeningEvent?' * $('form').serialize(),
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
                    var thumbnailImageUrl = (data.workPerformed.thumbnailUrl !== undefined)
                        ? data.workPerformed.thumbnailUrl
                        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz';

                    var alternativeHeadline = data.superEvent.alternativeHeadline;
                    if (typeof data.superEvent.alternativeHeadline === 'object') {
                        alternativeHeadline = data.superEvent.alternativeHeadline.ja;
                    }

                    return '<ul class="products-list">'
                        + '<li class="item">'
                        + '<div class="product-img">'
                        + '<img src="' + thumbnailImageUrl + '" alt="Product Image" class="img-size-50">'
                        + '</div>'
                        + '<div class="product-info">'
                        + '<a target="_blank" href="/events/screeningEvent/' + data.id + '">'
                        + data.name.ja
                        // + '<span class="badge badge-warning float-right">' + data.maximumAttendeeCapacity + ' seats</span>'
                        + '</a>'
                        + '<span class="product-description">' + alternativeHeadline + '</span>'
                        + '</div>'
                        + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<p>' + data.startDate + ' - ' + data.endDate + '</p>'
                        + '<p>'
                        + '<i class="fa fa-user"></i> ' + data.maximumAttendeeCapacity + ' maximum'
                        + '</p>'
                        + '<p>'
                        + '<i class="fa fa-user"></i> ' + data.remainingAttendeeCapacity + ' remaining'
                        + '</p>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.superEvent.location.name.ja + '</li>'
                        + '<li>' + data.location.name.ja + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.workPerformed.name + '</li>'
                        + '<li>' + moment.duration(data.workPerformed.duration).asMinutes() + ' minutes</li>'
                        + '</ul>';
                }
            }
        ]
    });

    // Date range picker
    $('#reservation').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })

    // イベント在庫仕入れ
    $('button.importScreeningEvents').click(function () {
        var selectedSellerNames = [];
        $('select[name="seller[ids][]"] option:selected').each(function () {
            selectedSellerNames.push($(this).text());
        });
        var message = '[販売者]\n' + selectedSellerNames.join('\n')
            + '\n\n[開催日]\n' + $('input[name="startRange"]').val()
            + '\n\nの販売イベントをインポートしようとしています。'
            + '\nよろしいですか？';
        if (window.confirm(message)) {
            $.ajax({
                url: '/events/screeningEvent/import',
                type: 'POST',
                dataType: 'json',
                data: $('form').serialize()
            }).done(function (tasks) {
                console.log(tasks);
                alert('インポートを開始しました');
            }).fail(function (xhr) {
                var res = $.parseJSON(xhr.responseText);
                alert(res.error.message);
            }).always(function () {
            });
        } else {
        }
    });

    // イベント管理
    $('button.updateEvents').click(function () {
        var url = $('input[name="chevreBackendEndpoint"]').val()
        window.open(url);
    });
});