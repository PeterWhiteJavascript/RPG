<?php
include("php-config.php");

if(isset($_GET['file-name'])){
    $filename = $_GET['file-name'];
} else {
    $filename = $_POST['file-name'];
}

$file = file_get_contents('../../data/json/story/characters/'.$filename);

$charGen = file_get_contents('../../data/json/data/character-generation.json');

$techniques = file_get_contents('../../data/json/data/skills.json');

$equipment = file_get_contents('../../data/json/data/equipment.json');
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create Characters</title>
        <link rel="stylesheet" type="text/css" href="css/create-characters.css">
        
    </head>
    <body>
        <div id="file-name" hidden><?php echo $filename?></div>
        <div id="file-info" hidden><?php echo $file?></div>
        <div id="char-gen" hidden><?php echo $charGen?></div>
        <div id="technique-info" hidden><?php echo $techniques?></div>
        <div id="equipment" hidden><?php echo $equipment?></div>
        <div id="editor-content">
            <div id="top-bar">
                <ul>
                    <li class="top-bar-btn"><div id="menu-create-group" class="menu-button btn btn-default">Create Group</div></li>
                    <li class="top-bar-btn"><div class="menu-button btn btn-default">-</div></li>
                    <li class="top-bar-btn"><div class="menu-button btn btn-default">-</div></li>
                    <li class="top-bar-btn"><div id="menu-save-file" class="menu-button btn btn-default" filename="<?php echo $filename?>">Save File</div></li>
                    <li class="top-bar-btn"><div class="menu-button btn btn-default">-</div></li>
                    <li class="top-bar-btn"><div class="menu-button btn btn-default">-</div></li>
                    <li class="top-bar-btn"><a href="select-characters-file.php"><div class="menu-button btn btn-default">Go Back</div></a></li>
                </ul>
            </div>
            <div id="group-menu" class="menu-box">
                <div class="dark-gradient char-title">Characters</div>
            </div>
            <div id="char-box-left" class="menu-box">
                <div class="char-stat-title medium-gradient"><p>Char Stats</p></div>
                <div class="stats-cont">
                    <div class="prop-cont">
                        <div class="stat-name"><p>Handle</p></div>
                        <input class="char-prop handle fifty-width" value="" placeholder="Input a handle.">
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Name</p></div>
                        <input class="char-prop name fifty-width" value="" placeholder="Leave blank for random name.">
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Level Min</p></div>
                        <input class="char-prop levelmin fifty-width" type="number" min=1 value=1>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Level Max</p></div>
                        <input class="char-prop levelmax fifty-width" type="number" min=1 value=1>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Gender</p></div>
                        <select class="char-prop gender fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Nationality</p></div>
                        <select class="char-prop nationality fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Char Class</p></div>
                        <select class="char-prop charClass fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Team</p></div>
                        <select class="char-prop team fifty-width"></select>
                    </div>
                </div>
                
                <div class="char-stat-title medium-gradient"><p>Equipment</p></div>
                <div class="equipment-cont">
                    <div class="equipment-options">
                        <div id="default-equipment-button" class="btn btn-quarter fifty-width"><p>Default</p></div>
                        <!--<div id="rand-equipment-button" class="btn btn-quarter third-width"><p>Rand</p></div>-->
                        <div id="full-rand-equipment-button" class="btn btn-quarter fifty-width"><p>Full Rand</p></div>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name-wide"><p>Right Hand</p></div>
                        <select class="char-prop right-hand-quality third-width left-float"></select>
                        <select class="char-prop right-hand-gear third-width left-float"></select>
                        <select class="char-prop right-hand-material third-width left-float"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name-wide"><p>Left Hand</p></div>
                        <select class="char-prop left-hand-quality third-width left-float"></select>
                        <select class="char-prop left-hand-gear third-width left-float"></select>
                        <select class="char-prop left-hand-material third-width left-float"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name-wide"><p>Armour</p></div>
                        <select class="char-prop armour-quality third-width left-float"></select>
                        <select class="char-prop armour-gear third-width left-float"></select>
                        <select class="char-prop armour-material third-width left-float"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name-wide"><p>Footwear</p></div>
                        <select class="char-prop footwear-quality third-width left-float"></select>
                        <select class="char-prop footwear-gear third-width left-float"></select>
                        <select class="char-prop footwear-material third-width left-float"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Accessory</p></div>
                        <select class="char-prop accessory fifty-width"></select>
                    </div>
                </div>
                
            </div>
            <div id="char-box-right" class="menu-box">
                
                <div class="char-stat-title medium-gradient"><p>Techniques</p></div>
                <div class="techniques-cont">
                    <div class="technique-options">
                        <div id="default-technique-button" class="btn btn-quarter fifty-width"><p>Default</p></div>
                        <div id="rand-technique-button" class="btn btn-quarter fifty-width"><p>Random</p></div>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Rank 1</p></div>
                        <select class="char-prop tech-1 fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Rank 2</p></div>
                        <select class="char-prop tech-2 fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Rank 3</p></div>
                        <select class="char-prop tech-3 fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Rank 4</p></div>
                        <select class="char-prop tech-4 fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Rank 5</p></div>
                        <select class="char-prop tech-5 fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Rank 6</p></div>
                        <select class="char-prop tech-6 fifty-width"></select>
                    </div>
                </div>
                <div class="char-stat-title medium-gradient"><p>Base Stats</p></div>
                <div class="base-stats-cont">
                    <div class="base-stats-options">
                        <div id="use-rand" class="btn btn-quarter twenty-five-width">
                            <p>Using Random</p>
                        </div>
                        <div class="spacer"></div>
                        <div id="randomize-base-stats" class="btn btn-quarter twenty-five-width">
                            <p>Randomize</p>
                        </div>
                        <select id="rand-base-stats" class="twenty-five-width">
                            <option>Random</option>
                            <option>Specialized</option>
                        </select>
                        <select id="value-rand-base-stats" class="twenty-five-width">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Maxed</option>
                        </select>
                    </div>
                    
                    <ul class="base-stats">
                        <li class="third-width">
                            <div class="stat-name"><p>STR</p></div>
                            <input class="base-stat str" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>END</p></div>
                            <input class="base-stat end" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>DEX</p></div>
                            <input class="base-stat dex" type="number" min=1 value=1>
                        </li>
                        
                        <li class="third-width">
                            <div class="stat-name"><p>WSK</p></div>
                            <input class="base-stat wsk" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>RFL</p></div>
                            <input class="base-stat rfl" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>INI</p></div>
                            <input class="base-stat ini" type="number" min=1 value=1>
                        </li>
                        
                        <li class="third-width">
                            <div class="stat-name"><p>ENR</p></div>
                            <input class="base-stat enr" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>SKL</p></div>
                            <input class="base-stat skl" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>EFF</p></div>
                            <input class="base-stat eff" type="number" min=1 value=1>
                        </li>
                    </ul>
                </div>
                <!--
                <div class="char-stat-title medium-gradient"><p>Full Stats</p></div>
                <div class="full-stats-cont">
                    To see full stats, fill out level, char class, all equipment, and base stats.
                    <ul class="full-stats">
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Max HP.</p></div>
                            <div class="full-stat max-hp fifty-width"><p>40</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Max TP.</p></div>
                            <div class="full-stat max-tp fifty-width"><p>12</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Attack</p></div>
                            <div class="full-stat attack fifty-width"><p>41</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Defence</p></div>
                            <div class="full-stat defence fifty-width"><p>41</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Accuracy</p></div>
                            <div class="full-stat accuracy fifty-width"><p>90</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Critical Chance</p></div>
                            <div class="full-stat crit-chance fifty-width"><p>1</p></div>
                        </li>
                        
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Pain Tolerance</p></div>
                            <div class="full-stat pain-tolerance fifty-width"><p>11</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Total Weight</p></div>
                            <div class="full-stat total-weight fifty-width"><p>100</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Attack Speed</p></div>
                            <div class="full-stat atk-speed fifty-width"><p>16</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Range</p></div>
                            <div class="full-stat range fifty-width"><p>1</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Enc. Threshold</p></div>
                            <div class="full-stat enc-threshold fifty-width"><p>1</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Enc. Penalty</p></div>
                            <div class="full-stat enc-penalty fifty-width"><p>1</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>ZOC</p></div>
                            <div class="full-stat zoc fifty-width"><p>0</p></div>
                        </li>
                        <li class="fifty-width">
                            <div class="stat-name fifty-width"><p>Move</p></div>
                            <div class="full-stat move fifty-width"><p>1</p></div>
                        </li>
                    </ul>
                </div>
                -->
            </div>
            
        </div>
        <script src="js/create-characters.js"></script>
    </body>
</html>