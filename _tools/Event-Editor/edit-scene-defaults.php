<?php
$scene = $_GET["scene"];
$data  = json_decode(file_get_contents('data/scene-defaults.json'));
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'GameDataLoader.php';?>
        <?php include 'config.php';?>
        <title>Set defaults</title>
        <link rel="stylesheet" href="css/edit-scene-defaults.css">
    </head>
    <body>
        <script>
            var scene = '<?php echo $scene?>';
            var data = JSON.parse('<?php echo json_encode($data);?>');
            if(!data[scene]){
                data[scene] = {
                    "Story": {
                        "music": "demo.mp3",
                        "bg": "Pumpkins.jpg",
                        "startPage": "Start"
                    },
                    "Location": {
                        "music": "demo.mp3",
                        "bg": "Pumpkins.jpg",
                        "defaultActions": []
                    },
                    "Battle Scene": {
                        "music": "demo.mp3",
                        "map": "Test\/Act-1-1-Left-Path.tmx"
                    },
                    "Battle": {
                        "music": "demo.mp3",
                        "map": "Test\/Act-1-1-Left-Path.tmx",
                        "maxAllies":6,
                        "defaultDirection":"up"
                    }
                }
            }
            var fileData = data[scene];
        </script>
        <div id="editor-content">
            <div id="editor-main-content">
                <div id="scene-title"><div><?php echo $scene?> Defaults</div></div>
                <div class="menu-box">
                    <span class="title-text full-width">Story</span>
                    <div id="story-props" class="UIC-group-item-props">
                        <span class='quarter-width'>Music</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>BG</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='half-width'>Start Page Name</span><input class='UIC-prop half-width' value='Start' type='text'>    
                    </div>
                    <span class="title-text full-width">Location</span>
                    <div id="location-props" class="UIC-group-item-props">
                        <span class='quarter-width'>Music</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>BG</span><select class='UIC-prop three-quarter-width'></select>
                        <span class="UIC-button full-width">Add Action</span>
                        <div id='location-actions' class='UIC-group-item-props'></div>
                    </div>
                    
                    <span class="title-text full-width">Battle Scene</span>
                    <div id="battle-scene-props" class="UIC-group-item-props">
                        <span class='quarter-width'>Music</span><select class='UIC-prop three-quarter-width'></select>
                        <span class="sub-title-text half-width">Map</span>
                        <select class="UIC-prop quarter-width"></select>
                        <select class="UIC-prop quarter-width"></select> 
                    </div>
                    
                    <span class="title-text full-width">Battle</span>
                    <div id="battle-props" class="UIC-group-item-props">
                        <span class='quarter-width'>Music</span><select class='UIC-prop three-quarter-width'></select>
                        <span class="sub-title-text half-width">Map</span>
                        <select class="UIC-prop quarter-width"></select>
                        <select class="UIC-prop quarter-width"></select>
                        <span class='half-width'>Max Allies</span><input class='UIC-prop half-width' value='6' type='number'> 
                        <span class='quarter-width'>Dir</span><select class='UIC-prop three-quarter-width'></select>
                    </div>
                    
                    
                    
                </div>
            </div>
        </div>
        <script src="js/common.js"></script>
        <script src="js/edit-scene-defaults.js"></script>
    </body>
</html>
