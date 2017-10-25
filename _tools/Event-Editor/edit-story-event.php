<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
$type = $_POST['type'];
$name = addDashes($_POST['event']);
$event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);
$pages = $event['pages'];
$variables = $event['vrs'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));


$directory = '../../data/json/story/events';
$scenes = array_diff(scandir($directory), array('..', '.'));

$dataFiles = array_slice(scandir('../../data/json/data'),2);

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <link href="css/edit-story-event.css" rel="stylesheet">
    </head>
    <body>
        <script>
            var sceneType = '<?php echo $type; ?>';
            var sceneName = '<?php echo $scene; ?>';
            var eventName = '<?php echo $name; ?>';
            
            
            var dataFiles = <?php echo json_encode($dataFiles) ?>;
            var dataPages = <?php echo json_encode($pages); ?>;
            var dataVariables = <?php echo json_encode($variables); ?>;
        </script>
        <div id="editor-content">
            <div id="top-bar">
                <ul>
                    <li class="top-bar-btn"><div id="add-new-page" class="menu-button btn btn-default">Add New Page</div></li>
                    <li class="top-bar-btn"><div id="add-new-variable" class="menu-button btn btn-default">Add New Variable</div></li>
                    <li class="top-bar-btn"><div id="remove-page" class="menu-button btn btn-default">Remove Page</div></li>
                    <li class="top-bar-btn"><div id="save-event" class="menu-button btn btn-default">Save Event</div></li>
                    <li class="top-bar-btn"><div id="test-event" class="menu-button btn btn-default">Test Event</div></li>
                    <li class="top-bar-btn"><div id="to-vars" class="menu-button btn btn-default">To Vars</div></li>
                    <li class="top-bar-btn"><div id="to-scenes" class="menu-button btn btn-default">To Scenes</div></li>
                </ul>
            </div>
            
            <div class="editor-left-menu" id="page-vars">
                <div class="centered-title">PAGES</div>
                <div id="editor-pages">
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