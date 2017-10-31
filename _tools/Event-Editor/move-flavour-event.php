<?php
$filename = $_POST['filename'].".json";
$from = "../../data/json/story/events/Flavour/".$_POST['from'];
$to = "../../data/json/story/events/Flavour/".$_POST['to'];
if(file_exists($to.'/'.$filename)){
    echo "File exists!";
} else {
    if(!copy($from.'/'.$filename,$to.'/'.$filename)){
        echo "Failed to copy.";
    } else {
        unlink($from.'/'.$filename);
        echo $filename;
    }
}