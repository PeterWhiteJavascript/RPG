<?php
$scene = $_POST['scene'];
$name = $_POST['event'];
$type = $_POST['type'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);


$maps_directory = '../../data/maps';
$places = array_diff(scandir($maps_directory), array('..', '.'));
$map_obj = (object)[];
foreach($places as $place_name){
    $place = array_diff(scandir($maps_directory."/".$place_name), array('..', '.'));
    $map_obj -> $place_name = array_values($place);
}

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_values(array_diff(scandir($music_directory), array('..', '.')));

$sound_directory = '../../audio/sfx';
$sounds = array_values(array_diff(scandir($sound_directory), array('..', '.')));

$directory = '../../data/json/story/events';
$types =  array_values(array_diff(scandir($directory), array('..', '.')));

$images =  array_values(array_diff(scandir("../../images/story"), array('..', '.')));

//Load all of the character files
$characterFiles = array_values(array_diff(scandir('../../data/json/story/characters'),array('..','.')));
$characters = (object)[];
foreach($characterFiles as $charFile){
    $characters -> $charFile = json_decode(file_get_contents('../../data/json/story/characters/'.$charFile), true);
}

$dataFiles = array_slice(scandir('../../data/json/data'),2);

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <link rel="stylesheet" href="css/edit-battleScene.css">
    </head>
    <body>
        <script>
            var sceneName = '<?php echo $scene; ?>';
            var sceneType = '<?php echo $type; ?>';
            var eventName = '<?php echo $name; ?>'; 
            
            var musicFileNames = <?php echo json_encode($music);?>;
            var soundFileNames = <?php echo json_encode($sounds);?>;
            var mapFileNames = <?php echo json_encode($map_obj);?>;
            var characterFiles = <?php echo json_encode($characters);?>;
            var dataFiles = <?php echo json_encode($dataFiles); ?>;
            var imageAssets = <?php echo json_encode($images); ?>;
        </script>
        <?php include 'quintus-lib.php'; ?>
        <script src="js/edit-battleScene-script.js"></script>
        <script src="../../js/music.js"></script>
        <!--<script src="lib/ask-before-redirect.js"></script>-->
        
        <div id="editor-content">
            <div id="full-screen-hider"></div>
            <div id="top-bar">
                <div class="top-bar-itm">
                    <div id="canvas-coordinates">0,0</div>
                </div>
                <div class="top-bar-itm">
                    <div id="save-file" class="bar-button">SAVE</div>
                </div>
                <div class="top-bar-itm">
                    <div id="test-file" class="bar-button">TEST</div>
                </div>
                <div class="top-bar-itm">
                    <div id="load-characters" class="bar-button">LOAD CHARS</div>
                </div>
                <div class="top-bar-itm">
                    <div id="go-back" class="bar-button">BACK</div>
                </div>
            </div>
            <div id="editor-main-content">
                <div id="map-cont" class="menu-box">
                    
                </div>
                <div id="event-chars-cont" class="menu-box droppable">
                    
                </div>
                <div id="char-files-cont" class="menu-box">
                    <div id="char-files">
                        
                    </div>
                </div>
                <div id="script-item-box" class="menu-box">
                    <div class="script-group-title-bar">
                        <span class="add-group item-desc full-width">Add Group</span>
                    </div>
                    <div class="script-groups">
                        
                    </div>
                </div>
                <div id="initial-props-cont" class="menu-box">
                    <div id="prop-map" class="initial-props-item">
                        <span class="item-desc half-width">Map</span>
                        <select id="map-select-group" class="quarter-width"></select>
                        <select id="map-select-place" class="quarter-width"></select>
                    </div>
                    
                    <div id="prop-music" class="initial-props-item">
                        <span class="item-desc half-width">Music</span>
                        <select class="music-select half-width"></select>
                        <audio controls class="music-preview full-width">
                            <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                        </audio>
                    </div>
                    <div id="prop-finished" class="initial-props-item">
                        <span class="item-desc full-width">Finished Event</span>
                        <select class="scene-type third-width"></select>
                        <select class="scene-name third-width"></select>
                        <select class="event-name third-width"></select>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>