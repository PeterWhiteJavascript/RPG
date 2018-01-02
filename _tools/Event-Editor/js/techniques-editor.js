$(function(){
    var FileSaver = {
        fileData:{},
        getTechnique:function(category,name){
            return FileSaver.techniqueData[category].find(function(t){return t[0] === name;});
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
    
    function techniqueArguments(data){
        function saveArg(){
            var argIdx = $(this).parent().index();
            var inputIdx = $(this).parent().children("input").index(this);
            var tech = FileSaver.getTechnique($(this).parent().parent().parent().parent().parent().parent().siblings(".title-text").text(),$(this).parent().parent().parent().parent().siblings(".sub-title-text").text());
            tech[(tech.length-1)][argIdx][inputIdx] = uic.processValue($(this).val());
        };
        function addArg(desc,val){
            var arg = $('<div class="technique-arg"><input placeholder="Describe this argument please" class="sixty-five-width" type="text" value="'+desc+'"><input class="quarter-width" type="number" value="'+val+'"><div class="remove-choice"><span>x</span></div></div>');
            arg.children(".remove-choice").on("click",function(){
               $(this).parent().remove();
            });
            arg.children("input").on("focusout",saveArg);
            
            return arg;
        };
        var cont = $("<div class='technique-arguments'><div class='UIC-hud-buttons'><div class='UIC-hud-button'><span>Add Argument</span></div></div><div class='technique-args-cont'></div></div>");
        cont.children(".UIC-hud-buttons").children(".UIC-hud-button").on("click",function(){
            var data = ["",0];
            $(this).parent().parent().children(".technique-args-cont").append(addArg(data[0],data[1]));
            var tech = FileSaver.getTechnique($(this).parent().parent().parent().parent().parent().siblings(".title-text").text(),$(this).parent().parent().parent().siblings(".sub-title-text").text());
            tech[(tech.length-1)].push(data);
        });
        for(var i=0;i<data.length;i++){
            cont.children(".technique-args-cont").append(addArg(data[i][0],data[i][1]));
        }
        return cont;
    };
    function ActiveTechnique(data){
        var cont = $("<div class='technique UIC-group-item'><div class='sub-title-text minimizer'>"+data[0]+"</div><div class='technique-props UIC-group-item-props'></div></div>");
        cont.children(".technique-props").append(uic.Input("Name",data[0]));
        uic.linkValueToText(cont.children(".technique-props").children("input:eq(0)"),cont.children(".sub-title-text"),100);
        //Save the old value
        cont.children(".technique-props").children("input:eq(0)").on('focusin', function(){
            $(this).data('val', $(this).val());
        });
        //Make sure to change any select that references this technique
        cont.children(".technique-props").children("input:eq(0)").on("focusout",function(){
            var oldVal = $(this).data('val');
            var newVal = $(this).val();
            $(".technique-cont").each(function(){
                $(this).children("select:eq(1)").children("option").each(function(){
                    if($(this).text() === oldVal){
                        $(this).text(newVal);
                        $(this).attr("value",newVal);
                    }
                });
                if($(this).children("select:eq(1)").val() === oldVal){
                    $(this).children("select:eq(1)").val(newVal);
                }
            });
            FileSaver.getTechnique("Active",oldVal)[0] = newVal;
        });
        cont.children(".technique-props").append(uic.TextArea("Desc",data[1]));
        cont.children(".technique-props").append(uic.Select("Tech Type 1",FileSaver.techniqueData.data["techTypes1"],data[2][0]));
        cont.children(".technique-props").append(uic.Select("Tech Type 2",FileSaver.techniqueData.data["techTypes2"],data[2][1]));

        cont.children(".technique-props").append(uic.Input("Range",data[3][0],"number"));
        cont.children(".technique-props").append(uic.Select("Range Type",FileSaver.techniqueData.data["rangeTypes"],data[3][1]));
        var rangeOpts = $(uic.Container("Range Options",data[3][2],"checkbox",FileSaver.techniqueData.data["rangeProps"]));
        cont.children(".technique-props").append(rangeOpts);

        cont.children(".technique-props").append(uic.Input("AOE",data[4][0],"number"));
        cont.children(".technique-props").append(uic.Select("AOE Type",FileSaver.techniqueData.data["aoeTypes"],data[4][1]));
        var aoeOpts = $(uic.Container("AOE Options",data[4][2],"checkbox",FileSaver.techniqueData.data["aoeProps"]));
        cont.children(".technique-props").append(aoeOpts);
        
        var resist = $(uic.Container("Resisted By",data[5],"checkbox",FileSaver.techniqueData.data["resistProps"]));
        cont.children(".technique-props").append(resist);
        cont.children(".technique-props").append(uic.Input("Default TP Cost",data[6],"number"));
        cont.children(".technique-props").append(uic.Select("Animation",FileSaver.techniqueData.data["animations"],data[7]));
        cont.children(".technique-props").append(uic.Select("Sound",FileSaver.techniqueData.data["sounds"],data[8]));
        function checkboxChanged(){
            var tech = $(this).parent().parent().parent().siblings(".sub-title-text").text();
            var data = FileSaver.getTechnique("Active",tech);
            switch($(this).parent().siblings(".sub-title-text").text()){
                case "Range Options":
                    data[3][2] = JSON.parse($(this).parent().parent().attr("data"));
                    break;
                case "AOE Options":
                    data[4][2] = JSON.parse($(this).parent().parent().attr("data"));
                    break;
                case "Resisted By":
                    data[5] = JSON.parse($(this).parent().parent().attr("data"));
                    break;
            }
        }
        $(rangeOpts).children(".UIC-cont-props").children("input").on("change",checkboxChanged);
        $(aoeOpts).children(".UIC-cont-props").children("input").on("change",checkboxChanged);
        $(resist).children(".UIC-cont-props").children("input").on("change",checkboxChanged);
        
        cont.children(".technique-props").append(techniqueArguments(data[9]));
        uic.selectInitialValue(cont.children(".technique-props"));
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
    }
    function PassiveTechnique(data){
        var cont = $("<div class='technique UIC-group-item'><div class='sub-title-text minimizer'>"+data[0]+"</div><div class='technique-props UIC-group-item-props'></div></div>");
        
        cont.children(".technique-props").append(uic.Input("Name",data[0]));
        uic.linkValueToText(cont.children(".technique-props").children("input:eq(0)"),cont.children(".sub-title-text"),100);
        //Save the old value
        cont.children(".technique-props").children("input:eq(0)").on('focusin', function(){
            $(this).data('val', $(this).val());
        });
        //Make sure to change any select that references this technique
        cont.children(".technique-props").children("input:eq(0)").on("focusout",function(){
            var oldVal = $(this).data('val');
            var newVal = $(this).val();
            $(".technique-cont").each(function(){
                $(this).children("select:eq(1)").children("option").each(function(){
                    if($(this).text() === oldVal){
                        $(this).text(newVal);
                        $(this).attr("value",newVal);
                    }
                });
                if($(this).children("select:eq(1)").val() === oldVal){
                    $(this).children("select:eq(1)").val(newVal);
                }
            });
            FileSaver.getTechnique("Passive",oldVal)[0] = newVal;
        });
        cont.children(".technique-props").append(uic.Input("Desc",data[1]));
        $(cont).children(".technique-props").children("input").on("focusout",function(){
            FileSaver.getTechnique("Passive",$(this).parent().siblings(".sub-title-text").text())[$(this).parent().children("input").index(this)] = uic.processValue($(this).val());
            
        });
        cont.children(".technique-props").append(techniqueArguments(data[2]));
        return cont;
    }
    $.getJSON("../../data/json/data/techniques.json",function(data){
        FileSaver.techniqueData = data;
        FileSaver.techniqueNames = {
            Active:data.Active.map(function(tech){return tech[0];}),
            Passive:data.Passive.map(function(tech){return tech[0];})
        };

        var activeTechs = FileSaver.techniqueData.Active;
        for(var i=0;i<activeTechs.length;i++){
            $("#active-techniques-cont").append(ActiveTechnique(activeTechs[i]));
        }

        var passiveTechs = FileSaver.techniqueData.Passive;
        for(var i=0;i<passiveTechs.length;i++){
            $("#passive-techniques-cont").append(PassiveTechnique(passiveTechs[i]));
        }

        var charClasses = Object.keys(FileSaver.techniqueData.CharClass);
        for(var i=0;i<charClasses.length;i++){
            var cont = $('<div class="UIC-group-item"><p class="title-text minimizer">'+charClasses[i]+'</p><div class="tech-props"></div></div>');
            for(var j=0;j<FileSaver.techniqueData.CharClass[charClasses[i]].length;j++){
                if(!FileSaver.techniqueData.CharClass[charClasses[i]][j].length) continue;
                cont.children(".tech-props").append(ActiveTechnique(FileSaver.techniqueData.CharClass[charClasses[i]][j]));
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
            $("#active-techniques-cont").append(ActiveTechnique(data));
            FileSaver.techniqueData["Active"].push(data);
        });
        $("#add-passive-tech").click(function(){
            var data = [
                "New Technique",
                "",
                []
            ];
            $("#passive-techniques-cont").append(PassiveTechnique(data));
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
        //$(".title-text.minimizer").trigger("click");
    });
});