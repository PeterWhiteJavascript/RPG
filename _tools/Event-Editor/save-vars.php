<?php
//Scene
if(isset($_POST['scene'])){
    $scene = $_POST['scene'];
    //Save the vars to the file
    $list = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
    for($i=0;$i<count($list["Story"]);$i++){
        if($list["Story"][$i]['name']===$scene){
            $list["Story"][$i]['vrs'] = json_decode($_POST['vrs']);
        }
    }
    file_put_contents('../../data/json/data/scenes-list.json', json_encode($list,JSON_PRETTY_PRINT));
    echo json_encode($list);
} 
//Global
else {
    $file = json_decode(file_get_contents('../../data/json/story/global-vars.json'), true);
    $file['vrs'] = json_decode($_POST['vrs']);
    //file_put_contents('../../data/json/story/global-vars.json', json_encode($file,JSON_PRETTY_PRINT));
    header("Location: load.php");
}