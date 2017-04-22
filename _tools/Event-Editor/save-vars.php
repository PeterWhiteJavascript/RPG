<?php
//Scene
if(isset($_POST['scene'])){
    $scene = $_POST['scene'];
    $type = $_POST['type'];
    //Save the vars to the file
    $list = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
    for($i=0;$i<count($list[$type]);$i++){
        print_r($list[$type][$i]);
        if($list[$type][$i]['name']===$scene){
            $list[$type][$i]['vrs'] = json_decode($_POST['vrs']);
        }
    }
    file_put_contents('../../data/json/data/scenes-list.json', json_encode($list,JSON_PRETTY_PRINT));
} 
//Global
else {
    $file = json_decode(file_get_contents('../../data/json/story/global-vars.json'), true);
    $file['vrs'] = json_decode($_POST['vrs']);
    file_put_contents('../../data/json/story/global-vars.json', json_encode($file,JSON_PRETTY_PRINT));
    header("Location: load.php");
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Save Vars</title>
    </head>
    <body>
        <div id="title"><h1><?php echo $scene; ?></h1></div>
        <div id="type"><h1><?php echo $type; ?></h1></div>
        <script>
        var scene = $("#title").text();
        var type = $("#type").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
        $("body").append(form);
        form.submit();
        </script>
    </body>
</html>

