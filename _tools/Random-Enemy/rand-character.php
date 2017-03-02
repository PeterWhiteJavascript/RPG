<?php


?>
<!DOCTYPE html>
<html>
    <head>
        <title>Name Generator</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="lib/jquery-3.1.1.js"></script>
        <script src="lib/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="css/style.css">
    </head>
    <body>
        <select id="chapters"></select>
        <button onclick="cont.generateCharacter()">Generate New Character</button>
        <button onclick="cont.deleteCharacter()">Delete Top Character</button>
        <button onclick="cont.goToEditor()">Adjust Values</button>
        <table id="charTable">
            <tr>
                <th>LV UP</th>
                <th>Name</th>
                <th>Level</th>
                <th>Nationality</th>
                <th>Character Class</th>
                <th>Gender</th>
                <th>Value</th>
                <th>Method</th>
                <th>Personality</th>
                <th>STR</th>
                <th>END</th>
                <th>DEX</th>
                <th>WSK</th>
                <th>RFL</th>
                <th>INI</th>
                <th>ENR</th>
                <th>SKL</th>
                <th>EFF</th>
            </tr>
        </table>
        <script>
            var cont = {};
            cont.characters = [];
            $(function(){
                $.getJSON( "../../data/json/data/character-generation.json", function( data ) {
                    var personalities = data.personalities;
                    var traitsKeys = Object.keys(personalities.traits);
                    var scenes = data.scenes;
                    var nationalities = data.nationalities;
                    var values = data.values;
                    var methodologies = data.methodologies;
                    var classNames = data.classNames;
                    var natClasses = data.natClasses;
                    var natKeys = Object.keys(natClasses);
                    var classes = data.classes;
                    var classKeys = Object.keys(classes);
                    var nameParts = data.nameParts;
                    var genders = data.genders;
                    var statTexts = data.statTexts;
                    var statNames = data.statNames;
                    var primaryStats = data.primaryStats;
                    var secondaryStats = data.secondaryStats;
                    var order = data.order;
                    var autoChance = data.autoChance;
                    
                    
                    //Returns the index of an array based off of a random number
                    cont.getIdx = function(group,num){
                        //Loop through elements in array until a match is found
                        for(var i=0;i<group.length;i++){
                            var sum = group.slice(0,i+1).reduce(function(a,b){return a+b;},0);
                            if(num<=sum){
                                return i;
                            }
                        }
                    };
                    cont.deleteCharacter = function(){
                        document.getElementById("charTable").deleteRow(1);
                    };
                    cont.levelUp = function(statTo,stats,primary,secondary){
                        switch(statTo){
                            case "primary":
                                stats[primary]+=1;
                                break;
                            case "secondary":
                                stats[secondary]+=1;
                                break;
                            case "random":
                                stats[statNames[Math.floor(Math.random()*statNames.length)]]+=1;
                                break;
                            case "auto":
                                stats = cont.levelUp(autoChance[Math.floor(Math.random()*autoChance.length)],stats,primary,secondary);
                                break;
                        }
                        return stats;
                    };
                    cont.getStats = function(level,classNum){
                        var stats = {};
                        //Set all starting stats
                        statNames.forEach(function(st){
                            stats[st] = Math.floor(Math.random()*10)+10;
                        });
                        var primary = primaryStats[classNum];
                        var secondary = secondaryStats[classNum];
                        stats[primary]+=5;
                        stats[secondary]+=3;

                        for(var idx=0;idx<level;idx++){
                            var num = idx%order.length;
                            stats = cont.levelUp(order[num],stats,primary,secondary);
                        }
                        return stats;
                    };
                    cont.rand = function(){
                        return Math.ceil(Math.random()*100);
                    };
                    cont.generateCharacter = function(){
                        var chapter = document.getElementById("chapters").value;
                        var charLevel = scenes[chapter].startLevel+cont.getIdx(scenes[chapter].spread,cont.rand());
                        var natNum = cont.getIdx(scenes[chapter].natSpread,cont.rand());
                        var charNat = natKeys[natNum];
                        var classNum = cont.getIdx(natClasses[charNat].classSpread,cont.rand());
                        var charClass = classKeys[classNum];
                        var charGender = genders[cont.getIdx([classes[charClass].gender[natNum],100],cont.rand())];
                        var numNameParts = cont.getIdx(nameParts[natNum].nameParts,cont.rand())+1;
                        var charName = "";
                        var main = nameParts[natNum].main;
                        for(var i=0;i<numNameParts;i++){
                            charName+=main[Math.floor(Math.random()*main.length)];
                        }

                        //Nomads have different prefix
                        if(nationalities[natNum]==="Nomadic") charName=nameParts[natNum][charGender][Math.floor(Math.random()*nameParts[natNum][charGender].length)]+charName;
                        else charName+=nameParts[natNum][charGender][Math.floor(Math.random()*nameParts[natNum][charGender].length)];
                        charName = charName.charAt(0).toUpperCase() + charName.slice(1);
                        var charValue = values[cont.getIdx(classes[charClass].value[natNum],cont.rand())];
                        var charMethod = methodologies[cont.getIdx(classes[charClass].methodology[natNum],cont.rand())];

                        var randPersonalityText = personalities.muchValues[Math.floor(Math.random()*personalities.muchValues.length)];
                        var randPersonality = personalities.traits[traitsKeys[Math.floor(Math.random()*traitsKeys.length)]];
                        var char =  {
                            name:charName,
                            level:charLevel,
                            nationality:nationalities[natNum],
                            charClass:classNames[classNum],
                            gender:charGender,
                            value:charValue,
                            method:charMethod,
                            personality:randPersonalityText+" "+randPersonality.name,
                            stats:cont.getStats(charLevel,classNum),

                            classNum:classNum
                        };
                        cont.insertCharToTable(char);
                        return char;
                    };
                    cont.insertCharToTable = function(char){
                        var table = document.getElementById("charTable");
                        var row = table.insertRow();

                        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
                        var lvUp = row.insertCell(0);
                        var name = row.insertCell(1);
                        var level = row.insertCell(2);
                        var nationality = row.insertCell(3);
                        var charClass = row.insertCell(4);
                        var gender = row.insertCell(5);
                        var value = row.insertCell(6);
                        var method = row.insertCell(7);
                        var personality = row.insertCell(8);

                        var lvUpButton = document.createElement("button");
                        lvUpButton.className = "lvUp";
                        lvUpButton.innerHTML = "UP";
                        lvUpButton.onclick = function() {
                            var primary = primaryStats[char.classNum];
                            var secondary = secondaryStats[char.classNum];
                            cont.levelUp(order[char.level%order.length],char.stats,primary,secondary);
                            char.level++;
                            level.innerHTML = char.level;
                            statNames.forEach(function(st,i){
                                row.cells[9+i].innerHTML = char.stats[st];
                            });
                        };
                        lvUp.appendChild(lvUpButton);
                        // Add some text to the new cells:
                        name.innerHTML = char.name;
                        level.innerHTML = char.level;
                        nationality.innerHTML = char.nationality;
                        charClass.innerHTML = char.charClass;
                        gender.innerHTML = char.gender;
                        value.innerHTML = char.value;
                        method.innerHTML = char.method;
                        personality.innerHTML = char.personality;
                        statNames.forEach(function(st,i){
                            row.insertCell(9+i).innerHTML = char.stats[st];
                        });
                        cont.characters.push(char);
                    };
                    var chapters = Object.keys(scenes);
                    //Create the select items
                    var select = document.getElementById("chapters");
                    chapters.forEach(function(chapter){
                        var option = document.createElement("option");
                        option.text = chapter;
                        select.add(option);
                    });
                    cont.goToEditor = function(){
                        window.location.href = "name-generation-editor.php";
                    };
                });
            });
        </script>
    </body>
</html>
