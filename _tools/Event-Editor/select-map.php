<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$kind = $_POST['kind'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

$battleScene = $event['scene'];
$characters = $event['characters'];
$eventMusic = $event['music'];
if(isset($_POST['map'])){
    $eventMap = $_POST['map'];
} else {
    $eventMap = $event['map'];
}

$variables = $event['vrs'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes =  array_diff(scandir($directory), array('..', '.'));

//Get all of the tmx files
$maps = array();
foreach (glob("../../data/*.tmx") as $mp) {
  $maps[] = $mp;
}
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'quintus-lib.php'; ?>
        <?php include 'config.php';?>
        <script src="js/select-map.js"></script>
    </head>
    <body>
        <div id="maps" value='<?php echo json_encode($maps); ?>'></div>
        <h2>Select Map</h2>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="scene-kind" hidden><h2><?php echo $kind; ?></h2></div>
        <div id="options">
            <select id="maps-select" initialValue="<?php echo "../../data/".$eventMap; ?>"></select>
        </div>
        <ul class="menu right btn-group">
            <li><a id="go-to-scene"><div class="menu-button btn btn-default">Edit Battle/Battle Scene</div></a></li>
        </ul>
        <div id="footer"><a><div class="menu-button btn btn-default">BACK</div></a></div>
    </body>
</html>