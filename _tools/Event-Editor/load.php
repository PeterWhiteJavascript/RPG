<?php
//Get all of the scene data
$directory = '../../data/json/story/scenes';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));

$defaultScenes = ["Feast1","Feast2","Feast3","Mentored1","Mentored2","Mentored3","Hunted1","Hunted2","Hunted3","EnemiesDefeated50","EnemiesDefeated100","EnemiesDefeated200","Assisted100","Assisted250","Assisted500","BattlesParticipated5","BattlesParticipated10","BattlesParticipated20","DamageDealt1000","DamageDealt5000","DamageDealt10000","DamageTaken500","DamageTaken2500","DamageTaken5000","SelfHealed500","SelfHealed2500","SelfHealed5000","TargetHealed1000","TargetHealed5000","TargetHealed10000","TimesWounded5","TimesWounded10","TimesWounded20","TimesRested5","TimesRested10","TimesRested20"];
$officers = ["Astrea","Lysandra","Gaios","Imamu","Rutendo","Nala","Sjrna","Eko","Nicodermus"];
$acts = ["Act-1-1","Act-1-2","Act-1-3","Act-1-4","Act-2-1","Act-2-2","Act-2-3","Act-2-4","Act-3-1","Act-3-2","Act-3-3","Act-3-4","Act-4-1"];
$crc = [];
$off = [];
$nor = [];
$act = [];

foreach($scanned_directory as $file) {
    $data = json_decode(file_get_contents($directory.'/'.$file), true);
    if(in_array($data['name'],$defaultScenes)){
        $crc[] = $data;
    } else if(in_array($data['name'],$officers)){
        $off[] = $data;
    } else if(in_array($data['name'],$acts)){
        $act[] = $data;
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
                <div class="left cont-menu">
                    <ul class="load-char-classes collapse-menu">
                        <li><div class="minimize">Default Scenes</div></li>
                        <?php
                            foreach($crc as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                    <ul class="load-officers collapse-menu">
                        <li><div class="minimize">Officer Scenes</div></li>
                        <?php
                            foreach($off as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                    <ul class="load-act collapse-menu">
                        <li><div class="minimize">Acts</div></li>
                        <?php
                            foreach($act as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                    <ul class="load-scene collapse-menu">
                        <li><div class="minimize">All Other Scenes</div></li>
                        <?php
                            foreach($nor as $data){
                                echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                            }
                        ?>
                    </ul>
                </div>
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
