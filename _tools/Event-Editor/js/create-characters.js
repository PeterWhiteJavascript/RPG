$(function(){
    var DC = {
        init:function(){
            var gen = this.charGen = JSON.parse($("#char-gen").text());
            //Add all of the select options
            var cont = $("#char-box-left").children(".stats-cont");
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
                        case "value":
                            genProp = gen.values;
                            break;
                        case "methodology":
                            genProp = gen.methodologies;
                            break;
                    }
                    genProp.forEach(function(name){
                        DC.addOption($(e).children(".char-prop"),name);
                    });
                } else if($(e).children(".char-prop").attr("class").split(" ")[1]==="personality"){
                    gen.personalities.muchValues.forEach(function(name){
                        DC.addOption($(e).children(".char-prop").children(".per-prop"),name);
                    });
                    gen.personalityNames.forEach(function(name){
                        DC.addOption($(e).children(".char-prop").children(".per-name"),name);
                    });
                }
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
                    <div class="char-name btn btn-group center thirty-height">'+char.name+'</div>\n\
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
            var cont = $("#char-box-left").children(".stats-cont");
            $(cont).children(".prop-cont").each(function(num,e){
                var prop = $(e).children(".char-prop").attr("class").split(" ")[1];
                switch(prop){
                    case "name":
                    case "level":
                    case "gender":
                    case "loyalty":
                    case "morale":
                        $(e).children(".char-prop").val(char[prop]);
                        break;
                    case "nationality":
                        $(e).children(".char-prop").val(DC.charGen.nationalities[char[prop]]);
                        break;
                    case "value":
                        var value;
                        if(char[prop]<=33) value = "Egoist";
                        else if(char[prop]>=66) value = "Altruist";
                        else value = "Nepotist";
                        $(e).children(".char-prop").val(value);
                        break;
                    case "methodology":
                        var value;
                        if(char[prop]<=33) value = "Intuitive";
                        else if(char[prop]>=66) value = "Kind";
                        else value = "Pragmatic";
                        $(e).children(".char-prop").val(value);
                        break;
                    case "personality":
                        //Clear all but the first personality
                        $($(e).children(".char-prop")).not(':first').remove();
                        char[prop].forEach(function(personality,idx){
                            if(idx>0){
                                DC.addPersonality($(e));
                            }
                            $(e).children(".char-prop").last().children(".per-prop").val(personality.prop);
                            $(e).children(".char-prop").last().children(".per-name").val(personality.name);
                        });
                        break;
                        
                }
                
                //console.log(prop)
                //console.log(char[prop])
            });
            
        },
        changeName:function(oldName,newName){
            $("#group-menu").children(".char-group").children(".char-buttons").children(".char-button").each(function(){
                if($(this).children(".char-name").text()===oldName){
                    $(this).children(".char-name").text(newName);
                }
            });
            DC.selectedCharacter.name = newName;
        },
        createNewCharacter:function(group,name){
            group.push({
                name:name,
                level:1,
                gender:"Male",
                "nationality":0,
                "charClass":0,
                "value":50,
                "methodology":50,
                "personality":[{prop:"A little",name:"Sensitive"}],
                "loyalty":50,
                "morale":50
            });
        },
        getCharacter:function(charName,group){
            return this.file[group].filter(function(char){
                return char.name==charName;
            })[0];
        },
        
        //Locks in a name from input to div
        lockInName:function(itm){
            var val = $(itm).val();
            var cl = $(itm).attr("class");
            $(itm).replaceWith('<div class="'+cl+'"><p>'+val+'</p></div>');
        }
    };
    
    //Changing a character's name
    $(document).on("focus",".name",function () {
        $(this).attr("old-value",this.value);
    }).on("change",".name",function() {
        DC.changeName($(this).attr("old-value"),$(this).val());
    });
    $(document).on("click",".char-name",function(){
        var groupName = $(this).parent().parent().parent().children(".char-group-top").children(".group-name").val();
        if(!groupName) groupName = $(this).parent().parent().parent().children(".char-group-top").children(".group-name").children("p").text();
        DC.showCharacter(DC.getCharacter($(this).text(),groupName),groupName);
    });
    $(document).on("click",".rand-name-button",function(){
        var oldName = $(this).parent().children(".char-prop").val();
        console.log(oldName);
        var natNum = DC.charGen.nationalities.indexOf($(this).parent().parent().children(".prop-cont").children(".nationality").val());
        var gender = $(this).parent().parent().children(".prop-cont").children(".gender").val();
        DC.generateName($(this).parent().children(".char-prop"),natNum,gender);
        DC.changeName(oldName,$(this).parent().children(".char-prop").val());
    });
    $(document).on("click",".add-personality",function(){
        DC.addPersonality($(this).parent()); 
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
                <div class="char-name btn btn-group center thirty-height">'+name+'</div>\n\
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