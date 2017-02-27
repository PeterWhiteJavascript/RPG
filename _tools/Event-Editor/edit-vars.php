<?php
//Edit scene and global vars here
if(isset($_POST['scene'])){
    $scene = $_POST['scene'];
    $vrs = json_decode(file_get_contents('../../data/json/story/scenes/'.$scene.'.json'), true)['vrs'];
} else {
    $scene = "";
    $vrs = json_decode(file_get_contents('../../data/json/story/global-vars.json'), true)['vrs'];
}
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Edit Variables</title>
    </head>
    <body>
        <div id="wrapper">
            <?php
            if(isset($_POST['scene'])){
            ?>
            <div id="title"><h1><?php echo $scene; ?></h1></div>
            <?php
            } else {
            ?>
            <div><h1>Global Vars</h1></div>
            <?php
            }
            ?>
            <div id="content">
                <ul id="vars" class="menu middle-left">
                    <?php
                        foreach($vrs as $vr){
                            echo '<li class="var-li">Name<div class="name">'.$vr['name'].'</div>Value<input class="val" value="'.$vr['val'].'"></li>';
                        }
                    ?>
                </ul>
                <ul class="menu middle-right">
                    <li><a id="new-variable"><div class="menu-button btn btn-default">New Variable</div></a></li>
                    <li><a id="save-variables"><div class="menu-button btn btn-default">Save Variables</div></a></li>
                </ul>
                <div id="footer"><a><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/edit-variables.js"></script>
    </body>
</html>
