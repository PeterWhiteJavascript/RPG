<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create Gear Techniques</title>
        <link rel="stylesheet" type="text/css" href="css/new-style.css">
        <link rel="stylesheet" type="text/css" href="css/techniques-editor.css">
        <style>
            #right-cont{
                
            }
            .no-bg-title-text{
                text-align:center;
                height:30px;
                line-height:30px;
                font-size:24px;
                user-select:none;
                display:inline-block;
                width:100%;
                vertical-align:top;
            }
        </style>
        <script>
            $(function(){
                var FileSaver = {
                    fileData:{},
                    getTechnique:function(category,name){
                        return FileSaver.techniqueData[category].find(function(t){return t[0] === name;});
                    },
                    saveFile:function(){
                        saveCurrentTechniques();
                        $.ajax({
                            type:'POST',
                            url:'save-gear.php',
                            data:{data:JSON.stringify(FileSaver.equipmentData)},
                            dataType:'json'
                        })
                        .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
                        .fail(function(data){console.log(data)});
                    }
                };
                var uic = new UIC({
                    topBarProps:{
                        Save:function(){
                            FileSaver.saveFile();
                        },
                        Back:function(){
                            if(confirm("Are you sure you want to go back without saving?")){
                                var to = "index.php";
                                $.redirect(to);
                            }
                        }
                    }
                });
                uic.createTopMenu($("#editor-content"));
                function getArgDesc(data){
                    if(!data) return "None";
                    var text = [];
                    data.forEach(function(d){
                        var func = d[0];
                        var props = d[1];
                        switch(func){
                            case "Change Stat Active":
                                text.push("Affects "+props[0]+ " | " + props[2] +" "+ props[3] + " (x)");
                                break;
                            case "Change Stat Passive":
                                text.push(props[1] +" "+ props[2] + " (x)");
                                break;
                            case "Apply Status Effect":
                                text.push("Affects "+props[0]+ " | Status "+props[1]);
                                break;
                            case "Change Ground":
                                text.push(props[1] +" "+ props[2] + " (x) TODO");
                                break;
                        }
                    });
                    return text;
                };
                function showTechnique(type,tech){
                    var data = FileSaver.techniqueData[type].find(function(d){return tech === d[0];});
                    $("#right-cont").children(".UIC-group-item").children(".tech-display").empty();
                    if(type==="Active"){
                        $("#right-cont").children(".UIC-group-item").children(".tech-display").append(
                            uic.Text("Name",data[0]),
                            uic.Text("Desc",data[1]),
                            uic.Text("Tech Type",data[2][0]+", "+data[2][1]),
                            uic.Text("Range",data[3][0]+", "+data[3][1]),
                            uic.Text("AOE",data[4][0]+", "+data[4][1]),
                            uic.Text("Resisted By",data[5].length ? data[5].toString().replace(/,/g, ', ') : "None"),
                            uic.Text("Damage",data[6]),
                            uic.Text("Accuracy",data[7]),
                            uic.Text("Default TP Cost",data[8]),
                            uic.Text("Animation",data[9]),
                            uic.Text("Sound",data[10]),
                            uic.Text("Arguments",getArgDesc(data[data.length-1]).join().replace(/,/g, ', '))
                        );
                    } else {
                        $("#right-cont").children(".UIC-group-item").children(".tech-display").append(
                            uic.Text("Name",data[0]),
                            uic.Text("Desc",data[1]),
                            uic.Text("Arguments",getArgDesc(data[data.length-1]).join().replace(/,/g, ', '))
                        );
                    }
                };
                function getTech(name,tech){
                    var techType = tech.length >= 3 ? "Active" : "Passive";
                    var cont = $("<div class='technique-cont UIC-group-item'><span class='full-width title-text'>"+name+"</span></div>");
                    cont.append(uic.Select("Tech Type",["Active","Passive"],techType));
                    cont.append(uic.Select("Technique",FileSaver.techniqueNames[techType],tech[0]));
                    uic.linkSelects(cont.children("select:eq(0)"),cont.children("select:eq(1)"),FileSaver.techniqueNames);
                    cont.on("click",function(){
                        $(".technique-cont").removeClass("selected");
                        $(this).siblings(".UIC-prop").children(".technique-conts").children(".technique-cont").hide();
                        $(this).addClass("selected");
                        showTechnique($(this).children("select:eq(0)").val(),$(this).children("select:eq(1)").val());
                    });

                    function createArguments(args,num,cont,data){
                        if(!args.length) return;
                        for(var i=0;i<args[0].length;i++){
                            var desc = getArgDesc(data[data.length-1])[i];
                            //If we changed the number of props in this technique, then there may be extra data from the previous version
                            if(!desc) continue;
                            cont.append("<span class='full-width'>"+desc+"</span>");
                            for(var j=0;j<num;j++){
                                cont.append("<input class='sixth-width' value='"+args[j][i]+"'>");
                            }
                        }
                    }
                    function createDamage(cont,num,arg){
                        cont.append("<span class='full-width'>Damage</span>");
                        for(var j=0;j<num;j++){
                            cont.append("<input class='sixth-width' value='"+arg[j]+"'>");
                        }
                    }
                    function createTPCost(cont,num,arg){
                        cont.append("<span class='full-width'>TP Cost</span>");
                        for(var j=0;j<num;j++){
                            cont.append("<input class='sixth-width' value='"+arg[j]+"'>");
                        }
                    }
                    var numOfLevels = name === "Base Technique" ? 6 : 2;
                    var data = FileSaver.getTechnique(techType,tech[0]);
                    createArguments(tech[1],numOfLevels,cont,data);
                    $(cont).children("select:eq(1)").on("change",function(){
                        $(this).nextAll().remove();
                        var category = $(this).siblings(".title-text").first().text();
                        var numOfLevels = category === "Base Technique" ? 6 : 2;
                        var type = $(this).siblings("select").first().val();
                        var tech = $(this).val();
                        var data = FileSaver.techniqueData[type].find(function(t){return t[0] === tech;});
                        var args = [];
                        for(var i=0;i<data[data.length-1].length;i++){
                            if(data[data.length-1][i][0]==="Change Stat Active" || data[data.length-1][i][0]==="Change Stat Passive"){
                                args.push(data[data.length-1][i][1][7] || data[data.length-1][i][1][3]);
                            }
                        }
                        createArguments(Array(numOfLevels).fill(args),numOfLevels,$(this).parent(),data);
                        if(type === "Active") createTPCost($(this).parent(),numOfLevels,Array(numOfLevels).fill([data[data.length-4]]));
                        if(type === "Active") createDamage($(this).parent(),numOfLevels,Array(numOfLevels).fill([data[6]]));
                        showTechnique(type,tech);
                    });
                    if(techType === "Active") createTPCost(cont,numOfLevels,tech[2]);
                    if(!tech[3]) tech[3] = [0,0,0,0,0,0];
                    if(techType === "Active") createDamage(cont,numOfLevels,tech[3]);
                    uic.selectInitialValue(cont);
                    return cont;
                }
                function saveCurrentTechniques(){
                    var gearType = $(".gear-name.selected").children(".no-bg-title-text").attr("kind");
                    var gearName = $(".gear-name.selected").children(".no-bg-title-text").text();
                    if(!gearType || !gearName) return;
                    function getSaveTechnique(cont,ranks){
                        var techType = cont.children("select:eq(0)").val();
                        var techName = cont.children("select:eq(1)").val();
                        var techData = FileSaver.getTechnique(techType,techName);
                        var inputs = cont.children("input");
                        var numArgs = techData[techData.length-1].filter(function(data){return data[0] === "Change Stat Active" || data[0] === "Change Stat Passive"}).length;
                        var args = [];
                        
                        for(var i=0;i<ranks;i++){
                            var group = [];
                            for(var j=0;j<numArgs;j++){
                                
                                group.push(uic.processValue(inputs.eq(i+(j*ranks)).val()));
                            }
                            args.push(group);
                        }
                        
                        if(techType === "Active"){
                            var tpCost = [];
                            for(var i=0;i<ranks;i++){
                                tpCost.push(uic.processValue(inputs.eq((numArgs*ranks)+i).val()));
                            } 
                            var damage = [];
                            for(var i=0;i<ranks;i++){
                                damage.push(uic.processValue(inputs.eq((numArgs*(ranks*2))+i).val()));
                            } 
                            return [
                                techName,
                                args,
                                tpCost,
                                damage
                            ];
                        } else {
                            return [
                                techName,
                                args
                            ];
                        }
                    };
                    var techConts = $(".technique-cont"); 
                    var data = FileSaver.equipmentData[gearType][gearName];
                    data.techniques["Base"] = getSaveTechnique(techConts.eq(0),6);
                    for(var i=0;i<data.materials.length;i++){
                        data.techniques[data.materials[i]] = [
                            getSaveTechnique(techConts.eq((i*3)+1),2),
                            getSaveTechnique(techConts.eq((i*3)+2),2),
                            getSaveTechnique(techConts.eq((i*3)+3),2)
                        ];
                    }
                }
                function displayTechniques(kind,name){
                    var eqData = FileSaver.equipmentData[kind][name];
                    console.log(eqData)
                    $("#mid-cont").children(".UIC-group-item-props").empty();
                    $("#mid-cont").children(".UIC-group-item-props").append(getTech("Base Technique",eqData.techniques.Base));
                    $("#mid-cont").children(".UIC-group-item-props").append(Materials(eqData));
                }
                function gearCont(name,kind){
                    var cont =  $("<div class='UIC-group-item gear-name'><div class='no-bg-title-text' kind='"+kind+"'>"+name+"</div></div>");
                    cont.on("click",function(){
                        saveCurrentTechniques();
                        displayTechniques($(this).children(".no-bg-title-text").attr("kind"),$(this).children(".no-bg-title-text").text());
                        $(".gear-name").removeClass("selected");
                        $(this).addClass("selected");
                    });
                    return cont;
                }
                function Materials(data){
                    var materials = data.materials;
                    var cont = $(uic.Container("Materials",materials,false,false,true));
                    cont.children("span").addClass("sub-title-text");
                    var techConts = cont.children(".UIC-cont-props");
                    
                    for(var i=0;i<materials.length;i++){
                        var mat = $("<span class='quarter-width material'>"+materials[i]+"</span>");
                        mat.on("click",function(){
                            $(this).parent().siblings(".technique-cont").removeClass("selected");
                            $(this).siblings().removeClass("selected");
                            $(this).addClass("selected");
                            $(this).siblings(".UIC-cont-props").children(".technique-cont").hide();
                            var idx = $(this).parent().children(".material").index(this)*3;
                            $(this).siblings(".UIC-cont-props").children(".technique-cont:eq("+idx+")").show();
                            $(this).siblings(".UIC-cont-props").children(".technique-cont:eq("+(idx+1)+")").show();
                            $(this).siblings(".UIC-cont-props").children(".technique-cont:eq("+(idx+2)+")").show();
                            $(this).siblings(".UIC-cont-props").children(".technique-cont:eq("+idx+")").trigger("click");
                        });
                        cont.append(mat);
                        var tech = data.techniques[materials[i]];
                        var qualityKeys = Object.keys(FileSaver.equipmentData.Quality);
                        var num = 0;
                        tech.forEach(function(d,i){
                            techConts.append(getTech(qualityKeys[num]+"/"+qualityKeys[(num+1)],d));
                            num += 2;
                        });
                    }
                    cont.append(techConts);
                    cont.children(".material").first().trigger("click");
                    return cont;
                };
                $.getJSON("../../data/json/data/equipment.json",function(data){
                    FileSaver.equipmentData = data;
                    $.getJSON("../../data/json/data/techniques.json",function(data){
                        FileSaver.techniqueData = data;
                        FileSaver.techniqueNames = {
                            Active:data.Active.map(function(tech){return tech[0];}),
                            Passive:data.Passive.map(function(tech){return tech[0];})
                        };
                        var weapons = Object.keys(FileSaver.equipmentData.Weapons);
                        for(var i=0;i<weapons.length;i++){
                            var cont = gearCont(weapons[i],"Weapons");
                            $("#gear-cont").append(cont);
                        }
                        
                        var shields = Object.keys(FileSaver.equipmentData.Shields);
                        for(var i=0;i<shields.length;i++){
                            var cont = gearCont(shields[i],"Shields");
                            $("#gear-cont").append(cont);
                        }
                        var accessories = Object.keys(FileSaver.equipmentData.Accessories);
                        for(var i=0;i<accessories.length;i++){
                            var cont = gearCont(accessories[i],"Accessories");
                            $("#gear-cont").append(cont);
                        }

                        $(".UIC-group-item").first().trigger("click");
                    });
                });
            });
        </script>
    </head>
    <body>
        <div id="editor-content">
            <div id="left-cont">
                <p class="title-text">Gear</p>
                <div id="gear-cont">
                    
                </div>
            </div>
            <div id="mid-cont">
                <div class="UIC-group-item-props">
                    
                </div>
            </div>
            <div id="right-cont">
                <div class="UIC-group-item">
                    <div class="tech-display UIC-group-item-props"></div>
                </div>
            </div>
        </div>
    </body>
</html>