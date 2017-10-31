<?php
include("php-config.php");
$data = json_decode($_POST['data'],true);
file_put_contents('../../data/json/story/events/'.$_POST['type'].'/'.$_POST['scene'].'/'.$data['name'].'.json', json_encode($data,JSON_PRETTY_PRINT));

echo json_encode($data);