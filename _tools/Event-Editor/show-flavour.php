<?php
$scenes = json_decode(file_get_contents('../../data/json/data/scenes-list.json'), true);
$flavour = json_decode(file_get_contents('../../data/json/data/flavour-events-list.json'), true);
$globalVars = json_decode(file_get_contents('../../data/json/story/global-vars.json'), true);
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Load an Event</title>
        <link rel="stylesheet" href="css/show-flavour.css">
        <script src="lib/jcanvas.min.js"></script>
        <script type="text/javascript" src="http://creativecouple.github.com/jquery-timing/jquery-timing.min.js"></script>
    </head>
    <body>
        <script>
            var scenes = <?php echo json_encode($scenes); ?>;
            var globalVars = <?php echo json_encode($globalVars); ?>;
            var flavour = <?php echo json_encode($flavour); ?>;
        </script>
        <div id="wrapper">
            <div class="full-screen-hider"></div>
            <div id="main-content">
                <div id="triggers-bar">
                    <div class="trigger-opts">
                        <div id="triggers-select-all" class="trigger-button">Select All</div>
                        <div id="triggers-select-none" class="trigger-button">Select None</div>
                    </div>
                    <div class="trigger">
                        <select id="trigger-acts" multiple="multiple" title="Acts">
                            <optgroup label="Act-1">
                                <option value="Act-1-1">Act-1-1</option>
                                <option value="Act-1-2">Act-1-2</option>
                                <option value="Act-1-3">Act-1-3</option>
                                <option value="Act-1-4">Act-1-4</option>
                            </optgroup>
                            <optgroup label="Act-2">
                                <option value="Act-2-1">Act-2-1</option>
                                <option value="Act-2-2">Act-2-2</option>
                                <option value="Act-2-3">Act-2-3</option>
                                <option value="Act-2-4">Act-2-4</option>
                            </optgroup>
                            <optgroup label="Act-3">
                                <option value="Act-3-1">Act-3-1</option>
                                <option value="Act-3-2">Act-3-2</option>
                                <option value="Act-3-3">Act-3-3</option>
                                <option value="Act-3-4">Act-3-4</option>
                            </optgroup>
                            <optgroup label="Final">
                                <option value="FinalAct">FinalAct</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-officers" multiple="multiple" title="Officers">
                            <option value="Astraea">Astraea</option>
                            <option value="Lysandra">Lysandra</option>
                            <option value="Gaios">Gaios</option>
                            <option value="Imamu">Imamu</option>
                            <option value="Rutendo">Rutendo</option>
                            <option value="Nala">Nala</option>
                            <option value="Sjrna">Sjrna</option>
                            <option value="Eko">Eko</option>
                            <option value="Nicodemus">Nicodemus</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-charClass"  multiple="multiple" title="Character Class">
                            <option value="Legionnaire">Legionnaire</option>
                            <option value="Berserker">Berserker</option>
                            <option value="Vanguard">Vanguard</option>
                            <option value="Assassin">Assassin</option>
                            <option value="Skirmisher">Skirmisher</option>
                            <option value="Archer">Archer</option>
                            <option value="Illusionist">Illusionist</option>
                            <option value="Elementalist">Elementalist</option>
                            <option value="Healer">Healer</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-nationality" multiple="multiple" title="Nationality">
                            <option value="Venorian">Venorian</option>
                            <option value="Dardoian">Dardoian</option>
                            <option value="Aliudramilan">Aliudramilan</option>
                            <option value="Talumpatuan">Talumpatuan</option>
                            <option value="Nomadic">Nomadic</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-value"  multiple="multiple" title="Value">
                            <option value="Egoist">Egoist</option>
                            <option value="Nepotist">Nepotist</option>
                            <option value="Altruist">Altruist</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-methodology"  multiple="multiple" title="Methodology">
                            <option value="Pragmatic">Pragmatic</option>
                            <option value="Intuitive">Intuitive</option>
                            <option value="Kind">Kind</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-personality"  multiple="multiple" title="Personality">
                            <option value="Sensitive">Sensitive</option>
                            <option value="Impassive">Impassive</option>
                            <option value="Unmotivated">Unmotivated</option>
                            <option value="Curious">Curious</option>
                            <option value="Clingy">Clingy</option>
                            <option value="Nonpartisan">Nonpartisan</option>
                            <option value="Charismatic">Charismatic</option>
                            <option value="Awkward">Awkward</option>
                            <option value="Violent">Violent</option>
                            <option value="Pacifistic">Pacifistic</option>
                            <option value="Hedonistic">Hedonistic</option>
                            <option value="Ascetic">Ascetic</option>
                            <option value="Extraverted">Extraverted</option>
                            <option value="Shy">Shy</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-gender"  multiple="multiple" title="Gender">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-character-base-stats"  multiple="multiple" title="Base Stats">
                            <option value="str">str</option>
                            <option value="end">end</option>
                            <option value="dex">dex</option>
                            <option value="wsk">wsk</option>
                            <option value="rfl">rfl</option>
                            <option value="ini">ini</option>
                            <option value="enr">enr</option>
                            <option value="skl">skl</option>
                            <option value="eff">eff</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-character-derived-stats"  multiple="multiple" title="Derived Stats">
                            <option value="Max Hit Points">Max Hit Points</option>
                            <option value="Max Technique Points">Max Technique Points</option>
                            <option value="Pain Tolerance">Pain Tolerance</option>
                            <option value="Damage Reduction">Damage Reduction</option>
                            <option value="Physical Resistance">Physical Resistance</option>
                            <option value="Mental Resistance">Mental Resistance</option>
                            <option value="Magical Resistance">Magical Resistance</option>
                            <option value="Attack Range">Attack Range</option>
                            <option value="Max Attack Damage">Max Attack Damage</option>
                            
                            <option value="Encumbrance Threshold">Encumbrance Threshold</option>
                            <option value="Total Weight">Total Weight</option>
                            <option value="Encumbrance Penalty">Encumbrance Penalty</option>
                            <option value="Defensive Ability">Defensive Ability</option>
                            <option value="Attack Accuracy">Attack Accuracy</option>
                            <option value="Critical Chance">Critical Chance</option>
                            <option value="Counter Chance">Counter Chance</option>
                            <option value="Attack Speed">Attack Speed</option>
                            <option value="Move Speed">Move Speed</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-character-awards"  multiple="multiple" title="Character Awards">
                            <option value="Enemies Defeated">Enemies Defeated</option>
                            <option value="Assisted">Assisted</option>
                            <option value="Battles Participated">Battles Participated</option>
                            <option value="Damage Dealt">Damage Dealt</option>
                            <option value="Damage Taken">Damage Taken</option>
                            <option value="Self Healed">Self Healed</option>
                            <option value="Target Healed">Target Healed</option>
                            <option value="Times Wounded">Times Wounded</option>
                            <option value="Visited">Visited</option>
                            <option value="Feasted">Feasted</option>
                            <option value="Guest of Honour">Guest of Honour</option>
                            <option value="Mentored">Mentored</option>
                            <option value="Times Hunted">Times Hunted</option>
                        </select>
                    </div>
                    <div class="trigger">
                        <select id="trigger-vars"  multiple="multiple" title="Vars">
                            <option value="Scene">Scene</option>
                            <option value="Global">Global</option>
                        </select>
                    </div>
                </div>
                <div id="events-cont">
                    
                </div>
                <div id="menu-cont">
                    <div class="menu-divider"></div>
                    <div id="new-event" class="menu-button">New Event</div>
                    <div id="new-event" class="menu-button">New Group</div>
                    <div id="edit-event" class="menu-button">Edit Event</div>
                    <div id="edit-event" class="menu-button">Change Trigger</div>
                    <div id="test-event" class="menu-button">Test Event</div>
                    <div id="delete-event" class="menu-button">Delete Event</div>
                    <div class="menu-divider"></div>
                    <div id="save" class="menu-button">Save Events</div>
                    <div class="menu-divider"></div>
                    <div id="back" class="menu-button">To Scenes</div>
                    <div id="back-to-main" class="menu-button">To Main Page</div>
                </div>
            </div>
                
        </div>
        <script src="js/show-flavour.js"></script>
    </body>
</html>
