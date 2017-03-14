<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);
if(isset($_POST['battleScene'])){
    $event['scene'] = json_decode($_POST['battleScene']);
}
file_put_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json', json_encode($event,JSON_PRETTY_PRINT));
?>


<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <?php
        if(isset($_POST['testing'])){
        ?>
        <script>
        var name = $("#editor-title").text();
        var scene = $("#scene-name").text();
        var form = $('<form action="../../index.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="name" value="'+name+'"></form>');
        $("body").append(form);
        form.submit();
        </script>
        <?php
            
        } else {
        ?>
        <script>
        var name = $("#editor-title").text();
        var scene = $("#scene-name").text();
        var form = $('<form action="edit-battleScene-script.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="name" value="'+name+'"></form>');
        $("body").append(form);
        form.submit();
        </script>
        <?php  
        }
        ?>
    </body>
</html>