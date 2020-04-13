$(function () {
    var table = $("#authorizations-table").DataTable({
        processing: true,
        serverSide: true,
        pagingType: 'simple',
        language: {
            info: 'Showing page _PAGE_',
            infoFiltered: ''
        },
        // paging: false,
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
        order: [[1, 'asc']], // デフォルトは枝番号昇順
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    return '<a href="javascript:void(0)" class="showQRCode" data-id="' + data.id + '">表示</a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var url = '/projects/' + PROJECT_ID + '/authorizations/' + data.id;

                    return '<span class="badge badge-light">' + data.typeOf + '</span>'
                        + '<br><a target="_blank" href="' + url + '"><span class="">' + data.code + '</span></a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return moment(data.validFrom).utc().format();

                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return moment(data.validUntil).utc().format();
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<a target="_blank" href="/projects/' + PROJECT_ID + '/ownershipInfos?ids=' + data.object.id + '"><span class="badge badge-light">' + data.object.typeOf + '</span></a>';

                    var objectType = 'undefined';
                    if (data.object.typeOfGood !== undefined) {
                        objectType = data.object.typeOfGood.typeOf;
                        // html += '<br><span class="badge badge-success">' + data.object.typeOfGood.typeOf + '</span>'
                        //     + ' <a href="javascript:void(0)" class="showObject" data-id="' + data.id + '">' + data.object.typeOfGood.id + '</a>';
                    }

                    html += '<br><a href="javascript:void(0)" class="showObject" data-id="' + data.id + '">' + objectType + '</a>';

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#validRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    })

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });

    $(document).on('click', '.showObject', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showObject(id);
    });

    $(document).on('click', '.showQRCode', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showQRCode(id);
    });

    /**
     * 認可対象を詳しく表示する
     */
    function showObject(id) {
        var authorizations = table
            .rows()
            .data()
            .toArray();
        var authorization = authorizations.find(function (a) {
            return a.id === id
        })

        var modal = $('#modal-authorization-object');
        var title = 'Authorization `' + authorization.id + '` Object';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(authorization.object, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    /**
     * QRコードを表示する
     */
    function showQRCode(id) {
        var authorizations = table
            .rows()
            .data()
            .toArray();
        var authorization = authorizations.find(function (a) {
            return a.id === id
        })

        QRCode.toDataURL(authorization.code, function (err, url) {
            console.log('qr generated', url)

            var modal = $('#modal-authorization-qrcode');
            var title = 'QR ' + authorization.id;
            var img = $('<img />').attr('src', url).addClass('rounded mx-auto d-block');
            modal.find('.modal-title').html(title);
            modal.find('.modal-body').html(img);
            modal.modal();
        });
    }
});