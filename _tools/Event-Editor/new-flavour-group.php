<?php
$dir = "../../data/json/story/events/Flavour/".$_POST['name']; 
if(!file_exists($dir)){
    mkdir($dir); 
    echo "New Group Created!";
} else {
    echo false;
}