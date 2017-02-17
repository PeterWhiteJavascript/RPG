<?php
$scene = $_POST['scene'];
$name = $_POST['name'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);


$battleScene = $event['scene'];
$eventMusic = $event['music'];
$eventMap = $event['map'];
$variables = $event['vrs'];

//Save the characters to the file
$characters = $_POST['characters'];
$event['characters'] = $characters;
file_put_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json', json_encode($event),JSON_PRETTY_PRINT);

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
        <script src="js/edit-battleScene-script.js"></script>
    </head>
    <body>
        <div id="scenes" value='<?php echo json_encode($eventsJSON); ?>'></div>
        <h2>Create the script</h2>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="event-map" hidden><?php echo $eventMap; ?></div>
        <div id="characters" hidden><?php echo $event['characters']; ?></div>
        
        <ul class="menu right btn-group" style="height:30%">
            
        </ul>
        <ul class="script-menu right btn-group sortable">
            
        </ul>
    </body>
</html>