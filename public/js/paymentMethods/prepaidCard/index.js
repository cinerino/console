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
                    return data.typeOf;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<a target="_blank" href="/projects/' + PROJECT_ID + '/paymentMethods/prepaidCard/' + data.identifier + '">' + data.identifier + '</a>';
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
                    return data.accessCode;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (typeof data.validFrom === 'string') {
                        html += moment(data.validFrom).utc().format();
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (typeof data.validThrough === 'string') {
                        html += moment(data.validThrough).utc().format();
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (data.amount !== undefined) {
                        html += String(data.amount.value)
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