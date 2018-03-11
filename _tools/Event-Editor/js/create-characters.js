$(function(){
    if(Array.isArray(GDATA.event)) GDATA.event = {};
    CharacterGenerator.init(GDATA.dataFiles["character-generation.json"],GDATA.dataFiles['equipment.json'],GDATA.dataFiles['default-equipment.json'],GDATA.dataFiles['techniques.json'],GDATA.dataFiles['talents.json'],GDATA.dataFiles['awards.json']);
    var uic = new UIC({
        dataP:{
            charGen:GDATA.dataFiles["character-generation.json"],
            techniques:GDATA.dataFiles["skills.json"],
            equipment:GDATA.dataFiles["equipment.json"],
            talents:GDATA.dataFiles["talents.json"]
        },
        topBarProps:{
            Save:function(){
                FileSaver.saveFile();
            },
            Back:function(){
                if(confirm("Are you sure you want to go back without saving?")){
                    window.location.href = "select-characters-file.php";
                }
            }
        }
    });
    uic.dataP.charClassTechs = [];
    var ranks = 6;
    for(var i=0;i<ranks;i++){
        var group = [];
        for(var j=0;j<uic.dataP.charGen.classNames.length;j++){
            group.push(uic.dataP.techniques[uic.dataP.charGen.classNames[j]][i].name);
        }
        uic.dataP.charClassTechs.push(group);
    }
    uic.createTopMenu($("#editor-content"));
    
    var FileSaver = {
        fileData:GDATA.event,
        getCurrentCharacter:function(){
            var group = $(".character.selected").parent().siblings(".sub-title-text").children("span").text();
            var handle = $(".character.selected").children("span").first().text();
            return this.fileData[group][handle];
        },
        //Saves the currently selected character
        saveCharacter:function(){
            if(!$(".character.selected").length) return;
            //Make sure the lean is = 100;
            $("#fix-lean").trigger("click");
            var data = this.getCurrentCharacter();
            data.handle = $("#char-props input:eq(0)").val();
            data.name = $("#char-props input:eq(1)").val();
            data.levelmin = parseInt($("#char-props input:eq(2)").val());
            data.levelmax = parseInt($("#char-props input:eq(3)").val());
            data.gender = $("#char-props select:eq(0)").val();
            data.nationality = $("#char-props select:eq(1)").val();
            data.charClass = $("#char-props select:eq(2)").val();
            data.promotion = parseInt($("#char-props select:eq(3)").val());
            data.team = $("#char-props select:eq(4)").val();
            
            function minGear(gear,material,quality){
                if(gear === "Default") return "Default";
                if(gear === "None") return "None";
                if(!material && !quality) return gear;
                return [gear,material,quality];
            };
            
            data.equipment = [
                minGear($("#equipment-props select:eq(0)").val(),$("#equipment-props select:eq(1)").val(),$("#equipment-props select:eq(2)").val()),
                minGear($("#equipment-props select:eq(3)").val(),$("#equipment-props select:eq(4)").val(),$("#equipment-props select:eq(5)").val()),
                minGear($("#equipment-props select:eq(6)").val(),$("#equipment-props select:eq(7)").val(),$("#equipment-props select:eq(8)").val()),
                minGear($("#equipment-props select:eq(9)").val(),$("#equipment-props select:eq(10)").val(),$("#equipment-props select:eq(11)").val()),
                minGear($("#equipment-props select:eq(12)").val())
            ];
            
            data.techniques = [
                $("#technique-props select:eq(0)").val(),
                $("#technique-props select:eq(1)").val(),
                $("#technique-props select:eq(2)").val(),
                $("#technique-props select:eq(3)").val(),
                $("#technique-props select:eq(4)").val(),
                $("#technique-props select:eq(5)").val()
            ];
            if($("#using-rand-lean").text() === "Use Rand Lean"){
                data.lean = false;
            } else {
                data.lean =  [
                    [
                        parseInt($("#lean-props input:eq(0)").val()),
                        parseInt($("#lean-props input:eq(1)").val()),
                        parseInt($("#lean-props input:eq(2)").val()),
                        parseInt($("#lean-props input:eq(3)").val())
                    ],
                    [
                        parseInt($("#lean-props input:eq(4)").val()),
                        parseInt($("#lean-props input:eq(5)").val()),
                        parseInt($("#lean-props input:eq(6)").val()),
                        parseInt($("#lean-props input:eq(7)").val())
                    ]
                ];
            }
            
            if($("#using-base-stats").text() === "Using Rand"){
                data.baseStats = [$("#using-base-stats").siblings("select:eq(0)").val(),$("#using-base-stats").siblings("select:eq(1)").val()];
            } else {
                data.baseStats = {
                    str:parseInt($("#base-stat-props input:eq(0)").val()),
                    end:parseInt($("#base-stat-props input:eq(1)").val()),
                    dex:parseInt($("#base-stat-props input:eq(2)").val()),
                    wsk:parseInt($("#base-stat-props input:eq(3)").val()),
                    rfl:parseInt($("#base-stat-props input:eq(4)").val()),
                    ini:parseInt($("#base-stat-props input:eq(5)").val()),
                    enr:parseInt($("#base-stat-props input:eq(6)").val()),
                    skl:parseInt($("#base-stat-props input:eq(7)").val()),
                    eff:parseInt($("#base-stat-props input:eq(8)").val())
                };
            }
            
        },
        saveFile:function(){
            this.saveCharacter();
            saveJsonToFile('character', GDATA.eventPointer.event, FileSaver.fileData);
        }
    };
    var DC = {
        addGroup:function(name,chars){
            chars = chars || [];
            var group = $("<div class='char-group'><div class='sub-title-text'><span>"+name+"</span><div class='remove-choice'><span>x</span></div></div><div class='UIC-hud-buttons hud-buttons'><div class='UIC-hud-button'><span>Add Character</span></div></div><div class='characters'></div></div>");
            $(group).children(".sub-title-text").children(".remove-choice").click(function(){
                var group = $(this).siblings("span").text();
                delete FileSaver.fileData[group];
                $(this).parent().parent().remove();
                if(!$(".char-group").length) $("#add-new-char-group").trigger("click");
                if(!$(".character.selected").length){
                    $(".character").first().trigger("click");
                }
                if(!$(".character").length){
                    $(".char-group").first().children(".hud-buttons").children(".UIC-hud-button").children("span").first().trigger("click");
                    $(".character").trigger("click");
                }
            });
            $(group).children(".sub-title-text").click(function(){
                if($(this).children().first().is("input")) return;
                var text = $(this).children().first().text();
                $(this).children().first().replaceWith("<input value='"+text+"'>");
                $(this).children("input").focus();
                $(this).children("input").on("focusout",function(){
                    var newText = $(this).val();
                    if(newText!==text){
                        FileSaver.fileData[newText] = FileSaver.fileData[text];
                        delete FileSaver.fileData[text];
                    }
                    $(this).replaceWith("<span>"+newText+"</span>");
                });
            });
            $("#character-groups").append(group);
            $(group).children(".hud-buttons").children(".UIC-hud-button").click(function(e){
                $(this).parent().parent().children(".sub-title-text").children("input").trigger("focusout");
                var group = $(this).parent().parent().children(".sub-title-text").children("span").first().text();
                var handle = "New Character ("+$(".character").length+")";
                while(DC.nameExists(handle)) handle = handle + "-(0)";
                $(this).parent().parent().children(".characters").append(DC.addCharacter(handle));
                var char = DC.newCharacter(handle);
                FileSaver.fileData[group][char.handle] = char;
            });
            chars.forEach(function(char){
                group.children(".characters").append(DC.addCharacter(char));
            });
        },
        newCharacter:function(handle){
            return {
                handle:handle,
                name:"",
                levelmin:1,
                levelmax:1,
                gender:"Male",
                promotion:1,
                team:"Enemy",
                equipment:[
                    "Default",
                    "Default",
                    "Default",
                    "Default",
                    "None"
                ],
                baseStats:["Random","Low"],
                techniques:[
                    "Forced March",
                    "Fortify",
                    "Embolden",
                    "Fervour",
                    "Direct",
                    "Phalanx"
                ],
                "nationality": "Venorian",
                "charClass": "Legionnaire"
            };
        },
        addCharacter:function(handle){
            var character = $("<div class='character sub-title-text'><span>"+handle+"</span><div class='remove-choice'><span>x</span></div></div>");
            $(character).children(".remove-choice").click(function(){
                var group = $(this).parent().parent().siblings(".sub-title-text").children("span").text();
                var handle = $(this).parent().children("span").first().text();
                if($(".character.selected").children("span").first().text() === handle) $(".character").first().trigger("click");
                delete FileSaver.fileData[group][handle];
                $(this).parent().remove();
            });
            character.click(function(){
                //Don't do it if we've selected the same character
                if($(".character.selected").children("span").first().text() === $(this).children("span").first().text() && $(this).parent().siblings(".sub-title-text").children("span").text() === $(".character.selected").parent().siblings(".sub-title-text").children("span").text()) return;
                FileSaver.saveCharacter();
                $(".character.selected").removeClass("selected");
                $(this).addClass("selected");
                DC.displayCharacter($(this).parent().siblings(".sub-title-text").children("span").text(),$(this).children("span").first().text());
            });
            return character;
        },
        displayCharacter:function(group,handle){
            var data = FileSaver.fileData[group][handle];
            $("#char-props").children("input:eq(0)").val(handle);
            $("#char-props").children("input:eq(1)").val(data.name);
            $("#char-props").children("input:eq(2)").val(data.levelmin);
            $("#char-props").children("input:eq(3)").val(data.levelmax);
            
            $("#char-props").children("select:eq(0)").val(data.gender);
            $("#char-props").children("select:eq(1)").val(data.nationality);
            $("#char-props").children("select:eq(2)").val(data.charClass);
            $("#char-props").children("select:eq(2)").trigger("change");
            $("#char-props").children("select:eq(3)").val(data.promotion);
            $("#char-props").children("select:eq(4)").val(data.team);
            
            var eqSelectVals = [];
            if(typeof data.equipment === "string"){
                if(data.equipment === "Default"){
                    eqSelectVals.push("Default","Default","Default","Default","Default","Default","Default","Default","Default","Default","Default","Default","Default");
                } else if(data.equipment === "None"){
                    eqSelectVals.push("None","None","None","None","None","None","None","None","None","None","None","None","None");
                }
            } else {
                data.equipment.forEach(function(eq,i){
                    if(typeof eq === "string"){
                        if(eq === "Default"){
                            if(i===12){
                                eqSelectVals.push("Default");
                            } else {
                                eqSelectVals.push("Default","Default","Default");
                            }
                        } else if(eq === "None"){
                            if(i===12){
                                eqSelectVals.push("None");
                            } else {
                                eqSelectVals.push("None","None","None");
                            }
                        }
                    } else {
                        eqSelectVals.push(eq[0],eq[1],eq[2]);
                    }
                });
            }
            $("#equipment-props").children("select").each(function(i){
                $(this).val(eqSelectVals[i]);
                $(this).trigger("change");
            });
            
            $("#technique-props").children("select").each(function(i){
                $(this).val(data.techniques[i]);
            });
            if(data.lean){
                $("#using-rand-lean").children("span").text("Use Set Lean");
                $("#random-lean").hide();
                $("#neutralize-lean").show();
                $("#fix-lean").show();
                var leans = data.lean[0].concat(data.lean[1]);
                $("#lean-props").children("input").each(function(i){
                    $(this).val(leans[i]);
                });
            } else {
                $("#using-rand-lean").children("span").text("Use Rand Lean");
                $("#random-lean").show();
                $("#neutralize-lean").hide();
                $("#fix-lean").hide();
                $("#random-lean").trigger("click");
            }
            
            if(Array.isArray(data.baseStats)){
                $("#using-base-stats").children("span").text("Using Rand");
                $("#random-base-stats").show();
                $("#random-base-stats").siblings("select").show();
                $("#random-base-stats").siblings("select:eq(0)").val(data.baseStats[0]);
                $("#random-base-stats").siblings("select:eq(1)").val(data.baseStats[1]);
                $("#random-base-stats").trigger("click");
            } else {
                $("#using-base-stats").children("span").text("Using Set");
                $("#random-base-stats").hide();
                $("#random-base-stats").siblings("select").hide();
                $("#base-stat-props").children("input").each(function(i){
                    $(this).val(data.baseStats[Object.keys(data.baseStats)[i]]);
                });
            }
        },
        //Sets up all selects
        init:function(){
            $("#add-new-char-group").click(function(e){
                var name = "NewGroup"+~~(Math.random()*100000);
                FileSaver.fileData[name] = {};
                DC.addGroup(name);
            });
            
            var charGen = uic.dataP.charGen;
            
            $("#char-props input:eq(0)").on("change",function(){
                var group = $(".character.selected").parent().siblings(".sub-title-text").children("span").text();
                var lastHandle = $(".character.selected").children("span").first().text();
                var handle = $(this).val();
                while(DC.nameExists(handle)) handle = handle + "-(0)";
                $(".character.selected").children("span").first().text(handle);
                FileSaver.fileData[group][handle] = FileSaver.fileData[group][lastHandle];
                delete FileSaver.fileData[group][lastHandle];
            });
            
            $("#char-props input:eq(2)").on("change",function(){
                
            });
            $("#char-props input:eq(3)").on("change",function(){
                
            });
            $("#button-random-name").click(function(){
                var props = DC.getCharProps();
                $("#char-props").children("input:eq(1)").val(CharacterGenerator.generateName(props.natNum,props.gender));
            });
            
            var levelmininput = $("#char-props").children("input:eq(2)");
            var levelmaxinput = $("#char-props").children("input:eq(3)");
            levelmininput.on("change",function(){
                if(parseInt($(this).val())>parseInt(levelmaxinput.val())){
                    levelmaxinput.val($(this).val());
                }
            });
            levelmaxinput.on("change",function(){
                if(parseInt($(this).val())<parseInt(levelmininput.val())){
                    levelmininput.val($(this).val());
                }
            });
            var charSelectProps = [
                charGen.genders.concat("Random"),
                charGen.nationalities.concat("Random"),
                charGen.classNames.concat("Random"),
                ["1","2","3"],
                charGen.teams
            ];
            
            $("#random-char-props").click(function(){
                $("#char-props").children("select:eq(0)").val("Random");
                $("#char-props").children("select:eq(1)").val("Random");
                $("#char-props").children("select:eq(2)").val("Random");
            });
            $("#char-props").children("select").each(function(i){
                $(this).append(uic.getOptions(charSelectProps[i]));
            });
            
            var equipment = uic.dataP.equipment;
            var hands = Object.assign(equipment.Weapons,equipment.Shields);
            var handsKeys = Object.keys(hands);
            var processedMaterialsObj = {};
            for(var i=0;i<handsKeys.length;i++){
                processedMaterialsObj[handsKeys[i]] = hands[handsKeys[i]].materials;
            }
            var armourKeys = Object.keys(equipment.Armour);
            for(var i=0;i<armourKeys.length;i++){
                processedMaterialsObj[armourKeys[i]] = equipment.Armour[armourKeys[i]].materials;
            }
            var shoesKeys = Object.keys(equipment.Footwear);
            for(var i=0;i<shoesKeys.length;i++){
                processedMaterialsObj[shoesKeys[i]] = equipment.Footwear[shoesKeys[i]].materials;
            }
            processedMaterialsObj.None = ["None"];
            processedMaterialsObj.Default = ["Default"];
            equipment.Quality["Random Low"] = [];
            equipment.Quality["Random Medium"] = [];
            equipment.Quality["Random High"] = [];
            equipment.Quality["Default"] = [];
            equipment.Quality["None"] = [];
            var equipmentSelectProps = [
                hands,
                processedMaterialsObj[handsKeys[0]],
                equipment.Quality,

                hands,
                processedMaterialsObj[handsKeys[0]],
                equipment.Quality,

                equipment.Armour,
                processedMaterialsObj[armourKeys[0]],
                equipment.Quality,

                equipment.Footwear,
                processedMaterialsObj[shoesKeys[0]],
                equipment.Quality,

                equipment.Accessories
            ];
            $("#equipment-props").children("select").each(function(i){
                if(i%3===0) $(this).append(uic.getOptions(["None","Default"]));
                $(this).append(uic.getOptions(equipmentSelectProps[i]));
            });
            $("#no-equipment").click(function(){
                $("#equipment-props").children("select").each(function(){
                    $(this).val("None");
                    $(this).trigger("change");
                });
            });
            $("#default-equipment").click(function(){
                $("#equipment-props").children("select").each(function(){
                    $(this).val("Default");
                    $(this).trigger("change");
                });
            });
            $("#random-equipment").click(function(){
                $("#equipment-props").children("select").each(function(){
                    uic.selectRandom(this);
                });
            });
            
            var techniques = uic.dataP.charClassTechs;
            $("#technique-props").children("select").each(function(i){
                $(this).append(uic.getOptions(techniques[i]));
            });
            
            $("#default-techniques").click(function(){
                $("#char-props select:eq(2)").trigger("change");
            });
            $("#random-techniques").click(function(){
                $("#technique-props").children("select").each(function(){
                    uic.selectRandom(this);
                });
            });
            
            //Link the char class to the techniques and talents
            $("#char-props").children("select:eq(2)").on("change",function(){
                var charClass = $(this).val() === "Random" ? DC.getCharProps().charClass : $(this).val();
                if(charClass === "Archer"){
                    $("#equipment-props").children("select:eq(0)").children("option[value='Bow']").removeAttr("disabled");
                    $("#equipment-props").children("select:eq(3)").children("option[value='Bow']").removeAttr("disabled");
                } else {
                    $("#equipment-props").children("select:eq(0)").children("option[value='Bow']").attr("disabled","disabled");
                    $("#equipment-props").children("select:eq(3)").children("option[value='Bow']").attr("disabled","disabled");
                }
                
                var classNum = CharacterGenerator.getClassNum(charClass);
                $("#technique-props").children("select").each(function(idx){
                    $(this).val(uic.dataP.charClassTechs[idx][classNum]);
                });
                var group = CharacterGenerator.generateCharGroup(classNum);
                if(group === "Mage"){
                    $("#equipment-props").children("select:eq(0)").children("option[value='Wand']").removeAttr("disabled");
                    $("#equipment-props").children("select:eq(0)").children("option[value='Staff']").removeAttr("disabled");
                    $("#equipment-props").children("select:eq(3)").children("option[value='Wand']").removeAttr("disabled");
                    $("#equipment-props").children("select:eq(3)").children("option[value='Staff']").removeAttr("disabled");
                } else {
                    $("#equipment-props").children("select:eq(0)").children("option[value='Wand']").attr("disabled","disabled");
                    $("#equipment-props").children("select:eq(0)").children("option[value='Staff']").attr("disabled","disabled");
                    $("#equipment-props").children("select:eq(3)").children("option[value='Wand']").attr("disabled","disabled");
                    $("#equipment-props").children("select:eq(3)").children("option[value='Staff']").attr("disabled","disabled");
                    var equipment = $("#equipment-props").children("select:eq(0)").children("option:selected").text();
                    if(equipment === "Wand" || equipment === "Staff") $("#equipment-props").children("select:eq(0)").val($("#equipment-props").children("select:eq(0)").children("option:eq(0)").text());
                    var equipment = $("#equipment-props").children("select:eq(3)").children("option:selected").text();
                    if(equipment === "Wand" || equipment === "Staff") $("#equipment-props").children("select:eq(3)").val($("#equipment-props").children("select:eq(3)").children("option:eq(0)").text());
                }
                var generalTalent = uic.dataP.talents.General[group][0];
                $("#talent-props").children("div:eq(0)").children(".minimizer").children("span").last().text(generalTalent.name);
                $("#talent-props").children("div:eq(0)").children("p").last().text(generalTalent.desc);
                var classTalents = uic.dataP.talents.CharClass[charClass];
                $("#talent-props").children("div:eq(1)").children(".minimizer").children("span").last().text(classTalents[0].name);
                $("#talent-props").children("div:eq(1)").children("p").last().text(classTalents[0].desc);
                
                $("#talent-props").children("div:eq(2)").children(".minimizer").children("span").last().text(classTalents[1].name);
                $("#talent-props").children("div:eq(2)").children("p").last().text(classTalents[1].desc);
                
                $("#talent-props").children("div:eq(3)").children(".minimizer").children("span").last().text(classTalents[2].name);
                $("#talent-props").children("div:eq(3)").children("p").last().text(classTalents[2].desc);
                
                var center = uic.dataP.charGen.primaryCoords[classNum];
                function inBounds(num){
                    return num>2 ? 0 : num<0 ? 2 : num;
                };
                function getSecondaries(center){
                    var graph = CharacterGenerator.levelUpGraph;
                    var mult = CharacterGenerator.levelUpMultiplier;
                    return [
                        graph[inBounds(center[1]+mult[0][1])][inBounds(center[0]+mult[0][0])],
                        graph[inBounds(center[1]+mult[1][1])][inBounds(center[0]+mult[1][0])],
                        graph[inBounds(center[1]+mult[2][1])][inBounds(center[0]+mult[2][0])],
                        graph[inBounds(center[1]+mult[3][1])][inBounds(center[0]+mult[3][0])]
                    ];
                }
                function getTertiaries(center){
                    var graph = CharacterGenerator.levelUpGraph;
                    var graph = CharacterGenerator.levelUpGraph;
                    var mult = CharacterGenerator.levelUpMultiplier;
                    return [
                        graph[inBounds(center[1]+mult[4][1])][inBounds(center[0]+mult[4][0])],
                        graph[inBounds(center[1]+mult[5][1])][inBounds(center[0]+mult[5][0])],
                        graph[inBounds(center[1]+mult[6][1])][inBounds(center[0]+mult[6][0])],
                        graph[inBounds(center[1]+mult[7][1])][inBounds(center[0]+mult[7][0])]
                    ];
                }
                var stats = getSecondaries(center).concat(getTertiaries(center));
                $("#lean-props").children("span.quarter-width").each(function(i){
                    $(this).text(stats[i]);
                });
                
                if($("#using-base-stats").text() === "Using Rand"){
                    if($("#using-rand-lean").children("span").text() === "Use Rand Lean"){
                        $("#random-lean").trigger("click");
                    }
                    $("#random-base-stats").trigger("click");
                    
                }
                
            });
            
            uic.linkSelects($("#equipment-props").children("select:eq(0)"),$("#equipment-props").children("select:eq(1)"),processedMaterialsObj);
            uic.linkSelects($("#equipment-props").children("select:eq(3)"),$("#equipment-props").children("select:eq(4)"),processedMaterialsObj);
            uic.linkSelects($("#equipment-props").children("select:eq(6)"),$("#equipment-props").children("select:eq(7)"),processedMaterialsObj);
            uic.linkSelects($("#equipment-props").children("select:eq(9)"),$("#equipment-props").children("select:eq(10)"),processedMaterialsObj);
            
            $("#using-rand-lean").click(function(){
                if($(this).siblings("#random-lean").is(":visible")){
                    $(this).children("span").text("Use Set Lean");
                    $("#neutralize-lean").show();
                    $("#random-lean").hide();
                    $("#fix-lean").show();
                    $(this).siblings("select").hide();
                } else {
                    $(this).children("span").text("Use Rand Lean");
                    $("#neutralize-lean").hide();
                    $("#random-lean").show();
                    $("#fix-lean").hide();
                    $(this).siblings("select").show();
                }
            });
            $("#neutralize-lean").click(function(){
                $("#lean-props").children("input").each(function(){
                    $(this).val(25);
                });
            });
            
            $("#random-lean").click(function(){
                var randLean = CharacterGenerator.generateStatLean().concat(CharacterGenerator.generateStatLean());
                $("#lean-props").children("input").each(function(i){
                    $(this).val(randLean[i]);
                });
            });
            $("#lean-props").children("input").focusout(function(){
                if(parseInt($(this).val()) > 97) $(this).val(97);
                if(parseInt($(this).val()) < 1) $(this).val(1);
            });
            function fixLean(){
                function getVals(dif,arr){
                    var divide = dif / 4;
                    if(dif<0) divide = Math.ceil(divide);
                    else divide = Math.floor(divide);
                    var extra = dif % 4;
                    var vals = [
                        arr[0] - divide,
                        arr[1] - divide,
                        arr[2] - divide,
                        arr[3] - divide
                    ];
                    vals[vals.indexOf(Math.max.apply(null,vals),vals)] -= extra;
                    return vals;
                }
                function processLeanVal(val){
                    return Math.min(97,Math.max(1,parseInt(val)));
                }
                do {
                    var lean = [processLeanVal($("#lean-props").children("input:eq(0)").val()),processLeanVal($("#lean-props").children("input:eq(1)").val()),processLeanVal($("#lean-props").children("input:eq(2)").val()),processLeanVal($("#lean-props").children("input:eq(3)").val())]
                    var secDif  = lean.reduce(function(acc,cur){return acc + cur;}) - 100;
                    var vals = getVals(secDif,lean);
                    $("#lean-props").children("input:eq(0)").val(vals[0]);
                    $("#lean-props").children("input:eq(1)").val(vals[1]);
                    $("#lean-props").children("input:eq(2)").val(vals[2]);
                    $("#lean-props").children("input:eq(3)").val(vals[3]);
                } while(vals.filter(function(elm){return elm < 1 || elm > 97;}).length);
                do {
                    var lean = [processLeanVal($("#lean-props").children("input:eq(4)").val()),processLeanVal($("#lean-props").children("input:eq(5)").val()),processLeanVal($("#lean-props").children("input:eq(6)").val()),processLeanVal($("#lean-props").children("input:eq(7)").val())];
                    var terDif = lean.reduce(function(acc,cur){return acc + cur;}) - 100;
                    var vals = getVals(terDif,lean);
                    $("#lean-props").children("input:eq(4)").val(vals[0]);
                    $("#lean-props").children("input:eq(5)").val(vals[1]);
                    $("#lean-props").children("input:eq(6)").val(vals[2]);
                    $("#lean-props").children("input:eq(7)").val(vals[3]);
                } while(vals.filter(function(elm){return elm < 1 || elm > 97;}).length);
                
            };
            $("#fix-lean").click(function(){
                fixLean();
            });
            
            $("#using-base-stats").click(function(){
                if($(this).siblings("#random-base-stats").is(":visible")){
                    $(this).children("span").text("Using Set");
                    $(this).siblings("#random-base-stats").hide();
                    $(this).siblings("select").hide();
                } else {
                    $(this).children("span").text("Using Rand");
                    $(this).siblings("#random-base-stats").show();
                    $(this).siblings("select").show();
                }
            });
            $("#random-base-stats").click(function(){
                var kind = $(this).siblings("select:eq(0)").val();
                var amount = $(this).siblings("select:eq(1)").val();
                var classNum = CharacterGenerator.getClassNum(DC.getCharProps().charClass);
                var primaryStat = uic.dataP.charGen.primaryStats[classNum];
                var primaryCoordinate = uic.dataP.charGen.primaryCoords[classNum];
                var min = parseInt($("#char-props input:eq(2)").val());
                var max = parseInt($("#char-props input:eq(3)").val());
                var level = min + ~~(Math.random()*(max-min));
                var lean = [
                    [parseInt($("#lean-props").children("input:eq(0)").val()),parseInt($("#lean-props").children("input:eq(1)").val()),parseInt($("#lean-props").children("input:eq(2)").val()),parseInt($("#lean-props").children("input:eq(3)").val())],
                    [parseInt($("#lean-props").children("input:eq(4)").val()),parseInt($("#lean-props").children("input:eq(5)").val()),parseInt($("#lean-props").children("input:eq(6)").val()),parseInt($("#lean-props").children("input:eq(7)").val())]
                ];
                //reducer = (accumulator, currentValue) => accumulator + currentValue;
                var sec = lean[0].reduce(function(acc,cur){return acc + cur;});
                var ter = lean[1].reduce(function(acc,cur){return acc + cur;});
                if(sec !== 100 || ter !== 100){
                    alert("Secondary lean is: "+sec+". Tertiary lean is: "+ter+". Make both of these 100.");
                    return;
                }
                var stats = {};
                var minStat = 10;
                var varianceStat = 5;
                switch(amount){
                    case "Low":
                        
                        break;
                    case "Medium":
                        minStat = 12; 
                        break;
                    case "High":
                        minStat = 15;
                        break;
                    case "Maxed":
                        varianceStat = 0;
                        minStat = 20;
                        break;
                }
                if(kind === "Random"){
                    stats = CharacterGenerator.statsToLevel(CharacterGenerator.generateBaseStats(minStat,varianceStat),primaryStat,primaryCoordinate,level,lean);
                } else if(kind === "Specialized"){
                    stats = CharacterGenerator.statsToLevel(CharacterGenerator.generateBaseStats(minStat,varianceStat),primaryStat,primaryCoordinate,level,lean);
                    stats[primaryStat] += 5;
                }
                $("#base-stat-props input:eq(0)").val(stats.str);
                $("#base-stat-props input:eq(1)").val(stats.end);
                $("#base-stat-props input:eq(2)").val(stats.dex);
                $("#base-stat-props input:eq(3)").val(stats.wsk);
                $("#base-stat-props input:eq(4)").val(stats.rfl);
                $("#base-stat-props input:eq(5)").val(stats.ini);
                $("#base-stat-props input:eq(6)").val(stats.enr);
                $("#base-stat-props input:eq(7)").val(stats.skl);
                $("#base-stat-props input:eq(8)").val(stats.eff);
            });
            
            $(".minimizer").on("click",function(){
                if($(this).siblings(".minimizable").is(":visible")){
                    $(this).siblings(".minimizable").hide();
                } else {
                    $(this).siblings(".minimizable").show();
                }
            });
            $(".minimizer").trigger("click");
            
            var groups = Object.keys(FileSaver.fileData);
            for(var i=0;i<groups.length;i++){
                var group = FileSaver.fileData[groups[i]];
                DC.addGroup(groups[i],Object.keys(group));
            }
            
            $(".character").first().trigger("click");
        },
        getCharProps:function(){
            var nationality = $("#char-props").children("select:eq(1)").val() === "Random" ? CharacterGenerator.generateNationality("Act-1-1") : $("#char-props").children("select:eq(1)").val();
            var natNum = CharacterGenerator.getNatNum(nationality);
            var charClass = $("#char-props").children("select:eq(2)").val() === "Random" ? CharacterGenerator.generateCharClass(nationality) : $("#char-props").children("select:eq(2)").val();
            var gender = $("#char-props").children("select:eq(0)").val() === "Random" ? CharacterGenerator.generateGender(charClass,natNum) : $("#char-props").children("select:eq(0)").val();
            return {nationality:nationality,natNum:natNum,charClass:charClass,gender:gender};
        },
        //Checks to make sure a name is not already in use
        nameExists:function(name){
            var exists = false;
            $(".character").each(function(){
                if(name === $(this).text()) exists = true;
            });
            return exists;
        }
    };
    DC.init();
    
});