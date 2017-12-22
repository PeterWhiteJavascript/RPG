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
            #left-cont{
                left:10%;
                width:33%;
                position:absolute;
                top:20%;
            }
            #right-cont{
                right:10%;
                width:33%;
                position:absolute;
                top:20%;
            }
            
            
            #select-character-options{
                width:100%;
                height:92.5%;
                background-color:var(--menu-background-color);
                color:var(--menu-text-color);
            }
            #open-character-file{
                margin:0 auto;
                text-align:center;
                border-bottom:1px solid black;
            }
            #open-character-file > *, #create-character-file > *{
                height:50px;
            }
            #file-select{
                border:0;
                width:100%;
                background-color:var(--menu-background-color);
                color:var(--menu-text-color);
                border-bottom:1px dashed black;
                height:50px;
                font-size:28px;
            }
            
            #new-file-name{
                width:100%;
                border:0;
                font-size:28px;
                background-color:var(--menu-background-color);
                color:var(--menu-text-color);
                border-bottom:1px dashed black;
                text-align:center;
            }
            #create-character-file{
                border-top:1px solid black;
                border-bottom:1px solid black;
            }
            .menu-title{
                text-align:center;
                height:50px;
                background: linear-gradient(to bottom right, var(--heading-gradient-one), var(--heading-gradient-two));
                user-select:none;
            }
            .menu-title > div{
                font-size:30px;
                height:50px;
                color:var(--heading-text-color);
                font-family: var(--heading-font-family) !important;
                padding:7.5px;
            }
            
        </style>
    </head>
    <body>
        <script>
            $(function(){
                $("#load-file").click(function(){
                    $.redirect('create-characters.php', {filename:$("#file-select").val()});
                });
                $("#delete-file").click(function(){
                    var sure = confirm("Are you sure you want to delete "+$("#file-select").val()+"?");
                    if(sure){
                        $.ajax({
                            type:'POST',
                            url:'delete-character-file.php',
                            data:{filename:$("#file-select").val()},
                            dataType:'json'
                        });
                        $("#file-select option[value='"+$("#file-select").val()+"']").remove();
                    }
                });
                $("#create-new-file").click(function(){
                    if($("#new-file-name").val().length){
                        $.ajax({
                            type:'POST',
                            url:'create-character-file.php',
                            data:{filename:$("#new-file-name").val()},
                            dataType:'json'
                        })
                        .done(function(data){$.redirect('create-characters.php', {filename:$("#new-file-name").val()});})
                        .fail(function(data){alert("This file already exists!");});
                        
                    } else {
                        alert("Please fill out a name.");
                    }
                });
                $("#back").click(function(){
                    $.redirect("index.php");
                });
            });
        </script>
        <div id="wrapper">
            <div id="main-content">
                <div id="scene-title"><div>Select a character file</div></div>
                <div class="main-menu-background">
                    <div id="left-cont">
                        <div class="menu-title"><div>Load a file</div></div>
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
                    <div id="right-cont">
                        <div class="menu-title"><div>Create a file</div></div>
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