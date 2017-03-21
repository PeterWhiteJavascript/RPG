<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
$name = addDashes($_POST['name']);

$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);
$pages = $event['pages'];
$variables = $event['vrs'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes = array_diff(scandir($directory), array('..', '.'));

$eventsJSON = (object)[];
foreach($scenes as $key => $val){
    $ev =[];
    $events = array_diff(scandir($directory."/".$val), array('..', '.'));
    foreach($events as $key2 => $val2){
        $ev[]=pathinfo($val2, PATHINFO_FILENAME);
         
    }
    $eventsJSON->$val=$ev;
}
$globalVars = json_decode(file_get_contents('../../data/json/story/global-vars.json'), true)['vrs'];

$sceneVars = json_decode(file_get_contents('../../data/json/story/scenes/'.$scene.'.json'), true)['vrs'];

$locationEvents = array_slice(scandir('../../data/json/story/locations'), 2);
$locEvents = [];
foreach($locationEvents as $ev){
    $locEvents[] = pathinfo($ev, PATHINFO_FILENAME);
}
$characters = json_decode(file_get_contents('../../data/json/data/characters.json'), true);
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="global-vars" value='<?php echo json_encode($globalVars); ?>'></div>
        <div id="scene-vars" value='<?php echo json_encode($sceneVars); ?>'></div>
        <div id="scenes" value='<?php echo json_encode($eventsJSON); ?>'></div>
        <div id="location-events" value='<?php echo json_encode($locEvents); ?>'></div>
        <div id="characters" value='<?php echo json_encode($characters); ?>'></div>
        
        
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        
        <div id="pages-data" hidden><?php echo json_encode($pages); ?></div>
        <div id="variables-data" hidden><?php echo json_encode($variables); ?></div>
        
        <div id="editor-content">
            <div class="editor-left-menu">
                <!--This is the options menu for the editor-->
                <ul>
                    <li><a id="add-new-variable"><div class="menu-button btn btn-default">Add New Variable</div></a></li>
                    <br>
                    <li><a id="add-new-page"><div class="menu-button btn btn-default">Add New Page</div></a></li>
                    <li><a id="remove-page"><div class="menu-button btn btn-default">Remove Page</div></a></li>
                    <li><a id="copy-page"><div class="menu-button btn btn-default">Copy Page</div></a></li>
                    <br>
                    <!--<li><a id="add-new-onload"><div class="menu-button btn btn-default">Add Onload</div></a></li>-->
                    <li><a id="add-new-choice"><div class="menu-button btn btn-default">Add Choice</div></a></li>
                    <br>
                    <li><a id="save-event"><div class="menu-button btn btn-default">Save Event</div></a></li>
                    <li><a id="test-event"><div class="menu-button btn btn-default">Test Event</div></a></li>
                    <br>
                    <li><a id="back"><div class="menu-button btn btn-default">Go Back</div></a></li>
                </ul>
            </div>
            <div class="editor-left-menu" id="editor-variables">
                <ul>
                    
                </ul>
            </div>
            <div class="editor-left-menu" id="editor-pages">
                <ul class="sortable">
                    
                </ul>
            </div>
            <div id="editor-page-options">
                <div id="music-select">
                    <p class="editor-descriptor">Music:</p>
                    <select>
                        <?php
                        forEach($music as $song){
                            echo '<option value='.$song.'>'.$song.'</option>';
                        }
                        ?>
                    </select>
                </div>
                <audio controls id="music-preview">
                    <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                </audio>
                <img id="bg-preview">
                <div id="bg-select">
                    <p class="editor-descriptor">BG:</p>
                    <select>
                        <?php 
                        forEach($bgs as $bg){
                            echo '<option value=bg/'.$bg.'>bg/'.$bg.'</option>';
                        }
                        ?>
                    </select>
                </div>
                <br>
                <div id="text-select">
                    <p class="editor-descriptor">Text: </p>
                    <textarea class="desc-text"></textarea>
                </div>
                <div id="onload">
                    <h2>On load:</h2>
                    <ul>
                        <li class="onload-li sortable">
                            <p class="editor-descriptor">Condition/Effect Groups: </p>
                            <a class="add-new-group"><div class="btn btn-default">Add Group</div></a>

                        </li>
                    </ul>
                </div>
                <div id="choices">
                    <h2>Choices:</h2>
                    <ul class="sortable">
                        
                    </ul>
                </div>
            </div>
        </div>
        <script src="js/edit-story-event.js"></script>
    </body>
</html>