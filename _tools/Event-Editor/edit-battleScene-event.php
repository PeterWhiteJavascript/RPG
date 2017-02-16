<?php
$scene = $_POST['scene'];
$name = $_POST['name'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

$initialChars = $event['initialChars'];
$eventMap = $event['map'];
$eventMusic = $event['music'];
$battleScene = $event['scene'];
$variables = $event['vrs'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes =  array_diff(scandir($directory), array('..', '.'));

$eventsJSON = (object)[];
foreach($scenes as $key => $val){
    $ev =[];
    $events = array_diff(scandir($directory."/".$val), array('..', '.'));
    foreach($events as $key2 => $val2){
        $ev[]=pathinfo($val2, PATHINFO_FILENAME);
         
    }
    $eventsJSON->$val=$ev;
}
$eventsJSON = json_encode($eventsJSON);
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="scenes" value='<?php echo $eventsJSON; ?>'></div>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
    </body>
</html>