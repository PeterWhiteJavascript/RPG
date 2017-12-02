<!DOCTYPE html>
<html>
    <head>
        <!--Users should be able to set some options here that are saved in a cookie-->
        <?php include 'config.php';?>
        <title>Set Options</title>
        <style>
            .desc-text{
                width:50%;
                font-size:1.2vw;
                display:inline-block;
                color:var(--desc-text-color);
            }
            input{
                width:50%;
                font-size:1.5vw;
                display:inline-block;
                color:var(--form-elm-text-color);
                background-color:var(--form-elm-background-color);
            }
            #main-bg{
                width:100%;
                height:100%;
                display:inline-block;
                background-color:var(--background-color);
            }
            #main-menu-cont{
                position:absolute;
                bottom:0px;
                height:150px;
                width:100%;
                text-align:center;
                background-color:var(--menu-background-color);
            }
            .bar-button{
                color:var(--menu-text-color);
            }
            .color-col{
                display:inline-block;
                vertical-align:top;
                width:25%;
                color:var(--menu-text-color);
            }
            .color-col *{
                height:30px;
                line-height:30px;
            }
        </style>
    </head>
    <body>
        <script>
            $(function(){
                function useCookies(){
                    var cont = $("#main-menu-cont");
                    cont.empty();
                    var group = $("<div class='color-col'></div>");
                    var numCol = 5;
                    for(var i=0;i<COOKIECOLORS.length;i++){
                        if(i>0&&i%numCol===0){
                            cont.append(group);
                            group = $("<div class='color-col'></div>");
                        }
                        var id = COOKIECOLORS[i][0];
                        var text = COOKIECOLORS[i][1];
                        var color = Cookies.get(id);
                        $("body").get(0).style.setProperty("--"+id, color);
                        $(group).append("<div class='color-cont'><span class='desc-text'>"+text+"</span><input class='color-value' id="+id+" value="+color+"></div>");
                    }
                    cont.append(group);
                }
                useCookies();
                
                $("#save").click(function(){
                    for(var i=0;i<COOKIECOLORS.length;i++){
                        var id = COOKIECOLORS[i][0];
                        var value = $("#"+id).val();
                        Cookies.set(id,value,{expires:365});
                    }
                    useCookies();
                });
                $("#back").click(function(){
                    window.location = "index.php";
                });
                $(document).on("change",".color-value",function(){
                    $("#save").trigger("click");
                });
            });
        </script>
        <div id="wrapper">
            <div id="main-bg">
                <div id="top-bar">
                    <div class="top-bar-itm">
                        <div id="save" class="bar-button">Save</div>
                    </div>
                    <div class="top-bar-itm">
                        <div id="back" class="bar-button">Back</div>
                    </div>
                </div>
                <div id="main-menu-cont"></div>
            </div>
        </div>        
    </body>
</html>
