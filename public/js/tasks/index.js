$(function () {
    $("#tasks-table").DataTable({
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
                    return '<ul class="list-unstyled">'
                        + '<li>' + data.id + '</li>'
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
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return '<ul class="list-unstyled">'
                        + '<li><textarea class="form-control" placeholder="" disabled="" rows="8">' + JSON.stringify(data.executionResults, null, '\t') + '</textarea></li>'
                        + '</ul>';
                }
            }
        ]
    });

    // Date range picker
    $('#runsRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    })
});