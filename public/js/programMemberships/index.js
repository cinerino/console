$(function () {
    var table = $("#programMemberships-table").DataTable({
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
                    var projectId = (data.project !== undefined && data.project !== null) ? data.project.id : 'undefined';

                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-light">' + projectId + '</span></li>'
                        + '<li><a href="/projects/' + PROJECT_ID + '/programMemberships/' + data.id + '">' + data.id + '</a></li>'
                        + '<li><span class="badge badge-info ' + data.typeOf + '">' + data.typeOf + '</span></li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';
                    html += '<li>' + data.programName + '</li>';
                    html += '</ul>';

                    return html;
                }
            }
        ]
    });
});