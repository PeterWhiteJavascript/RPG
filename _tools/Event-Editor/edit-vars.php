<?php
//Edit scene and global vars here
if(isset($_POST['scene'])){
    $scene = $_POST['scene'];
    $type = $_POST['type'];
    $list = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
    $vrs;
    for($i=0;$i<count($list[$type]);$i++){
        if($list[$type][$i]['name']===$scene){
            $vrs = $list[$type][$i]['vrs'];
        }
    }
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
            <div id="title2"><h1><?php echo $type; ?></h1></div>
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
                        foreach($vrs as $key => $value){
                            echo '<li class="var-li"><div class="btn btn-group center var-remove remove-choice">x</div>Name<div class="name">'.$key.'</div>Value<input class="val" value="'.$value.'"></li>';
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
