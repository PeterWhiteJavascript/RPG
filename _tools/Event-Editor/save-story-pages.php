<?php
include("php-config.php");
$name = addDashes($_POST['name']);
$scene = addDashes($_POST['scene']);

$file = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

$file['vrs'] = json_decode($_POST['vrs']);
$file['pages'] = json_decode($_POST['pages']);
file_put_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json', json_encode($file, JSON_PRETTY_PRINT));

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="title"><h1><?php echo $scene; ?></h1></div>
        <div id="title2"><h1><?php echo $name; ?></h1></div>
        <script>
            
        <?php
        if(isset($_POST['testing'])){
        ?>
        var scene = $("#title").text();
        var name = $("#title2").text();
        var form = $('<form action="../../index.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="name" value="'+name+'"></form>');
        $("body").append(form);
        form.submit();
        <?php
        } else {
        ?>
        var scene = $("#title").text();
        var name = $("#title2").text();
        var form = $('<form action="edit-story-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"></form>');
        $("body").append(form);
        form.submit();
        <?php
        }
        ?>
        </script>
    </body>
</html>