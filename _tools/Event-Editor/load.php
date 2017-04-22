<?php
$file = json_decode(file_get_contents('../../data/json/data/scenes-list.json'),true);

$nor = $file['Other'];
$off = $file['Officer'];
$act = $file['Story'];
$crc = $file['Character'];
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
                <div class="left cont-menu">
                    <ul class="load-char-classes collapse-menu">
                        <li><div class="minimize">Character Scenes</div></li>
                        <?php
                            foreach($crc as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'" type="Character"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                    <ul class="load-officers collapse-menu">
                        <li><div class="minimize">Officer Scenes</div></li>
                        <?php
                            foreach($off as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'" type="Officer"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                    <ul class="load-act collapse-menu">
                        <li><div class="minimize">Acts</div></li>
                        <?php
                            foreach($act as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'" type="Story"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                    <ul class="load-scene collapse-menu">
                        <li><div class="minimize">Other Scenes</div></li>
                        <?php
                            foreach($nor as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'" type="Other"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                </div>
                <div id="load-desc" class="menu middle fixed">
                    <!--The first description is shown with js-->
                    <div class="desc-text"></div>
                </div>
                <ul class="menu right btn-group fixed">
                    <!--<li><a id="create-new-scene"><div class="menu-button btn btn-default">Create New Scene</div></a></li>-->
                    <li><a id="open-scene"><div class="menu-button btn btn-default">Open Scene</div></a></li>
                    <!--<li><a id="delete-scene"><div class="menu-button btn btn-default">Delete Scene</div></a></li>-->
                    <br>
                    <li><a id="edit-vars"><div class="menu-button btn btn-default">Edit Global Variables</div></a></li>
                </ul>
                <div id="footer"><a href="index.php"><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/load.js"></script>
    </body>
</html>
