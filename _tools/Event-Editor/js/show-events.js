//This will be filled with php for already made scenes
var events = [];

//Store the event that has been clicked on
var selectedEvent;

$(function(){
    //START OPTS BUTTONS
    $('#new-event').click( function(e) {
        var scene = $("#title").text();
        var form = $('<form action="create-event.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        $("body").append(form);
        form.submit();
    });
    
    $('#edit-vars').click( function(e) {
        var scene = $("#title").text();
        var form = $('<form action="edit-vars.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        $("body").append(form);
        form.submit();
    });
    
    $('#edit-event').click( function(e) {
        if(selectedEvent){
            console.log(selectedEvent)
            var kind = $(selectedEvent).parent().attr("kind")
            switch(kind){
                case "story":
                    var scene = $("#title").text();
                    var name = $(selectedEvent).parent().attr("name");
                    var form = $('<form action="edit-story-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"></form>');

                    $("body").append(form);
                    form.submit();
                    break;
                case "battle":
                case "battleScene":
                    
                    var scene = $("#title").text();
                    var name = $(selectedEvent).parent().attr("name");
                    var form = $('<form action="select-map.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="kind" value="'+kind+'"></form>');

                    $("body").append(form);
                    form.submit();
                    break;
            }
        }
    });
    $('#test-event').click( function(e) {
        if(selectedEvent){
            var scene = $("#title").text();
            var name = $(selectedEvent).parent().attr("name");
            var form = $('<form action="../../index.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="name" value="'+name+'"></form>');
            
            $("body").append(form);
            form.submit();
        }
    });
    
    
    $('#copy-event').click( function(e) {
        if(selectedEvent){
            var name = $(selectedEvent).parent().attr("name");
            var scene = $("#title").text();
            var form = $('<form action="create-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="copying" value="true"></form>');
            
            $("body").append(form);
            form.submit();
        }
    });
    
    //Change the order of the scenes
    $('#order-events').click( function(e) {
        if(selectedEvent){
            var scene = $("#title").text();
            var form = $('<form action="order-events.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
            
            $("body").append(form);
            form.submit();
        }
    });
    //Change the scene in which this event occurs
    $('#change-scene').click( function(e) {
        if(selectedEvent){
            var event = $(selectedEvent).parent().attr("name");
            var scene = $("#title").text();
            var form = $('<form action="change-scene.php" method="post"><input type="text" name="event" value="'+event+'"><input type="text" name="scene" value="'+scene+'"></form>');
            
            $("body").append(form);
            form.submit();
        }
    });
    $('#delete-event').click( function(e) {
        if(selectedEvent){
            var yes = confirm("Really delete event?");
            if(yes){
                var name = $(selectedEvent).parent().attr("name");
                var scene = $("#title").text();
                var form = $('<form action="delete-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"></form>');
                
                $("body").append(form);
                form.submit();
            }
        }
    });
    //END OPTS BUTTONS
    //When an individual scene is clicked
    $(document).on("click",".scene-button",function(e){
        selectedEvent = this;
        $(".menu-button.active").removeClass("active");
        $(this).children(":first").addClass('active');
        //Remove description that is there
        $("#show-desc div").remove();
        //Show the description for the scene
        var idx = $(".scene-button").index(selectedEvent);
        var desc = events[idx].desc;
        var kind = events[idx].kind;
        $("#show-desc").append('<div class="desc-text">'+desc+'</div>');
        $("#show-desc").append('<div class="desc-foot">Type:'+kind+'</div>');
    });
    
    //Fill the events array
    var ev = $("#show-events").children();
    for(var i=1;i<ev.length;i++){
        events.push({name:$(ev[i]).attr("name"),desc:$(ev[i]).attr("desc"),kind:$(ev[i]).attr("kind")});
    }
    //Default to top item being selected
    $(".scene-button").first().trigger("click");
    
});

