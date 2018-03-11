<?php
/**
 * General file i/o backend for the Editor
 *
 * $_POST['type'] signifies the operation being performed
 * $postData is the submitted json object
 * $_POST['id'] is the usual identifier for where to write to (though 'story' requires a 3 part identifier of Type, Scene, Name)
 */
require_once 'php-config.php';

$postData = json_decode($_POST['data'], true);
if ($postData === null) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid data']));
}

if ($_GET['type'] === 'data') {
    $filename = $_POST['id'];
    dieIfFilenameUnsafe($filename);
    file_put_contents("../../data/json/data/{$filename}.json", json_encode($postData, JSON_PRETTY_PRINT));
    echo json_encode($postData);
}
if ($_GET['type'] === 'scene-defaults') {
    $scenes  = json_decode(file_get_contents('data/scene-defaults.json'), true);
    $scenes[$_POST['id']] = $postData;

    file_put_contents('data/scene-defaults.json', json_encode($scenes,JSON_PRETTY_PRINT));
    echo json_encode($scenes);
}
if ($_GET['type'] === 'character') {
    $filename = $_POST['id'];
    dieIfFilenameUnsafe($filename);
    $filePath = "../../data/json/story/characters/{$filename}.json";
    if ($postData !== []) {
        file_put_contents($filePath, json_encode($postData, JSON_PRETTY_PRINT));
    } else {
        unlink($filePath);
    }
    echo json_encode($postData);
}
if ($_GET['type'] === 'story') {
    $type = addDashes($_POST['type']);
    $scene = addDashes($_POST['scene']);
    $name = addDashes($_POST['event']);
    $filePath = "../../data/json/story/events/{$type}/{$scene}/{$name}.json";
    if ($postData !== []) {
        if (!file_exists(dirname($filePath))) {
            mkdir(dirname($filePath));
        }
        file_put_contents($filePath, json_encode($postData, JSON_PRETTY_PRINT));
    } else {
        unlink($filePath);
    }
    echo json_encode($postData);
}
if ($_GET['type'] === 'remove-flavour-group') {
    $type = 'Flavour';
    $scene = addDashes($_POST['id']);
    rmdir("../../data/json/story/events/{$type}/{$scene}");
}
if ($_GET['type'] === 'variables') {
    if($_POST['id']) {
        // Scene specific
        $scene = $_POST['id'];

        $allScenes = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
        for($i=0;$i<count($allScenes["Story"]);$i++){
            if($allScenes["Story"][$i]['name'] === $scene){
                $allScenes["Story"][$i]['vrs'] = $postData;
                break;
            }
        }
        file_put_contents('../../data/json/data/scenes-list.json', json_encode($allScenes,JSON_PRETTY_PRINT));
        echo json_encode($allScenes);
    }
    else {
        // Global
        $globalVars = json_decode(file_get_contents('../../data/json/story/global-vars.json'), true);
        $globalVars['vrs'] = $postData;
        file_put_contents('../../data/json/story/global-vars.json', json_encode($globalVars,JSON_PRETTY_PRINT));
        echo json_encode($globalVars['vrs']);
    }
}