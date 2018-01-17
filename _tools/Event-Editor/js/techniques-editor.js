$(function(){
    
    var FileSaver = {
        fileData:{},
        getTechnique:function(category,name,charClass){
            if(category === "CharClass"){
                var charClass = charClass || $(".sub-title-text:contains("+(name)+")").parent().parent().siblings(".title-text").filter(function(){
                    return $(this).text() !== "Active";
                }).eq(0).text();
                return FileSaver.techniqueData[category][charClass].find(function(t){return t[0] === name;});
            } else {
                return FileSaver.techniqueData[category].find(function(t){return t[0] === name;});
            }
        },
        saveFile:function(){
            $.ajax({
                type:'POST',
                url:'save-techniques.php',
                data:{data:JSON.stringify(FileSaver.techniqueData)},
                dataType:'json'
            })
            .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
            .fail(function(data){console.log(data)});
        }
    };
    
    $.getJSON("../../data/json/data/character-generation.json",function(data){
        FileSaver.charGen = data;
        $.getJSON("../../data/json/data/techniques.json",function(data){
            FileSaver.techniqueData = data;
            var uic = new UIC({
                topBarProps:{
                    Save:function(){
                        saveCurrentTech();
                        FileSaver.saveFile();
                    },  
                    Back:function(){
                        if(confirm("Are you sure you want to go back without saving?")){
                            var to = "index.php";
                            $.redirect(to);
                        }
                    }
                },
                techniquesFuncs:["Change Stat","Apply Status Effect","Change Ground"],
                targets:["Target","User"],
                techniqueProps:function(func,props){
                    var cont = $("<div class='UIC-group-item-props'></div>");
                    func = func || "Target";
                    switch(func){
                        case "Change Stat":
                            props = props || ["Target","combatStats","physicalResistance","+",10,0,100];
                            cont.append(uic.Select("Affects",uic.targets,props[0]));
                            
                            cont.append(uic.Select("Stat Type",uic.argumentTargetProps,props[1]));
                            cont.append(uic.Select("Stat",uic.argumentTargetProps[props[1]],props[2]));
                            uic.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],uic.argumentTargetProps);
                            
                            cont.append(uic.Select("Operator",uic.operators,props[3]));
                            cont.append(uic.Input("Amount",props[4],"number"));
                            cont.append(uic.Input("Turns",props[5],"number",0));
                            cont.append(uic.Input("Accuracy",props[6],"number",1,100));
                        
                            break;
                        case "Apply Status Effect":
                            props = props || ["Target","Poison",3,100];
                            cont.append(uic.Select("Affects",uic.targets,props[0]));
                            cont.append(uic.Select("Status Effect",FileSaver.charGen.statuses,props[1]));
                            cont.append(uic.Input("Turns",props[2],"number",0));
                            cont.append(uic.Input("Accuracy",props[3],"number",1,100));
                            break;
                        case "Change Ground":
                            props = props || ["Icy",3,4,100];
                            cont.append(uic.Select("Target",uic.argumentGroundProps,props[0]));
                            cont.append(uic.Select("Tile",uic.argumentGroundProps[props[0]],props[1]));
                            uic.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],uic.argumentGroundProps);
                            
                            cont.append(uic.Input("Min Turns",props[2],"number",1));
                            cont.append(uic.Input("Max Turns",props[3],"number",1));
                            cont.append(uic.Input("Accuracy",props[4],"number",1,100));
                            break;
                    }
                    this.selectInitialValue(cont);
                    return cont;
                },
                argumentTargetProps:{
                    combatStats:FileSaver.charGen.combatStats,
                    dmgResistance:FileSaver.techniqueData.data["techTypes2"],
                    statusResistance:FileSaver.charGen.statuses
                },
                argumentGroundProps:{
                    changeTile:["Icy","Burning"],
                    addObjectOnTop:["Caltrops","Mirage"]
                },
                operators:["+","-","*","/"]
            });
            uic.createTopMenu($("#editor-content"));

            function techniqueArguments(data){
                return uic.createGroup([uic.getPremadeGroup("TechniqueArguments",data)]);
            };
            function saveCurrentTech(){
                function getArgs(args){
                    var argums = [];
                    args.each(function(){
                        argums.push([
                           $(this).children("input:eq(0)").val(), 
                           uic.processValue($(this).children("input:eq(1)").val())
                        ]);
                    });
                    return argums;
                }
                var type = $(".sub-title-text.selected").closest(".tech-group").attr("class").split(" ")[1];
                var tech = $(".sub-title-text.selected").text();
                var cont = $(".technique-props");
                var data;
                if(type === "Active" || type === "CharClass"){
                    data = [
                        cont.children("input:eq(0)").val(),
                        cont.children("textarea:eq(0)").val(),
                        [cont.children("select:eq(0)").val(),cont.children("select:eq(1)").val()],
                        [uic.processValue(cont.children("input:eq(1)").val()),cont.children("select:eq(2)").val(),JSON.parse(cont.children(".UIC-container:eq(0)").attr("data"))],
                        [uic.processValue(cont.children("input:eq(2)").val()),cont.children("select:eq(3)").val(),JSON.parse(cont.children(".UIC-container:eq(1)").attr("data"))],
                        JSON.parse(cont.children(".UIC-container:eq(2)").attr("data")),
                        uic.processValue(cont.children("input:eq(3)").val()),
                        cont.children("select:eq(4)").val(),
                        cont.children("select:eq(5)").val(),
                        uic.getSaveGroups(cont)[0][0]
                    ];
                } else {
                    data = [
                        cont.children("input:eq(0)").val(),
                        cont.children("input:eq(1)").val(),
                        uic.getSaveGroups(cont)[0][0]
                    ];
                }
                if(type === "CharClass"){
                    var charClass = $(".sub-title-text:contains("+tech+")").filter(function() {
                        return $(this).text() === tech;
                    }).parent().parent().siblings(".title-text").text();
                    FileSaver.techniqueData[type][charClass][FileSaver.techniqueData[type][charClass].indexOf(FileSaver.getTechnique(type,tech,charClass))] = data;
                } else {
                    FileSaver.techniqueData[type][FileSaver.techniqueData[type].indexOf(FileSaver.getTechnique(type,tech))] = data;
                }
            };
            function removeTech(pass){
                var type = $(this).parent().parent().siblings(".title-text").text();
                var tech = $(this).siblings(".sub-title-text").text();
                if(confirm("Remove "+tech+"?")){
                    FileSaver.techniqueData[type].splice(FileSaver.techniqueData[type].indexOf(FileSaver.getTechnique(type,tech)),1);
                    $(this).parent().remove();
                }
            };
            var TechFuncs = {
                Active:function(data){
                    var cont = $("<div class='technique-props UIC-group-item-props'></div>");
                    cont.append(uic.Input("Name",data[0]));
                    uic.linkValueToText(cont.children("input:eq(0)"),$(".sub-title-text.selected"),100);
                    cont.children("input:eq(0)").attr("orig-name",data[0]);
                    $(cont).children("input").on("focusout",function(){
                        var type = $(".sub-title-text.selected").closest(".tech-group").attr("class").split(" ")[1];
                        var charClass;
                        if(type === "CharClass"){
                            charClass =$(".sub-title-text.selected").parent().parent().siblings(".title-text").text();
                        }
                        FileSaver.getTechnique(type,$(this).attr("orig-name"),charClass)[0] = uic.processValue($(this).val());
                    });
                    cont.append(uic.TextArea("Desc",data[1]));
                    cont.append(uic.Select("Tech Type 1",FileSaver.techniqueData.data["techTypes1"],data[2][0]));
                    cont.append(uic.Select("Tech Type 2",FileSaver.techniqueData.data["techTypes2"],data[2][1]));

                    cont.append(uic.Input("Range",data[3][0],"number"));
                    cont.append(uic.Select("Range Type",FileSaver.techniqueData.data["rangeTypes"],data[3][1]));
                    var rangeOpts = $(uic.Container("Range Options",data[3][2],"checkbox",FileSaver.techniqueData.data["rangeProps"]));
                    cont.append(rangeOpts);

                    cont.append(uic.Input("AOE",data[4][0],"number"));
                    cont.append(uic.Select("AOE Type",FileSaver.techniqueData.data["aoeTypes"],data[4][1]));
                    var aoeOpts = $(uic.Container("AOE Options",data[4][2],"checkbox",FileSaver.techniqueData.data["aoeProps"]));
                    cont.append(aoeOpts);

                    var resist = $(uic.Container("Resisted By",data[5],"checkbox",FileSaver.techniqueData.data["resistProps"]));
                    cont.append(resist);
                    cont.append(uic.Input("Default TP Cost",data[6],"number"));
                    cont.append(uic.Select("Animation",FileSaver.techniqueData.data["animations"],data[7]));
                    cont.append(uic.Select("Sound",FileSaver.techniqueData.data["sounds"],data[8]));

                    cont.append(techniqueArguments(data[9]));
                    uic.selectInitialValue(cont);
                    $(cont).children(".technique-props").children("input, select, textarea").on("focusout",function(){
                        var elementGroup = $(this).parent().children("input, select, textarea");
                        var conts = $(this).parent().children("div.UIC-prop");
                        var idx = elementGroup.index(this);
                        var technique = $(this).parent().siblings(".sub-title-text").text();
                        var data = FileSaver.getTechnique("Active",technique);
                        var thisVal = $(this).val();
                        switch(idx){
                            case 0:
                            case 1:
                            case 6:
                            case 8:
                            case 9:
                            case 10:
                                data[idx] = uic.processValue(thisVal);
                                break;
                            case 2:
                                data[2] = [uic.processValue(thisVal),uic.processValue(elementGroup.eq(idx+1).val())];
                                break;
                            case 3:
                                data[2] = [uic.processValue(elementGroup.eq(idx-1).val()),uic.processValue(thisVal)];
                                break
                            case 4:
                                data[3] = [uic.processValue($(this).val()),uic.processValue(elementGroup.eq(idx+1).val()),JSON.parse(conts.eq(0).attr("data"))];
                                break;
                            case 5:
                                data[3] = [uic.processValue(elementGroup.eq(idx-1).val()),uic.processValue($(this).val()),JSON.parse(conts.eq(0).attr("data"))];
                                break;
                            case 6:
                                data[4] = [uic.processValue($(this).val()),uic.processValue(elementGroup.eq(idx+1).val()),JSON.parse(conts.eq(1).attr("data"))];
                                break;
                            case 7:
                                data[4] = [uic.processValue(elementGroup.eq(idx+1).val()),uic.processValue($(this).val()),JSON.parse(conts.eq(1).attr("data"))];
                                break;
                        }
                    });
                    return cont;
                },
                Passive:function(data){
                    var cont = $("<div class='technique-props UIC-group-item-props'></div>");
                    cont.append(uic.Input("Name",data[0]));
                    uic.linkValueToText(cont.children("input:eq(0)"),$(".sub-title-text.selected"),100);
                    cont.children("input:eq(0)").attr("orig-name",data[0]);
                    cont.append(uic.Input("Desc",data[1]));
                    $(cont).children("input").on("focusout",function(){
                        FileSaver.getTechnique("Passive",$(this).attr("orig-name"))[0] = uic.processValue($(this).val());
                    });
                    cont.append(techniqueArguments(data[2]));
                    return cont;
                }
            };
            function techName(name,type){
                var cont = $("<div class='technique group-item'><div class='sub-title-text'>"+name+"</div></div>");
                if(type !== "CharClass"){
                    cont.prepend("<div class='remove-tech'><span>x</span></div>");
                    cont.children(".remove-tech").on("click",removeTech);
                }
                cont.children(".sub-title-text").on("click",function(){
                    if($(".sub-title-text.selected").length){
                        saveCurrentTech();
                        $(".sub-title-text.selected").removeClass("selected");
                    }
                    $(this).addClass("selected");
                    $("#mid-cont").empty();
                    var type = $(this).closest(".tech-group").attr("class").split(" ")[1];
                    var data = FileSaver.getTechnique(type,$(this).text());
                    if(type === "CharClass") type = "Active";
                    $("#mid-cont").append(TechFuncs[type](data));
                });
                return cont;
            }
            var activeTechs = FileSaver.techniqueData.Active;
            for(var i=0;i<activeTechs.length;i++){
                $("#active-techniques-cont").append(techName(activeTechs[i][0],"Active"));
            }

            var passiveTechs = FileSaver.techniqueData.Passive;
            for(var i=0;i<passiveTechs.length;i++){
                $("#passive-techniques-cont").append(techName(passiveTechs[i][0],"Passive"));
            }
            var charClasses = Object.keys(FileSaver.techniqueData.CharClass);
            for(var i=0;i<charClasses.length;i++){
                var cont = $('<div class="UIC-group-item"><p class="title-text minimizer">'+charClasses[i]+'</p><div class="tech-props"></div></div>');
                for(var j=0;j<FileSaver.techniqueData.CharClass[charClasses[i]].length;j++){
                    cont.children(".tech-props").append(techName(FileSaver.techniqueData.CharClass[charClasses[i]][j][0],"CharClass"));
                }
                $("#char-classes-cont").append(cont);
            }

            $("#add-active-tech").click(function(){
                var data = [
                    "New Technique",
                    "",
                    ["Damage","Physical"],
                    [1,"Normal",[]],
                    [0,"Normal",[]],
                    [],
                    10,
                    "Charging",
                    "slashing",
                    []
                ];
                FileSaver.techniqueData["Active"].push(data);
            });
            $("#add-passive-tech").click(function(){
                var data = [
                    "New Technique",
                    "",
                    []
                ];
                FileSaver.techniqueData["Passive"].push(data);
            });


            $(document).on("click",".minimizer",function(){
                if($(this).next().is(":visible")){
                    $(this).next().hide();
                } else {
                    $(this).next().show();
                }
            });

            $(".UIC-group-item").children(".sub-title-text.minimizer").trigger("click");
            $("#char-classes-cont").children(".UIC-group-item").children(".title-text.minimizer").trigger("click");
            $(".title-text:contains(Char Classes)").trigger("click");
            $(".technique").first().children(".sub-title-text").trigger("click");
        });
    });
});