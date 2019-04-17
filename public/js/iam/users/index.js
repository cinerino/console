$(function () {
    $("#people-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/iam/users?' + $('form').serialize(),
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
                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-info">' + data.typeOf + '</span></li>'
                        + '<li><a target="_blank" href="/iam/users/' + data.id + '">' + data.id + '</a></li>';
                    if (data.memberOf !== undefined) {
                        html += '<li><span class="badge badge-warning">' + ((data.memberOf.membershipNumber !== undefined) ? data.memberOf.membershipNumber : '') + '</span></li>';
                    }

                    html += '<li>' + data.familyName + ' ' + data.givenName + '</li>'
                        + '<li>' + data.email + '</li>'
                        + '<li>' + data.telephone + '</li>'

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (Array.isArray(data.additionalProperty)) {
                        data.additionalProperty.forEach(function (p) {
                            html += '<li>' + '<span class="badge badge-secondary">' + p.name + '</span> ' + p.value.toString() + '</li>';
                        });
                    }

                    html += '</ul>';

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#orderDateRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })
});