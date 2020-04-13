$(function () {
    var table = $("#tasks-table").DataTable({
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
        order: [[1, 'asc']], // デフォルトは枝番号昇順
        ordering: false,
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    var url = '/projects/' + PROJECT_ID + '/tasks/' + data.id + '?name=' + data.name;

                    return '<a target="_blank" href="' + url + '">' + data.id + '</a>';
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
                    return '<span class="badge ' + data.status + '">' + data.status + '</span>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.remainingNumberOfTries + '/' + data.numberOfTried;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.runsAt;

                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return data.lastTriedAt;

                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<textarea class="form-control" placeholder="" disabled="" rows="1">' + JSON.stringify(data.data, null, '\t') + '</textarea>'
                        + '<br><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showData" data-id="' + data.id + '">詳細</a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<textarea class="form-control" placeholder="" disabled="" rows="1">' + JSON.stringify(data.executionResults, null, '\t') + '</textarea>'
                        + '<br><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showExecutionResults" data-id="' + data.id + '">詳細</a>';
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