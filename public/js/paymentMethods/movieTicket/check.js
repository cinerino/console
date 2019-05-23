$(function () {
    if ($('form input[name="identifier"]').val() !== '') {
        $('#paymentMethods-table').DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: '/projects/' + PROJECT_ID + '/paymentMethods/movieTicket/check',
                type: 'POST',
                data: function (d) {
                    // d.name = d.search.value;
                    d.format = 'datatable';
                    $('form').serializeArray().forEach(function (s) {
                        d[s.name] = s.value;
                    });
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
                            + '<li><a href="/projects/' + PROJECT_ID + '/paymentMethods/movieTicket/' + data.identifier + '">' + data.identifier + '</a></li>'
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
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var html = '<ul class="list-unstyled">'

                        if (data.validThrough !== undefined) {
                            html += '<li>- ' + data.validThrough + '</li>';
                        }

                        html += '</ul>';

                        return html;
                    }
                }
            ]
        });
    }
});