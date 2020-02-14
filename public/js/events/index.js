
$(function () {
    var table = $("#events-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '?' + $('form').serialize(),
            data: function (d) {
                d.limit = d.length;
                d.page = (d.start / d.length) + 1;
                // d.name = d.search.value;
                d.format = 'datatable';
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(jqXHR, textStatus, errorThrown);
                var message = '予期せぬ原因で検索に失敗しました';
                if (jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined) {
                    var errors = jqXHR.responseJSON.error.errors;
                    if (Array.isArray(errors)) {
                        message = errors[0].name + '\n\n' + errors[0].message;
                    }
                }
                alert(message);
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

                    var thumbnailImageUrl = (data.workPerformed.thumbnailUrl !== undefined)
                        ? data.workPerformed.thumbnailUrl
                        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz';

                    var alternativeHeadline = data.superEvent.alternativeHeadline;
                    if (typeof data.superEvent.alternativeHeadline === 'object') {
                        alternativeHeadline = data.superEvent.alternativeHeadline.ja;
                    }

                    return '<ul class="products-list">'
                        + '<li><span class="badge badge-light">' + projectId + '</span></li>'
                        + '<li class="item">'
                        + '<div class="product-img">'
                        + '<img src="' + thumbnailImageUrl + '" alt="Product Image" class="img-size-50">'
                        + '</div>'
                        + '<div class="product-info">'
                        + '<span class="badge badge-secondary ' + data.typeOf + '">' + data.typeOf + '</span>'
                        + '<br>'
                        + '<span class="badge badge-secondary ' + data.eventStatus + '">' + data.eventStatus + '</span>'
                        + '<br>'
                        + '<a target="_blank" href="/projects/' + PROJECT_ID + '/events/' + data.id + '">'
                        + data.name.ja
                        // + '<span class="badge badge-warning float-right">' + data.maximumAttendeeCapacity + ' seats</span>'
                        + '</a>'
                        + '<span class="product-description">' + alternativeHeadline + '</span>'
                        + data.startDate + ' - ' + data.endDate + '<br>'
                        // + '<i class="fa fa-user"></i> ' + data.maximumAttendeeCapacity + ' maximum'
                        // + '<br>'
                        + '<i class="fa fa-user"></i> ' + data.remainingAttendeeCapacity + '/' + data.maximumAttendeeCapacity + ' remaining'
                        + '<br>'
                        + '</div>'
                        + '</li>'
                        + '</ul>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li>' + '<span class="badge badge-secondary ' + data.location.typeOf + '">' + data.location.typeOf + '</span></li>'
                        + '<li>' + data.location.branchCode + '</li>'
                        + '<li>' + data.location.name.ja + '</li>';


                    html += '<li>';
                    html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showLocation" data-id="' + data.id + '">詳しく</a>';
                    html += '</li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li>' + '<span class="badge badge-secondary ' + data.superEvent.typeOf + '">' + data.superEvent.typeOf + '</span></li>'
                        + '<li>' + data.superEvent.id + '</li>'
                        + '<li>' + data.superEvent.name.ja + '</li>';

                    html += '<li>';
                    html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showSuperEvent" data-id="' + data.id + '">詳しく</a>';
                    html += '</li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var html = '<ul class="list-unstyled">'
                        + '<li>' + '<span class="badge badge-secondary ' + data.workPerformed.typeOf + '">' + data.workPerformed.typeOf + '</span></li>'
                        + '<li>' + data.workPerformed.id + '</li>'
                        + '<li>' + data.workPerformed.identifier + '</li>'
                        + '<li>' + data.workPerformed.name + '</li>'
                        + '<li>' + moment.duration(data.workPerformed.duration).asMinutes() + ' minutes</li>';

                    html += '<li>';
                    html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showWorkPerformed" data-id="' + data.id + '">詳しく</a>';
                    html += '</li>';

                    html += '</ul>';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    if (data.offers === undefined) {
                        data.offers = { name: {} };
                    }

                    var html = '<ul class="list-unstyled">'
                        + '<li><span class="badge badge-secondary">ID</span> ' + String(data.offers.id) + '</li>'
                        + '<li><span class="badge badge-secondary">NAME</span> ' + String(data.offers.name.ja) + '</li>'
                        + '<li><span class="badge badge-secondary">AVBL</span> ' + String(data.offers.availability) + '</li>'
                        + '<li><span class="badge badge-secondary">VALID</span> ' + String(data.offers.validFrom) + ' - ' + String(data.offers.validThrough) + '</li>'

                    html += '<li>';
                    html += ' <a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showOffers" data-id="' + data.id + '">詳しく</a>';
                    html += '</li>';

                    html += '</ul>';

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#reservation').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    })

    $(document).on('click', '.showLocation', function () {
        showDetails($(this).data('id'), 'location');
    });

    $(document).on('click', '.showSuperEvent', function () {
        showDetails($(this).data('id'), 'superEvent');
    });

    $(document).on('click', '.showWorkPerformed', function () {
        showDetails($(this).data('id'), 'workPerformed');
    });

    $(document).on('click', '.showOffers', function () {
        showDetails($(this).data('id'), 'offers');
    });

    function showDetails(id, propertyName) {
        var events = table
            .rows()
            .data()
            .toArray();
        var event = events.find(function (e) {
            return e.id === id
        })

        var modal = $('#modal-event');
        var title = 'Event `' + event.id + '` Location';
        var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
            + JSON.stringify(event[propertyName], null, '\t')
            + '</textarea>';
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal();
    }

    // イベント在庫仕入れ
    $('button.importScreeningEvents').click(function () {
        var selectedSellerNames = [];
        $('select[name="seller[ids][]"] option:selected').each(function () {
            selectedSellerNames.push($(this).text());
        });
        var message = '[販売者]\n' + selectedSellerNames.join('\n')
            + '\n\n[開催日]\n' + $('input[name="startRange"]').val()
            + '\n\nの販売イベントをインポートしようとしています。'
            + '\nよろしいですか？';
        if (window.confirm(message)) {
            $.ajax({
                url: '/projects/' + PROJECT_ID + '/events/import',
                type: 'POST',
                dataType: 'json',
                data: $('form').serialize()
            }).done(function (tasks) {
                console.log(tasks);

                if (Array.isArray(tasks)) {
                    var modal = $('#modal-sm');
                    var title = 'インポートを開始しました(' + tasks.length + 'つのタスクが作成されました' + ')';
                    var body = tasks.map(function (task) {
                        var href = '/projects/' + PROJECT_ID + '/tasks/' + task.id + '?name=' + task.name;
                        return task.id + ' <a target="_blank" href="' + href + '">タスクを確認</a>';
                    }).join('<br>');
                    ;
                    modal.find('.modal-title').html(title);
                    modal.find('.modal-body').html(body);
                    modal.modal();
                }

                // alert('インポートを開始しました');
            }).fail(function (xhr) {
                var res = $.parseJSON(xhr.responseText);
                alert(res.error.message);
            }).always(function () {
            });
        } else {
        }
    });

    // イベント管理
    $('button.updateEvents').click(function () {
        var url = $('input[name="chevreBackendEndpoint"]').val()
        window.open(url);
    });
});