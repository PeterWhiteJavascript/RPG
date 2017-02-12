<?php
include("php-config.php");
$name = addDashes($_POST["name"]);
$desc = $_POST["desc"];
//Make sure there's no other scene with this name
$directory = '../../data/json/story/scenes';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));

if (in_array($name.'.json', $scanned_directory)) {
    echo "File already exists!";
    echo "<br>";
    echo "Press the back button to go back!";
} else {
    $newFile = [
        'name' => $name,
        'desc' => $desc,
        'eventOrder' => []
       ];

    // encode array to json
    $json = json_encode($newFile);

    //write json to file
    if (file_put_contents('../../data/json/story/scenes/'.$name.'.json', $json)){
        //Create a new directory in the events folder
        mkdir("../../data/json/story/events/".$name);
        
    } else {
        echo "Oops! Error creating json file...";
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="title"><?php echo $name; ?></div>
        <script>
        var scene = $("#title").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        $("body").append(form);
        form.submit();
        </script>
    </body>
</html>

