<?php
//This file takes references and saves them to the scenes-list.json file.
//It also saves references to scene and global vars.

if(!isset($_POST['scene'])){ return; }
$sceneName = $_POST['scene'];
$eventName = $_POST['name'];
$eventRefs = isset($_POST['eventRefs']) ? $_POST['eventRefs'] : [];
$sceneVarRefs = isset($_POST['sceneVarRefs']) ? $_POST['sceneVarRefs'] : [];
$globalVarRefs = isset($_POST['globalVarRefs']) ? $_POST['globalVarRefs'] : [];

$scenes = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);

foreach($scenes["Story"] as $key => $item){
    if($scenes["Story"][$key]['name']===$sceneName){
        foreach($scenes["Story"][$key]['events'] as $key2 => $item2){
            if($item2['name']===$eventName){
                $scenes["Story"][$key]['events'][$key2]['events'] = $eventRefs;
                $scenes["Story"][$key]['events'][$key2]['sceneVars'] = $sceneVarRefs;
                $scenes["Story"][$key]['events'][$key2]['globalVars'] = $globalVarRefs;
            }
        }
    }
}
$file = json_encode($scenes,JSON_PRETTY_PRINT);
file_put_contents('../../data/json/data/scenes-list.json', $file);

echo $file;