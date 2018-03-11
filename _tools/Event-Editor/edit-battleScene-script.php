<?php

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'GameDataLoader.php';?>
        <?php include 'config.php';?>
        <link rel="stylesheet" href="css/edit-battleScene.css">
    </head>
    <body>
        <div id="editor-content">
            <div id="full-screen-hider"></div>
            <div id="editor-main-content">
                <div id="map-cont">
                    
                </div>
                <div id="event-chars-cont" class="menu-box droppable sortable">
                    
                </div>
                <div id="char-files-cont" class="menu-box">
                    <div id="char-files">
                        
                    </div>
                </div>
                <div id="script-item-box" class="menu-box">
                    <div class="script-group-title-bar">
                        <span id="add-group" class="title-text full-width">Add Group</span>
                    </div>
                    <div id="script-groups" class="sortable">
                        
                    </div>
                </div>
                <div id="initial-props-cont" class="menu-box">
                    <div id="prop-map" class="initial-props-item">
                        <span class="title-text half-width">Map</span>
                        <select id="map-select-group" class="quarter-width"></select>
                        <select id="map-select-place" class="quarter-width"></select>
                    </div>
                    
                    <div id="prop-initial-view" class="initial-props-item">
                        <span class="title-text half-width">View (x,y)</span>
                        <input class="quarter-width" type="number" min="0" placeholder="Loc X">
                        <input class="quarter-width" type="number" min="0" placeholder="Loc Y">
                    </div>
                    <div id="prop-music" class="initial-props-item">
                        <span class="title-text half-width">Music</span>
                        <select class="music-select half-width"></select>
                        <audio controls class="music-preview full-width">
                            <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                        </audio>
                    </div>
                    <div id="prop-finished" class="initial-props-item">
                        <span class="title-text full-width">Finished Event</span>
                        <select class="scene-type third-width"></select>
                        <select class="scene-name third-width"></select>
                        <select class="event-name third-width"></select>
                    </div>
                </div>
            </div>
        </div>
        <script src="js/common.js"></script>
        <script src="js/edit-battleScene-script.js"></script>
        <script src="../../js/music.js"></script>
        <script src="../../js/animations.js"></script>
    </body>
</html>