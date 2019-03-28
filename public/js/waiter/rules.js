$(function () {
    $("#rules-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/waiter/rules',
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
                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-success">' + data.scope + '</span></li>'
                        + '<li>' + data.name + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.threshold + ' / ' + data.aggregationUnitInSeconds + ' seconds</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (Array.isArray(data.availableHoursSpecifications)) {
                        data.availableHoursSpecifications.forEach(function (specification) {
                            html += '<li>' + specification.startDate + ' - ' + specification.endDate + '</li>'
                        });
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (Array.isArray(data.unavailableHoursSpecifications)) {
                        data.unavailableHoursSpecifications.forEach(function (specification) {
                            html += '<li>' + specification.startDate + ' - ' + specification.endDate + '</li>'
                        });
                    }

                    html += '</ul>';

                    return html;
                }
            }
        ]
    });
});