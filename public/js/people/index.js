var table;

$(function () {
    table = $("#people-table").DataTable({
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
                    var html = '<span class="badge badge-light">' + data.typeOf + '</span>'
                        + '<br><a target="_blank" href="/projects/' + PROJECT_ID + '/people/' + data.id + '">' + data.id + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = ''
                    if (data.memberOf !== undefined) {
                        html += (data.memberOf.membershipNumber !== undefined) ? data.memberOf.membershipNumber : '';
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += data.email

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += data.telephone;

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += data.familyName;

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += data.givenName;

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (Array.isArray(data.additionalProperty)) {
                        html += '<a href="javascript:void(0)" class="showAdditionalProperty" data-id="' + data.id + '">' + '表示</a>';
                    }

                    html += '';

                    return html;
                }
            }
        ]
    });

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });

    // Date range picker
    $('#orderDateRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    })

    $(document).on('click', '.showAdditionalProperty', function () {
        showDetails($(this).data('id'), 'additionalProperty');
    });

});

function showDetails(id, propertyName) {
    var people = table
        .rows()
        .data()
        .toArray();
    var person = people.find(function (p) {
        return p.id === id
    })

    var modal = $('#modal-person');
    var title = 'Person `' + person.id + '`';
    var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
        + JSON.stringify(person[propertyName], null, '\t')
        + '</textarea>';
    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}
