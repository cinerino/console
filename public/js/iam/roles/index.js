$(function () {
    $("#roles-table").DataTable({
        processing: true,
        serverSide: true,
        pagingType: 'simple',
        language: {
            info: 'Showing page _PAGE_',
            infoFiltered: ''
        },
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
        order: [[1, 'asc']],
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<span class="badge badge-light">' + data.typeOf + '</span>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += data.roleName;

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (Array.isArray(data.permissions)) {
                        html += '<span class="text-muted">' + data.permissions.length + ' permissions</span>'
                        html += '<br>';
                        data.permissions.forEach(function (p) {
                            html += '<span class="badge badge-pill badge-secondary mr-1">' + p + '</span>';
                        });
                    }

                    return html;
                }
            }
        ]
    });

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });
});