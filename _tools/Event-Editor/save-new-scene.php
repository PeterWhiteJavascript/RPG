<?php
include("php-config.php");
$name = addDashes($_POST['name']);
$desc = $_POST['desc'];
$type = $_POST['type'];
//Make sure there's no other scene with this name

$list = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
$file_name_in_use = false;
for($i=0;$i<count($list[$type]);$i++){
    if($list[$type][$i]['name']===$name){
        $file_name_in_use = true;
    }
}
if ($file_name_in_use) {
    echo "File already exists!";
    echo "<br>";
    echo "Press the back button to go back!";
} else {
    $newFile = [
        'name' => $name,
        'desc' => $desc,
        'eventOrder' => [],
        'vrs' => (object)[]
       ];
    $list[$type][] = $newFile;

    //write json to file
    if (file_put_contents('../../data/json/data/scenes-list.json', json_encode($list,JSON_PRETTY_PRINT))){
        //Create a new directory in the events folder
        mkdir('../../data/json/story/events/'.$type.'/'.$name);
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
        <div id="title2"><?php echo $type; ?></div>
        <script>
        var scene = $("#title").text();
        var type = $("#title2").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
        $("body").append(form);
        form.submit();
        </script>
    </body>
</html>

