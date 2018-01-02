<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create Gear</title>
        <link rel="stylesheet" type="text/css" href="css/new-style.css">
        <style>
            body{
                width:100%;
                height:100%;
                background-color:var(--background-color);
            }
            #left-cont{
                width:33.33%;
                top:60px;
                position:absolute;
                left:0%;
                border:1px solid black;
            }
            #mid-cont{
                width:33.34%;
                top:60px;
                position:absolute;
                left:33.33%;
                border:1px solid black;
            }
            #right-cont{
                width:33.33%;
                top:60px;
                position:absolute;
                left:66.67%;
                border:1px solid black;
            }
            .title-text{
                cursor:pointer;
            }
            .UIC-group-item{
                overflow:hidden;
                padding:0;
                border:0;
            }
            .UIC-group-item-props p{
                padding:0;
            }
            .minimizer:hover{
                background-color:var(--content-button-hover-color);
            }
            .selected{
                background-color:var(--button-hover-color);
            }
        </style>
        <script>
            $(function(){
                var FileSaver = {
                    fileData:{},
                    saveFile:function(){
                        function setSaveValues(cont,order,category){
                            var gear = $(cont).children(".sub-title-text").text();
                            var props = $(cont).children(".gear-props").children(".UIC-prop");
                            props.each(function(i){
                                if(!$(this).val()) return;
                                FileSaver.fileData[category][gear][order[i]] = uic.processValue($(this).val());
                            });
                        }
                        $("#weapons-cont").children(".UIC-group-item").each(function(){
                            setSaveValues(this,["weight","wield","mindmg","maxdmg","reach","attackSpeed","range","cost","hands"],"Weapons");
                        });
                        $("#shields-cont").children(".UIC-group-item").each(function(){
                            setSaveValues(this,["weight","block","cost","hands"],"Shields");
                        });
                        $("#armour-cont").children(".UIC-group-item").each(function(){
                            setSaveValues(this,["weight","damageReduction","cost"],"Armour");
                        });
                        $("#footwear-cont").children(".UIC-group-item").each(function(){
                            setSaveValues(this,["weight","move","initiative","cost"],"Footwear");
                        });
                        $("#accessories-cont").children(".UIC-group-item").each(function(){
                            setSaveValues(this,["weight","effect","cost"],"Accessories");
                        });
                        
                        $.ajax({
                            type:'POST',
                            url:'save-gear.php',
                            data:{data:JSON.stringify(FileSaver.fileData)},
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
                function gearCont(name){
                    return $("<div class='UIC-group-item'><div class='sub-title-text minimizer'>"+name+"</div><div class='gear-props UIC-group-item-props minimizable'></div></div>");
                };
                function Weapon(w){
                    return uic.Input("Weight",w.weight,"number",1,100,0.01)+
                            uic.Input("Wield",w.wield,"number",1,1000)+
                            uic.Input("Min Damage",w.mindmg,"number",1,1000)+
                            uic.Input("Max Damage",w.maxdmg,"number",1,1000)+
                            uic.Input("Reach",w.reach,"number",1,1000)+
                            uic.Input("ATK Speed",w.attackSpeed,"number",1,1000)+
                            uic.Input("Range",w.range,"number",1,20)+
                            uic.Input("Cost",w.cost,"number",1,10000)+
                            uic.Input("Hands",w.hands,"number",1,2);
                }
                function Shield(s){
                    return uic.Input("Weight",s.weight,"number",1,100)+
                            uic.Input("Block",s.block,"number",1,1000)+
                            uic.Input("Cost",s.cost,"number",1,10000)+
                            uic.Input("Hands",s.hands,"number",1,2);
                }
                function Armour(a){
                    return uic.Input("Weight",a.weight,"number",1,100)+
                            uic.Input("Dmg Reduction",a.damageReduction,"number",1,1000)+
                            uic.Input("Cost",a.cost,"number",1,10000);
                }
                function Footwear(f){
                    return uic.Input("Weight",f.weight,"number",1,100)+
                            uic.Input("Move",f.move,"number",1,10)+
                            uic.Input("Initiative",f.initiative,"number",1,10)+
                            uic.Input("Cost",f.cost,"number",1,10000);
                }
                function Accessory(a){
                    return uic.Input("Weight",a.weight,"number",1,100)+
                            uic.Input("Effect",a.effect,"text")+
                            uic.Input("Cost",a.cost,"number",1,10000);
                }
                function Materials(materials){
                    var cont = $(uic.Container("Materials",materials));
                    cont.children("span").addClass("sub-title-text");
                    for(var i=0;i<materials.length;i++){
                        var mat = $("<span class='quarter-width'>"+materials[i]+"</span>");
                        mat.on("click",function(){
                            $(this).siblings().removeClass("selected");
                            $(this).addClass("selected");
                            $(this).parent().siblings("select:eq(0)").nextAll().remove();
                            var quality = $(this).parent().siblings("select:eq(0)").val();
                            var material = $(this).text() ;
                            var gearType = $(this).parent().parent().parent().parent().prev().text();
                            var gear = $(this).parent().parent().siblings(".sub-title-text").text();
                            var qualityData = FileSaver.fileData["Quality"][quality];
                            var materialData = FileSaver.fileData["Materials"][material];
                            var gearData = FileSaver.fileData[gearType][gear];
                            
                            var name = quality+" "+material+" "+gear;
                            $(this).parent().parent().append(uic.Text("Name",name));
                            var weight = Math.ceil(gearData.weight + materialData[0]);
                            $(this).parent().parent().append(uic.Text("Weight",weight));
                            var cost = Math.ceil(gearData.cost*qualityData[1]*materialData[2]);
                            $(this).parent().parent().append(uic.Text("Cost",cost));
                            switch(gearType){
                                case "Weapons":
                                    var wield = Math.ceil(gearData.wield*qualityData[0]);
                                    var mindmg = Math.ceil(gearData.mindmg*materialData[1]);
                                    var maxdmg = Math.ceil(gearData.maxdmg*materialData[1]);
                                    var atkSpeed = Math.ceil(gearData.attackSpeed*qualityData[0]);
                                    $(this).parent().parent().append(uic.Text("Wield",wield));
                                    $(this).parent().parent().append(uic.Text("Min DMG",mindmg));
                                    $(this).parent().parent().append(uic.Text("Max DMG",maxdmg));
                                    $(this).parent().parent().append(uic.Text("ATK Speed",atkSpeed));
                                    
                                    break;
                                case "Shields":
                                    var block = Math.ceil(gearData.block*materialData[1]*qualityData[0]);
                                    $(this).parent().parent().append(uic.Text("Block",block));
                                    break;
                                case "Armour": 
                                    var dmgRed = Math.ceil(gearData.damageReduction*materialData[1]*qualityData[0]);
                                    $(this).parent().parent().append(uic.Text("Dmg Reduction",dmgRed));
                                    break;
                                case "Footwear":
                                    var initiative = Math.ceil(gearData.initiative * ((qualityData[0]/2)+(materialData[1]/2)));
                                    $(this).parent().parent().append(uic.Text("Initiative",initiative));
                                    break;
                            }
                        });
                        cont.append(mat);
                    }
                    return cont;
                }
                $.getJSON("../../data/json/data/equipment.json",function(data){
                    FileSaver.fileData = data;
                    var weapons = Object.keys(data.Weapons);
                    for(var i=0;i<weapons.length;i++){
                        var cont = gearCont(weapons[i]);
                        cont.children(".gear-props").append(Weapon(FileSaver.fileData.Weapons[weapons[i]]));
                        cont.children(".gear-props").append(Materials(FileSaver.fileData.Weapons[weapons[i]].materials));
                        cont.children(".gear-props").append(uic.Select("Quality",FileSaver.fileData["Quality"],"Average"));
                        $(cont.children(".gear-props").children("select:eq(0)")).on("change",function(){$(this).siblings(".UIC-container").children("span.selected").trigger("click");});
                        uic.selectInitialValue(cont.children(".gear-props"));
                        $("#weapons-cont").append(cont);
                        cont.children(".gear-props").children(".UIC-container").children("span:eq(1)").trigger("click");
                    }
                    var shields = Object.keys(data.Shields);
                    for(var i=0;i<shields.length;i++){
                        var cont = gearCont(shields[i]);
                        cont.children(".gear-props").append(Shield(FileSaver.fileData.Shields[shields[i]]));
                        cont.children(".gear-props").append(Materials(FileSaver.fileData.Shields[shields[i]].materials));
                        cont.children(".gear-props").append(uic.Select("Quality",FileSaver.fileData["Quality"],"Average"));
                        $(cont.children(".gear-props").children("select:eq(0)")).on("change",function(){$(this).siblings(".UIC-container").children("span.selected").trigger("click");});
                        uic.selectInitialValue(cont.children(".gear-props"));
                        $("#shields-cont").append(cont);
                        cont.children(".gear-props").children(".UIC-container").children("span:eq(1)").trigger("click");
                    }
                    var armour = Object.keys(data.Armour);
                    for(var i=0;i<armour.length;i++){
                        var cont = gearCont(armour[i]);
                        cont.children(".gear-props").append(Armour(FileSaver.fileData.Armour[armour[i]]));
                        cont.children(".gear-props").append(Materials(FileSaver.fileData.Armour[armour[i]].materials));
                        cont.children(".gear-props").append(uic.Select("Quality",FileSaver.fileData["Quality"],"Average"));
                        $(cont.children(".gear-props").children("select:eq(0)")).on("change",function(){$(this).siblings(".UIC-container").children("span.selected").trigger("click");});
                        uic.selectInitialValue(cont.children(".gear-props"));
                        $("#armour-cont").append(cont);
                        cont.children(".gear-props").children(".UIC-container").children("span:eq(1)").trigger("click");
                    }
                    var footwear = Object.keys(data.Footwear);
                    for(var i=0;i<footwear.length;i++){
                        var cont = gearCont(footwear[i]);
                        cont.children(".gear-props").append(Footwear(FileSaver.fileData.Footwear[footwear[i]]));
                        cont.children(".gear-props").append(Materials(FileSaver.fileData.Footwear[footwear[i]].materials));
                        cont.children(".gear-props").append(uic.Select("Quality",FileSaver.fileData["Quality"],"Average"));
                        $(cont.children(".gear-props").children("select:eq(0)")).on("change",function(){$(this).siblings(".UIC-container").children("span.selected").trigger("click");});
                        uic.selectInitialValue(cont.children(".gear-props"));
                        $("#footwear-cont").append(cont);
                        cont.children(".gear-props").children(".UIC-container").children("span:eq(1)").trigger("click");
                    }
                    var accessories = Object.keys(data.Accessories);
                    for(var i=0;i<accessories.length;i++){
                        var cont = gearCont(accessories[i]);
                        cont.children(".gear-props").append(Accessory(FileSaver.fileData.Accessories[accessories[i]]));
                        $("#accessories-cont").append(cont);
                    }
                    var materials = Object.keys(data.Materials);
                    for(var i=0;i<materials.length;i++){
                        var cont = gearCont(materials[i]);
                        cont.children(".gear-props").append(
                            uic.Input("Effect A",FileSaver.fileData.Materials[materials[i]][0],"number",0,100,0.01)+
                            uic.Input("Effect B",FileSaver.fileData.Materials[materials[i]][1],"number",0,100,0.01)+
                            uic.Input("Cost Multiplier",FileSaver.fileData.Materials[materials[i]][2],"number",0,100000,0.01)
                        );
                        $(cont).children(".gear-props").children("input").each(function(){
                            $(this).on("change",function(){
                                var idx = $(this).parent().children("input").index(this);
                                var material = $(this).parent().siblings(".sub-title-text").text();
                                FileSaver.fileData.Materials[material][idx] = parseFloat($(this).val());
                                $(".UIC-container").children(".selected").each(function(){
                                    if($(this).text() === material){
                                        $(this).trigger("click");
                                    }
                                });
                            });
                        });
                        $("#materials-cont").append(cont);
                    }
                    
                    var quality = Object.keys(data.Quality);
                    for(var i=0;i<quality.length;i++){
                        var cont = gearCont(quality[i]);
                        cont.children(".gear-props").append(
                            uic.Input("Effect C",FileSaver.fileData.Quality[quality[i]][0],"number",1,100,0.01)+
                            uic.Input("Cost Multiplier",FileSaver.fileData.Quality[quality[i]][1],"number",1,100,0.01)
                        );
                        $(cont).children(".gear-props").children("input").each(function(){
                            $(this).on("change",function(){
                                var idx = $(this).parent().children("input").index(this);
                                var quality = $(this).parent().siblings(".sub-title-text").text();
                                FileSaver.fileData.Quality[quality][idx] = parseFloat($(this).val());
                                $(".UIC-group-item-props").children("select").each(function(){
                                    if($(this).val() === quality){
                                        $(this).siblings(".UIC-container").children(".selected").trigger("click");
                                    }
                                });
                            });
                        });
                        $("#quality-cont").append(cont);
                    }
                    
                    $(".minimizer").on("click",function(){
                        if($(this).next().is(":visible")){
                            $(this).next().hide();
                        } else {
                            $(this).next().show();
                        }
                    });
                    $(".sub-title-text.minimizer").trigger("click");
                    //$(".title-text.minimizer").trigger("click");
                });
            });
        </script>
    </head>
    <body>
        <div id="editor-content">
            <div id="left-cont">
                <p class="title-text minimizer">Weapons</p>
                <div id="weapons-cont" class="minimizable">
                    
                </div>
                <p class="title-text minimizer">Shields</p>
                <div id="shields-cont" class="minimizable">
                    
                </div>
                
            </div>
            
            <div id="mid-cont">
                <p class="title-text minimizer">Armour</p>
                <div id="armour-cont" class="minimizable">
                    
                </div>
                <p class="title-text minimizer">Footwear</p>
                <div id="footwear-cont" class="minimizable">
                    
                </div>
                <p class="title-text minimizer">Accessories</p>
                <div id="accessories-cont" class="minimizable">
                    
                </div>
            </div>
            <div id="right-cont">
                <p class="title-text minimizer">Materials</p>
                <div id="materials-cont" class="minimizable">
                    
                </div>
                
                <p class="title-text minimizer">Quality</p>
                <div id="quality-cont" class="minimizable">
                    
                </div>
            </div>
        </div>
    </body>
</html>