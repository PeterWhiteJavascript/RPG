<?php
include("php-config.php");
$name = addDashes($_POST['name']);
$scene = addDashes($_POST['scene']);
$type = $_POST['type'];

$file = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);

foreach($_POST as $key => $value)
{
    $file[$key] = $value;
}

function checkBool($string){
    $string = strtolower($string);
    return (in_array($string, array("true", "false", "1", "0"/*, "yes", "no"*/), true));
}

function adjustDisabled($obj){
    for($i=0;$i<count($obj);$i++){
        $obj[$i] = intval(urldecode($obj[$i]));
    }
    return $obj;
}
function processValue($value){
    if (is_numeric($value)) {
        return intval(urldecode($value));
    } else if(checkBool($value)) {
        return boolval(urldecode($value));
    } else {
        return urldecode($value);
    }
}
function adjustValues($obj){
    if(!$obj){
        return false;
    }
    for($i=0;$i<count($obj);$i++){
        if(isset($obj[$i]['conds'])){
            for($j=0;$j<count($obj[$i]['conds']);$j++){
                foreach($obj[$i]['conds'][$j][1] as $key => $value){
                    $obj[$i]['conds'][$j][1][$key] = processValue($value);
                }
            }
        } else {
            $obj[$i]['conds'] = array();
        }
        //There should always be an effect set, but still do this because someone might accidentally make a cond without effect at some point.
        if(isset($obj[$i]['effects'])){
            for($j=0;$j<count($obj[$i]['effects']);$j++){
                foreach($obj[$i]['effects'][$j][1] as $key => $value){
                    $obj[$i]['effects'][$j][1][$key] = processValue($value);
                }
            }
        } else {
            $obj[$i]['effects'] = array();
        }
    }
    return $obj;
}
foreach($file['vrs'] as $key => $value){
    $file['vrs'][$key] = processValue($value);
}
$file['disabledChoices'] = adjustDisabled($file['disabledChoices']);
$file['onload'] = adjustValues($file['onload']);
for($k=1;$k<count($file['pageList']);$k++){
    $file[$file['pageList'][$k]]['onload'] = adjustValues($file[$file['pageList'][$k]]['onload']);
    $file[$file['pageList'][$k]]['disabledChoices'] = 
            isset($file[$file['pageList'][$k]]['disabledChoices']) ? 
            adjustDisabled($file[$file['pageList'][$k]]['disabledChoices']) : 
            [];
}
file_put_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json', json_encode($file,JSON_PRETTY_PRINT));

echo json_encode($file);