<?php

?>

<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="css/edit-battleScene.css">
    </head>
    <body>
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
                    <div class="script-groups sortable">
                        
                    </div>
                </div>
                <div id="initial-props-cont" class="menu-box">
                    <div id="prop-map" class="initial-props-item">
                        <span class="item-desc half-width">Map</span>
                        <select id="map-select-group" class="quarter-width"></select>
                        <select id="map-select-place" class="quarter-width"></select>
                    </div>
                    
                    <div id="prop-initial-view" class="initial-props-item">
                        <span class="item-desc half-width">View (x,y)</span>
                        <input class="quarter-width" type="number" min="0" placeholder="Loc X">
                        <input class="quarter-width" type="number" min="0" placeholder="Loc Y">
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
        
        <?php include 'GameDataLoader.php';?>
        <?php include 'config.php';?>
        <script src="js/edit-battleScene-script.js"></script>
        <script src="../../js/music.js"></script>
        <script src="../../js/animations.js"></script>
        <!--<script src="lib/ask-before-redirect.js"></script>-->
    </body>
</html>