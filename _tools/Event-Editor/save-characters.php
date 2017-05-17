<?php
$filename = $_POST['filename'];
$data = $_POST['data'];

$directory = '../../data/json/story/characters/';
file_put_contents($directory.$filename,json_decode(json_encode($data, JSON_PRETTY_PRINT)));

header( "Location:create-characters.php?file-name=$filename");
