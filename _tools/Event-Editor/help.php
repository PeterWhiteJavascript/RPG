<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Get Help</title>
        <style>
            #footer{
                width:100%;
                height:5%;
                text-align: center;
                z-index:100;
                font-size:1.5vw;
                display:inline-block;
                cursor:pointer;
                background-color:var(--main-color);
                padding:0.5%;
            }
            #footer{
                background-color:var(--button-background-color);
            }
            #footer:hover{
                background-color:var(--button-hover-color);
            }
            #help-cont{
                width:100%;
                height:87.5%;
                display:inline-block;
                background-color:var(--background-color);
                font-size:36px;
                padding:100px;
                overflow-y:auto;
            }
            p{
                text-align:center;
            }
        </style>
    </head>
    <body>
        
        <script>
            $(function(){
                $("#footer").on("click",function(){window.location = "index.php";});
            });
        </script>
        <div id="wrapper">
            <div id="main-content">
                <div id="scene-title"><div>Help</div></div>
                <div id="help-cont">
                    <p>Click to download files.</p>
                    <div class="menu-divider"></div>
                    <a href="docs/Story Scene Modules.rtf" download>Story Scene Modules</a>
                </div>
                <div id="footer">Go Back</div>
            </div>
        </div>        
    </body>
</html>
