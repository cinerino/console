$(function () {
    $("#roles-table").DataTable({
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
        order: [[1, 'asc']],
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-info">' + data.typeOf + '</span></li>';

                    html += '<li>' + data.roleName + '</li>'

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (Array.isArray(data.permissions)) {
                        html += '<li>';
                        data.permissions.forEach(function (p) {
                            html += '<span class="badge badge-secondary mr-1">' + p + '</span>';
                        });
                        html += '</li>';
                    }

                    html += '</ul>';

                    return html;
                }
            }
        ]
    });
});