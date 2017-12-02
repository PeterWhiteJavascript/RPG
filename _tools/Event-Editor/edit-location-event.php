<?php
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'GameDataLoader.php'; ?>
        <?php include 'config.php';?>
        <link rel="stylesheet" href="css/edit-location.css">
    </head>
    <body>
        <div id="editor-content">
            <div id="editor-left-menu" id="action-vars">
                <div id="add-action"class="category-button" >Add Action</div>
                <div class="title-text">Actions</div>
                <div id="editor-actions">
                    <div id="actions-cont" class="sortable">

                    </div>
                </div>
                <div id="add-var"class="category-button" >Add Var</div>
                <div class="title-text">Vars</div>
                <div id="editor-variables">
                    <div id="variables-cont">
                        
                    </div>
                </div>
            </div>
            <div id="editor-main-content">
                <div id="editor-page-options">
                    <div id="music-select">
                        <p class="title-text">Music</p>
                        <select class="music-select"></select>
                        <audio controls class="music-preview full-width">
                            <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                        </audio>
                    </div>
                    <div id="bg-select">
                        <p class="title-text">Background</p>
                        <select class="bg-select">
                        </select>
                        <img>
                    </div>
                </div>
                <div id="bottom-page-options">
                    <div id="onload">
                        <p class="title-text">On Load</p>
                        <div id="add-new-onload-group"class="category-button" >Add Group</div>
                        <div id="onload-cont">
                            
                        </div>
                    </div>
                    <div id="choices">
                        <p class="title-text">Choices</p>
                        <div id="add-new-choice"class="category-button" >Add Choice</div>
                        <div id="choices-cont" class="sortable">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script src="js/edit-location-event.js"></script>
    </body>
</html>