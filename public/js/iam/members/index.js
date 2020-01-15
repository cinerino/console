$(function () {
    $("#members-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '?' + $('form').serialize(),
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
                    var member = data.member;
                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary">' + member.typeOf + '</span></li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var member = data.member;
                    var html = '<ul class="list-unstyled">'
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/iam/members/' + member.id + '">' + member.id + '</a></li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var member = data.member;
                    var html = '<ul class="list-unstyled">';

                    html += '<li>' + member.name + '</li>';
                    html += '<li>' + member.username + '</li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var member = data.member;
                    var html = '<ul class="list-unstyled">';

                    if (Array.isArray(member.hasRole)) {
                        member.hasRole.forEach(function (role) {
                            html += '<li>' + role.roleName + '</li>';
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
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    })
});