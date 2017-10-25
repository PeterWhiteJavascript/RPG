<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <script>
        var scene = '<?php echo $_POST['scene'];?>';
        var event = '<?php echo $_POST['event'];?>';
        var type = '<?php echo $_POST['type'];?>';
        console.log(type,scene,event)
        
        //Get the event file
        $.getJSON("../../data/json/story/events/"+type+"/"+scene+"/"+event+".json",function(data){
            var kind = data.kind;
            //Send user to correct editor for this event.
            switch(kind){
                case "story":
                    $.redirect("edit-story-event.php",{scene:scene,event:data.name,type:type});
                    break;
                case "battleScene":
                    $.redirect("edit-battleScene-event.php",{scene:scene,event:data.name,type:type});
                    break;
                case "battle":
                    $.redirect("edit-battle-event.php",{scene:scene,event:data.name,type:type});
                    break;
                case "location":
                    $.redirect("edit-location-event.php",{scene:scene,event:data.name,type:type});
                    break;
            }
        });
        </script>
    </body>
</html>