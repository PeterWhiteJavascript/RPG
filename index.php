<?php
//FOR TESTING, ACCEPT THE NAME AND SCENE IF WE ARE TESTING A SPECIFIC EVENT.
$name;
$scene;
if(isset($_POST['name'])){$name = $_POST['name'];}
if(isset($_POST['name'])){$scene = $_POST['scene'];}
if(isset($_POST['name'])){$type = $_POST['type'];}
 
//Load all of the character files
$characterFiles = array_values(array_diff(scandir('data/json/story/characters'),array('..','.')));
$characters = (object)[];
foreach($characterFiles as $charFile){
    $characters -> $charFile = json_decode(file_get_contents('data/json/story/characters/'.$charFile), true);
}
 
?>

<!DOCTYPE html>
<html>
    <head>
        <title>RPG</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="css/style.css" />
        <script src='lib/quintus.js'></script>
        <script src='lib/quintus_sprites.js'></script>
        <script src='lib/quintus_scenes.js'></script>
        <script src='lib/quintus_input.js'></script>
        <script src='lib/quintus_anim.js'></script>
        <script src='lib/quintus_2d.js'></script>
        <script src='lib/quintus_tmx.js'></script>
        <script src='lib/quintus_touch.js'></script>
        <script src='lib/quintus_ui.js'></script>
        <script src='lib/quintus_audio.js'></script>
        <script src="lib/astar.js"></script>
        <script src="lib/jquery-3.1.1.js"></script>
        <script src="lib/jquery-ui.min.js"></script>
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
        
    </head>
    <body>
        <img id="loading-screen" src="images/ui/loading-screen.png">
        <?php
        if(isset($_POST['name'])){
        ?>
            <div id="title" hidden><?php echo $scene; ?></div>
            <div id="title2" hidden><?php echo $name; ?></div>
            <div id="title3" hidden><?php echo $type; ?></div>
        <?php
        }
        ?>
        <div id="all-characters" hidden><?php echo json_encode($characters); ?></div>
        
        <script src='js/main.js'></script>
        <script src='js/objects.js'></script>
        <script src='js/animations.js'></script>
        <script src='js/hud.js'></script>
        <script src='js/music.js'></script>
        <script src='js/ai.js'></script>
        <script src='js/ui_objects.js'></script>
        <script src='js/q_functions.js'></script>
        <script src='js/scene_funcs.js'></script>
        <script src='js/game_objects.js'></script>
    </body>
</html>


