<?php
include("php-config.php");
$scene = addDashes($_POST["scene"]);

$directory = '../../data/json/story/scenes';
unlink($directory.'/'.$scene.".json");
array_map('unlink', glob("../../data/json/story/events/".$scene."/*.*"));
rmdir("../../data/json/story/events/".$scene);
header("Location: load.php");