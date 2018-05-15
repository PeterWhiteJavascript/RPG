<!DOCTYPE html>
<html>
    <head>
        <title>RPG</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="css/style.css" />
        <link rel="stylesheet" href="css/menus.css" />
        <link rel="stylesheet" href="css/ui-icons.css" />
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    </head>
    <body>
        <!-- Stores canvas and UI elements -->
        <div id="main-content">
            <div id="background-container"></div>
            
            <div id="loading-bar">
                <div id="bar-cont">
                    <div id="bar-bottom"></div>
                    <div id="bar-top"></div>
                    <div id="bar-text"></div>
                </div>
            </div>
            <div id="content-container">
                <canvas id='quintus'></canvas>
                <div id='HUD-container'><div><span>Money: </span><span id='hud-money'></span></div><div><span>Week: </span><span id='hud-week'></span></div></div>
                <!-- Content for events. Gets emptied for each event, so don't store anything that shouldn't be removed! -->
                <div id="main-container">
                    

                </div>
            </div>
            
        </div>
        
        <!--Script tag for testing-->
        <script>
            var testing = false;
            <?php if(isset($_GET['testing'])){ ?>
            testing = {
                type: '<?php echo $_GET['type']; ?>',
                scene: '<?php echo $_GET['scene']; ?>',
                event: '<?php echo $_GET['event']; ?>'
            };
            <?php } ?>
        </script>
        <?php include 'GameFilesLoader.php'; ?>
    </body>
</html>


