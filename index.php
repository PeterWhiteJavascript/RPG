<!DOCTYPE html>
<html>
    <head>
        <title>RPG</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="css/style.css" />
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    </head>
    <body>
        <img id="background-image" src="images/ui/loading-screen.png">
        <div id="loading-bar">
            <div id="bar-cont">
                <div id="bar-bottom"></div>
                <div id="bar-top"></div>
                <div id="bar-text"></div>
            </div>
        </div>
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


