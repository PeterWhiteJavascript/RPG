<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create Techniques</title>
        <link rel="stylesheet" type="text/css" href="css/new-style.css">
        <link rel="stylesheet" type="text/css" href="css/techniques-editor.css">
        <script src="js/techniques-editor.js"></script>
    </head>
    <body>
        <div id="editor-content">
            <div id="left-cont">
                <div class="tech-group Active">
                    <div class='UIC-hud-buttons'><div id='add-active-tech' class='UIC-hud-button'><span>Add Active Technique</span></div></div>
                    <p class="title-text minimizer">Active</p>
                    <div id="active-techniques-cont" class="minimizable"></div>
                </div>
                <div class="tech-group Passive">
                    <div class='UIC-hud-buttons'><div id='add-passive-tech'class='UIC-hud-button'><span>Add Passive Technique</span></div></div>
                    <p class="title-text minimizer">Passive</p>
                    <div id="passive-techniques-cont" class="minimizable"></div>
                </div>
                <div class="tech-group CharClass">
                    <p class="title-text minimizer">Char Classes</p>
                    <div id="char-classes-cont">

                    </div>
                </div>
                
            </div>
            <div id="mid-cont">
                
            </div>
            <div id="right-cont">
                
            </div>
        </div>
    </body>
</html>