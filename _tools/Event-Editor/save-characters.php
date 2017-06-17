<?php
$filename = $_POST['filename'];
$data = $_POST['data'];

$directory = '../../data/json/story/characters/';
file_put_contents($directory.$filename,json_encode(json_decode($data),JSON_PRETTY_PRINT));

header( "Location:create-characters.php?file-name=$filename");
