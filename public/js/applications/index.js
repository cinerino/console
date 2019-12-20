$(function () {
    var table = $("#applications-table").DataTable({
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

                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-light">' + projectId + '</span></li>'
                        + '<li><a target="_blank" href="/projects/' + PROJECT_ID + '/applications/' + data.id + '">' + data.id + '</a></li>'
                        + '<li><span class="badge badge-info ' + data.typeOf + '">' + data.typeOf + '</span></li>'
                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li>' + data.name + '</li>'
                    html += '</ul>';

                    return html;
                }
            }
        ]
    });

    $(document).on('click', '.showAdditionalProperty', function () {
        var id = $(this).data('id');
        showAdditionalProperty(id);
    });

    function showAdditionalProperty(id) {
        var applications = table
            .rows()
            .data()
            .toArray();
        var application = applications.find(function (a) {
            return a.id === id
        })

        var modal = $('#modal-application');
        var title = 'Application `' + application.id + '` Additional Property';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(application.additionalProperty, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});