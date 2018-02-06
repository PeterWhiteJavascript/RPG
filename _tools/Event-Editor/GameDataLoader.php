<?php

$type = isset($_POST['type']) ? $_POST['type'] : false;
$scene = isset($_POST['scene']) ? $_POST['scene'] : false;
$name = isset($_POST['event']) ? $_POST['event'] : false;
if(!$name){
    $name = isset($_POST['filename']) ? $_POST['filename'] : false;
}
if($type && $scene && $name){
    $event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);
} else if($name) {
    $event = json_decode(file_get_contents('../../data/json/story/characters/'.$name), true);
} 
//There is no event, just get the data
else {
    $event = false;
}


$maps_directory = '../../data/maps';
$places = array_diff(scandir($maps_directory), array('..', '.'));
$map_obj = (object)[];
foreach($places as $place_name){
    $place = array_diff(scandir($maps_directory."/".$place_name), array('..', '.'));
    $map_obj -> $place_name = array_values($place);
}

$bg_directory = '../../images/bg';
$bgs = array_values(array_diff(scandir($bg_directory), array('..', '.')));

$sprites_directory = '../../images/sprites';
$sprites_imgs = array_values(array_diff(scandir($sprites_directory), array('..', '.')));

$anims_directory = '../../images/animations';
$anims_imgs = array_values(array_diff(scandir($anims_directory), array('..', '.')));

$music_directory = '../../audio/bgm';
$music = array_values(array_diff(scandir($music_directory), array('..', '.')));

$sound_directory = '../../audio/sfx';
$sounds = array_values(array_diff(scandir($sound_directory), array('..', '.')));

$directory = '../../data/json/story/events';
$types =  array_values(array_diff(scandir($directory), array('..', '.')));

$images =  array_values(array_diff(scandir("../../images/story"), array('..', '.')));

//Load all of the character files
$characterFiles = array_values(array_diff(scandir('../../data/json/story/characters'),array('..','.')));
$characters = (object)[];
foreach($characterFiles as $charFile){
    $characters -> $charFile = json_decode(file_get_contents('../../data/json/story/characters/'.$charFile), true);
}

$dataFiles = (object)[]; 
$dh = opendir('../../data/json/data');
while($file = readdir($dh)) {
    if ($file == '.' || $file == '..') { 
        continue; 
    } 
    $dataFiles -> $file = json_decode(file_get_contents('../../data/json/data/' . $file));
}
$globalName = "global-vars.json";
$dataFiles -> $globalName = json_decode(file_get_contents('../../data/json/story/global-vars.json'));

$sceneDefaults = json_decode(file_get_contents('data/scene-defaults.json'), true);
?>
<?php include 'quintus-lib.php'; ?>
<script>
    var GDATA = {
        event: <?php echo json_encode($event);?>,
        eventPointer:{
            type: '<?php echo $type; ?>',
            scene: '<?php echo $scene; ?>',
            event: '<?php echo $name; ?>'
        },
        musicFileNames: <?php echo json_encode($music);?>,
        soundFileNames:<?php echo json_encode($sounds);?>,
        mapFileNames: <?php echo json_encode($map_obj);?>,
        characterFiles: <?php echo json_encode($characters);?>,
        dataFiles: <?php echo json_encode($dataFiles); ?>,
        imageAssets: <?php echo json_encode($images); ?>,
        spritesImgs: <?php echo json_encode($sprites_imgs); ?>,
        animsImgs: <?php echo json_encode($anims_imgs); ?>,
        bgFiles:<?php echo json_encode($bgs); ?>,
        sceneDefaults:<?php echo json_encode($sceneDefaults); ?>
    };
    console.log(GDATA);
    //Makes sure empty object is not converted to array (not sure what is really happening here).
    if(GDATA.event.vrs && Array.isArray(GDATA.event.vrs)) GDATA.event.vrs = {};
    var formatScenes = function(){
        var story = GDATA.dataFiles["scenes-list.json"];
        var flavour = GDATA.dataFiles["flavour-events-list.json"];
        var newScenes = {
            Story:[],
            Flavour:[]
        };
        for(var i=0;i<story.Story.length;i++){
            newScenes["Story"].push(story.Story[i].name);
        }
        var groups = Object.keys(flavour.groups);
        for(var i=0;i<groups.length;i++){
            newScenes["Flavour"].push(groups[i]);
        }

        return newScenes;
    };
    var formatEvents = function(){
        var story = GDATA.dataFiles["scenes-list.json"];
        var flavour = GDATA.dataFiles["flavour-events-list.json"];
        var newEvents = {
            Story:{},
            Flavour:{}
        };
        for(var i=0;i<story.Story.length;i++){
            newEvents.Story[story.Story[i].name] = story.Story[i].events.map(function(itm){return itm.name;});
        }
        var groups = Object.keys(flavour.groups);
        for(var i=0;i<groups.length;i++){
            newEvents.Flavour[groups[i]] = flavour.groups[groups[i]][2];
        }
        return newEvents;
    };
    GDATA.events = formatEvents();
    GDATA.scenes = formatScenes();
</script>
