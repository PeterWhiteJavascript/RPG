<?php
function addDashes($string) {
    //Clean up multiple dashes or whitespaces
    $string = preg_replace("/[\s-]+/", " ", $string);
    //Convert whitespaces and underscore to dash
    $string = preg_replace("/[\s_]/", "-", $string);
    // Strip any remaining non-alphanumeric characters
    return preg_replace("/[^a-zA-Z0-9\-]/", "", $string);
}

function dieIfFilenameUnsafe($filename) {
    if (!preg_match('/^[A-Za-z0-9\-]+$/', $filename)) {
        http_response_code(400);
        die(json_encode(['error' => 'Invalid filename']));
    }
    return $filename;
}
