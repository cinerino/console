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
                        + '<li><span class="text-muted">' + data.agent.id + '</span></li>'
                        + '<li><span class="">' + data.agent.name + '</span></li>';
                    html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showAgent" data-id="' + data.id + '">詳細</a><li>';
                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.recipient !== undefined && data.recipient !== null && Object.keys(data.recipient).length > 0) {
                        html += '<li><span class="badge badge-secondary">' + data.recipient.typeOf + '</span></li>'
                            + '<li><span class="text-muted">' + data.recipient.id + '</span></li>'
                            + '<li><span class="">' + data.recipient.name + '</span></li>';
                    }

                    html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showRecipient" data-id="' + data.id + '">詳細</a><li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.object !== undefined && data.object !== null) {
                        if (Array.isArray(data.object)) {
                            data.object.forEach(function (o) {
                                html += '<li><span class="badge badge-secondary">' + o.typeOf + '</span></li>'
                                    + '<li><span class="text-muted">' + o.id + '</span></li>';
                            });
                        } else {
                            html += '<li><span class="badge badge-secondary">' + data.object.typeOf + '</span></li>'
                                + '<li><span class="text-muted">' + data.object.id + '</span></li>';
                        }
                        html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showObject" data-id="' + data.id + '">詳細</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.purpose !== undefined && data.purpose !== null) {
                        var purposeId = data.purpose.id;
                        var url = '';
                        if (data.purpose.typeOf === 'Order') {
                            purposeId = data.purpose.orderNumber;
                            url = '/projects/' + PROJECT_ID + '/orders/' + data.purpose.orderNumber;
                        } else {
                            url = '/projects/' + PROJECT_ID + '/transactions/' + data.purpose.typeOf + '/' + data.purpose.id;
                        }

                        html += '<li><span class="badge badge-secondary">' + data.purpose.typeOf + '</span></li>'
                            + '<li><a target="_blank" href="' + url + '"><span class="">' + purposeId + '</span></a></li>';
                        html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showPurpose" data-id="' + data.id + '">詳細</a><li>';
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (typeof data.amount === 'number') {
                        html += '<li>' + data.amount + '</li>'
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.fromLocation !== undefined && data.fromLocation !== null) {
                        html += '<li><span class="badge badge-secondary ' + data.fromLocation.typeOf + '">' + data.fromLocation.typeOf + '</span></li>'
                            + '<li><span class="font-weight-light font-italic">' + data.fromLocation.name + '</span></li>';

                        if (data.fromLocation.typeOf === 'Account') {
                            var url = '/projects/' + PROJECT_ID + '/accounts/' + data.fromLocation.accountType + '/' + data.fromLocation.accountNumber;
                            html += '<li><span class="badge badge-pill badge-dark">' + data.fromLocation.accountType + '</span></li>'
                                + '<li><a target="_blank" href="' + url + '"><span class="">' + data.fromLocation.accountNumber + '</span></a></li>';
                        }
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.toLocation !== undefined && data.toLocation !== null) {
                        html += '<li><span class="badge badge-secondary ' + data.toLocation.typeOf + '">' + data.toLocation.typeOf + '</span></li>'
                            + '<li><span class="font-weight-light font-italic">' + data.toLocation.name + '</span></li>';

                        if (data.toLocation.typeOf === 'Account') {
                            var url = '/projects/' + PROJECT_ID + '/accounts/' + data.toLocation.accountType + '/' + data.toLocation.accountNumber;
                            html += '<li><span class="badge badge-pill badge-dark">' + data.toLocation.accountType + '</span></li>'
                                + '<li><a target="_blank" href="' + url + '"><span class="">' + data.toLocation.accountNumber + '</span></a></li>';
                        }
                    }

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.result !== undefined && data.result !== null && Object.keys(data.result).length > 0) {
                        html += '<li><span class="badge badge-secondary">' + data.result.typeOf + '</span></li>'
                            + '<li><span class="text-muted">' + data.result.id + '</span></li>';
                    }

                    html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showResult" data-id="' + data.id + '">詳細</a><li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">';

                    if (data.error !== undefined && data.error !== null && Object.keys(data.error).length > 0) {
                        html += '<li><span class="badge badge-danger">' + data.error.name + '</span></li>'
                            + '<li>' + data.error.message + '</li>';
                    }

                    html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showError" data-id="' + data.id + '">詳細</a><li>';

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

    $(document).on('click', '.showRecipient', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showRecipient(id);
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

    function showRecipient(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` Recipient';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.recipient, null, '\t')
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