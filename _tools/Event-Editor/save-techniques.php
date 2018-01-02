<?php
file_put_contents('../../data/json/data/techniques.json', json_encode(json_decode($_POST['data']),JSON_PRETTY_PRINT));
echo $_POST['data'];