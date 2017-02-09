<?php
$scene = $_POST['scene'];
$name = $_POST['name'];

$event = json_decode(file_get_contents('../../data/json/story/events/'.$scene.'/'.$name.'.json'), true);
$pages = $event['pages'];
$variables = $event['vrs'];

$bg_directory = '../../images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = '../../audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="editor-content">
            <div class="editor-left-menu">
                <!--This is the options menu for the editor-->
                <ul>
                    <li><a id="add-new-variable"><div class="menu-button btn btn-default">Add New Variable</div></a></li>
                    <li><a id="remove-variable"><div class="menu-button btn btn-default">Remove Variable</div></a></li>
                    <br>
                    <li><a id="add-new-page"><div class="menu-button btn btn-default">Add New Page</div></a></li>
                    <li><a id="remove-page"><div class="menu-button btn btn-default">Remove Page</div></a></li>
                    <li><a id="copy-page"><div class="menu-button btn btn-default">Copy Page</div></a></li>
                    <br>
                    <li><a id="add-new-choice"><div class="menu-button btn btn-default">Add Choice</div></a></li>
                    <li><a id="add-new-condition"><div class="menu-button btn btn-default">Add Condition</div></a></li>
                    <li><a id="add-new-effect"><div class="menu-button btn btn-default">Add Effect</div></a></li>
                    <br>
                    <li><a id="save-event"><div class="menu-button btn btn-default">Save Event</div></a></li>
                    <li><a id="test-event"><div class="menu-button btn btn-default">Test Event</div></a></li>
                    <br>
                    <li><a id="back"><div class="menu-button btn btn-default">Go Back</div></a></li>
                </ul>
            </div>
            <div class="editor-left-menu" id="editor-variables">
                <ul>
                    <?php
                    foreach($variables as $key => $value){
                        echo '<li><div class="menu-button var-button"><input class="var-name" value='.$key.'></input><input class="var-value" value='.$value.'></input></div></li>';
                    }
                    ?>
                </ul>
            </div>
            <div class="editor-left-menu" id="pages">
                <ul class="sortable">
                <?php
                foreach ($pages as $key => $value) {
                    $mus = $value['music'];
                    $bg = $value['bg'];
                    $te = $value['text'];
                    $name = $value['name'];
                    echo '<li id="'.$key.'" music="'.$mus.'" bg="'.$bg.'" text="'.$te.'"><a class="scene-button"><div class="menu-button btn btn-default">'.$name.'</div></a></li>';
                }
                ?>
                </ul>
            </div>
            <div id="editor-page-options">
                <div id="music-select">
                    <p class="editor-descriptor">Music:</p>
                    <select>
                        <?php
                        forEach($music as $song){
                            echo '<option value='.$song.'>'.$song.'</option>';
                        }
                        ?>
                    </select>
                </div>
                <audio controls>
                    <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                </audio>
                <img id="bg-preview">
                <div id="bg-select">
                    <p class="editor-descriptor">BG:</p> 
                    <select>
                        <?php 
                        forEach($bgs as $bg){
                            echo '<option value=bg/'.$bg.'>bg/'.$bg.'</option>';
                        }
                        ?>
                    </select>
                </div>
                <br>
                <div id="text-select">
                    <p class="editor-descriptor">Text: </p>
                </div>
                <div id="choices"><h2>Choices:</h2>
                    <ul class="sortable">
                        <?php
                        forEach($pages as $key => $value){
                            forEach($value['choices'] as $key2 => $value2){
                                $display = $value2['displayText'];
                                $desc = $value2['desc'];
                                $page = $value2['page'];
                        ?>
                                <li class="choice-<?php echo $key; ?> choice-li">
                                    <a class="remove-choice">
                                        <div class="btn btn-default">x</div>
                                    </a>
                                    <div><p class="editor-descriptor">Display Text: </p><input class="display-text" value="<?php echo $display; ?>"></div>
                                    <div><p class="editor-descriptor">On selected text displayed: </p><textarea class="desc-text"><?php echo $desc; ?></textarea></div>
                                    <div><p class="editor-descriptor">To Page: </p><select class="pages-to" initialValue="<?php echo $page; ?>"></select></div>
                                    <div class="conditions">
                                        <p class="editor-descriptor">Conditions: </p>
                                        <?php
                                        if(isset($value2['cond'])){
                                            $conds = $value2['cond'];
                                            forEach($conds as $cond => $val){
                                                switch($val[0]){
                                                    case "checkVar":
                                        ?>
                                                        <div class="condition">
                                                            <a class="remove-choice">
                                                                <div class="btn btn-default">x</div>
                                                            </a>
                                                            <select class="conditions-select" value="<?php echo $val[0] ?>"></select>
                                                            <div class="cond-cont">
                                                                <select class="cond-var-type" initialValue="<?php echo $val[1]['scope']; ?>"></select>
                                                                <div class="cond">
                                                                    <select class="cond-vars" initialValue="<?php echo $val[1]['vr']; ?>"></select>
                                                                    <input class="cond-vals" value="<?php echo $val[1]['vl']; ?>"></input>
                                                                </div>
                                                            </div>
                                                        </div>
                                        <?php
                                                        break;
                                                }
                                            }

                                        }
                                        ?>
                                    </div>
                                    <div class="effects">
                                        <p class="editor-descriptor">Effects: </p>
                                        <?php
                                        if(isset($value2['effect'])){
                                            $effects = $value2['effect'];
                                            forEach($effects as $effect => $val2){
                                                switch($val2[0]){
                                                    case "setVar":
                                        ?>
                                                    <div class="effect">
                                                        <a class="remove-choice">
                                                            <div class="btn btn-default">x</div>
                                                        </a>
                                                        <select class="effects-select" value="<?php echo $val2[0] ?>"></select>
                                                        <div class="effect-cont">
                                                            <select class="effect-var-type" initialValue="<?php echo $val2[1]['scope'];?>"></select>
                                                            <div class="eff">
                                                                <select class="eff-vars" initialValue="<?php echo $val2[1]['vr']; ?>"></select>
                                                                <input class="eff-vals" value="<?php echo $val2[1]['vl']; ?>"></input>
                                                            </div>
                                                        </div>
                                                    </div>
                                                        
                                        <?php
                                                        break;
                                                    case "changePage":
                                        ?>
                                                    <div class="effect">
                                                        <a class="remove-choice">
                                                            <div class="btn btn-default">x</div>
                                                        </a>
                                                        <select class="effects-select" initialValue="<?php echo $val2[0] ?>"></select>
                                                        <div class="effect-cont">
                                                            <select class="effect-pages" initialValue="<?php echo $val2[1]['page']?>"></select>
                                                            <textarea class="effect-page-to-desc" placeholder="display text"><?php echo $val2[1]['desc']?></textarea>
                                                        </div>
                                                    </div>
                                        <?php
                                                        break;
                                                }
                                            }
                                        }
                                        ?>
                                    </div>
                                </li>
                        <?php
                                
                            }
                        }
                        ?>
                    </ul>
                </div>
            </div>
        </div>
        <script src="js/edit-story-event.js"></script>
    </body>
</html>