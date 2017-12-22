<?php
$filename = $_POST['filename'].'.json';


if ($handle = opendir('../../data/json/story/characters')) {
    while (false !== ($entry = readdir($handle))) {
        if($filename==$entry){
            exit();
        }
    }
}
$newFile = json_encode((object)[],JSON_PRETTY_PRINT);
file_put_contents('../../data/json/story/characters/'.$filename, $newFile);
echo($newFile);