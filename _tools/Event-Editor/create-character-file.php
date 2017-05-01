<?php
$filename = $_POST['file-name'].'.json';


if ($handle = opendir('../../data/json/story/characters')) {
    while (false !== ($entry = readdir($handle))) {
        if($filename==$entry){
            header("Location:select-characters-file.php?err=File already exists!");
            exit();
        }
    }
}


file_put_contents('../../data/json/story/characters/'.$filename, json_encode((object)[]));

header( "Location:create-characters.php?file-name=$filename");