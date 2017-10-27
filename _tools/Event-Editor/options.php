<!DOCTYPE html>
<html>
    <head>
        <!--Users should be able to set some options here that are saved in a cookie-->
        <?php include 'config.php';?>
        <title>Set Options</title>
        <style>
            #main-bg{
                width:100%;
                height:92.5%;
                background-color:var(--secondary-color);
                display:inline-block;
            }
            span{
                width:50%;
                font-size:1.5vw;
                display:inline-block;
            }
            input{
                width:50%;
                font-size:1.5vw;
                display:inline-block;
            }
        </style>
    </head>
    <body>
        <script>
            $(function(){ 
                $("#main-color").val(Cookies.get("main-color"));
                $("#secondary-color").val(Cookies.get("secondary-color"));
                function useCookies(main,second){
                    $("body").get(0).style.setProperty("--main-color", main);
                    $("body").get(0).style.setProperty("--secondary-color", second);
                }
                $("#save").click(function(){
                    Cookies.set("main-color",$("#main-color").val(),{expires:365});
                    Cookies.set("secondary-color",$("#secondary-color").val(),{expires:365});
                    useCookies($("#main-color").val(),$("#secondary-color").val());
                });
                $("#back-to-main").click(function(){
                    window.location = "index.php";
                });
            });
        </script>
        <div id="wrapper">
            <div id="main-content">
                <div id="scene-title"><div>Options</div></div>
                <div id="main-bg">
                    
                </div>
                <div class="main-menu-cont">
                    <div id="main-color-cont">
                        <span>Main Colour</span>
                        <input id="main-color" placeholder="Main Colour" value="">
                    </div>
                    <div id="secondary-color-cont">
                        <span>Secondary Colour</span>
                        <input id="secondary-color" placeholder="Secondary Colour" value="">
                    </div>
                    <div id="save" class="menu-button">Save</div>
                    <div id="back-to-main" class="menu-button">Back</div>
                </div>
            </div>
        </div>        
    </body>
</html>
