$(function () {
    $("#paymentMethods-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/paymentMethods/movieTicket?' + $('form').serialize(),
            data: function (d) {
                d.limit = d.length;
                d.page = (d.start / d.length) + 1;
                // d.name = d.search.value;
                d.format = 'datatable';
            }
        },
        searching: false,
        order: [[0, 'asc']],
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><a href="/paymentMethods/movieTicket/' + data.identifier + '">' + data.identifier + '</a></li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.serviceType + '</li>'
                        + '</ul>';
                }
            }
        ]
    });
});