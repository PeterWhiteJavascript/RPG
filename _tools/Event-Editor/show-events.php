<?php
$scenes = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
$globalVars = json_decode(file_get_contents('../../data/json/story/global-vars.json'), true);
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'GameDataLoader.php'; ?>
        <?php include 'config.php';?>
        <title>Load an Event</title>
        <link rel="stylesheet" href="css/show-events.css">
        <script src="lib/jcanvas.min.js"></script>
        <script type="text/javascript" src="http://creativecouple.github.com/jquery-timing/jquery-timing.min.js"></script>
    </head>
    <body>
        <script>
            var scenes = <?php echo json_encode($scenes); ?>;
            var globalVars = <?php echo json_encode($globalVars); ?>;
        </script>
        <div id="wrapper">
            <div class="full-screen-hider"></div>
            <div id="main-content">
                <div id="scene-title"></div>
                <div id="scene-type-display"></div>
                <div id="events-flowchart-cont">
                    
                </div>
                <div id="menu-cont">
                    <div id="new-event" class="menu-button">New Event</div>
                    <div id="edit-event" class="menu-button">Edit Event</div>
                    <div id="test-event" class="menu-button">Test Event</div>
                    <div id="delete-event" class="menu-button">Delete Event</div>
                    <div class="menu-divider"></div>
                    <div id="save-flowchart" class="menu-button">Save Events</div>
                    <div class="menu-divider"></div>
                    <div id="edit-vars" class="menu-button">To Scene Vars</div>
                    <div id="back" class="menu-button">To Scenes</div>
                    <div id="back-to-main" class="menu-button">To Main Page</div>
                </div>
                
            </div>
                
        </div>
        <script src="js/show-events.js"></script>
    </body>
</html>
