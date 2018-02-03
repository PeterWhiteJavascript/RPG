<?php
$data  = json_decode(file_get_contents('data/scene-defaults.json'));

$scene = $_POST['scene'];
$newData = json_decode($_POST['data']);
$data -> $scene = $newData;

file_put_contents('data/scene-defaults.json', json_encode($data,JSON_PRETTY_PRINT));
echo json_encode($data);