function saveJsonToFile(type, id, data) {
    $.ajax({
        type: 'POST',
        url: 'save-json.php?type=' + type,
        data: {
            id: id,
            data: JSON.stringify(data)
        },
        dataType: 'json'
    })
        .done(function (data) {
            console.log(data);
            changed = false;
        })
        .fail(function (data) {
            console.log(data);
        });
}
function saveStoryJsonToFile(type, scene, event, data) {
    $.ajax({
        type: 'POST',
        url: 'save-json.php?type=story',
        data: {
            type: type,
            scene: scene,
            event: event,
            data: JSON.stringify(data)
        },
        dataType: 'json'
    })
        .done(function (data) {
            console.log(data);
            changed = false;
        })
        .fail(function (data) {
            console.log(data);
        });
}
