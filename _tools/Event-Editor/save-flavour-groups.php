<?php
if(isset($_POST['file'])){
    $file = json_decode($_POST['file']);
    file_put_contents('../../data/json/data/flavour-events-list.json', json_encode($file,JSON_PRETTY_PRINT));
    echo json_encode($file);
}