//Store the scene that has been clicked on
var selectedScene;

$(function(){
    //START OPTS BUTTONS
    $('#open-scene').click(function(e){
        var scene = $(selectedScene).parent().attr("name");
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        $("body").append(form);
        form.submit();
    });
    $('#create-new-scene').click( function(e) {
        window.location = "create-new-scene.php";
    });
    $('#edit-scene').click( function(e) {
        var desc = $(selectedScene).parent().attr("desc");
        var scene = $(selectedScene).parent().attr("name");
        var form = $('<form action="edit-scene.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="desc" value="'+desc+'"></form>');
        $("body").append(form);
        form.submit();
    });
    $('#delete-scene').click( function(e) {
        var yes = confirm("Really delete?");
        if(yes){
            var scene = $(selectedScene).parent().attr("name");
            var form = $('<form action="delete-scene.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
            $("body").append(form);
            form.submit();
        }
    });
    //END OPTS BUTTONS
    //When an individual scene is clicked
    $(document).on("click",".scene-button",function(e){
        selectedScene = this;
        $(".menu-button.active").removeClass("active");
        $(this).children(":first").addClass('active');
        //Remove description that is there
        $("#load-desc div").remove();
        $("#load-desc").append('<div class="desc-text">'+$(selectedScene).parent().attr("desc")+'</div>');
    });
   
    //Default to top item being selected
    $(".scene-button").first().trigger("click");
    
    $('#edit-vars').click( function(e) {
        var form = $('<form action="edit-vars.php" method="post"></form>');
        $("body").append(form);
        form.submit();
    });
});


