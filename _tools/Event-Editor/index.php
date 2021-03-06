<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Greece Lightning Event Editing Tool</title>
    </head>
    <body>
        <script>
            $(function(){
                $(document).on("click",".menu-button",function(){
                    window.location = $(this).attr("id")+".php";
                });
            });
        </script>
        <div id="wrapper">
            <div id="main-content">
                <div id="scene-title"><div>Path of Ascension Editor</div></div>
                <div class="main-menu-background">
                    <div class="main-menu-cont">
                        <div class="menu-divider"></div>
                        <div class="menu-divider"></div>
                        <div id="load" class="menu-button">Load Story Scenes</div>
                        <div id="show-flavour" class="menu-button">Load Flavour</div>
                        <div id="edit-vars" class="menu-button">Edit Global Vars</div>
                        <div id="select-characters-file" class="menu-button">Create Characters</div>
                        <div id="gear-editor" class="menu-button">Edit Equipment</div>
                        <div id="techniques-editor" class="menu-button">Edit Techniques</div>
                        <div id="gear-techniques-editor" class="menu-button">Edit Gear Techniques</div>
                        <div id="edit-jobs" class="menu-button">Edit Jobs Data</div>
                        <div id="options" class="menu-button">Options</div>
                        <div id="help" class="menu-button">Help</div>
                        <div id="about" class="menu-button">About</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
