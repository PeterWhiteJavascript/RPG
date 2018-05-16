var _hasUnsavedChanges = false;
function savedAnimation(){
    var anim = $("<div class='file-saver-animation'>File Saved!</div>");
    $("body").append(anim);
    anim.delay(100).animate({
        opacity:0,
        top:"10%"
        }, 1200,"swing",
        function(){
            $(this).remove();
        });
}
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
            _hasUnsavedChanges = false;
            savedAnimation();
        })
        .fail(function (data) {
            console.log(data);
            alert("Error Saving. Check console for details.");
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
            _hasUnsavedChanges = false;
        })
        .fail(function (data) {
            console.log(data);
        });
}
$(function() {
    setTimeout(function() {
        // Wait 2s before listening, to let the page finish loading
        $('body').on('change', ':input', function() {
            _hasUnsavedChanges = true;
        });
    }, 2000);
});
function hasUnsavedChanges() {
    return _hasUnsavedChanges;
}
function promptAboutChanges() {
    return !_hasUnsavedChanges || confirm("Are you sure you want to go back without saving?");
}
