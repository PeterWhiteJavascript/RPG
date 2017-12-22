<!DOCTYPE html>
<html>
    <head>
        <?php include 'GameDataLoader.php'; ?>
        <?php include 'config.php';?>
        <link href="css/edit-story-event.css" rel="stylesheet">
    </head>
    <body>
        <div id="editor-content">
            <div id="editor-left-menu">
                <div id="add-page" class="category-button" >Add Page</div>
                <div class="title-text">Pages</div>
                <div id="pages-cont">
                    
                </div>
                <div id="add-var" class="category-button" >Add Var</div>
                <div class="title-text">Vars</div>
                <div id="variables-cont">
                    
                </div>
            </div>
            <div id="editor-main-content">
                <div id="editor-page-options">
                    <div id="text-select">
                        <p class="title-text">Text</p>
                        <textarea class="desc-text"></textarea>
                    </div>
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
                        <div id="add-new-onload-group" class="category-button" >Add Group</div>
                        <div id="onload-cont">
                            
                        </div>
                    </div>
                    <div id="choices">
                        <p class="title-text">Choices</p>
                        <div id="add-new-choice" class="category-button" >Add Choice</div>
                        <div id="choices-cont" class="sortable">
                            
                        </div>
                    </div>
                    <div id="modules">
                        <p class="title-text">Modules</p>
                        <div id="add-new-module" class="category-button">Add Module</div>
                        <div id="modules-cont" class="sortable">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script src="js/edit-story-event.js"></script>
    </body>
</html>