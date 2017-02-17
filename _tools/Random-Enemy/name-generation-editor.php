<?php
    
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Edit Values</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="lib/jquery-3.1.1.js"></script>
        <script src="lib/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="css/style.css">
    </head>
    <body>
        <ul id="generator-vars">
            
        </ul>
        <script>
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
                    
                    var cont = $("#values");
                    var checkType = function(val){
                        return $.type(val);
                    };
                    
                    var processVal = function(val,parent){
                        //Create a list item for each value
                        var type = checkType(val);
                        switch(type){
                            case "array":
                                //TO DO create list for array
                                var p = parent.append("<div></div>");
                                var childDataType = checkType(val[0]);
                                if(childDataType==="number"||childDataType==="string"){
                                    p.children("div").last().append("<button onclick='addInput()'>Add Input</button>");
                                }
                                val.forEach(function(v){
                                    processVal(v,p.children("div").last());
                                });
                                break;
                            case "object":
                                //TO DO loop through keys. Create header for each key
                                var kys = Object.keys(val);
                                var childDataType = checkType(val[0]);
                                if(childDataType==="number"||childDataType==="string"){
                                    p.children("div").last().append("<button onclick='addInput()'>Add Input</button>");
                                }
                                kys.forEach(function(k){
                                    var p = parent.append("<div>"+k+"</div>");
                                    processVal(val[k],p.children("div").last());
                                });
                                break;
                            case "number":
                                //Input field
                                parent.append("<input value='"+val+"'></input>");
                                break;
                            case "string":
                                //Input field
                                parent.append("<input value='"+val+"'></input>");
                                
                                break;
                        }
                    };
                    var ul = $("#generator-vars");
                    $.each( data, function( key, val ) {
                        ul.append("<li id='" + key + "'>"+key+"</li>");
                        processVal(val,$('#'+key));
                    });
                });
            });
        </script>
    </body>
</html>
