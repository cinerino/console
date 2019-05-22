$(function () {
    var table = $("#authorizations-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/authorizations?' + $('form').serialize(),
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
                    return '<ul class="list-unstyled">'
                        + '<li><a href="#">' + data.code + '</a></li>'
                        + '<li>' + data.validFrom + '</li>'
                        + '<li>' + data.validUntil + '</li>'
                        + '</ul>';

                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary">' + data.project.typeOf + '</span></li>'
                        + '<li>' + data.project.id + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-info">' + data.object.typeOf + '</span></li>'
                        + '<li><span class="badge badge-secondary">' + data.object.id + '</span></li>';

                    if (data.object.typeOfGood !== undefined) {
                        html += '<ul class="list-unstyled">'
                            + '<li><span class="badge badge-info">' + data.object.typeOfGood.typeOf + '</span></li>'
                            + '<li><span class="badge badge-secondary">' + data.object.typeOfGood.id + '</span></li>';
                    }

                    html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showObject" data-id="' + data.id + '">オブジェクトをより詳しく見る</a><li>';

                    html += '</ul>';

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#validRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })

    $(document).on('click', '.showObject', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showObject(id);
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

        var modal = $('#modal-customer-identifier');
        var title = 'Authorization `' + authorization.id + '` Object';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(authorization.object, null, '\t');
        + '</textarea>'
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});