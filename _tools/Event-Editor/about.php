<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>About</title>
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
            #footer:hover{
                background-color:#F5f5f5;
            }
            .about-menu-cont{
                width:100%;
                height:87.5%;
                display:inline-block;
                background-color:var(--secondary-color);
                font-size:28px;
                padding:100px;
                overflow-y:scroll;
            }
            p{
                line-height:50px;
            }
            #credits-cont{
                width:80%;
                height:auto;
                text-align:center;
                background-color:lightgrey;
                border-radius:5px;
                margin:auto;
                
            }
            #credits-title{
                font-weight:bold;
                text-decoration:underline;
                padding:10px;
            }
            .credit{
                font-size:22px;
                width:100%;
                height:50px;
                padding-left:20px;
                padding-right:20px;
                background:lightslategray;
                padding-top:15px;
            }
            .credit:nth-of-type(2n){
                background:lightgrey;
            }
            .title{
                float:left;
            }
            .name{
                float:right;
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
                <div id="scene-title"><div>About</div></div>
                <div class="about-menu-cont">
                    <p>Path of Ascension is a turn-based RPG with a focus on story elements. The player makes many decisions that affect later events.</p>
                    <div class="menu-divider"></div>
                    <p>The first commit to GitHub was on October 10, 2016 under the code name "Greece Lightning".</p>
                    <div class="menu-divider"></div>
                    <p><a href="https://github.com/PeterWhiteJavascript/RPG" target="_blank">Path of Ascension on GitHub</a></p>
                    <p><a href="http://rpg.nebtown.info/" target="_blank">Official Website</a></p>
                    <div class="menu-divider"></div>
                    <div id="credits-cont">
                        <p id="credits-title">Credits</p>
                        <div class="credit"><div class="title">Director/Designer/Artist</div><div class="name">Bayden</div></div>
                        <div class="credit"><div class="title">Programmer</div><div class="name">Peter</div></div>
                        <div class="credit"><div class="title">Programmer</div><div class="name">Ben</div></div>
                        <div class="credit"><div class="title">World Designer</div><div class="name">Rachel</div></div>
                        <div class="credit"><div class="title">Writer</div><div class="name">Ryn</div></div>
                        <div class="credit"><div class="title">Writer</div><div class="name">Kyla</div></div>
                        <div class="credit"><div class="title">Writer</div><div class="name">Christian</div></div>
                        <div class="credit"><div class="title">Musician/Sound Designer</div><div class="name">Jared</div></div>
                    </div>
                    
                </div>
                <div id="footer">Go Back</div>
            </div>
        </div>        
    </body>
</html>
