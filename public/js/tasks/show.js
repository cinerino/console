var task = JSON.parse($('#jsonViewer textarea').val());

$(function () {
    $('button.retry').click(function () {
        if (window.confirm('本当にリトライしますか？')) {
            $.ajax({
                url: '/projects/' + PROJECT_ID + '/tasks/' + task.id + '/retry' + '?name=' + task.name,
                type: 'POST'
            }).done(function (data) {
                alert('タスクを作成しました。新しいタスクページへ移動します...');
                location.href = '/projects/' + PROJECT_ID + '/tasks/' + data.id + '?name=' + task.name;
            }).fail(function () {
                alert('リトライに失敗しました。');
            }).always(function () {
            });
        } else {
        }
    });
});