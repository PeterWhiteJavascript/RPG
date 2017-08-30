<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$type = $_POST['type'];
$event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);
if(isset($_POST['data'])){
    $event['characters'] = json_decode($_POST['data'])->characters;
    $event['script'] = json_decode($_POST['data'])->scriptData;
}
$error = false;
if($event['characters']===null||$event['script']===null){
    print_r($_POST['data']);
    $event = false;
} else {
    file_put_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json', json_encode($event,JSON_PRETTY_PRINT));
}
echo json_encode($event);