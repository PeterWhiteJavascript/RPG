<?php

$equipment = file_get_contents('../../data/json/data/equipment.json');

?>

<!DOCTYPE html>
<html>
    <head>
        <title>Generate All Equipment</title>
        <script src="lib/jquery-3.1.1.js"></script>
        <script src="lib/jquery-ui.min.js"></script>
        <script src="lib/sorttable.js"></script>
        <link rel="stylesheet" href="css/style.css">
    </head>
    <body>
        <div id="equipment" hidden><?php echo $equipment?></div>
        <div><p>Weapons</p></div>
        <table id="weapons-table" class="sortable">
            <tr>
                <th>Name</th>

                <th>Wield</th>
                <th>Min Dmg</th>
                <th>Max Dmg</th>
                <th>Reach</th>
                <th>Speed</th>
                <th>Range</th>
                <th>Handed</th>

                <th>Wgt (Gear)</th>
                <th>Wgt (Material)</th>
                <th>Wgt (Total)</th>

                <th>Cost (Gear)</th>
                <th>Cost (Material)</th>
                <th>Cost (Total)</th>

                <th>Effect A</th>

                <th>Effect B</th>
                <th>Cost Mult</th>
            </tr>
        </table>
        
        <div><p>Shields</p></div>
        <table id="shields-table" class="sortable">
            <tr>
                <th>Name</th>

                <th>Block</th>
                <th>Handed</th>

                <th>Wgt (Gear)</th>
                <th>Wgt (Material)</th>
                <th>Wgt (Total)</th>

                <th>Cost (Gear)</th>
                <th>Cost (Material)</th>
                <th>Cost (Total)</th>

                <th>Effect A</th>

                <th>Effect B</th>
                <th>Cost Mult</th>
            </tr>
        </table>
        
        <div><p>Armour</p></div>
        <table id="armour-table" class="sortable">
            <tr>
                <th>Name</th>
                
                <th>Dmg Reduction</th>
                
                <th>Wgt (Gear)</th>
                <th>Wgt (Material)</th>
                <th>Wgt (Total)</th>
                
                <th>Cost (Gear)</th>
                <th>Cost (Material)</th>
                <th>Cost (Total)</th>
                
                <th>Effect A</th>
                
                <th>Effect B</th>
                <th>Cost Mult</th>
            </tr>
        </table>
        
        <div><p>Footwear</p></div>
        <table id="footwear-table" class="sortable">
            <tr>
                <th>Name</th>
                
                <th>Move</th>
                
                <th>Wgt (Gear)</th>
                <th>Wgt (Material)</th>
                <th>Wgt (Total)</th>
                
                <th>Cost (Gear)</th>
                <th>Cost (Material)</th>
                <th>Cost (Total)</th>
                
                <th>Effect A</th>
                
                <th>Effect B</th>
                <th>Cost Mult</th>
            </tr>
        </table>
        
        <div><p>Accessories</p></div>
        <table id="accessories-table" class="sortable">
            <tr>
                <th>Name</th>

                <th>Effect</th>

                <th>Wgt (Gear)</th>
                <th>Wgt (Material)</th>
                <th>Wgt (Total)</th>

                <th>Cost (Gear)</th>
                <th>Cost (Material)</th>
                <th>Cost (Total)</th>

                <th>Effect A</th>

                <th>Effect B</th>
                <th>Cost Mult</th>
            </tr>
        </table>
        <script>
            var data = JSON.parse($("#equipment").text());
            var genEquip = {};
            var generateEquipment = function(gear,material,type,quality){
                var gearData = data[type][gear];
                var matData = data["Materials"][material];
                var qualityData = data["Quality"][quality];
                var equipment = {
                    name:quality+" "+material+" "+gear,
                    weightGear:gearData.weight,
                    weightMaterial:matData[0],
                    weightTotal:Math.ceil(gearData.weight+matData[0]),
                    costGear:gearData.cost,
                    costMaterial:matData[2],
                    costQuality:qualityData[1],
                    costTotal:Math.ceil((gearData.cost*qualityData[1])*matData[2]),
                    effectA:matData[1],
                    effectB:qualityData[0]
                };
                switch(type){
                    case "Shields":
                        equipment.block = Math.ceil(gearData.block*equipment.effectA*qualityData[0]);
                        equipment.hands = gearData.hands;
                        insertToShieldsTable(equipment);
                        break;
                    case "Weapons":
                        equipment.wield = Math.ceil(gearData.wield*qualityData[0]);
                        equipment.mindmg = Math.ceil(gearData.mindmg*equipment.effectA);
                        equipment.maxdmg = Math.ceil(gearData.maxdmg*equipment.effectA);
                        equipment.reach = gearData.reach;
                        equipment.speed = Math.ceil(gearData.speed*equipment.effectB);
                        equipment.range = gearData.range;
                        equipment.hands = gearData.hands;
                        insertToWeaponsTable(equipment);
                        break;
                    case "Armour":
                        equipment.damageReduction = Math.ceil(gearData.damageReduction*equipment.effectA*equipment.effectB);
                        insertToArmourTable(equipment);
                        break;
                    case "Footwear":
                        equipment.move = gearData.move;
                        insertToFootwearTable(equipment);
                        break;
                    case "Accessories":
                        equipment.effect = gearData.effect;
                        insertToAccessoriesTable(equipment);
                        break;
                }
                genEquip[equipment.name] = equipment;
            };
            var insertToShieldsTable = function(eq){
                $('#shields-table tr:last').after('\n\
                <tr>\n\
                    <td>'+eq.name+'</td>\n\
                    <td>'+eq.block+'</td>\n\
                    <td>'+eq.hands+'</td>\n\
                    <td>'+eq.weightGear+'</td>\n\
                    <td>'+eq.weightMaterial+'</td>\n\
                    <td>'+eq.weightTotal+'</td>\n\
                    <td>'+eq.costGear+'</td>\n\
                    <td>'+eq.costMaterial+'</td>\n\
                    <td>'+eq.costTotal+'</td>\n\
                    <td>'+eq.effectA+'</td>\n\
                    <td>'+eq.effectB+'</td>\n\
                    <td>'+eq.costQuality+'</td>\n\
                </tr>\n\
                ');
            };
            var insertToWeaponsTable = function(eq){
                $('#weapons-table tr:last').after('\n\
                <tr>\n\
                    <td>'+eq.name+'</td>\n\
                    <td>'+eq.wield+'</td>\n\
                    <td>'+eq.mindmg+'</td>\n\
                    <td>'+eq.maxdmg+'</td>\n\
                    <td>'+eq.reach+'</td>\n\
                    <td>'+eq.speed+'</td>\n\
                    <td>'+eq.range+'</td>\n\
                    <td>'+eq.hands+'</td>\n\
                    <td>'+eq.weightGear+'</td>\n\
                    <td>'+eq.weightMaterial+'</td>\n\
                    <td>'+eq.weightTotal+'</td>\n\
                    <td>'+eq.costGear+'</td>\n\
                    <td>'+eq.costMaterial+'</td>\n\
                    <td>'+eq.costTotal+'</td>\n\
                    <td>'+eq.effectA+'</td>\n\
                    <td>'+eq.effectB+'</td>\n\
                    <td>'+eq.costQuality+'</td>\n\
                </tr>\n\
                ');
            };
            var insertToArmourTable = function(eq){
                $('#armour-table tr:last').after('\n\
                <tr>\n\
                    <td>'+eq.name+'</td>\n\
                    <td>'+eq.damageReduction+'</td>\n\
                    <td>'+eq.weightGear+'</td>\n\
                    <td>'+eq.weightMaterial+'</td>\n\
                    <td>'+eq.weightTotal+'</td>\n\
                    <td>'+eq.costGear+'</td>\n\
                    <td>'+eq.costMaterial+'</td>\n\
                    <td>'+eq.costTotal+'</td>\n\
                    <td>'+eq.effectA+'</td>\n\
                    <td>'+eq.effectB+'</td>\n\
                    <td>'+eq.costQuality+'</td>\n\
                </tr>\n\
                ');
            };
            var insertToFootwearTable = function(eq){
                $('#footwear-table tr:last').after('\n\
                <tr>\n\
                    <td>'+eq.name+'</td>\n\
                    <td>'+eq.move+'</td>\n\
                    <td>'+eq.weightGear+'</td>\n\
                    <td>'+eq.weightMaterial+'</td>\n\
                    <td>'+eq.weightTotal+'</td>\n\
                    <td>'+eq.costGear+'</td>\n\
                    <td>'+eq.costMaterial+'</td>\n\
                    <td>'+eq.costTotal+'</td>\n\
                    <td>'+eq.effectA+'</td>\n\
                    <td>'+eq.effectB+'</td>\n\
                    <td>'+eq.costQuality+'</td>\n\
                </tr>\n\
                ');
            };
            var insertToAccessoriesTable = function(eq){
                $('#accessories-table tr:last').after('\n\
                <tr>\n\
                    <td>'+eq.name+'</td>\n\
                    <td>'+eq.effect+'</td>\n\
                    <td>'+eq.weightGear+'</td>\n\
                    <td>'+eq.weightMaterial+'</td>\n\
                    <td>'+eq.weightTotal+'</td>\n\
                    <td>'+eq.costGear+'</td>\n\
                    <td>'+eq.costMaterial+'</td>\n\
                    <td>'+eq.costTotal+'</td>\n\
                    <td>'+eq.effectA+'</td>\n\
                    <td>'+eq.effectB+'</td>\n\
                    <td>'+eq.costQuality+'</td>\n\
                </tr>\n\
                ');
            };
            var types = ["Weapons","Shields","Armour","Footwear","Accessories"];
            var qualityKeys = Object.keys(data["Quality"]);
            var keys = Object.keys(types);
            for(var i=0;i<keys.length;i++){
                var eqKeys = Object.keys(data[types[i]]);
                for(var j=0;j<eqKeys.length;j++){
                    var eqData = data[types[keys[i]]][eqKeys[j]];
                    for(var k=0;k<eqData.materials.length;k++){
                        generateEquipment(eqKeys[j],eqData.materials[k],types[keys[i]],"Average");
                        /*for(var l=0;l<qualityKeys.length;l++){
                            generateEquipment(eqKeys[j],eqData.materials[k],types[keys[i]],qualityKeys[l]);
                        }*/
                    }
                }
            }
            
        </script>
    </body>
</html>