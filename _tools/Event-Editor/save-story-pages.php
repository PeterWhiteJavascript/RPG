<?php
include("php-config.php");
$name = addDashes($_POST['name']);
$scene = addDashes($_POST['scene']);
$type = $_POST['type'];

$file = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);

$file['vrs'] = json_decode($_POST['vrs']);
foreach($file['vrs'] as $key=>$value){
    $file['vrs']->$key = urldecode($value);
}
$file['pages'] = json_decode($_POST['pages']);
//Decode spaces and single quotes
for($i=0;$i<count($file['pages']);$i++){
    $page = $file['pages'][$i];
    $page->name = urldecode($page->name);
    $page->text = urldecode($page->text);
    foreach($page->onload as $group){
        foreach($group->conds as $cond){
            foreach($cond[1] as $key => $value){
                $cond[1]->$key = urldecode($value);
            }
        }
        foreach($group->effects as $effect){
            foreach($effect[1] as $key => $value){
                $effect[1]->$key = urldecode($value);
            }
        }
    }
    //Loop through each choice on the page
    foreach($page->choices as $choice){
        $choice->displayText = urldecode($choice->displayText);
        $choice->desc = urldecode($choice->desc);
        $choice->page = urldecode($choice->page);
        //Loop through each cond/effect on each choice
        foreach($choice->groups as $group){
            foreach($group->conds as $cond){
                foreach($cond[1] as $key => $value){
                    $cond[1]->$key = urldecode($value);
                }
            }
            foreach($group->effects as $effect){
                foreach($effect[1] as $key => $value){
                    $effect[1]->$key = urldecode($value);
                }
            }
        }
    }
    foreach($page->modules as $module){
        foreach($module as $key => $value){
            $module[$key]->text = urldecode($value->text);
        }
    }
    foreach($page->modulesVars as $moduleVar){
        foreach($moduleVar as $key => $value){
            $moduleVar[$key]->text = urldecode($value->text);
            if(isset($moduleVar[$key]->checks)){
                foreach($moduleVar[$key]->checks as $key3=>$value3){
                    $moduleVar[$key]->checks[$key3][2] = urldecode($value3[2]);
                    $moduleVar[$key]->checks[$key3][3] = urldecode($value3[3]);
                }
            }
            
        }
    }
}
file_put_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json', json_encode($file, JSON_PRETTY_PRINT));

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="title"><h1><?php echo $scene; ?></h1></div>
        <div id="title2"><h1><?php echo $name; ?></h1></div>
        <div id="title3"><h1><?php echo $type; ?></h1></div>
        <script>
            
        <?php
        if(isset($_POST['testing'])){
        ?>
        var scene = $("#title").text();
        var name = $("#title2").text();
        var type = $("#title3").text();
        var form = $('<form action="../../index.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="name" value="'+name+'"><input type="text" name="type" value="'+type+'"></form>');
        $("body").append(form);
        form.submit();
        <?php
        } else {
        ?>
        var scene = $("#title").text();
        var name = $("#title2").text();
        var type = $("#title3").text();
        var form = $('<form action="edit-story-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
        $("body").append(form);
        form.submit();
        <?php
        }
        ?>
        </script>
    </body>
</html>