<?php
include("php-config.php");
$scene = addDashes($_POST["scene"]);
$name = addDashes($_POST["name"]);
$type = $_POST['type'];
//Delete the file
$directory = '../../data/json/story/events/'.$type.'/'.$scene;
unlink($directory.'/'.$name.".json");
//Remove the event from the order in the scene
$scenesList = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
for($i=0;$i<count($scenesList[$type]);$i++){
    if($scenesList[$type][$i]['name']===$scene){
        for($j=0;$j<count($scenesList[$type][$i]['eventOrder']);$j++){
            $eventName = $scenesList[$type][$i]['eventOrder'][$j];
            if($eventName===$name){
                unset($scenesList[$type][$i]['eventOrder'][$j]);
                $scenesList[$type][$i]['eventOrder'] = array_values($scenesList[$type][$i]['eventOrder']);
                $j = count($scenesList[$type][$i]['eventOrder']);
                $i = count($scenesList[$type]);
            }
        }
    }
}
file_put_contents('../../data/json/data/scenes-list.json', json_encode($scenesList,JSON_PRETTY_PRINT));

?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="title"><h1><?php echo $scene; ?></h1></div>
        <div id="title2"><h1><?php echo $type; ?></h1></div>
        <script>
        var scene = $("#title").text();
        var type = $("#title2").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
        $("body").append(form);
        form.submit();
        </script>
    </body>
</html>