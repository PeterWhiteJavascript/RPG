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

$charGen = json_decode(file_get_contents('../../data/json/data/character-generation.json'), true);
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
        <div id="char-gen" value='<?php echo json_encode($charGen); ?>'></div>
        
        
        <div id="editor-title" hidden><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        
        <div id="pages-data" hidden><?php echo json_encode($pages); ?></div>
        <div id="variables-data" hidden><?php echo json_encode($variables); ?></div>
        
        <div id="editor-content">
            <div id="top-bar">
                <ul>
                    <li class="top-bar-btn"><div id="add-new-page" class="menu-button btn btn-default">Add New Page</div></li>
                    <li class="top-bar-btn"><div id="add-new-variable" class="menu-button btn btn-default">Add New Variable</div></li>
                    <li class="top-bar-btn"><div id="copy-page" class="menu-button btn btn-default">Copy Page</div></li>
                    <li class="top-bar-btn"><div id="remove-page" class="menu-button btn btn-default">Remove Page</div></li>
                    <li class="top-bar-btn"><div id="save-event" class="menu-button btn btn-default">Save Event</div></li>
                    <li class="top-bar-btn"><div id="test-event" class="menu-button btn btn-default">Test Event</div></li>
                    <li class="top-bar-btn"><div id="back" class="menu-button btn btn-default">Go Back</div></li>
                </ul>
            </div>
            
            <div class="editor-left-menu" id="page-vars">
                <div class="centered-title">PAGES</div>
                <div id="editor-pages">
                    <ul>

                    </ul>
                </div>
                <div class="centered-title">VARS</div>
                <div id="editor-variables">
                    <ul>

                    </ul>
                </div>
            </div>
            <div id="editor-main-content">
                <div id="editor-page-options">
                    <div id="text-select">
                        <p class="editor-descriptor dark-gradient">Text</p>
                        <textarea class="desc-text"></textarea>
                    </div>
                    <div id="music-select">
                        <p class="editor-descriptor dark-gradient">Music</p>
                        <select>
                            <?php
                            forEach($music as $song){
                                echo '<option value='.$song.'>'.$song.'</option>';
                            }
                            ?>
                        </select>
                        <audio controls id="music-preview">
                            <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                        </audio>
                    </div>
                    <div id="bg-select">
                        <p class="editor-descriptor dark-gradient">Background</p>
                        <select>
                            <?php 
                            forEach($bgs as $bg){
                                echo '<option value=bg/'.$bg.'>bg/'.$bg.'</option>';
                            }
                            ?>
                        </select>
                        <img id="bg-preview">
                    </div>
                </div>
                <div id="bottom-page-options">
                    <div id="onload">
                        <p class="editor-descriptor-big dark-gradient">On Load</p>
                        <div class="btn btn-default" id="add-new-onload-group">Add Group</div>
                    </div>
                    <div id="choices">
                        <p class="editor-descriptor-big dark-gradient">Choices</p>
                        <div class="btn btn-default" id="add-new-choice">Add Choice</div>
                        <ul class="sortable">
                            
                        </ul>
                    </div>
                    <div id="modules">
                        <p class="editor-descriptor-big dark-gradient">Modules</p>
                        <div class="btn btn-default" id="add-new-module-var">Add Variable Module</div>
                        <div class="btn btn-default" id="add-new-module">Add Character Module</div>
                        <ul class="sortable">

                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <script src="js/edit-story-event.js"></script>
    </body>
</html>