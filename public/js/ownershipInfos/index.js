var table;

$(function () {
    table = $("#ownershipInfos-table").DataTable({
        processing: true,
        serverSide: true,
        pagingType: 'simple',
        language: {
            info: 'Showing page _PAGE_',
            infoFiltered: ''
        },
        // paging: false,
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
                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.typeOf + '/' + data.id;

                    return '<span class="badge badge-light">' + data.typeOf + '</span>'
                        + '<br><a target="_blank" href="' + url + '">' + data.id + '</a>';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return moment(data.ownedFrom).utc().format();
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return moment(data.ownedThrough).utc().format();
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var userPoolId = '';
                    var tokenIssuer = '';
                    var clientId = '';
                    if (Array.isArray(data.ownedBy.identifier)) {
                        var tokenIssuerIdentifier = data.ownedBy.identifier.find((i) => i.name === 'tokenIssuer');
                        var clienIdIdentifier = data.ownedBy.identifier.find((i) => i.name === 'clientId');
                        if (tokenIssuerIdentifier !== undefined) {
                            tokenIssuer = tokenIssuerIdentifier.value;
                            userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                        }
                        if (clienIdIdentifier !== undefined) {
                            clientId = clienIdIdentifier.value;
                        }
                    }

                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.ownedBy.typeOf + '/' + data.ownedBy.id + '?userPoolId=' + userPoolId;

                    var html = '';

                    html += '<a target="_blank" href="' + url + '"><span class="badge badge-light">' + data.ownedBy.typeOf + '</span></a>'
                        + ' <span class="badge badge-light">' + ((data.ownedBy.memberOf !== undefined) ? data.ownedBy.memberOf.membershipNumber : '') + '</span>'
                        + ' <a target="_blank" href="/projects/' + PROJECT_ID + '/applications/' + clientId + '"><span class="badge badge-light">Application</span></a>'
                        + '<br><a href="javascript:void(0)" class="showOwnedBy" data-id="' + data.id + '">' + data.ownedBy.name + '</a>';

                    if (Array.isArray(data.ownedBy.identifier)) {
                        // data.customer.identifier.slice(0, 2).forEach(function (i) {
                        //     html += '<li>' + '<span class="badge badge-secondary">' + i.name + '</span> ' + i.value.toString() + '</li>';
                        // });

                        // html += '<li><a href="javascript:void(0)" class="btn btn-outline-primary btn-sm showCustomerIdentifier" data-orderNumber="' + data.orderNumber + '">識別子をより詳しく見る</a><li>';
                    }

                    html += '';

                    return html;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    var resourceId = data.typeOfGood.id;
                    if (data.typeOfGood.typeOf === 'Account') {
                        resourceId = data.typeOfGood.accountNumber;
                    }
                    var url = '/projects/' + PROJECT_ID + '/resources/' + data.typeOfGood.typeOf + '/' + resourceId + '?accountType=' + data.typeOfGood.accountType;

                    var html = ''
                        + '<a target="_blank" href="' + url + '"><span class="badge badge-light">' + data.typeOfGood.typeOf + '</span></a>';

                    html += '<br><a href="javascript:void(0)" class="showTypeOfGood" data-id="' + data.id + '">' + resourceId + '</a>'
                        + '';

                    return html;
                }
            }
        ]
    });

    // Date range picker
    $('#ownedRange').daterangepicker({
        timePicker: true,
        // timePickerIncrement: 30,
        locale: {
            format: 'YYYY-MM-DDTHH:mm:ssZ'
        }
    });

    $(document).on('click', '.btn.search,a.search', function () {
        $('form.search').submit();
    });

    $(document).on('click', '.showTypeOfGood', function () {
        var id = $(this).data('id');
        console.log('showing... id:', id);

        showTypeOfGood(id);
    });

    $(document).on('click', '.showOwnedBy', function () {
        var id = $(this).data('id');

        showOwnedBy(id);
    });
});

function showTypeOfGood(id) {
    var ownershipInfos = table
        .rows()
        .data()
        .toArray();
    var ownershipInfo = ownershipInfos.find(function (o) {
        return o.id === id
    })

    var modal = $('#modal-ownershipInfo');
    var title = 'OwnershipInfo `' + ownershipInfo.id + '`';
    var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
        + JSON.stringify(ownershipInfo.typeOfGood, null, '\t')
        + '</textarea>';
    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}

function showOwnedBy(id) {
    var ownershipInfos = table
        .rows()
        .data()
        .toArray();
    var ownershipInfo = ownershipInfos.find(function (o) {
        return o.id === id
    })

    var modal = $('#modal-ownershipInfo');
    var title = 'OwnershipInfo `' + ownershipInfo.id + '`';
    var body = '<textarea rows="25" class="form-control" placeholder="" disabled="">'
        + JSON.stringify(ownershipInfo.ownedBy, null, '\t')
        + '</textarea>';
    modal.find('.modal-title').html(title);
    modal.find('.modal-body').html(body);
    modal.modal();
}