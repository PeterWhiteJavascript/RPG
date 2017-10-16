<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
$name = addDashes($_POST['name']);
$type = $_POST['type'];
$eventType = $_POST['event-type'];

$newFile;
//New event
if(!isset($_POST['copying'])){
    $newFile = [
        'name' => $name,
        'desc' => $_POST['desc'],
        'kind' => $eventType
    ];
    switch($eventType){
        case "story":
            $newFile['pages'] = [];
            $newFile['vrs'] = (object)[];
            break;
        case "battleScene":
            $newFile['script'] = [];
            $newFile['characters'] = [];
            $newFile['map'] = "";
            break;
        case "battle":
            $newFile['battle'] = (object)[];
            $newFile['maxAllies'] = 0;
            $newFile['characters'] = (object)[];
            break;
        case "location":
            $newFile['actions'] = [];
            $newFile['vrs'] = (object)[];
            $newFile['disabledChoices'] = [];
            $newFile['pageList'] = [];
            break;
    }
    $newFile['kind'] = $eventType;
    file_put_contents("../../data/json/story/events/".$type."/".$scene."/".$name.".json", json_encode($newFile,JSON_PRETTY_PRINT));
    
    //Add the event to the event order of the scene
    $scenesList = json_decode(file_get_contents("../../data/json/data/scenes-list.json"), true);
    for($i=0;$i<count($scenesList[$type]);$i++){
        if($scenesList[$type][$i]['name']===$scene){
            $scenesList[$type][$i]['eventOrder'][] = $name;
        }
    }
    file_put_contents("../../data/json/data/scenes-list.json", json_encode($scenesList,JSON_PRETTY_PRINT));
} else {
    $newFile = json_decode(file_get_contents("../../data/json/story/events/".$type."/".$scene."/".$_POST['copying'].".json"), true);
    $newFile['name'] = $name;
    $newFile['desc'] = $_POST['desc'];
    file_put_contents("../../data/json/story/events/".$type."/".$scene."/".$name.".json", json_encode($newFile,JSON_PRETTY_PRINT));
}
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="name"><?php echo $name; ?></div>
        <div id="scene"><?php echo $scene; ?></div>
        <div id="type"><?php echo $type; ?></div>
        <div id="kind"><?php echo $eventType; ?></div>
        <script>
        var kind = $("#kind").text();
        switch(kind){
            case "story":
                var form = $('<form action="edit-story-event.php" method="post"></form>');
                form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
                form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
                form.append('<input type="text" name="type" value="'+$("#type").text()+'">');
                $("body").append(form);
                form.submit();
                break;
            case "battleScene":
            case "battle":
                var form = $('<form action="select-map.php" method="post"></form>');
                form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
                form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
                form.append('<input type="text" name="type" value="'+$("#type").text()+'">');
                form.append('<input type="text" name="kind" value="'+kind+'">');
                $("body").append(form);
                form.submit();
                break;
            case "location":
                var form = $('<form action="edit-location-event.php" method="post"></form>');
                form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
                form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
                form.append('<input type="text" name="type" value="'+$("#type").text()+'">');
                $("body").append(form);
                form.submit();
                break;
        }
        </script>
    </body>
</html>