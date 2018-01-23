<?php
// Usage: Hit /_tools/artgen/?body=Female&chest=Vest&class=Archer
// to generate a browser-cachable png

$PROJECT_ROOT = realpath("../..");
require "{$PROJECT_ROOT}/lib/SimpleImage.php";

$sprite_filenames = [];
$dir = new DirectoryIterator("{$PROJECT_ROOT}/images/sprite-layers/");
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
        $filename_parts = str_getcsv($fileinfo->getFilename());
        if (!isset($filename_parts[3])) continue;
        $sprite_filenames[$filename_parts[3]] = $fileinfo->getFilename();
    }
}
function getFileName(string $layer): string
{
    global $PROJECT_ROOT, $sprite_filenames;
    return realpath("{$PROJECT_ROOT}/images/sprite-layers/{$sprite_filenames[$layer]}");
}

$image = new \claviska\SimpleImage();
$gender = $_GET['body'] !== 'Female' ? 'Male' : 'Female';
$image->fromFile(getFileName("Body {$gender}"));
$image->overlay(getFileName("{$gender} Venorian Clothes"));
if ($_GET['chest']) $image->overlay(getFileName($_GET['chest'])); // Shirt, Vest, Capelet, Curiass, Breastplate
$image->overlay(getFileName($_GET['class'])); // Skirmisher, Archer
$image->overlay(getFileName("Sandals {$gender}"));
$image->toScreen();
