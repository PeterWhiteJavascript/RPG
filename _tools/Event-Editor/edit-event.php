<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
$name = addDashes($_POST['name']);
$eventType = $_POST['event-type'];

$newFile;
//New event
if(!isset($_POST['copying'])){
    $newFile = [
        'name' => $_POST['name'],
        'desc' => $_POST['desc'],
        'kind' => $eventType,
        'vrs' => []
    ];
    switch($eventType){
        case "story":
            $newFile['pages'] = [];
            $newFile['onload'] = [];
            break;
        case "dialogue":
            $newFile['interactions'] = (object)[];
            break;
        case "battleScene":
            $newFile['scene'] = [];
            $newFile['characters'] = (object)[];
            $newFile['music'] = "";
            $newFile['map'] = "";
            break;
        case "battle":
            $newFile['battle'] = (object)[];
            $newFile['maxAllies'] = 0;
            $newFile['characters'] = (object)[];
            break;
    }
    file_put_contents("../../data/json/story/events/".$scene."/".$name.".json", json_encode($newFile,JSON_PRETTY_PRINT));
} else {
    $newFile = json_decode(file_get_contents("../../data/json/story/events/".$scene."/".$_POST['copying'].".json"), true);
    $newFile['name'] = $name;
    $newFile['desc'] = $_POST['desc'];
    file_put_contents("../../data/json/story/events/".$scene."/".$name.".json", json_encode($newFile,JSON_PRETTY_PRINT));
}

//Add the event to the event order of the scene
$sceneData = json_decode(file_get_contents("../../data/json/story/scenes/".$scene.".json"), true);
if(!in_array($name, $sceneData['eventOrder'])){
    $sceneData['eventOrder'][] = $name;
    //If the orig name is in here, remove it
   /* if(isset($_POST['origName'])){
        $index = array_search($_POST['origName'],$sceneData['eventOrder']);
        if($index !== false){
            unset($sceneData['eventOrder'][$index]);
        }
    }*/
    $sceneData['eventOrder'] = array_values($sceneData['eventOrder']);
    file_put_contents("../../data/json/story/scenes/".$scene.".json", json_encode($sceneData,JSON_PRETTY_PRINT));
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
        <div id="kind"><?php echo $eventType; ?></div>
        <script>
        var kind = $("#kind").text();
        switch(kind){
            case "story":
                var form = $('<form action="edit-story-event.php" method="post"></form>');
                form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
                form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
                $("body").append(form);
                form.submit();
                break;
            case "battleScene":
            case "battle":
                var form = $('<form action="select-map.php" method="post"></form>');
                form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
                form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
                form.append('<input type="text" name="kind" value="'+kind+'">');
                $("body").append(form);
                form.submit();
                break;
        }
        </script>
    </body>
</html>