var table;

$(function () {
    table = $("#products-table").DataTable({
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
        order: [[0, 'asc']],
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    return '<a href="javascript:void(0)" class="showServiceOutput" data-id="' + data.id + '">' + data.typeOf + '</a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';
                    if (data.name !== undefined && typeof data.name.ja === 'string') {
                        html += data.name.ja;
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';
                    if (data.hasOfferCatalog !== undefined && typeof data.hasOfferCatalog.id === 'string') {
                        html += data.hasOfferCatalog.id;
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''
                    return html;
                }
            }
        ]
    });

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });

    $(document).on('click', '.showServiceOutput', function () {
        showServiceOutput($(this).data('id'));
    });
});

function showServiceOutput(id) {
    var outputs = table
        .rows()
        .data()
        .toArray();
    var output = outputs.find(function (s) {
        return s.id === id
    })

    var modal = $('#modal-serviceOutput');
    var title = 'serviceOutput `' + output.id + '`';
    var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
        + JSON.stringify(output, null, '\t')
        + '</textarea>';
    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}
