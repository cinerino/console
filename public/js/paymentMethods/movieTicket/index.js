$(function () {
    $("#paymentMethods-table").DataTable({
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
                    return '<a target="_blank" href="/projects/' + PROJECT_ID + '/paymentMethods/movieTicket/' + data.identifier + '">' + data.identifier + '</a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.serviceType;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (typeof data.validThrough === 'string') {
                        html += moment(data.validThrough).utc().format() + ' まで';
                    }

                    html += '';

                    return html;
                }
            }
        ]
    });
});