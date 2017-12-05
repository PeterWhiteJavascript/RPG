<?php
$name = $_POST['event'];
$scene = $_POST['scene'];
$type = $_POST['type'];
file_put_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json', json_encode(json_decode($_POST['file']),JSON_PRETTY_PRINT));
echo json_encode($_POST['file']);