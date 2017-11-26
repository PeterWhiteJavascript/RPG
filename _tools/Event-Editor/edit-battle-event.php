<?php

?>
<!DOCTYPE html>
<html>
    <head>
        <link href="css/edit-battle-event.css" rel="stylesheet">
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
                <div id="cond-groups-cont" class="menu-box">
                    <div class="cond-group-title-bar">
                        <span class="add-group item-desc full-width">Add Group</span>
                    </div>
                    <div class="cond-groups">
                        
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
                    <div id="prop-maxAllies" class="initial-props-item">
                        <span class="item-desc half-width">Max Allies</span>
                        <input type="number" class="half-width" min="1" value="6">
                    </div>
                    <div id="prop-placementSquares" class="initial-props-item">
                        <span id="placement-squares-button" class="item-desc full-width">Placement Squares</span>
                        <span id="placement-squares-cont"></span>
                    </div>
                    <div id="prop-victory" class="initial-props-item">
                        <span class="item-desc full-width">Victory</span>
                        <select class="scene-type third-width"></select>
                        <select class="scene-name third-width"></select>
                        <select class="event-name third-width"></select>
                        <div class="cond-group-title-bar">
                            <span class="add-group item-desc full-width">Add Group</span>
                        </div>
                        <div class="cond-groups">

                        </div>
                    </div>
                    <br>
                    <div id="prop-defeat" class="initial-props-item">
                        <span class="item-desc full-width">Defeat</span>
                        <select class="scene-type third-width"></select>
                        <select class="scene-name third-width"></select>
                        <select class="event-name third-width"></select>
                        <div class="cond-group-title-bar">
                            <span class="add-group item-desc full-width">Add Group</span>
                        </div>
                        <div class="cond-groups">

                        </div>
                    </div>
                        
                </div>
            </div>
        </div>
        
        <?php include 'GameDataLoader.php';?>
        <?php include 'config.php';?>
        <?php include 'quintus-lib.php'; ?>
        <script src="../../js/music.js"></script>
        <script src="../../js/animations.js"></script>
        <script src="js/edit-battle-event.js"></script>
    </body>
</html>
