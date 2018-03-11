<?php
/**
 * Redirect to the relevant specific event editor
 */
require_once 'php-config.php';

dieIfFilenameUnsafe($_GET['type']);
dieIfFilenameUnsafe($_GET['scene']);
dieIfFilenameUnsafe($_GET['event']);

$event = json_decode(file_get_contents("../../data/json/story/events/{$_GET['type']}/{$_GET['scene']}/{$_GET['event']}.json"), true);
$query = http_build_query($_GET);
switch ($event['kind']) {
    case "story":
    case "Story":
        redirect("edit-story-event.php?{$query}");
        break;
    case "battleScene":
    case "Battle Scene":
        redirect("edit-battleScene-script.php?{$query}");
        break;
    case "battle":
    case "Battle":
        redirect("edit-battle-event.php?{$query}");
        break;
    case "location":
    case "Location":
        redirect("edit-location-event.php?{$query}");
        break;
}
