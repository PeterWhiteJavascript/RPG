<?php
include("php-config.php");
$name = addDashes($_POST['name']);
$scene = addDashes($_POST['scene']);


$file = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);

$file['vrs'] = json_decode($_POST['vrs']);
$file['pages'] = json_decode($_POST['pages']);
//Decode spaces and single quotes
for($i=0;$i<count($file['pages']);$i++){
    $page = $file['pages'][$i];
    $page->name = urldecode($page->name);
    $page->text = urldecode($page->text);
    //Loop through each choice on the page
    foreach($page->choices as $choice){
        $choice->displayText = urldecode($choice->displayText);
        $choice->desc = urldecode($choice->desc);
        $choice->page = urldecode($choice->page);
        //Loop through each cond/effect on each choice
        foreach($choice->groups as $group){
            foreach($group->effects as $effect){
                foreach($effect[1] as $key => $value){
                    $effect[1]->$key = urldecode($effect[1]->$key);
                }
            }
        }
    }
    
}
file_put_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json', json_encode($file, JSON_PRETTY_PRINT));

?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="title"><h1><?php echo $scene; ?></h1></div>
        <div id="title2"><h1><?php echo $name; ?></h1></div>
        <script>
            
        <?php
        if(isset($_POST['testing'])){
        ?>
        var scene = $("#title").text();
        var name = $("#title2").text();
        var form = $('<form action="../../index.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="name" value="'+name+'"></form>');
        $("body").append(form);
        form.submit();
        <?php
        } else {
        ?>
        var scene = $("#title").text();
        var name = $("#title2").text();
        var form = $('<form action="edit-story-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"></form>');
        $("body").append(form);
        form.submit();
        <?php
        }
        ?>
        </script>
    </body>
</html>