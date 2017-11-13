<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$type = $_POST['type'];
$event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);
if(isset($_POST['data'])){
    $event = json_decode($_POST['data']);
    file_put_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json', json_encode($event,JSON_PRETTY_PRINT));
    echo json_encode($event);
} else {
    echo "Failed";
}
