$(function(){
    var DC = {
        init:function(){
            this.characters = {};
            var gen = this.charGen = JSON.parse($("#char-gen").text());
            var techs = this.techniqueData = JSON.parse($("#technique-info").text());
            var keys = Object.keys(techs);
            var sortedTechs = {
                rank:[[{name:"Default"}],[{name:"Default"}],[{name:"Default"}],[{name:"Default"}],[{name:"Default"}],[{name:"Default"}]]
            };
            for(var i=0;i<keys.length;i++){
                for(var j=0;j<techs[keys[i]].length;j++){
                    sortedTechs.rank[j].push(techs[keys[i]][j]);
                }
            }
            
            //Char Stats
            var cont = $("#char-box-left").children(".stats-cont");
            //Add all of the select options
            $(cont).children(".prop-cont").each(function(num,e){
                if($(e).children(".char-prop").is("select")){
                    var prop = $(e).children(".char-prop").attr("class").split(" ")[1];
                    var genProp;
                    switch(prop){
                        case "gender":
                            genProp = gen.genders;
                            genProp.push("Random");
                            break;
                        case "nationality":
                            genProp = gen.nationalities;
                            genProp.push("Random");
                            break;
                        case "charClass":
                            genProp = gen.classNames;
                            genProp.push("Random");
                            break;
                        case "team":
                            genProp = ["Enemy","Ally"];
                            break;
                    }
                    genProp.forEach(function(name){
                        DC.addOption($(e).children(".char-prop"),name);
                    });
                }
            });
            //Equipment
            var equipment = this.equipmentData = JSON.parse($("#equipment").text());
            var hands = ["Default","None"].concat(Object.keys(equipment.Weapons)).concat(Object.keys(equipment.Shields));
            var cont = $("#char-box-left").children(".equipment-cont");
            $(cont).children(".prop-cont").children(".char-prop").each(function(num,e){
                var prop = $(e).attr("class").split(" ")[1];
                switch(prop){
                    case "right-hand-quality":
                    case "left-hand-quality":
                    case "armour-quality":
                    case "footwear-quality":
                        ["Default","Random Low","Random Medium","Random High","Random"].concat(Object.keys(equipment.Quality)).forEach(function(obj){
                            DC.addOption($(e),obj);
                        });
                        break;
                    case "right-hand-gear":
                    case "left-hand-gear":
                        hands.forEach(function(obj){
                            DC.addOption($(e),obj);
                        });
                        break;
                    case "armour-gear":
                        ["Default","None"].concat(Object.keys(equipment.Armour)).forEach(function(obj){
                            DC.addOption($(e),obj);
                        });
                        break;
                    case "footwear-gear":
                        ["Default","None"].concat(Object.keys(equipment.Footwear)).forEach(function(obj){
                            DC.addOption($(e),obj);
                        });
                        break;
                    case "accessory":
                        ["None"].concat(Object.keys(equipment.Accessories)).forEach(function(obj){
                            DC.addOption($(e),obj);
                        });
                        break;
                }
            });
            var cont = $("#char-box-right").children(".techniques-cont");
            $(cont).children(".prop-cont").each(function(num,e){
                var prop = $(e).children(".char-prop").attr("class").split(" ")[1];
                var genProp;
                switch(prop){
                    case "tech-1":
                        genProp = sortedTechs.rank[0];
                        break;
                    case "tech-2":
                        genProp = sortedTechs.rank[1];
                        break;
                    case "tech-3":
                        genProp = sortedTechs.rank[2];
                        break;
                    case "tech-4":
                        genProp = sortedTechs.rank[3];
                        break;
                    case "tech-5":
                        genProp = sortedTechs.rank[4];
                        break;
                    case "tech-6":
                        genProp = sortedTechs.rank[5];
                        break;
                }
                genProp.forEach(function(obj){
                    DC.addOption($(e).children(".char-prop"),obj.name);
                });
            });
            
            var file = this.file = JSON.parse($("#file-info").text());
            var groups = Object.keys(file);
            var firstChar;
            var firstGroup;
            if(groups.length){
                for(var i=0;i<groups.length;i++){
                    this.createGroup(groups[i]);
                    var chars = Object.keys(file[groups[i]]);
                    for(var j=0;j<chars.length;j++){
                        var char = this.decodeChar(file[groups[i]][chars[j]]);
                        this.addCharacter(groups[i],char);
                        if(!firstChar){
                            firstChar = char;
                            firstGroup = groups[i];
                        }
                    }
                }
            }
            if(firstChar){
                this.showCharacter(firstChar,firstGroup);
            } else {
                $("#menu-create-group").trigger("click");
                $("#char-box-left").hide();
                $("#char-box-right").hide();
            }
        },
        //Takes the character from the save and makes it editor-friendly
        decodeChar:function(char){
            return {
                handle:char.handle,
                name:char.name,
                levelmin:char.levelmin,
                levelmax:char.levelmax,
                gender:char.gender,
                nationality:char.nationality,
                charClass:char.charClass,
                baseStats:char.baseStats,
                team:char.team,
                "right-hand-quality":char.equipment.righthand[0],
                "right-hand-gear":char.equipment.righthand[2],
                "right-hand-material":char.equipment.righthand[1],
                "left-hand-quality":char.equipment.lefthand[0],
                "left-hand-gear":char.equipment.lefthand[2],
                "left-hand-material":char.equipment.lefthand[1],
                "armour-quality":char.equipment.armour[0],
                "armour-gear":char.equipment.armour[2],
                "armour-material":char.equipment.armour[1],
                "footwear-quality":char.equipment.footwear[0],
                "footwear-gear":char.equipment.footwear[2],
                "footwear-material":char.equipment.footwear[1],
                "accessory":char.equipment.accessory,
                "tech-1":char.techniques[0],
                "tech-2":char.techniques[1],
                "tech-3":char.techniques[2],
                "tech-4":char.techniques[3],
                "tech-5":char.techniques[4],
                "tech-6":char.techniques[5]
            };
        },
        addOption:function(cont,text){
            $(cont).append("<option>"+text+"</option>");
        },
        createGroup:function(name){
            $("#group-menu").append('\n\
                <div class="char-group">\n\
                    <div class="char-group-top light-blue-gradient">\n\
                        <div class="group-name"><p>'+name+'</p></div>\n\
                        <div class="btn btn-group center var-remove remove-group remove-choice-deep">x</div>\n\
                        <div class="add-char-button btn btn-quarter half-top">Add Character</div>\n\
                    </div>\n\
                    <div class="char-buttons">\n\
                    </div>\n\
                </div>\n\
            ');
            this.characters[name] = {};
        },
        addCharacter:function(group,char){
            $("#group-menu").children(".char-group").last().children(".char-buttons").last().append('\n\
                <div class="char-button">\n\
                    <div class="char-handle btn btn-group center thirty-height">'+char.handle+'</div>\n\
                    <div class="btn btn-group center var-remove remove-character">x</div>\n\
                </div>\n\
            ');
            this.characters[group][char.handle] = char;
        },  
        addPersonality:function(cont){
            var gen = this.charGen;
            cont.append('\n\
            <div class="char-prop personality full-line">\n\
                <select class="per-prop fifty-width left-float"></select>\n\
                <select class="per-name fifty-width left-float"></select>\n\
            </div>\n\
            ');
            gen.personalities.muchValues.forEach(function(name){
                DC.addOption(cont.children(".char-prop").last().children(".per-prop"),name);
            });
            gen.personalityNames.forEach(function(name){
                DC.addOption($(cont).children(".char-prop").last().children(".per-name"),name);
            });
            
        },
        getIdx:function(group,num){
            //Loop through elements in array until a match is found
            for(var i=0;i<group.length;i++){
                var sum = group.slice(0,i+1).reduce(function(a,b){return a+b;},0);
                if(num<=sum){
                    return i;
                }
            }
        },
        rand:function(){
            return Math.ceil(Math.random()*100);
        },
        generateName:function(cont,nationality,gender){
            if(gender==="Random"||nationality===5){
                alert("Please set gender and nationality.");
                return;
            }
            var numNameParts = this.getIdx(this.charGen.nameParts[nationality].nameParts,this.rand())+1;
            var charName = "";
            var main = this.charGen.nameParts[nationality].main;
            for(var i=0;i<numNameParts;i++){
                charName+=main[Math.floor(Math.random()*main.length)];
            }

            //Nomads have different prefix
            if(this.charGen.nationalities[nationality]==="Nomadic") charName=this.charGen.nameParts[nationality][gender][Math.floor(Math.random()*this.charGen.nameParts[nationality][gender].length)]+charName;
            else charName+=this.charGen.nameParts[nationality][gender][Math.floor(Math.random()*this.charGen.nameParts[nationality][gender].length)];
            charName = charName.charAt(0).toUpperCase() + charName.slice(1);
            $(cont).val(charName);
        },
        showCharacter:function(char,group){
            //Change the colour of the character in the groups
            $("#group-menu").children(".char-group").children(".char-buttons").children(".char-button").children(".char-handle").removeClass("selected");
            $("#group-menu").children(".char-group").children(".char-buttons").children(".char-button").each(function(){
                if($(this).children(".char-handle").text()===char.handle){
                    $(this).children(".char-handle").addClass("selected");
                }
            });
            
            this.selectedGroup = group;
            this.selectedCharacter = char;
            //Show all of the character stats
            $("#char-box-left").children(".stats-cont").children(".prop-cont").children(".char-prop").each(function(num,e){
                var prop = $(e).attr("class").split(" ")[1];
                $(e).val(char[prop]);
            });
            //Save the props so they don't get overriden in the change trigger.
            var rh = char["right-hand-material"];
            var lh = char["left-hand-material"];
            var ar = char["armour-material"];
            var fw = char["footwear-material"];
            //Show all of the equipment
            $("#char-box-left").children(".equipment-cont").children(".prop-cont").children(".char-prop").each(function(num,e){
                var prop = $(e).attr("class").split(" ")[1];
                $("."+prop).val(char[prop]);
                $(this).trigger("change");
            });
            
            $(".right-hand-material").val(rh);
            char["right-hand-material"] = rh;
            $(".left-hand-material").val(lh);
            char["left-hand-material"] = lh;
            $(".armour-material").val(ar);
            char["armour-material"] = ar;
            $(".footwear-material").val(fw);
            char["footwear-material"] = fw;
            
            
            //Show all of the techniques
            $("#char-box-right").children(".techniques-cont").children(".prop-cont").children(".char-prop").each(function(num,e){
                var prop = $(e).attr("class").split(" ")[1];
                $("."+prop).val(char[prop]);
            });
            //Show all of the base stats. If it is set to randomize, generate the stats.
            if(Array.isArray(char.baseStats)){
                
                $("#rand-base-stats").val(char.baseStats[0]);
                $("#value-rand-base-stats").val(char.baseStats[1]);
                
                $("#use-rand").children("p").text("Using Random");
                $("#use-rand").parent().children("#randomize-base-stats").show();
                $("#use-rand").parent().children("#rand-base-stats").show();
                $("#use-rand").parent().children("#value-rand-base-stats").show();
                $("#use-rand").parent().children(".spacer").hide();
                
                $("#randomize-base-stats").trigger("click");
                
            } else {
                $("#char-box-right").children(".base-stats-cont").children(".base-stats").children("li").children(".base-stat").each(function(i){
                    var prop = $(this).attr("class").split(" ")[1];
                    $(this).val(char.baseStats[prop]);
                });
                $("#use-rand").children("p").text("Using Defined");
                $("#use-rand").parent().children("#randomize-base-stats").hide();
                $("#use-rand").parent().children("#rand-base-stats").hide();
                $("#use-rand").parent().children("#value-rand-base-stats").hide();
                $("#use-rand").parent().children(".spacer").show();
            }
            //Generate values for the full stats. (TO DO MAYBE)
            var cont = $("#char-box-right").children(".full-stats-cont");
            
            
        },
        removeCharacter:function(group,name){
            delete DC.characters[group][name];
        },
        removeGroup:function(group){
            delete DC.characters[group];
        },
        //Checks to make sure a name is not already in use
        nameExists:function(group,name){
            var exists = false;
            Object.keys(this.characters[group]).forEach(function(obj){
                if(obj===name) exists = true;
            });
            return exists;
        },
        changeName:function(group,oldName,newName){
            //Check if the name exists
            $("#group-menu").children(".char-group").children(".char-buttons").children(".char-button").each(function(){
                if($(this).children(".char-handle").text()===oldName){
                    $(this).children(".char-handle").text(newName);
                    DC.characters[group][newName] = DC.characters[group][oldName];
                    delete DC.characters[group][oldName];
                }
            });
            DC.selectedCharacter.handle = newName;
        },
        createNewCharacter:function(name){
            return {
                handle:name,
                name:"",
                levelmin:1,
                levelmax:1,
                gender:"Male",
                nationality:"Venorian",
                charClass:"Legionnaire",
                team:"Enemy",
                baseStats:["Random","Medium"],
                "right-hand-quality":"Default",
                "right-hand-gear":"Default",
                "right-hand-material":"Default",
                "left-hand-quality":"Default",
                "left-hand-gear":"Default",
                "left-hand-material":"Default",
                "armour-quality":"Default",
                "armour-gear":"Default",
                "armour-material":"Default",
                "footwear-quality":"Default",
                "footwear-gear":"Default",
                "footwear-material":"Default",
                "accessory":"None",
                "tech-1":"Forced March",
                "tech-2":"Fortify",
                "tech-3":"Embolden",
                "tech-4":"Fervour",
                "tech-5":"Direct",
                "tech-6":"Phalanx"
            };
        },
        getCharacter:function(charName,group){
            return this.characters[group][charName];
        },
        saveCharacterProp:function(prop,val){
            DC.selectedCharacter[prop] = val;
        },
        saveBaseStat:function(prop,val){
            DC.selectedCharacter.baseStats[prop] = parseInt(val);
        },
        //Locks in a name from input to div
        lockInName:function(itm){
            var val = $(itm).val();
            var cl = $(itm).attr("class");
            $(itm).replaceWith('<div class="'+cl+'"><p>'+val+'</p></div>');
        },
        levelUp:function(stats,primary,primaryCoordinate,lean){
            function inBounds(num){
                return num>2 ? 0 : num<0 ? 2 : num;
            };
            stats[primary] += 1;
            var center = primaryCoordinate;
            var graph = DC.charGen.levelUpGraph;
            var mult = DC.charGen.levelUpMultiplier;
            //Get 3 unique secondary stats.
            var secStats = [];
            for(var i=0;i<3;i++){
                var secStat;
                do{
                    var secondary = this.getIdx(lean[0],this.rand());
                    var secPos = [inBounds(center[0]+mult[secondary][0]),inBounds(center[1]+mult[secondary][1])];
                    secStat = graph[secPos[1]][secPos[0]];
                } while(secStats.indexOf(secStat)!==-1);
                secStats.push(secStat);
                stats[secStat]++;
            }
            //Get 1 tertiary stat.
            var tertiary = this.getIdx(lean[1],this.rand());
            var terPos = [inBounds(center[0]+mult[tertiary+4][0]),inBounds(center[1]+mult[tertiary+4][1])];
            var terStat = graph[terPos[1]][terPos[0]];
            stats[terStat]++;
            return stats;
        },
        generateBaseStats:function(min,variance){
            min = min?min:10,variance = variance?variance:10;
            var stats = {};
            //Set all lv 1 stats
            DC.charGen.statNames.forEach(function(st){
                stats[st] = Math.floor(Math.random()*variance)+min;
            });
            return stats;
        },
        statsToLevel:function(stats,primary,primaryCoordinate,level,lean){
            stats[primary]+=5;
            for(var idx=0;idx<level;idx++){
                stats = DC.levelUp(stats,primary,primaryCoordinate,lean);
            }  
            return stats;
        },
        getStatLean:function(){
            //Force at least 1 percent chance for each stat
            var lean = [1,1,1,1];
            //Start at 96 since 4 is already taken.
            var num = 96;
            //The skew is how far apart the numbers will probably be. Higher skew = higher chance of very big/very small numbers.
            var skew = 15;
            //Generate some pretty decent random numbers
            while(num>0){
                var rand = Math.ceil(Math.random()*skew);
                if(rand>num) rand = num;
                lean[Math.floor(Math.random()*4)] += rand;
                num -= rand;
            }
            return lean;
        },
        getEquipmentData:function(name){
            if(name==="None"||name==="Default"||name==="Random") return {};
            var eq = this.equipmentData;
            var data = eq.Weapons[name];
            if(!data) data = eq.Shields[name];
            if(!data) data = eq.Armour[name];
            if(!data) data = eq.Footwear[name];
            if(!data) data = eq.Accessories[name];
            return data;
        },
        encodeChar:function(char){
            return {
                "handle":char.handle,
                "name":char.name,
                "levelmin":parseInt(char.levelmin),
                "levelmax":parseInt(char.levelmax),
                "gender":char.gender,
                "team":char.team,
                "equipment":{
                    "righthand":[char["right-hand-quality"],char["right-hand-material"],char["right-hand-gear"]],
                    "lefthand":[char["left-hand-quality"],char["left-hand-material"],char["left-hand-gear"]],
                    "armour":[char["armour-quality"],char["armour-material"],char["armour-gear"]],
                    "footwear":[char["footwear-quality"],char["footwear-material"],char["footwear-gear"]],
                    "accessory":char.accessory
                },
                "baseStats":char.baseStats,
                "techniques":[
                    char["tech-1"],
                    char["tech-2"],
                    char["tech-3"],
                    char["tech-4"],
                    char["tech-5"],
                    char["tech-6"],
                ],
                "nationality":char.nationality,
                "charClass":char.charClass
            };
        },
        saveFile:function(){
            var data = this.characters;
            var groupKeys = Object.keys(data);
            var encoded = {};
            for(var i=0;i<groupKeys.length;i++){
                encoded[groupKeys[i]] = {};
                var chars = data[groupKeys[i]];
                var charKeys = Object.keys(chars);
                for(var j=0;j<charKeys.length;j++){
                    encoded[groupKeys[i]][charKeys[j]] = this.encodeChar(chars[charKeys[j]]);
                }
            }
            $.ajax({
                type:'POST',
                url:'save-characters.php',
                data:{data:JSON.stringify(encoded),filename:$("#file-name").text()},
                dataType:'json'
            })
            .done(function(data){console.log(data);alert("Saved Successfully!")})
            .fail(function(data){console.log(data)});
        }
    };
    
    $(document).on("change",".char-prop",function(){
        DC.saveCharacterProp($(this).attr("class").split(" ")[1],$(this).val());
    });
    $(document).on("change",".base-stat",function(){
        DC.saveBaseStat($(this).attr("class").split(" ")[1],$(this).val());
    });
    $(document).on("change","#rand-base-stats",function(){
        DC.selectedCharacter.baseStats[0] = $(this).val();
    });
    $(document).on("change","#value-rand-base-stats",function(){
        DC.selectedCharacter.baseStats[1] = $(this).val();
    });
    
    //Changing a character's name
    $(document).on("focus",".handle",function () {
        $(this).attr("old-value",this.value);
    }).on("change",".handle",function() {
        if(confirm("Caution: If you've referenced this character somewhere in an event, it will not work properly.")){
            if(!DC.nameExists(DC.selectedGroup,$(this).val())){
                DC.changeName(DC.selectedGroup,$(this).attr("old-value"),$(this).val());
            } else {
                $(this).val($(this).attr("old-value"));
            }
        } else {
            $(this).val($(this).attr("old-value"));
        }
    });
    $(document).on("click",".char-handle",function(){
        var groupName = $(this).parent().parent().parent().children(".char-group-top").children(".group-name").val();
        if(!groupName) groupName = $(this).parent().parent().parent().children(".char-group-top").children(".group-name").children("p").text();
        DC.showCharacter(DC.getCharacter($(this).text(),groupName),groupName);
    });
    /*
    $(document).on("click",".rand-name-button",function(){
        var oldName = $(this).parent().children(".char-prop").val();
        console.log(oldName);
        var natNum = DC.charGen.nationalities.indexOf($(this).parent().parent().children(".prop-cont").children(".nationality").val());
        var gender = $(this).parent().parent().children(".prop-cont").children(".gender").val();
        DC.generateName($(this).parent().children(".char-prop"),natNum,gender);
        DC.changeName(oldName,$(this).parent().children(".char-prop").val());
    });*/
    $(document).on("click",".add-personality",function(){
        DC.addPersonality($(this).parent()); 
    }); 
    
    $("#default-equipment-button").click(function(){
        $(".right-hand-quality").val("Default");
        $(".right-hand-gear").val("Default");
        $(".right-hand-gear").trigger("change");
        $(".right-hand-material").val("Default");
        
        $(".left-hand-quality").val("Default");
        $(".left-hand-gear").val("Default");
        $(".left-hand-gear").trigger("change");
        $(".left-hand-material").val("Default");
        
        $(".armour-quality").val("Default");
        $(".armour-gear").val("Default");
        $(".armour-gear").trigger("change");
        $(".armour-material").val("Default");
        
        $(".footwear-quality").val("Default");
        $(".footwear-gear").val("Default");
        $(".footwear-gear").trigger("change");
        $(".footwear-material").val("Default");
        
        $(".accessory").val("None");
    });
    /*$("#rand-equipment-button").click(function(){
        $(".right-hand-quality").val("Random");
        $(".right-hand-gear").val("Random");
        $(".right-hand-gear").trigger("change");
        $(".right-hand-material").val("Random");
        
        $(".left-hand-quality").val("Random");
        $(".left-hand-gear").val("Random");
        $(".left-hand-gear").trigger("change");
        $(".left-hand-material").val("Random");
        
        $(".armour-quality").val("Random");
        $(".armour-gear").val("Random");
        $(".armour-gear").trigger("change");
        $(".armour-material").val("Random");
        
        $(".footwear-quality").val("Random");
        $(".footwear-gear").val("Random");
        $(".footwear-gear").trigger("change");
        $(".footwear-material").val("Random");
    });*/
    $("#full-rand-equipment-button").click(function(){
        var ra = function(cl){
            options = $(cl+" > option");
            options[Math.floor(Math.random() * options.length)].selected = true;
        };
        ra(".right-hand-quality");
        ra(".left-hand-quality");
        ra(".armour-quality");
        ra(".footwear-quality");
        
        ra(".right-hand-gear");
        ra(".left-hand-gear");
        ra(".armour-gear");
        ra(".footwear-gear");
        ra(".accessory");
        
        $(".right-hand-gear").trigger("change");
        $(".left-hand-gear").trigger("change");
        $(".armour-gear").trigger("change");
        $(".footwear-gear").trigger("change");
        if($(".right-hand-gear").val()!=="Default"&&$(".right-hand-gear").val()!=="None"&&$(".right-hand-gear").val()!=="Random"){
            ra(".right-hand-material");
        }
        if($(".left-hand-gear").val()!=="Default"&&$(".left-hand-gear").val()!=="None"&&$(".left-hand-gear").val()!=="Random"){
            ra(".left-hand-material");
        }
        if($(".armour-gear").val()!=="Default"&&$(".armour-gear").val()!=="None"&&$(".armour-gear").val()!=="Random"){
            ra(".armour-material");
        }
        if($(".footwear-gear").val()!=="Default"&&$(".footwear-gear").val()!=="None"&&$(".footwear-gear").val()!=="Random"){
            ra(".footwear-material");
        }
        var data = DC.getEquipmentData($(".right-hand-gear").val());
        if(data.hands===2){
            $(".left-hand-quality").val("Default");
            $(".left-hand-gear").val("None");
            $(".left-hand-gear").trigger("change");
        }
        var data = DC.getEquipmentData($(".left-hand-gear").val());
        if(data.hands===2){
            $(".right-hand-quality").val("Default");
            $(".right-hand-gear").val("None");
            $(".right-hand-gear").trigger("change");
        }
    });
    
    $("#default-technique-button").click(function(){
        if(DC.selectedCharacter.charClass==="Random"){
            $(this).parent().parent().children(".prop-cont").each(function(i){
                $(this).children(".char-prop").val("Default");
                $(this).children(".char-prop").trigger("change");
            });
        } else {
            var techs = DC.techniqueData[DC.selectedCharacter.charClass];
            $(this).parent().parent().children(".prop-cont").each(function(i){
                $(this).children(".char-prop").val(techs[i].name);
                $(this).children(".char-prop").trigger("change");
            });
        }
    });
    $("#rand-technique-button").click(function(){
        $(this).parent().parent().children(".prop-cont").each(function(i){
            var randClass = DC.charGen.classNames[Math.floor(Math.random()*(DC.charGen.classNames.length-1))];
            var techs = DC.techniqueData[randClass];
            $(this).children(".char-prop").val(techs[i].name);
        });
    });
    
    $("#rand-technique-button").click(function(){
        $(this).parent().parent().children(".prop-cont").each(function(i){
            var randClass = DC.charGen.classNames[Math.floor(Math.random()*(DC.charGen.classNames.length-1))];
            var techs = DC.techniqueData[randClass];
            $(this).children(".char-prop").val(techs[i].name);
        });
    });
    
    $("#use-rand").click(function(){
        if($(this).children("p").text()==="Using Random"){
            $(this).children("p").text("Using Defined");
            $(this).parent().children("#randomize-base-stats").hide();
            $(this).parent().children("#rand-base-stats").hide();
            $(this).parent().children("#value-rand-base-stats").hide();
            $(this).parent().children(".spacer").show();
            //Change the save character
            $("#randomize-base-stats").trigger("click");
        } else {
            $(this).children("p").text("Using Random");
            $(this).parent().children("#randomize-base-stats").show();
            $(this).parent().children("#rand-base-stats").show();
            $(this).parent().children("#value-rand-base-stats").show();
            $(this).parent().children(".spacer").hide();
            //Change the save character
            DC.characters[DC.selectedGroup][DC.selectedCharacter.handle].baseStats = [$("#rand-base-stats").val(),$("#value-rand-base-stats").val()];
        }
    });
    
    $("#randomize-base-stats").click(function(){
        var baseType = $("#rand-base-stats").val();
        var baseAmount = $("#value-rand-base-stats").val();
        
        var char = DC.selectedCharacter;
        var primary;
        var classNum;
        if(char.charClass==="Random"){
            var rand = Math.floor(Math.random()*DC.charGen.primaryStats.length);
            primary = DC.charGen.primaryStats[rand];
            classNum = rand;
        } else {
            var idx = DC.charGen.classNames.indexOf(char.charClass);
            primary = DC.charGen.primaryStats[idx];
            classNum = idx;
        }
        
        var statNames = DC.charGen.statNames;
        var stats = {};
        var numStats = 9;
        switch(baseType){
            case "Random":
                switch(baseAmount){
                    case "Low":
                        for(var i=0;i<numStats;i++){
                            stats[statNames[i]]=Math.floor(Math.random()*5)+10;
                        }
                        break;
                    case "Medium":
                        for(var i=0;i<numStats;i++){
                            stats[statNames[i]]=Math.floor(Math.random()*5)+12;
                        }
                        break;
                    case "High":
                        for(var i=0;i<numStats;i++){
                            stats[statNames[i]]=Math.floor(Math.random()*5)+15;
                        }
                        break;
                    case "Maxed":
                        for(var i=0;i<numStats;i++){
                            stats[statNames[i]]=20;
                        }
                        break;
                }
                break;
            case "Specialized":
                switch(baseAmount){
                    case "Low":
                        for(var i=0;i<numStats;i++){
                            if(primary===DC.charGen.statNames[i]){
                                stats[statNames[i]]=16;
                            } else {
                                stats[statNames[i]]=Math.floor(Math.random()*5)+10;
                            }
                        }
                        break;
                    case "Medium":
                        for(var i=0;i<numStats;i++){
                            if(primary===DC.charGen.statNames[i]){
                                stats[statNames[i]]=18;
                            } else {
                                stats[statNames[i]]=Math.floor(Math.random()*5)+12;
                            }
                        }
                        break;
                    case "High":
                        for(var i=0;i<numStats;i++){
                            if(primary===DC.charGen.statNames[i]){
                                stats[statNames[i]]=20;
                            } else {
                                stats[statNames[i]]=Math.floor(Math.random()*5)+15;
                            }
                        }
                        break;
                    case "Maxed":
                        for(var i=0;i<numStats;i++){
                            stats[statNames[i]]=20;
                        }
                        break;
                break;
            }
        }
        //Level up to the mean of levelmin and levelmax (minus 1 as level 1 is start)
        var mean = Math.ceil((parseInt($(".levelmin").val())+parseInt($(".levelmax").val()))/2)-1;
        var lean = [DC.getStatLean(),DC.getStatLean()]
        var primaryCoord = DC.charGen.primaryCoords[classNum];
        stats = DC.statsToLevel(DC.generateBaseStats(),primary,primaryCoord,mean,lean);
        var keys = Object.keys(stats);
        $(this).parent().parent().children(".base-stats").children("li").children(".base-stat").each(function(i){
            $(this).val(stats[keys[i]]);
        });
        if($("#use-rand").children("p").text()!=="Using Random"){
            char.baseStats = stats;
        }
        
    });
    
    
    var numNewChars = 0;
    $('#menu-create-group').click( function(e) {
        $("#group-menu").append('\n\
            <div class="char-group">\n\
                <div class="char-group-top light-blue-gradient">\n\
                    <input class="group-name" value="" placeholder="Enter Group Name">\n\
                    <div class="btn btn-group center var-remove remove-group remove-choice-deep">x</div>\n\
                </div>\n\
                <div class="char-buttons">\n\
                </div>\n\
            </div>\n\
        ');
    });
    $(document).on("click",".add-char-button",function(){
        var name = 'NewCharacter'+numNewChars;
        var group = $(this).parent().parent().children(".char-group-top").children(".group-name").children("p").text();
        while(DC.nameExists(group,name)){
            numNewChars++;
            name = 'NewCharacter'+numNewChars;
        }
        $(this).parent().parent().children(".char-buttons").append('\n\
            <div class="char-button">\n\
                <div class="char-handle btn btn-group center thirty-height">'+name+'</div>\n\
                <div class="btn btn-group center var-remove remove-character">x</div>\n\
            </div>\n\
        ');
        //If the group name is still an input
        if(!group) group = $(this).parent().parent().children(".char-group-top").children(".group-name").val();
        DC.characters[group][name] = DC.createNewCharacter(name);
        numNewChars++;
        $("#char-box-left").show();
        $("#char-box-right").show();
        //Show this character
        DC.showCharacter(DC.characters[group][name],group);
    });
    //When a group name is entered, create the add character button and solidify the name. Also add an entry for saving at this point
    $(document).on("change",".group-name",function(e){
        $(this).parent().append('<div class="add-char-button btn btn-quarter half-top">Add Character</div>');
        DC.characters[$(this).val()] = {};
        DC.lockInName(this);
    });
    
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
    });
    $(document).on("click",".remove-choice-deep",function(e){
        $(this).parent().parent().remove();
    });
    
    $(document).on("change",".charClass",function(){
        $("#default-technique-button").trigger("click");
    });
    
    
    $(document).on("change",".right-hand-gear",function(){
        $(".right-hand-material").empty();
        var gear = $(this).val();
        if(gear==="None"){
            $(".right-hand-material").append("<option value='None'>None</option>");
            $(".right-hand-material").trigger("change");
            return;
        } else if(gear==="Random"){
            $(".right-hand-material").append("<option value='Random Low'>Random Low</option><option value='Random Medium'>Random Medium</option><option value='Random High'>Random High</option><option value='Random'>Random</option>");
            $(".right-hand-material").trigger("change");
            return;
        } else if(gear==="Default"){
            $(".right-hand-material").append("<option value='Default'>Default</option>");
            $(".right-hand-material").trigger("change");
            return;
        }
        var data = DC.equipmentData.Weapons[gear];
        if(!data){
            data = DC.equipmentData.Shields[gear];
        }
        data.materials.forEach(function(obj){
            DC.addOption($(".right-hand-material"),obj);
        });
        $(".right-hand-material").trigger("change");
    });
    $(document).on("change",".left-hand-gear",function(){
        $(".left-hand-material").empty();
        var gear = $(this).val();
        if(gear==="None"){
            $(".left-hand-material").append("<option value='None'>None</option>");
            $(".left-hand-material").trigger("change");
            return;
        } else if(gear==="Random"){
            $(".left-hand-material").append("<option value='Random Low'>Random Low</option><option value='Random Medium'>Random Medium</option><option value='Random High'>Random High</option><option value='Random'>Random</option>");
            $(".left-hand-material").trigger("change");
            return;
        } else if(gear==="Default"){
            $(".left-hand-material").append("<option value='Default'>Default</option>");
            $(".left-hand-material").trigger("change");
            return;
        }
        var data = DC.equipmentData.Weapons[gear];
        if(!data){
            data = DC.equipmentData.Shields[gear];
        }
        data.materials.forEach(function(obj){
            DC.addOption($(".left-hand-material"),obj);
        });
        $(".left-hand-material").trigger("change");
    });
    $(document).on("change",".armour-gear",function(){
        $(".armour-material").empty();
        var gear = $(this).val();
        if(gear==="None"){
            $(".armour-material").append("<option value='None'>None</option>");
            $(".armour-material").trigger("change");
            return;
        } else if(gear==="Random"){
            $(".armour-material").append("<option value='Random Low'>Random Low</option><option value='Random Medium'>Random Medium</option><option value='Random High'>Random High</option><option value='Random'>Random</option>");
            $(".armour-material").trigger("change");
            return;
        } else if(gear==="Default"){
            $(".armour-material").append("<option value='Default'>Default</option>");
            $(".armour-material").trigger("change");
            return;
        }
        var data = DC.equipmentData.Armour[gear];
        data.materials.forEach(function(obj){
            DC.addOption($(".armour-material"),obj);
        });
        $(".armour-material").trigger("change");
    });
    $(document).on("change",".footwear-gear",function(){
        $(".footwear-material").empty();
        var gear = $(this).val();
        if(gear==="None"){
            $(".footwear-material").append("<option value='None'>None</option>");
            $(".footwear-material").trigger("change");
            return;
        } else if(gear==="Random"){
            $(".footwear-material").append("<option value='Random Low'>Random Low</option><option value='Random Medium'>Random Medium</option><option value='Random High'>Random High</option><option value='Random'>Random</option>");
            $(".footwear-material").trigger("change");
            return;
        } else if(gear==="Default"){
            $(".footwear-material").append("<option value='Default'>Default</option>");
            $(".footwear-material").trigger("change");
            return;
        }
        var data = DC.equipmentData.Footwear[gear];
        data.materials.forEach(function(obj){
            DC.addOption($(".footwear-material"),obj);
        });
        $(".footwear-material").trigger("change");
    });
    
    //Re-generate base stats when the level is changed.
    $(document).on("focusout",".levelmin",function(){
        //Make sure the level min is not greater than the levelmax
        if(parseInt($(this).val())>parseInt($(".levelmax").val())) $(".levelmax").val(parseInt($(this).val()));
        DC.selectedCharacter.levelmin=parseInt($(".levelmin").val());
        DC.selectedCharacter.levelmax=parseInt($(".levelmax").val());
        //If we're using the random stats, generate them
        if($("#use-rand").children("p").text()==="Using Random"){
            $("#randomize-base-stats").trigger("click");
        }
    });
    $(document).on("focusout",".levelmax",function(){
        //Make sure the level min is not greater than the levelmax
        if(parseInt($(".levelmin").val())>parseInt($(this).val())) $(".levelmin").val(parseInt($(this).val()));
        DC.selectedCharacter.levelmin=parseInt($(".levelmin").val());
        DC.selectedCharacter.levelmax=parseInt($(".levelmax").val());
        
        //If we're using the random stats, generate them
        if($("#use-rand").children("p").text()==="Using Random"){
            $("#randomize-base-stats").trigger("click");
        }
    });
    
    $("#menu-save-file").click(function(){
        DC.saveFile();
    });
    
    $(document).on("click",".remove-character",function(){
        var group = $(this).parent().parent().parent().children(".char-group-top").children(".group-name").children("p").text();
        DC.removeCharacter(group,$(this).parent().children(".char-handle").text());
        $(this).parent().remove();
        var groups = Object.keys(DC.characters);
        DC.showCharacter(DC.characters[groups[0]][Object.keys(DC.characters[groups[0]])[0]],groups[0]);
    });
    
    $(document).on("click",".remove-group",function(){
        var group = $(this).parent().children(".group-name").children("p").text();
        DC.removeGroup(group);
    });
    
    DC.init();
    
});