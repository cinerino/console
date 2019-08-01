$(function () {
    var table = $("#actions-table").DataTable({
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
                    var html = '<ul class="list-unstyled">';

                    html += '<li><span class="badge badge-secondary">' + data.typeOf + '</span></li>'
                        + '<li><span class="text-muted">' + data.id + '</span></li>'
                        + '<li>' + data.startDate + '</li>'
                        + '<li>' + data.endDate + '</li>';
                    html += '<li><span class="badge ' + data.actionStatus + '">' + data.actionStatus + '</span></li>';
                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    html += '<li><span class="badge badge-secondary">' + data.agent.typeOf + '</span></li>'
                        + '<li><span class="text-muted">' + data.agent.id + '</span></li>';
                    html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showAgent" data-id="' + data.id + '">詳しく見る</a><li>';
                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.object !== undefined) {
                        if (Array.isArray(data.object)) {
                            data.object.forEach(function (o) {
                                html += '<li><span class="badge badge-secondary">' + o.typeOf + '</span></li>'
                                    + '<li><span class="text-muted">' + o.id + '</span></li>';
                            });
                        } else {
                            html += '<li><span class="badge badge-secondary">' + data.object.typeOf + '</span></li>'
                                + '<li><span class="text-muted">' + data.object.id + '</span></li>';
                        }
                        html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showObject" data-id="' + data.id + '">詳しく見る</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.purpose !== undefined) {
                        html += '<li><span class="badge badge-secondary">' + data.purpose.typeOf + '</span></li>'
                            + '<li><span class="text-muted">' + data.purpose.id + '</span></li>';
                        html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showPurpose" data-id="' + data.id + '">詳しく見る</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.result !== undefined) {
                        html += '<li><span class="badge badge-secondary">' + data.result.typeOf + '</span></li>'
                            + '<li><span class="text-muted">' + data.result.id + '</span></li>';
                        html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showResult" data-id="' + data.id + '">詳しく見る</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.error !== undefined) {
                        html += '<li><span class="badge badge-secondary">' + data.error.typeOf + '</span></li>'
                            + '<li><span class="text-muted">' + data.reserrorult.id + '</span></li>';
                        html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showError" data-id="' + data.id + '">詳しく見る</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.endDate !== undefined) {
                        html += '<li>' + moment.duration(moment(data.endDate).diff(data.startDate)).asSeconds() + ' s</li>';
                    }
                    html += '</ul>';

                    return html;
                }
            },
        ]
    });

    // Date range picker
    $('#startRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        format: 'YYYY-MM-DDTHH:mm:ssZ'
    });

    $(document).on('click', '.showAgent', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showAgent(id);
    });

    $(document).on('click', '.showObject', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showObject(id);
    });

    $(document).on('click', '.showPurpose', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showPurpose(id);
    });

    $(document).on('click', '.showResult', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showResult(id);
    });

    $(document).on('click', '.showError', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showError(id);
    });

    function showAgent(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` Agent';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.agent, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showObject(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` Object';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.object, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showPurpose(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` Purpose';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.purpose, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showResult(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` Result';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.result, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    function showError(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` Error';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.error, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }
});