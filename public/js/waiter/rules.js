$(function () {
    $("#rules-table").DataTable({
        processing: true,
        serverSide: true,
        pagingType: 'simple',
        language: {
            info: 'Showing page _PAGE_',
            infoFiltered: ''
        },
        ajax: {
            url: '',
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
                    return data.scope;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.name;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.threshold + ' / ' + data.aggregationUnitInSeconds + ' seconds';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (Array.isArray(data.availableHoursSpecifications)) {
                        data.availableHoursSpecifications.forEach(function (specification) {
                            html += specification.startDate + ' - ' + specification.endDate
                        });
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (Array.isArray(data.unavailableHoursSpecifications)) {
                        data.unavailableHoursSpecifications.forEach(function (specification) {
                            html += specification.startDate + ' - ' + specification.endDate
                        });
                    }

                    return html;
                }
            }
        ]
    });
});