<?php
//Scene
if(isset($_POST['scene'])){
    $scene = $_POST['scene'];
    //Save the vars to the file
    $file = json_decode(file_get_contents('../../data/json/story/scenes/'.$scene.'.json'), true);
    $file['vrs'] = json_decode($_POST['vrs']);
    file_put_contents('../../data/json/story/scenes/'.$scene.'.json', json_encode($file,JSON_PRETTY_PRINT));
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
        <script>
        var scene = $("#title").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        $("body").append(form);
        form.submit();
        </script>
    </body>
</html>

