<?php
$files = array_diff(scandir('../../data/json/story/characters'), array('..', '.'));
if(isset($_GET['err'])){
    $err = $_GET['err'];
    echo $err;
};


?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Select Characters</title>
        <style>
            #new-file-name{
                width:200px;
            }
        </style>
    </head>
    <body>
        <div id="title"><h1>Select a character file</h1></div>
        <select id="file-select">
            <?php
            forEach($files as $file){
                echo '<option value="'.$file.'">'.$file.'</option>';
            }
            ?>
        </select>
        <div id="load-file" class="btn btn-default">Load</div>
        <div id="delete-file" class="btn btn-default">Delete</div>
        
        <input id="new-file-name" value="" placeholder="New File Name">
        <div id="create-new-file" class="btn btn-default">Create New File</div>
        <script>
            $(function(){
                $(document).on("click","#load-file",function(){
                    var form = $('<form action="create-characters.php" method="post"></form>');
                    form.append('<input type="text" name="file-name" value="'+$("#file-select").val()+'">');
                    $("body").append(form);
                    form.submit();
                });
                $(document).on("click","#delete-file",function(){
                    var sure = confirm("Are you sure you want to delete "+$("#file-select").val()+"?");
                    if(sure){
                        var form = $('<form action="delete-character-file.php" method="post"></form>');
                        form.append('<input type="text" name="file-name" value="'+$("#file-select").val()+'">');
                        $("body").append(form);
                        form.submit();
                    }
                });
                $(document).on("click","#create-new-file",function(){
                    if($("#new-file-name").val().length){       
                        var form = $('<form action="create-character-file.php" method="post"></form>');
                        form.append('<input type="text" name="file-name" value="'+$("#new-file-name").val()+'">');
                        $("body").append(form);
                        form.submit();
                    } else {
                        alert("Please fill out a name.");
                    }
                });
            });
        </script>
    <body>
</html>