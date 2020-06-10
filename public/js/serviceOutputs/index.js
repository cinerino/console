var table;

$(function () {
    table = $("#paymentMethods-table").DataTable({
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
                    if (data.issuedThrough !== undefined) {
                        html += data.issuedThrough.typeOf
                            + '<br>' + data.issuedThrough.id;
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';
                    if (typeof data.identifier === 'string') {
                        html += data.identifier;
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';
                    if (typeof data.name === 'string') {
                        html += data.name;
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';
                    if (typeof data.accessCode === 'string') {
                        html += data.accessCode;
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (typeof data.dateIssued === 'string') {
                        html += moment(data.dateIssued).utc().format();
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (typeof data.validFor === 'string') {
                        html += moment.duration(data.validFor)
                            .humanize();
                    }

                    return html;
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

                    if (typeof data.validUntil === 'string') {
                        html += moment(data.validUntil).utc().format();
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (data.amount !== undefined && data.amount !== null) {
                        html += String(data.amount.typeOf);
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (data.depositAmount !== undefined && data.depositAmount !== null) {
                        html += String(data.depositAmount.typeOf);
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''

                    if (data.paymentAmount !== undefined && data.paymentAmount !== null) {
                        html += String(data.paymentAmount.typeOf);
                    }

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
