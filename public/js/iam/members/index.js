$(function () {
    $("#members-table").DataTable({
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
                    var member = data.member;
                    var html = '<span class="badge badge-light">' + member.typeOf + '</span>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var member = data.member;
                    var html = '<a target="_blank" href="/projects/' + PROJECT_ID + '/iam/members/' + member.id + '">' + member.id + '</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var member = data.member;
                    var html = '';

                    html += member.name;

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var member = data.member;
                    var html = '';

                    html += member.username;

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var member = data.member;
                    var html = '';

                    if (Array.isArray(member.hasRole)) {
                        member.hasRole.forEach(function (role) {
                            html += ' <span class="badge badge-light">' + role.roleName + '</span>';
                        });
                    }

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
    });

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });
});