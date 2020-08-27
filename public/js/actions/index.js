$(function () {
    var table = $("#actions-table").DataTable({
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
                    var html = '<span class="badge badge-light">' + data.typeOf + '</span>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += '<a href="javascript:void(0)" class="showId" data-id="' + data.id + '">表示</a>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += moment(data.startDate).utc().format();

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';
                    if (typeof data.endDate === 'string') {
                        html += moment(data.endDate).utc().format();
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    html += '<span class="badge ' + data.actionStatus + '">' + String(data.actionStatus).replace('ActionStatus', '') + '</span>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.agent !== undefined && data.agent !== null && Object.keys(data.agent).length > 0) {
                        var userPoolId = '';
                        if (Array.isArray(data.agent.identifier)) {
                            var tokenIssuerIdentifier = data.agent.identifier.find((i) => i.name === 'tokenIssuer');
                            if (tokenIssuerIdentifier !== undefined) {
                                userPoolId = tokenIssuerIdentifier.value.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                            }
                        }
                        var url = '/projects/' + PROJECT_ID + '/resources/' + data.agent.typeOf + '/' + data.agent.id + '?userPoolId=' + userPoolId;

                        var agentName = (typeof data.agent.name === 'string') ? data.agent.name : data.agent.id;
                        if (typeof data.agent.name === 'object' && data.agent.name !== undefined) {
                            agentName = data.agent.name.ja;
                        }

                        if (typeof agentName === 'string' && agentName.length > 8) {
                            agentName = agentName.slice(0, 8) + '...';
                        }

                        html += '<a target="_blank" href="' + url + '"><span class="badge badge-light">' + data.agent.typeOf + '</span></a>'
                            + '<br><a href="javascript:void(0)" class="showAgent" data-id="' + data.id + '">' + agentName + '</a>';
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.recipient !== undefined && data.recipient !== null && Object.keys(data.recipient).length > 0) {
                        var userPoolId = '';
                        if (Array.isArray(data.recipient.identifier)) {
                            var tokenIssuerIdentifier = data.recipient.identifier.find((i) => i.name === 'tokenIssuer');
                            if (tokenIssuerIdentifier !== undefined) {
                                userPoolId = tokenIssuerIdentifier.value.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                            }
                        }
                        var url = '/projects/' + PROJECT_ID + '/resources/' + data.recipient.typeOf + '/' + data.recipient.id + '?userPoolId=' + userPoolId;

                        var recipientName = (typeof data.recipient.name === 'string') ? data.recipient.name : data.recipient.id;
                        if (typeof data.recipient.name === 'object' && data.recipient.name !== undefined && typeof data.recipient.name.ja === 'string') {
                            recipientName = data.recipient.name.ja;
                        }

                        if (typeof recipientName === 'string' && recipientName.length > 8) {
                            recipientName = recipientName.slice(0, 8) + '...';
                        }

                        html += '<a target="_blank" href="' + url + '"><span class="badge badge-light">' + data.recipient.typeOf + '</span></a>'
                            + '<br><a href="javascript:void(0)" class="showRecipient" data-id="' + data.id + '">' + recipientName + '</a>';
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.object !== undefined && data.object !== null) {
                        if (Array.isArray(data.object)) {
                            data.object.forEach(function (o) {
                                html += '<span class="badge badge-light">' + o.typeOf + '</span>';
                            });
                        } else {
                            var userPoolId = '';
                            if (Array.isArray(data.object.identifier)) {
                                var tokenIssuerIdentifier = data.object.identifier.find((i) => i.name === 'tokenIssuer');
                                if (tokenIssuerIdentifier !== undefined) {
                                    userPoolId = tokenIssuerIdentifier.value.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                                }
                            }
                            var objectId = data.object.id;
                            if (data.object.typeOf === 'Order') {
                                objectId = data.object.orderNumber;
                            }
                            var url = '/projects/' + PROJECT_ID + '/resources/' + data.object.typeOf + '/' + objectId + '?userPoolId=' + userPoolId;

                            html += '<a target="_blank" href="' + url + '"><span class="badge badge-light">' + data.object.typeOf + '</span></a>';
                        }

                        html += '<br><a href="javascript:void(0)" class="showObject" data-id="' + data.id + '">表示</a>';
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.purpose !== undefined && data.purpose !== null) {
                        var purposeId = data.purpose.id;
                        if (data.purpose.typeOf === 'Order') {
                            purposeId = data.purpose.orderNumber;
                        }
                        var url = '/projects/' + PROJECT_ID + '/resources/' + data.purpose.typeOf + '/' + purposeId;

                        html += '<a target="_blank" href="' + url + '"><span class="badge badge-light">' + data.purpose.typeOf + '</span></a>'
                            + '<br><a href="javascript:void(0)" class="showPurpose" data-id="' + data.id + '">表示</a>';
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.instrument !== undefined && data.instrument !== null) {
                        html += '<span class="badge badge-light">' + data.instrument.typeOf + '</span>'
                            + '<br><a href="javascript:void(0)" class="showInstrument" data-id="' + data.id + '">表示</a>';
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.amount !== undefined && data.amount !== null) {
                        if (typeof data.amount === 'number') {
                            html += data.amount;
                        } else {
                            html += data.amount.value + ' ' + data.amount.currency;
                        }
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.fromLocation !== undefined && data.fromLocation !== null) {
                        html += '<span class="badge badge-light ' + data.fromLocation.typeOf + '">' + data.fromLocation.typeOf + '</span>'
                            + '<br><span class="font-weight-light font-italic">' + data.fromLocation.name + '</span>';

                        if (data.fromLocation.typeOf === 'Account') {
                            var url = '/projects/' + PROJECT_ID + '/accounts/' + data.fromLocation.accountType + '/' + data.fromLocation.accountNumber;
                            html += '<br><span class="badge badge-pill badge-dark">' + data.fromLocation.accountType + '</span>'
                                + '<br><a target="_blank" href="' + url + '"><span class="">' + data.fromLocation.accountNumber + '</span></a>';
                        }
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.toLocation !== undefined && data.toLocation !== null) {
                        html += '<span class="badge badge-light ' + data.toLocation.typeOf + '">' + data.toLocation.typeOf + '</span>'
                            + '<br><span class="font-weight-light font-italic">' + data.toLocation.name + '</span>';

                        if (data.toLocation.typeOf === 'Account') {
                            var url = '/projects/' + PROJECT_ID + '/accounts/' + data.toLocation.accountType + '/' + data.toLocation.accountNumber;
                            html += '<br><span class="badge badge-pill badge-dark">' + data.toLocation.accountType + '</span>'
                                + '<br><a target="_blank" href="' + url + '"><span class="">' + data.toLocation.accountNumber + '</span></a>';
                        }
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.result !== undefined && data.result !== null && Object.keys(data.result).length > 0) {
                        html += '<span class="badge badge-light">' + data.result.typeOf + '</span>';
                        html += '<br><a href="javascript:void(0)" class="showResult" data-id="' + data.id + '">表示</a>';
                    } else {
                    }

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '';

                    if (data.error !== undefined && data.error !== null && Object.keys(data.error).length > 0) {
                        html += '<span class="badge badge-light">' + data.error.name + '</span></li>';
                        if (typeof data.error.message === 'string') {
                            html += data.error.message.slice(0, 10) + '...';
                        }
                        html += '<a href="javascript:void(0)" class="showError" data-id="' + data.id + '">表示</a>';
                    } else {
                    }

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#startRange').daterangepicker({
        autoUpdateInput: false,
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    })
        .on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DDTHH:mm:ssZ') + ' - ' + picker.endDate.format('YYYY-MM-DDTHH:mm:ssZ'));
        })
        .on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
        });

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });

    $(document).on('click', '.showId', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showId(id);
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

    $(document).on('click', '.showInstrument', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showInstrument(id);
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

    function showId(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` ID';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.id, null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

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

    function showInstrument(id) {
        var actions = table
            .rows()
            .data()
            .toArray();
        var action = actions.find(function (o) {
            return o.id === id
        })

        var modal = $('#modal-action');
        var title = 'Action `' + action.id + '` Instrument';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(action.instrument, null, '\t')
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