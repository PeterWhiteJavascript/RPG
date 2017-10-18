<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
$name = addDashes($_POST['name']);
$type = $_POST['type'];


$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes = array_diff(scandir($directory), array('..', '.'));

$dataFiles = array_slice(scandir('../../data/json/data'),2);

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
        <?php include 'config.php';?>
        <link rel="stylesheet" href="css/edit-location.css">
    </head>
    <body>
        <script>
            var sceneType = '<?php echo $type; ?>';
            var sceneName = '<?php echo $scene; ?>';
            var eventName = '<?php echo $name; ?>';
            
            var dataFiles = <?php echo json_encode($dataFiles) ?>;
        </script>
        <div id="all-characters" hidden><?php echo json_encode($characters); ?></div>
        
        <div id="editor-content">
            <div id="top-bar">
                <ul>
                    <li class="top-bar-btn"><div id="add-new-action" class="menu-button btn btn-default">Add New Action</div></li>
                    <li class="top-bar-btn"><div id="add-new-variable" class="menu-button btn btn-default">Add New Variable</div></li>
                    <li class="top-bar-btn"><div id="copy-action" class="menu-button btn btn-default">Copy Action</div></li>
                    <li class="top-bar-btn"><div id="remove-action" class="menu-button btn btn-default">Remove Action</div></li>
                    <li class="top-bar-btn"><div id="save-event" class="menu-button btn btn-default">Save Event</div></li>
                    <li class="top-bar-btn"><div id="test-event" class="menu-button btn btn-default">Test Event</div></li>
                    <li class="top-bar-btn"><div id="back" class="menu-button btn btn-default">Go Back</div></li>
                </ul>
            </div>
            
            <div class="editor-left-menu" id="action-vars">
                <div class="centered-title">ACTIONS</div>
                <div id="editor-actions">
                    <ul class="sortable">

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
                        <div class="btn btn-default" id="add-new-choice">Add Choices</div>
                        <ul class="sortable">
                            
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <script src="js/edit-location-event.js"></script>
    </body>
</html>