<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
$name = addDashes($_POST['name']);
$desc = $_POST['desc'];
$eventType = $_POST['event-type'];

$newFile;
//Editing an event
if(isset($_POST['origName'])){
    $file = "../../data/json/story/events/".$scene."/".addDashes($_POST['origName']).".json";
    $newFile = json_decode(file_get_contents($file), true);
    $newFile['name'] = $name;
    $newFile['desc'] = $desc;
    $newFile['kind'] = $eventType;
    file_put_contents("../../data/json/story/events/".$scene."/".$name.".json", json_encode($newFile,JSON_PRETTY_PRINT));
    if($name!==$_POST['origName']){
        unlink($file);
    }
}  
//A new event
else {
    $newFile = [
        'name' => $name,
        'desc' => $desc,
        'kind' => $eventType,
        'vrs' => (object)[]
    ];
    switch($eventType){
        case "story":
            $newFile['pages'] = [];
            break;
        case "dialogue":
            $newFile['interactions'] = (object)[];
            break;
        case "battleScene":
            $newFile['scene'] = [];
            $newFile['initialChars'] = [];
            $newFile['music'] = "";
            $newFile['map'] = "";
            break;
        case "battle":
            $newFile['battle'] = (object)[];
            break;
    }
    file_put_contents("../../data/json/story/events/".$scene."/".$name.".json", json_encode($newFile,JSON_PRETTY_PRINT));
}

//Add the event to the event order of the scene
$sceneData = json_decode(file_get_contents("../../data/json/story/scenes/".$scene.".json"), true);
if(!in_array($name, $sceneData['eventOrder'])){
    $sceneData['eventOrder'][] = $name;
    //If the orig name is in here, remove it
    if(isset($_POST['origName'])){
        $index = array_search($_POST['origName'],$sceneData['eventOrder']);
        if($index !== false){
            unset($sceneData['eventOrder'][$index]);
        }
    }
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
        var form = $('<form action="edit-'+$("#kind").text()+'-event.php" method="post"></form>');
        form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
        form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
        $("body").append(form);
        form.submit();
        </script>
    </body>
</html>