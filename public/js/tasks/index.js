$(function () {
    var table = $("#tasks-table").DataTable({
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
        order: [[1, 'asc']], // デフォルトは枝番号昇順
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var projectId = (data.project !== undefined && data.project !== null) ? data.project.id : 'undefined';
                    var url = '/projects/' + PROJECT_ID + '/tasks/' + data.id + '?name=' + data.name;

                    return '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-light">' + projectId + '</span></li>'
                        + '<li><a target="_blank" href="' + url + '">' + data.id + '</a></li>'
                        + '<li><span class="badge-secondary badge ' + data.name + '">' + data.name + '</span></li>'
                        + '<li><span class="badge ' + data.status + '">' + data.status + '</span></li>'
                        + '<li>' + data.remainingNumberOfTries + '/' + data.numberOfTried + '</li>'
                        + '<li>' + data.runsAt + '</li>'
                        + '<li>' + data.lastTriedAt + '</li>'
                        + '</ul>';

                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><textarea class="form-control" placeholder="" disabled="" rows="8">' + JSON.stringify(data.data, null, '\t') + '</textarea></li>'
                        + '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showData" data-id="' + data.id + '">詳細</a><li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><textarea class="form-control" placeholder="" disabled="" rows="8">' + JSON.stringify(data.executionResults, null, '\t') + '</textarea></li>'
                        + '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showExecutionResults" data-id="' + data.id + '">詳細</a><li>'
                        + '</ul>';
                }
            }
        ]
    });

    // Date range picker
    $('#runsRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    });

    $(document).on('click', '.showData', function () {
        showData($(this).data('id'));
    });

    $(document).on('click', '.showExecutionResults', function () {
        showExecutionResults($(this).data('id'));
    });

    function showData(id) {
        var tasks = table
            .rows()
            .data()
            .toArray();
        var task = tasks.find(function (task) {
            return task.id === id
        })

        var modal = $('#modal-detail');
        var title = 'Task `' + task.id + '` Data';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(task.data, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showExecutionResults(id) {
        var tasks = table
            .rows()
            .data()
            .toArray();
        var task = tasks.find(function (task) {
            return task.id === id
        })

        var modal = $('#modal-detail');
        var title = 'Task `' + task.id + '` Data';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(task.executionResults, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});