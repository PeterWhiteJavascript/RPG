<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

//Save the characters to the file
if(isset($_POST['characters'])){
    $event['characters'] = json_decode($_POST['characters']);
    file_put_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json', json_encode($event,JSON_PRETTY_PRINT));
    $event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);
}

$eventMusic = $event['music'];
$eventMap = $event['map'];
$variables = $event['vrs'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes =  array_values(array_diff(scandir($directory), array('..', '.')));

$eventNames = [];
foreach($scenes as $s){
    $eventNames[] = array_values(array_diff(scandir($directory."/".$s), array('..', '.')));
}
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
        <div id="all-scene-names" hidden><?php echo json_encode($scenes); ?></div>
        <div id="all-event-names" hidden><?php echo json_encode($eventNames); ?></div>
        
        <div id="editor-title" hidden><h2><?php echo $name; ?></h2></div>
        <h2>Create the script</h2>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="event-map" hidden><?php echo $eventMap; ?></div>
        <div id="characters" hidden><?php echo json_encode($event['characters']); ?></div>
        
        <ul id="script-options" class="menu btn-group">
            
        </ul>
        <div id="script-menu">
            <?php
            forEach($event['scene'] as $scriptItem){
            ?>
            <ul class="sortable">
                <li><div class="minimize"><?php echo $scriptItem['name']?></div></li>
                <?php
                forEach($scriptItem['items'] as $itm){
                    if(isset($itm['text'])){
                        $text = $itm['text'];
                        $num = strlen($text[0]);
                        if($num>19){ $num=19;}
                        $displayText = substr($text[0], 0, $num);
                        echo "<li text=".json_encode($text)." asset='".json_encode($itm['asset'])."' pos='".$itm['pos']."' autoCycle='".$itm['autoCycle']."' noCycle='".$itm['noCycle']."'><div class='text-or-func'>Text</div><a class='script-item text btn btn-default'>".$displayText."</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>";
                    } else {
                        echo "<li func='".$itm['func']."' props='".json_encode($itm['props'])."'><div class='text-or-func'>Func</div><a class='script-item func btn btn-default'>".$itm['func']."</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>";
                    }
                }
                ?>
            </ul>
            <?php
            }
            ?>
        </div>
        <select id="images-holder" hidden>
            <?php 
            forEach($images as $im){
                echo '<option value=story/'.$im.'>story/'.$im.'</option>';
            }
            ?>
        </select>
        <div id="canvas-coordinates"></div>
    </body>
</html>