<?php
include("php-config.php");

if(isset($_GET['file-name'])){
    $filename = $_GET['file-name'];
} else {
    $filename = $_POST['file-name'];
}

$file = file_get_contents('../../data/json/story/characters/'.$filename);

$charGen = file_get_contents('../../data/json/data/character-generation.json');


?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create Characters</title>
        <link rel="stylesheet" type="text/css" href="css/create-characters.css">
        
    </head>
    <body>
        <div id="file-info" hidden><?php echo $file?></div>
        <div id="char-gen" hidden><?php echo $charGen?></div>
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
                        <div class="stat-name"><p>Name</p></div>
                        <div class="rand-name-button btn btn-quarter fifty-width"><p>Rand Name</p></div>
                        <input class="char-prop name full-line" value="">
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Level</p></div>
                        <input class="char-prop level fifty-width" type="number" min=1 value=1>
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
                        <div class="stat-name"><p>Value</p></div>
                        <select class="char-prop value fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Methodology</p></div>
                        <select class="char-prop methodology fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Personality</p></div>
                        <div class="add-personality btn btn-quarter fifty-width">+Personality</div>
                        <div class="char-prop personality full-line">
                            <select class="per-prop fifty-width left-float"></select>
                            <select class="per-name fifty-width left-float"></select>
                        </div>
                    </div>
                    
                    <div class="prop-cont">
                        <div class="stat-name"><p>Loyalty</p></div>
                        <input class="char-prop loyalty fifty-width" type="number" min=1 value=50>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Morale</p></div>
                        <input class="char-prop morale fifty-width" type="number" min=1 value=50>
                    </div>
                </div>
                
                <div class="char-stat-title medium-gradient"><p>Equipment (TO DO)</p></div>
                <div class="equipment-cont">
                    <div class="equipment-options">
                        <div class="default-equipment-button btn btn-quarter twenty-five-width"><p>Default</p></div>
                        <div class="rand-equipment-button btn btn-quarter twenty-five-width"><p>Rand</p></div>
                        <div class="full-rand-equipment-button btn btn-quarter twenty-five-width"><p>Full Rand</p></div>
                        <div class="smart-rand-equipment-button btn btn-quarter twenty-five-width"><p>Smart Rand</p></div>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Right Hand</p></div>
                        <select class="char-prop right-hand fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Left Hand</p></div>
                        <select class="char-prop left-hand fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Body</p></div>
                        <select class="char-prop body fifty-width"></select>
                    </div>
                    <div class="prop-cont">
                        <div class="stat-name"><p>Feet</p></div>
                        <select class="char-prop feet fifty-width"></select>
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
                        <div class="default-equipment-button btn btn-quarter fifty-width"><p>Default</p></div>
                        <div class="full-rand-equipment-button btn btn-quarter twenty-five-width"><p>Full Rand</p></div>
                        <div class="smart-rand-equipment-button btn btn-quarter twenty-five-width"><p>Smart Rand</p></div>
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
                        <div class="low-rand-base-stats-button btn btn-quarter third-width"><p>Low Rand</p></div>
                        <div class="medium-rand-base-stats-button btn btn-quarter third-width"><p>Medium Rand</p></div>
                        <div class="high-rand-base-stats-button btn btn-quarter third-width"><p>High Rand</p></div>
                        <div class="low-special-rand-base-stats-button btn btn-quarter third-width"><p>Low Special</p></div>
                        <div class="medium-special-rand-base-stats-button btn btn-quarter third-width"><p>Medium Special</p></div>
                        <div class="high-special-rand-base-stats-button btn btn-quarter third-width"><p>High Special</p></div>
                        <div class="low-smart-rand-base-stats-button btn btn-quarter third-width"><p>Low Smart</p></div>
                        <div class="medium-smart-rand-base-stats-button btn btn-quarter third-width"><p>Medium Smart</p></div>
                        <div class="high-smart-rand-base-stats-button btn btn-quarter third-width"><p>High Smart</p></div>
                    </div>
                    
                    <ul class="base-stats">
                        <li class="third-width">
                            <div class="stat-name"><p>STR</p></div>
                            <input class="char-prop str" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>END</p></div>
                            <input class="char-prop end" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>DEX</p></div>
                            <input class="char-prop dex" type="number" min=1 value=1>
                        </li>
                        
                        <li class="third-width">
                            <div class="stat-name"><p>WSK</p></div>
                            <input class="char-prop wsk" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>RFL</p></div>
                            <input class="char-prop rfl" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>INI</p></div>
                            <input class="char-prop ini" type="number" min=1 value=1>
                        </li>
                        
                        <li class="third-width">
                            <div class="stat-name"><p>ENR</p></div>
                            <input class="char-prop enr" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>SKL</p></div>
                            <input class="char-prop skl" type="number" min=1 value=1>
                        </li>
                        <li class="third-width">
                            <div class="stat-name"><p>EFF</p></div>
                            <input class="char-prop eff" type="number" min=1 value=1>
                        </li>
                    </ul>
                </div>
                
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
            </div>
            
        </div>
        <script src="js/create-characters.js"></script>
    </body>
</html>