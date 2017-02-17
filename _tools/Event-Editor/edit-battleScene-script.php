<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

if(isset($_POST['battleScene'])){
    $event['scene'] = $_POST['battleScene'];
};
$battleScene = json_decode($event['scene']);

$eventMusic = $event['music'];
$eventMap = $event['map'];
$variables = $event['vrs'];

//Save the characters to the file
if(isset($_POST['character'])){
    $event['characters'] = $_POST['characters'];
}
file_put_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json', json_encode($event,JSON_PRETTY_PRINT));

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes =  array_diff(scandir($directory), array('..', '.'));


$images =  array_diff(scandir("../../images/story"), array('..', '.'));

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'quintus-lib.php'; ?>
        <?php include 'config.php';?>
        <script src="js/edit-battleScene-script.js"></script>
    </head>
    <body>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <h2>Create the script</h2>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="event-map" hidden><?php echo "../../".$eventMap; ?></div>
        <div id="characters" hidden><?php echo $event['characters']; ?></div>
        
        <ul id="script-options" class="menu btn-group">
            
        </ul>
        <ul id="script-menu" class="right btn-group sortable">
            <?php
                forEach($battleScene as $scriptItem){
                    if(isset($scriptItem -> text)){
                        $text = json_decode($scriptItem->text);
                        $num = strlen($text[0]);
                        if($num>19){ $num=19;}
                        $displayText = substr($text[0], 0, $num);
                        echo "<li text='".json_encode($text)."' asset='".$scriptItem->asset."' pos='".$scriptItem->pos."' autoCycle='".$scriptItem->autoCycle."' noCycle='".$scriptItem->noCycle."'><a class='script-item text btn btn-default'>".$displayText."</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>";
                    } else {
                        echo "<li func='".$scriptItem->func."' props='".$scriptItem->props."'><a class='script-item func btn btn-default'>".$scriptItem->func."</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>";
                    }
                }
            ?>
        </ul>
        <select id="images-holder" hidden>
            <option value=''></option>
            <?php 
            forEach($images as $im){
                echo '<option value=story/'.$im.'>story/'.$im.'</option>';
            }
            ?>
        </select>
    </body>
</html>