<?php
?>

<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="css/edit-location.css">
    </head>
    <body>
        <div id="editor-content">
            <div class="editor-left-menu" id="action-vars">
                <div id="add-action" class="btn btn-default">Add Action</div>
                <div class="dark-gradient centered-title">Actions</div>
                <div id="editor-actions">
                    <div id="actions-cont" class="sortable">

                    </div>
                </div>
                <div id="add-var" class='btn btn-default'>Add Var</div>
                <div class="dark-gradient centered-title">Vars</div>
                <div id="editor-variables">
                    <div id="variables-cont">
                        
                    </div>
                </div>
            </div>
            <div id="editor-main-content">
                <div id="editor-page-options">
                    <div id="music-select">
                        <p class="dark-gradient centered-title">Music</p>
                        <select class="music-select"></select>
                        <audio controls class="music-preview full-width">
                            <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                        </audio>
                    </div>
                    <div id="bg-select">
                        <p class="dark-gradient centered-title">Background</p>
                        <select class="bg-select">
                        </select>
                        <img>
                    </div>
                </div>
                <div id="bottom-page-options">
                    <div id="onload">
                        <p class="editor-descriptor-big dark-gradient">On Load</p>
                        <div class="btn btn-default" id="add-new-onload-group">Add Group</div>
                        <div id="onload-cont">
                            
                        </div>
                    </div>
                    <div id="choices">
                        <p class="editor-descriptor-big dark-gradient">Choices</p>
                        <div class="btn btn-default" id="add-new-choice">Add Choice</div>
                        <div id="choices-cont" class="sortable">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php include 'GameDataLoader.php'; ?>
        <?php include 'config.php';?>
        <script src="js/edit-location-event.js"></script>
    </body>
</html>



<!--
<html>
    <head>
        <link rel="stylesheet" href="css/edit-location.css">
        <link rel="stylesheet" href="css/style.css">
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
                    <li class="top-bar-btn"><div id="remove-action" class="menu-button btn btn-default">Remove Action</div></li>
                    <li class="top-bar-btn"><div id="save-event" class="menu-button btn btn-default">Save Event</div></li>
                    <li class="top-bar-btn"><div id="test-event" class="menu-button btn btn-default">Test Event</div></li>
                    <li class="top-bar-btn"><div id="to-vars" class="menu-button btn btn-default">To Vars</div></li>
                    <li class="top-bar-btn"><div id="to-events" class="menu-button btn btn-default">To Events</div></li>
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
</html>-->