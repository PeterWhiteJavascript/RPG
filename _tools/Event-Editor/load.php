<?php
//Get all of the scene data
$directory = '../../data/json/story/scenes';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));

$charClasses = ["Legionnaire","Berserker","Vanguard","Assassin","Skirmisher","Archer","Illusionist","Elementalist","Healer"];
$officers = ["Astrea","Lysandra"];
$crc = [];
$off = [];
$nor = [];

foreach($scanned_directory as $file) {
    $data = json_decode(file_get_contents($directory.'/'.$file), true);
    if(in_array($data['name'],$charClasses)){
        $crc[] = $data;
    } else if(in_array($data['name'],$officers)){
        $off[] = $data;
    } else {
        $nor[] = $data;
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Load a Scene</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1>LOAD</h1></div>
            <div id="content">
                <ul class="load-char-classes menu left-top">
                    <li><div>Character Class Scenes</div></li>
                    <?php
                        foreach($crc as $data){
                            echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                        }
                    ?>
                </ul>
                <ul class="load-officers menu left-mid">
                    <li><div>Officer Scenes</div></li>
                    <?php
                        foreach($off as $data){
                            echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                        }
                    ?>
                </ul>
                <ul class="load-scene menu left-bottom">
                    <li><div>All Other Scenes</div></li>
                    <?php
                        foreach($nor as $data){
                            echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                        }
                    ?>
                </ul>
                
                <div id="load-desc" class="menu middle fixed">
                    <!--The first description is shown with js-->
                    <div class="desc-text"></div>
                </div>
                <ul class="menu right btn-group fixed">
                    <li><a id="create-new-scene"><div class="menu-button btn btn-default">Create New Scene</div></a></li>
                    <li><a id="open-scene"><div class="menu-button btn btn-default">Open Scene</div></a></li>
                    <li><a id="edit-scene"><div class="menu-button btn btn-default">Edit Scene</div></a></li>
                    <li><a id="delete-scene"><div class="menu-button btn btn-default">Delete Scene</div></a></li>
                    <br>
                    <li><a id="edit-vars"><div class="menu-button btn btn-default">Edit Global Variables</div></a></li>
                </ul>
                <div id="footer"><a href="index.php"><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/load.js"></script>
    </body>
</html>
