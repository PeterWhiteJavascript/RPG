$(function(){
    var DC = {
        init:function(){
            var gen = this.charGen = JSON.parse($("#char-gen").text());
            var techs = this.techniqueData = JSON.parse($("#technique-info").text());
            var keys = Object.keys(techs);
            var sortedTechs = {
                rank:[[],[],[],[],[],[]]
            };
            for(var i=0;i<keys.length;i++){
                for(var j=0;j<6;j++){
                    sortedTechs.rank[j].push(techs[keys[i]][j])
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
                            break;
                        case "nationality":
                            genProp = gen.nationalities;
                            break;
                        case "charClass":
                            genProp = gen.classNames;
                            break;
                    }
                    genProp.forEach(function(name){
                        DC.addOption($(e).children(".char-prop"),name);
                    });
                }
            });
            //Equipment
            var cont = $("#char-box-left").children(".equipment-cont");
            
            
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
                    for(var j=0;j<file[groups[i]].length;j++){
                        this.addCharacter(file[groups[i]][j]);
                        if(!firstChar){
                            firstChar = file[groups[i]][j];
                            firstGroup = groups[i];
                        }
                    }
                }
            }
            if(firstChar){
                this.showCharacter(firstChar,firstGroup);
            }
        },
        addOption:function(cont,text){
            $(cont).append("<option>"+text+"</option>");
        },
        createGroup:function(name){
            $("#group-menu").append('\n\
                <div class="char-group">\n\
                    <div class="char-group-top light-blue-gradient">\n\
                        <div class="group-name"><p>'+name+'</p></div>\n\
                        <div class="btn btn-group center var-remove remove-choice-deep">x</div>\n\
                        <div class="add-char-button btn btn-quarter half-top">Add Character</div>\n\
                    </div>\n\
                    <div class="char-buttons">\n\
                    </div>\n\
                </div>\n\
            ');
        },
        addCharacter:function(char){
            $("#group-menu").children(".char-group").last().children(".char-buttons").last().append('\n\
                <div class="char-button">\n\
                    <div class="char-handle btn btn-group center thirty-height">'+char.handle+'</div>\n\
                    <div class="btn btn-group center var-remove remove-choice">x</div>\n\
                </div>\n\
            ');
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
            this.selectedGroup = group;
            this.selectedCharacter = char;
            //Show all of the character stats
            $("#char-box-left").children(".stats-cont").children(".prop-cont").each(function(num,e){
                var prop = $(e).children(".char-prop").attr("class").split(" ")[1];
                switch(prop){
                    case "nationality":
                        $(e).children(".char-prop").val(DC.charGen.nationalities[char[prop]]);
                        break;
                    case "charClass":
                        $(e).children(".char-prop").val(DC.charGen.classNames[char[prop]]);
                        break;
                    default:
                        $(e).children(".char-prop").val(char[prop]);
                        break;
                }
            });
            //Show all of the equipment
            var cont = $("#char-box-left").children(".equipment-cont");
            
            //Show all of the techniques
            $("#char-box-right").children(".techniques-cont").children(".prop-cont").each(function(num,e){
                var prop = $(e).children(".char-prop").attr("class").split(" ")[1];
                switch(prop){
                    case "tech-1":
                        $(e).children(".char-prop").val(char.techniques[0]);
                        break;
                    case "tech-2":
                        $(e).children(".char-prop").val(char.techniques[1]);
                        break;
                    case "tech-3":
                        $(e).children(".char-prop").val(char.techniques[2]);
                        break;
                    case "tech-4":
                        $(e).children(".char-prop").val(char.techniques[3]);
                        break;
                    case "tech-5":
                        $(e).children(".char-prop").val(char.techniques[4]);
                        break;
                    case "tech-6":
                        $(e).children(".char-prop").val(char.techniques[5]);
                        break;
                }
            });
            
            //Show all of the base stats. If it is set to randomize, generate the stats.
            if(typeof char.baseStats[0]==="string"){
                $("#rand-base-stats").val(char.baseStats[0]);
                $("#value-rand-base-stats").val(char.baseStats[1]);
                $("#randomize-base-stats").trigger("click");
            } else {
                $("#char-box-right").children(".base-stats-cont").children(".base-stats-cont").children(".base-stats").children(".base-stats").children("li").children(".char-prop").each(function(i){
                    $(this).val(char.baseStats[i]);
                });
            }
            //Generate values for the full stats.
            var cont = $("#char-box-right").children(".full-stats-cont");
            
            
            
        },
        changeName:function(oldName,newName){
            $("#group-menu").children(".char-group").children(".char-buttons").children(".char-button").each(function(){
                if($(this).children(".char-handle").text()===oldName){
                    $(this).children(".char-handle").text(newName);
                }
            });
            DC.selectedCharacter.handle = newName;
        },
        createNewCharacter:function(group,name){
            group.push({
                handle:name,
                name:"",
                levelmin:1,
                levelmax:1,
                gender:"Male",
                "nationality":0,
                "charClass":0
            });
        },
        getCharacter:function(charName,group){
            return this.file[group].filter(function(char){
                return char.handle==charName;
            })[0];
        },
        saveCharacterProp:function(prop,val){
            DC.selectedCharacter[prop] = val;
            console.log(DC.selectedCharacter)
        },
        //Locks in a name from input to div
        lockInName:function(itm){
            var val = $(itm).val();
            var cl = $(itm).attr("class");
            $(itm).replaceWith('<div class="'+cl+'"><p>'+val+'</p></div>');
        },
        levelUp:function(char){
            
        },
        levelTo:function(char){
            var level = char.level;
            for(var i=0;i<level;i++){
                this.levelUp(char);
            }
        }
    };
    
    $(document).on("change",".char-prop",function(){
        DC.saveCharacterProp($(this).attr("class").split(" ")[1],$(this).val());
    });
    
    //Changing a character's name
    $(document).on("focus",".handle",function () {
        $(this).attr("old-value",this.value);
    }).on("change",".handle",function() {
        DC.changeName($(this).attr("old-value"),$(this).val());
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
        console.log(this)
    });
    $("#rand-equipment-button").click(function(){
        console.log(this)
    });
    $("#full-rand-equipment-button").click(function(){
        console.log(this)
    });
    $("#smart-rand-equipment-button").click(function(){
        console.log(this)
    });
    
    $("#default-technique-button").click(function(){
        var techs = DC.techniqueData[DC.charGen.classNames[DC.selectedCharacter.charClass]];
        $(this).parent().parent().children(".prop-cont").each(function(i){
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
    
    $("#rand-technique-button").click(function(){
        $(this).parent().parent().children(".prop-cont").each(function(i){
            var randClass = DC.charGen.classNames[Math.floor(Math.random()*(DC.charGen.classNames.length-1))];
            var techs = DC.techniqueData[randClass];
            $(this).children(".char-prop").val(techs[i].name);
        });
    });
    
    $("#use-rand").click(function(){
        if($(this).children("p").text()==="Using Random"){
            $(this).children("p").text("Using Defined Stats");
        } else {
            $(this).children("p").text("Using Random");
        }
    });
    
    $("#randomize-base-stats").click(function(){
        var baseType = $("#rand-base-stats").val();
        var baseAmount = $("#value-rand-base-stats").val();
        
        var char = DC.selectedCharacter;
        
        var primary = DC.charGen.primaryStats[char.charClass];
        var secondary = DC.charGen.secondaryStats[char.charClass];
        var stats = [];
        var numStats = 9;
        switch(baseType){
            case "Rand":
                switch(baseAmount){
                    case "Low":
                        for(var i=0;i<numStats;i++){
                            stats.push(Math.floor(Math.random()*5)+10);
                        }
                        break;
                    case "Medium":
                        for(var i=0;i<numStats;i++){
                            stats.push(Math.floor(Math.random()*5)+12);
                        }
                        break;
                    case "High":
                        for(var i=0;i<numStats;i++){
                            stats.push(Math.floor(Math.random()*5)+15);
                        }
                        break;
                    case "Maxed":
                        for(var i=0;i<numStats;i++){
                            stats.push(20);
                        }
                        break;
                }
                break;
            case "Specialized":
                    case "Low":
                        for(var i=0;i<numStats;i++){
                            if(primary===DC.charGen.statNames[i]){
                                stats.push(16);
                            } else if(secondary===DC.charGen.statNames[i]){
                                stats.push(15);
                            } else {
                                stats.push(Math.floor(Math.random()*5)+10);
                            }
                        }
                        break;
                    case "Medium":
                        for(var i=0;i<numStats;i++){
                            if(primary===DC.charGen.statNames[i]){
                                stats.push(18);
                            } else if(secondary===DC.charGen.statNames[i]){
                                stats.push(17);
                            } else {
                                stats.push(Math.floor(Math.random()*5)+12);
                            }
                        }
                        break;
                    case "High":
                        for(var i=0;i<numStats;i++){
                            if(primary===DC.charGen.statNames[i]){
                                stats.push(20);
                            } else if(secondary===DC.charGen.statNames[i]){
                                stats.push(20);
                            } else {
                                stats.push(Math.floor(Math.random()*5)+15);
                            }
                        }
                        break;
                    case "Maxed":
                        for(var i=0;i<numStats;i++){
                            stats.push(20);
                        }
                        break;
                break;
        }
        $(this).parent().parent().children(".base-stats").children("li").children(".char-prop").each(function(i){
            $(this).val(stats[i]);
        });
    });
    
    
    var numNewChars = 0;
    $('#menu-create-group').click( function(e) {
        $("#group-menu").append('\n\
            <div class="char-group">\n\
                <div class="char-group-top light-blue-gradient">\n\
                    <input class="group-name" value="" placeholder="Group Name">\n\
                    <div class="btn btn-group center var-remove remove-choice-deep">x</div>\n\
                    <div class="add-char-button btn btn-quarter half-top">Add Character</div>\n\
                </div>\n\
                <div class="char-buttons">\n\
                </div>\n\
            </div>\n\
        ');
    });
    $(document).on("click",".add-char-button",function(){
        var name = 'New Character '+numNewChars;
        $(this).parent().parent().children(".char-buttons").append('\n\
            <div class="char-button">\n\
                <div class="char-handle btn btn-group center thirty-height">'+name+'</div>\n\
                <div class="btn btn-group center var-remove remove-choice">x</div>\n\
            </div>\n\
        ');
        var group = $(this).parent().parent().children(".char-group-top").children(".group-name").children("p").text();
        DC.createNewCharacter(DC.file[group],name);
        numNewChars++;
    });
    $(document).on("keydown",".group-name",function(e){
        if(e.keyCode == 13){
            DC.lockInName(this);
        }
    });
    
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
    });
    $(document).on("click",".remove-choice-deep",function(e){
        $(this).parent().parent().remove();
    });
    
    
    DC.init();
});