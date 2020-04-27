var table;

$(function () {
    table = $("#programMemberships-table").DataTable({
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
                    return '<span class="badge badge-light ' + data.typeOf + '">' + data.typeOf + '</span>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<a href="/projects/' + PROJECT_ID + '/programMemberships/' + data.id + '">' + data.id + '</a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.name.ja;
                }
            }
        ]
    });

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });
});