<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Edit Variables</title>
        <link rel="stylesheet" href="css/edit-vars.css">
    </head>
    <body data-scene="<?= isset($_GET['scene']) ? $_GET['scene'] : ''?>">=
        <div id="wrapper">
            <div id="main-content">
                <div id="scene-title"></div>
                <div id="vars-list">
                    <div class="var-title">Variables</div>
                    
                </div>
                <div id="ref-cont">
                    <div class="ref-title">References</div>
                </div>
                <div id="menu-cont">
                    
                </div>
            </div>
        </div>
        <script src="js/common.js"></script>
        <script src="js/edit-variables.js"></script>
    </body>
</html>
