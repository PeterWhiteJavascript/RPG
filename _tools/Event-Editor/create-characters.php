<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <?php include 'GameDataLoader.php'; ?>
        <title>Create Characters</title>
        <link rel="stylesheet" type="text/css" href="css/create-characters.css">
        <link rel="stylesheet" type="text/css" href="css/new-style.css">
    </head>
    <body>
        <div id="editor-content">
            <div id="group-menu" class="menu-box">
                <div id="add-new-char-group" class="category-button" >Add Group</div>
                <p class="title-text">Character Groups</p>
                <div id="character-groups"></div>
            </div>
            <div id="char-box-left" class="menu-box">
                <p class="title-text">Char Stats</p>
                <div class="UIC-group-item">
                    <div id="char-props" class="UIC-group-item-props">
                        <span class='quarter-width'>Handle</span><input class='UIC-prop three-quarter-width' value='' type='text'>
                        <span class='quarter-width'>Name</span><input class='UIC-prop half-width' value='' type='text'><span id="button-random-name" class='UIC-button quarter-width'>Random Name</span>
                        <span class='quarter-width'>Level Min</span><input class='UIC-prop three-quarter-width' value='1' type='number'  min='1'>
                        <span class='quarter-width'>Level Max</span><input class='UIC-prop three-quarter-width' value='1' type='number'  min='1'>
                        <div id="random-char-props" class="UIC-hud-buttons hud-buttons">
                            <div class="UIC-hud-button"><span>Random</span></div>
                        </div>
                        <span class='quarter-width'>Gender</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Nationality</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Char Class</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Promotion</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Faction</span><select class='UIC-prop three-quarter-width'></select>
                    </div>
                </div>
                <p class="title-text">Equipment</p>
                <div class="UIC-hud-buttons hud-buttons">
                    <div id="no-equipment" class="UIC-hud-button"><span>None</span></div>
                    <div id="default-equipment" class="UIC-hud-button"><span>Default</span></div>
                    <div id="random-equipment" class="UIC-hud-button"><span>Full Rand</span></div>
                </div>
                <div class="UIC-group-item">
                    <div id="equipment-props" class="UIC-group-item-props">
                        <span class="sub-title-text">Right Hand</span>
                        <span class='quarter-width'>Gear</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Material</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Quality</span><select class='UIC-prop three-quarter-width'></select>
                        
                        <span class="sub-title-text">Left Hand</span>
                        <span class='quarter-width'>Gear</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Material</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Quality</span><select class='UIC-prop three-quarter-width'></select>
                        
                        <span class="sub-title-text">Armour</span>
                        <span class='quarter-width'>Gear</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Material</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Quality</span><select class='UIC-prop three-quarter-width'></select>
                        
                        <span class="sub-title-text">Footwear</span>
                        <span class='quarter-width'>Gear</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Material</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Quality</span><select class='UIC-prop three-quarter-width'></select>
                        
                        <span class="sub-title-text">Accessory</span>
                        <span class='quarter-width'>Gear</span><select class='UIC-prop three-quarter-width'></select>
                    </div>
                </div>
            </div>
            <div id="char-box-right" class="menu-box">
                <p class="title-text">Techniques</p>
                <div class="UIC-hud-buttons hud-buttons">
                    <div id="default-techniques" class="UIC-hud-button"><span>Default</span></div>
                    <div id="random-techniques" class="UIC-hud-button"><span>Random</span></div>
                </div>
                <div class="UIC-group-item">
                    <div id="technique-props" class="UIC-group-item-props">
                        <span class='quarter-width'>Rank 1</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Rank 2</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Rank 3</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Rank 4</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Rank 5</span><select class='UIC-prop three-quarter-width'></select>
                        <span class='quarter-width'>Rank 6</span><select class='UIC-prop three-quarter-width'></select>
                    </div>
                </div>
                
                <p class="title-text">Base Stats</p>
                <div class="UIC-hud-buttons hud-buttons">
                    <div id="using-base-stats" class="UIC-hud-button"><span>Using Rand</span></div>
                    <div id="random-base-stats" class="UIC-hud-button"><span>Randomize</span></div>
                    <select class='quarter-width'><option>Random</option><option>Specialized</option></select>
                    <select class='quarter-width'><option>Low</option><option>Medium</option><option>High</option><option>Maxed</option></select>
                </div>
                
                <div class="UIC-group-item">
                    <div id="base-stat-props" class="UIC-group-item-props">
                        <span class='sixth-width'>STR</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        <span class='sixth-width'>END</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        <span class='sixth-width'>DEX</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        
                        <span class='sixth-width'>WSK</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        <span class='sixth-width'>RFL</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        <span class='sixth-width'>INI</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        
                        <span class='sixth-width'>ENR</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        <span class='sixth-width'>SKL</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        <span class='sixth-width'>EFF</span><input class='UIC-prop sixth-width' type='number'  min='1'>
                        
                    </div>
                </div>
                <p class="title-text">Talents</p>
                <div class="UIC-group-item">
                    <div id="talent-props" class="UIC-group-item-props">
                        <div>
                            <div class='minimizer'>
                                <span class='quarter-width'>Group</span><span class='three-quarter-width'></span>
                            </div>
                            <p class='full-width minimizable'></p>
                        </div>
                        <div>
                            <div class='minimizer'>
                                <span class='quarter-width'>Class 1</span><span class='three-quarter-width'></span>
                            </div>
                            <p class='full-width minimizable'></p>
                        </div>
                        <div>
                            <div class='minimizer'>
                                <span class='quarter-width'>Class 2</span><span class='three-quarter-width'></span>
                            </div>
                            <p class='full-width minimizable'></p>
                        </div>
                        <div>
                            <div class='minimizer'>
                                <span class='quarter-width'>Class 3</span><span class='three-quarter-width'></span>
                            </div>
                            <p class='full-width minimizable'></p>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
        <script src="js/create-characters.js"></script>
        <script src="../../js/character-generator.js"></script>
    </body>
</html>