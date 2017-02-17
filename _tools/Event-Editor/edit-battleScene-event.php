<?php
$scene = $_POST['scene'];
$name = $_POST['name'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

$battleScene = $event['scene'];
$characters = $event['characters'];
$eventMusic = $event['music'];
$eventMap = $_POST['map'];
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
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'quintus-lib.php'; ?>
        <?php include 'config.php';?>
        <script src="js/edit-battleScene-event.js"></script>
    </head>
    <body>
        <div id="scenes" value='<?php echo json_encode($eventsJSON); ?>'></div>
        <h2>Set initial characters</h2>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="event-map" hidden><?php echo $eventMap; ?></div>
        
        <ul class="menu right btn-group" style="height:80%">
            
        </ul>
    </body>
</html>