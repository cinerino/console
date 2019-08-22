var authorization = JSON.parse($('#jsonViewer textarea').val());

$(function () {
});

$(function () {
    $('button.delete').click(function () {
        if (window.confirm('元には戻せません。本当に削除しますか？')) {
            $.ajax({
                url: '/projects/' + PROJECT_ID + '/authorizations/' + authorization.id,
                type: 'DELETE'
            }).done(function () {
                alert('削除しました');
                location.href = '/projects/' + PROJECT_ID + '/authorizations';
            }).fail(function () {
                alert('削除できませんでした');
            }).always(function () {
            });
        } else {
        }
    });
});