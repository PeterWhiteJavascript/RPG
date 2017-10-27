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
            #scene-title{
                font-size:2vw;
                text-align:center;
            }
            #select-character-options{
                width:100%;
                height:92.5%;
                background-color:var(--secondary-color);
            }
            #open-character-file{
                margin:0 auto;
                text-align:center;
                border-bottom:1px solid black;
            }
            #file-select{
                font-size:1.5vw;
                background-color:transparent;
                border:0;
                width:100%;
                border-bottom:1px dashed black;
            }
            #new-file-name{
                font-size:1.5vw;
                width:100%;
                background-color:transparent;
                border:0;
                border-bottom:1px dashed black;
                text-align:center;
            }
            #create-character-file{
                border-bottom:1px solid black;
                
            }
        </style>
    </head>
    <body>
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
                
                $("#back").on("click",function(){
                    $.redirect("index.php");
                });
            });
        </script>
        <div id="wrapper">
            <div id="main-content">
                <div id="scene-title">Select a character file</div>
                <div id="select-character-options">
                    <div class="main-menu-cont">
                        <div id="open-character-file">
                            <select id="file-select">
                                <?php
                                forEach($files as $file){
                                    echo '<option value="'.$file.'">'.$file.'</option>';
                                }
                                ?>
                            </select>
                            <div id="load-file" class="menu-button">Load</div>
                            <div id="delete-file" class="menu-button">Delete</div>
                        </div>
                        <div id="create-character-file">
                            <input id="new-file-name" value="" placeholder="New File Name">
                            <div id="create-new-file" class="menu-button">Create New File</div>
                        </div>
                        <div id="back" class="menu-button">Back</div>
                    </div>
                </div>
            </div>
        </div>
        
        
    <body>
</html>