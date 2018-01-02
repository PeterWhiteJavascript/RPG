<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create Techniques</title>
        <link rel="stylesheet" type="text/css" href="css/new-style.css">
        <link rel="stylesheet" type="text/css" href="css/techniques-editor.css">
        <script>
            $(function(){
                var FileSaver = {
                    fileData:{},
                    saveFile:function(){

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
                           // FileSaver.saveFile();
                        },
                        Test:function(){

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
                function showTechnique(type,tech){
                    var data = FileSaver.techniqueData[type].find(function(d){return tech === d[0];});
                    $("#mid-cont").children(".UIC-group-item").children(".tech-display").empty();
                    if(type==="Active"){
                        $("#mid-cont").children(".UIC-group-item").children(".tech-display").append(
                            uic.Text("Name",data[0]),
                            uic.Text("Desc",data[1]),
                            uic.Text("Tech Type",data[2][0]+", "+data[2][1]),
                            uic.Text("Range",data[3][0]+", "+data[3][1]),
                            uic.Text("AOE",data[4][0]+", "+data[4][1]),
                            uic.Text("Resisted By",data[5].length ? data[5].toString().replace(/,/g, ', ') : "None"),
                            uic.Text("Default TP Cost",data[6]),
                            uic.Text("Animation",data[7]),
                            uic.Text("Sound",data[8]),
                            uic.Text("Arguments",data[9].length ? data[9].map(function(d){return d[0]+" -> "+d[1];}).toString().replace(/,/g, '<br>') : "None")
                        );
                    } else {
                        $("#mid-cont").children(".UIC-group-item").children(".tech-display").append(
                            uic.Text("Name",data[0]),
                            uic.Text("Desc",data[1]),
                            uic.Text("Arguments",data[2].length ? data[2].map(function(d){return d[0]+" -> "+d[1];}).toString().replace(/,/g, '<br>') : "None")
                        );
                    }
                };
                function getTech(name,tech){
                    var techType = tech.length === 3 ? "Active" : "Passive";
                    var cont = $("<div class='technique-cont'><span class='full-width sub-title-text'>"+name+"</span></div>");
                    cont.append(uic.Select("Tech Type",["Active","Passive"],techType));
                    cont.append(uic.Select("Technique",FileSaver.techniqueNames[techType],tech[0]));
                    uic.linkSelects(cont.children("select:eq(0)"),cont.children("select:eq(1)"),FileSaver.techniqueNames);
                    cont.on("click",function(){
                        var lastSelected = $(".technique-cont.selected").first();
                        if(lastSelected.parent().siblings(".sub-title-text").text() === $(this).parent().siblings(".sub-title-text").text() && lastSelected.children(".sub-title-text").text() === $(this).children(".sub-title-text").text()) return;
                        $(".technique-cont").removeClass("selected");
                        $(this).addClass("selected");
                        showTechnique($(this).children("select:eq(0)").val(),$(this).children("select:eq(1)").val());
                    });

                    function createArguments(args,num,cont){
                        if(!args.length) return;
                        for(var i=0;i<args[0].length;i++){
                            cont.append("<span class='quarter-width'>Arg "+i+"</span>");
                            for(var j=0;j<num;j++){
                                cont.append("<input class='twelve-n-five-width' value='"+args[j][i]+"'>");
                            }
                        }
                    }
                    function createSPCost(cont,num,arg){
                        cont.append("<span class='quarter-width'>TP Cost</span>");
                        for(var j=0;j<num;j++){
                            cont.append("<input class='twelve-n-five-width' value='"+arg[j]+"'>");
                        }
                    }
                    var numOfLevels = name === "Base Technique" ? 6 : 2;
                    createArguments(tech[1],numOfLevels,cont);
                    $(cont).children("select:eq(1)").on("change",function(){
                        $(this).nextAll().remove();
                        var category = $(this).siblings(".sub-title-text").first().text();
                        var numOfLevels = category === "Base Technique" ? 6 : 2;
                        var type = $(this).siblings("select").first().val();
                        var tech = $(this).val();
                        var data = FileSaver.techniqueData[type].find(function(t){return t[0] === tech;});
                        var args = data[data.length-1].map(function(d){return d[1];});
                        createArguments(Array(numOfLevels).fill(args),numOfLevels,$(this).parent());
                        if(type === "Active") createSPCost($(this).parent(),numOfLevels,Array(numOfLevels).fill([data[data.length-3]]));
                        showTechnique(type,tech);
                    });
                    if(techType === "Active") createSPCost(cont,numOfLevels,tech[2]);
                    uic.selectInitialValue(cont);
                    return cont;
                }
                function gearCont(name,kind){
                    return $("<div class='UIC-group-item'><div class='sub-title-text minimizer'>"+name+"</div><div class='gear-props UIC-group-item-props minimizable' kind='"+kind+"'></div></div>");
                }
                function Materials(materials){
                    var cont = $(uic.Container("Materials",materials));
                    cont.children("span").addClass("sub-title-text");
                    for(var i=0;i<materials.length;i++){
                        var mat = $("<span class='quarter-width material'>"+materials[i]+"</span>");
                        mat.on("click",function(){
                            $(this).siblings().removeClass("selected");
                            $(this).addClass("selected");
                            var material = $(this).text();
                            var gear = $(this).parent().parent().siblings(".sub-title-text").text();
                            var category = $(this).parent().parent().attr("kind");
                            var data = FileSaver.equipmentData[category][gear].techniques[material];
                            $(this).parent().nextAll().remove();
                            var cont = $(this).parent().parent();
                            var qualityKeys = Object.keys(FileSaver.equipmentData.Quality);
                            var num = 0;
                            if(!data) data = Array(3).fill(["Stab",[[0],[1]],[1,2]]);//REMOVE THIS AFTER EVERYTHING IS SAVED
                            data.forEach(function(d,i){
                                cont.append(getTech(qualityKeys[num]+"/"+qualityKeys[(num+1)],d));
                                num += 2;
                            });
                        });
                        cont.append(mat);
                    }
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
                            cont.children(".gear-props").append(getTech("Base Technique",FileSaver.equipmentData.Weapons[weapons[i]].techniques.Base));
                            cont.children(".gear-props").append(Materials(FileSaver.equipmentData.Weapons[weapons[i]].materials));
                            $("#gear-cont").append(cont);
                        }
                        var shields = Object.keys(FileSaver.equipmentData.Shields);
                        for(var i=0;i<shields.length;i++){
                            var cont = gearCont(shields[i],"Shields");
                            cont.children(".gear-props").append(getTech("Base Technique",FileSaver.equipmentData.Shields[shields[i]].techniques.Base));
                            cont.children(".gear-props").append(Materials(FileSaver.equipmentData.Shields[shields[i]].materials));
                            $("#gear-cont").append(cont);
                        }
                        var accessories = Object.keys(FileSaver.equipmentData.Accessories);
                        for(var i=0;i<accessories.length;i++){
                            var cont = gearCont(accessories[i],"Accessories");
                            cont.children(".gear-props").append(getTech("Base Technique",FileSaver.equipmentData.Accessories[accessories[i]].techniques.Base));
                            $("#gear-cont").append(cont);
                        } 
                        
            
                        $(document).on("click",".minimizer",function(){
                            if($(this).next().is(":visible")){
                                $(this).next().hide();
                            } else {
                                $(this).next().show();
                            }
                        });

                        $(".UIC-group-item").children(".sub-title-text.minimizer").trigger("click");
                    });
                });
            });
        </script>
    </head>
    <body>
        <div id="editor-content">
            <div id="left-cont">
                <p class="title-text minimizer">Gear</p>
                <div id="gear-cont" class="minimizable">
                    
                </div>
            </div>
            <div id="mid-cont">
                <div class="UIC-group-item">
                    <div class="tech-display UIC-group-item-props"></div>
                </div>
            </div>
        </div>
    </body>
</html>