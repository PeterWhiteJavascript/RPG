<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$type = $_POST['type'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);

if(isset($_POST['map'])){
    $event['map'] = $_POST['map'];
    file_put_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json', json_encode($event,JSON_PRETTY_PRINT));
    $event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);
}

$eventMap = $event['map'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_values(array_diff(scandir($music_directory), array('..', '.')));

$sound_directory = '../../audio/sfx';
$sounds = array_values(array_diff(scandir($sound_directory), array('..', '.')));

$directory = '../../data/json/story/events';
$types =  array_values(array_diff(scandir($directory), array('..', '.')));

$scenes = [];
$eventNames = [];
for($i=0;$i<count($types);$i++){
    $sc = array_values(array_diff(scandir($directory.'/'.$types[$i]),array('..','.')));
    array_push($scenes,$sc);
    foreach($sc as $s){
        $ev = array_values(array_diff(scandir($directory.'/'.$types[$i].'/'.$s),array('..','.')));
        $eventNames[$s] = preg_replace('/\\.[^.\\s]{3,4}$/', '', $ev);
    }
    
}
$images =  array_diff(scandir("../../images/story"), array('..', '.'));

//Load all of the character files
$characterFiles = array_values(array_diff(scandir('../../data/json/story/characters'),array('..','.')));
$characters = (object)[];
foreach($characterFiles as $charFile){
    $characters -> $charFile = json_decode(file_get_contents('../../data/json/story/characters/'.$charFile), true);
}

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'quintus-lib.php'; ?>
        <?php include 'config.php';?>
        <script src="js/edit-battleScene-script.js"></script>
        <script src="../../js/music.js"></script>
        <script src="lib/ask-before-redirect.js"></script>
        <link rel="stylesheet" href="css/edit-battleScene.css">
    </head>
    <body>
        <div id="all-characters" hidden><?php echo json_encode($characters); ?></div>
        <div id="all-scene-types" hidden><?php echo json_encode($types); ?></div>
        <div id="all-scene-names" hidden><?php echo json_encode($scenes); ?></div>
        <div id="all-event-names" hidden><?php echo json_encode($eventNames); ?></div>
        <div id="all-music-names" hidden><?php echo json_encode($music); ?></div>
        <div id="all-sound-names" hidden><?php echo json_encode($sounds); ?></div>
        
        <div id="editor-title" hidden><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="scene-type" hidden><h2><?php echo $type; ?></h2></div>
        <div id="event-map" hidden><?php echo $eventMap; ?></div>
        
        <div id="event-data" hidden><?php echo json_encode($event); ?></div>
        
        <div id="editor-content">
            <div id="top-bar">
                <ul>
                    <li class="top-bar-btn"><div class="menu-button btn btn-default">-</div></li>
                    <li class="top-bar-btn"><div id="menu-create-group" class="menu-button btn btn-default">Create Group</div></li>
                    <li class="top-bar-btn"><div id="menu-add-text-item" class="menu-button btn btn-default">Add Text Item</div></li>
                    <li class="top-bar-btn"><div id="menu-add-func-item" class="menu-button btn btn-default">Add Func Item</div></li>
                    <li class="top-bar-btn"><div id="menu-save-file" class="menu-button btn btn-default" filename="<?php echo $filename?>">Save</div></li>
                    <li class="top-bar-btn"><div id="menu-test-event" class="menu-button btn btn-default">Test</div></li>
                    <li class="top-bar-btn"><div id="menu-go-back" class="menu-button btn btn-default">Back</div></li>
                </ul>
            </div>
            <div id="canvas-coordinates"></div>
            <div id="left-box">
                <div id="event-characters-box">
                    <p class="editor-descriptor dark-gradient">Event Characters</p>
                    <ul id="characters-list" class="droppable sortable">
                        
                    </ul>
                </div>
                <div id="event-script-box">
                    <p class="editor-descriptor dark-gradient">Script</p>
                    <div id="script-list" class="sortable">
                        
                    </div>
                </div>
            </div>
            <div id="right-box">
                <div id="all-characters-box">
                    <p class="editor-descriptor dark-gradient">Character Files</p>
                    <div id="files"></div>
                </div>
                
                <div id="script-item-box">
                    <p class="editor-descriptor dark-gradient">Script Item</p>
                    
                </div>
            </div>
        </div>
        
        <select id="images-holder" hidden>
            <?php 
            forEach($images as $im){
                echo '<option value=story/'.$im.'>story/'.$im.'</option>';
            }
            ?>
        </select>
    </body>
</html>