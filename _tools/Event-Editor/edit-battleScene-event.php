<?php
$scene = $_POST['scene'];
$name = $_POST['name'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

$battleScene = $event['scene'];
$characters = $event['characters'];
$eventMusic = $event['music'];
if(isset($_POST['map'])){
    //Save the map to the file
    $event['map'] = $_POST['map'];
}
$eventMap = $event['map'];
file_put_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json', json_encode($event,JSON_PRETTY_PRINT));

$variables = $event['vrs'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes =  array_diff(scandir($directory), array('..', '.'));

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'quintus-lib.php'; ?>
        <?php include 'config.php';?>
        <script src="js/edit-battleScene-event.js"></script>
    </head>
    <body>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <h2>Set initial characters</h2>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="event-map" hidden><?php echo $eventMap; ?></div>
        <div id="characters" hidden><?php echo json_encode($event['characters']); ?></div>
        
        <ul class="menu right btn-group" style="height:80%">
            
        </ul>
    </body>
</html>