<?php
include("php-config.php");
$name = "";
$scene = addDashes($_POST["scene"]);
$type = $_POST['type'];
$event = [];
$desc = "";
$kind = "story";
//Check if name is set, otherwise it's a new event
if(isset($_POST['name'])){
    $name = addDashes($_POST["name"]);
    $event = json_decode(file_get_contents('../../data/json/story/events/'.$type.'/'.$scene.'/'.$name.'.json'), true);
    $desc = $event['desc'];
    $kind = $event['kind'];
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create an Event</title>
    </head>
    <body>
        <div id="name"><?php echo $name; ?></div>
        <div id="scene"><?php echo $scene; ?></div>
        <div id="type"><?php echo $type; ?></div>
        <?php
        //If we're editing, go to the next page
        if(isset($_POST['name'])&&!isset($_POST['copying'])){
        ?>
        <div id="kind"><?php echo $event['kind']; ?></div>
            <script>
            var form = $('<form action="edit-event.php" method="post"></form>');
            form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
            form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
            form.append('<input type="text" name="type" value="'+$("#type").text()+'">');
            form.append('<input type="text" name="event-type" value="'+$("#kind").text()+'">');
            form.append('<input type="hidden" name="origName" value="'+$("#name").text()+'">');
            $("body").append(form);
            form.submit();
            </script>
            <?php
        }
        ?>
        <div id="wrapper">
            <div id="title"><h1><?php echo $scene; ?></h1></div>
            <div id="content">
                <div class="menu middle">
                    <form action="edit-event.php" method="post">
                        Event Name<br>
                        <input type="text" name="name" value="<?php echo $name; ?>" placeholder="Event Name"><br>
                        Description<br>
                        <textarea type="text" name="desc" placeholder="Description"><?php echo $desc; ?></textarea><br>
                        <?php
                        if(isset($_POST['copying'])){
                            ?>
                            <select name="event-type" hidden>
                                <option <?php if($kind=="story"){echo "selected";}?> value="story">Story</option>
                                <option <?php if($kind=="battleScene"){echo "selected";}?> value="battleScene">Battle Scene</option>
                                <option <?php if($kind=="battle"){echo "selected";}?> value="battle">Battle</option>
                            </select>
                            <input type="hidden" name="copying" value="<?php echo $name; ?>">
                            <?php
                        } else {   
                            ?>
                            Event Type<br>
                            <select name="event-type">
                                <option <?php if($kind=="story"){echo "selected";}?> value="story">Story</option>
                                <option <?php if($kind=="battleScene"){echo "selected";}?> value="battleScene">Battle Scene</option>
                                <option <?php if($kind=="battle"){echo "selected";}?> value="battle">Battle</option>
                            </select>
                            <?php
                        }
                        ?>
                        <input type="hidden" name="scene" value="<?php echo $scene; ?>">
                        <input type="hidden" name="type" value="<?php echo $type; ?>">
                        <input type="submit" value="Create/Edit Scene">
                    </form>
                </div>
                <div id="footer"><a><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/create-event.js"></script>
    </body>
</html>