<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create Gear Techniques</title>
        <link rel="stylesheet" type="text/css" href="css/new-style.css">
        <style>
            body{
                width:100%;
                height:100%;
                background-color:var(--background-color);
            }
            #left-cont{
                width:20%;
                height:calc(100% - 60px);
                top:60px;
                position:absolute;
                left:0%;
                border:1px solid black;
            }
            #right-cont{
                width:80%;
                height:calc(100% - 60px);
                top:60px;
                position:absolute;
                left:20%;
                border:1px solid black;
            }
            #job-titles{
                
            }
            .job-title-cont{
                height:30px;
                display:flex;
                align-items:center;
                color:var(--content-button-text-color);
                background-color:var(--content-button-background-color);
                cursor:pointer;
                user-select:none;
            }
            .job-title-cont:hover{
                background-color:var(--content-button-hover-color);
            }
            .job-title{
                width:90%;
                text-align:center;
            }
            .job-title-cont.selected{
                color:var(--button-text-color);
                background-color:var(--button-background-color);
            }
            .remove-choice{
                width:10%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                cursor:pointer;
                user-select:none;
            }
            .remove-choice:hover{
                background-color:var(--button-hover-color);
            }
            
            .job-tier-cont{
                width:100%;
                height:20%;
                display:flex;
                border:1px solid black;
            }
            .job-tier-left-cont{
                width:20%;
                height:100%;
                border:1px solid black;
            }
            .job-tier-left-middle-cont{
                width:20%;
                height:100%;
                border:1px solid black;
            }
            .job-tier-middle-cont{
                width:28%;
                height:100%;
                border:1px solid black;
            }
            .job-tier-right-cont{
                width:32%;
                height:100%;
                border:1px solid black;
            }
            .job-tier-item{
                height:16.6666%;
                width:100%;
                display:flex;
                align-items:center;
            }
            .req-cont{
                height:20%;
                width:50%;
                display:inline-flex;
                align-items:center;
                justify-content:center;
                flex-direction:column;
                flex-wrap: wrap;
            }
            .req-cont div{
                height:100%;
            }
            .req-cont div input{
                height:100%;
            }
            .job-tier-item div input{
                width:100%;
                height:100%;
            }
            .job-tier-item div{
                height:100%;
            }
            .job-category-text{
                display:flex;
                align-items:center;
                justify-content:center;
                height:100%;
                background-color:var(--heading-text-color);
                font-family:var(--heading-font-family);
            }
            .w-30{
                width:30%;
            }
            .w-70{
                width:70%;
            }
            .w-100{
                width:100%;
            }
            .job-tier-stats-cont{
                width:100%;
                height:50%;
                display:flex;
                flex-wrap:wrap;
            }
            .job-tier-stat-button{
                display:flex;
                align-items:center;
                justify-content:center;
                width:33.3333%;
                height:33.3333%;
                color:var(--content-button-text-color);
                background-color:var(--content-button-background-color);
                cursor:pointer;
                user-select:none;
            }
            .job-tier-stat-button:hover:not(.selected){
                background-color:var(--content-button-hover-color);
            }
            .job-tier-stat-button.selected{
                color:var(--button-text-color);
                background-color:var(--button-background-color);
            }
            
            .text-button{
                cursor:pointer;
                user-select:none;
                color:var(--button-text-color);
                background-color:var(--button-background-color);
            }
            .text-button:hover{
                background-color:var(--button-hover-color);
            }
            .earnings-cont{
                height:80%;
                width:100%;
                overflow:auto;
            }
            .earning{
                width:100%;
                height:25%;
                display:flex;
                align-items: stretch;
            }
            .earning select{
                flex-grow: 1;
                width:25%;
            }
            .loots-cont{
                height:80%;
                width:100%;
                overflow:auto;
            }
            .loot{
                width:100%;
                height:25%;
                display:flex;
            }
            .loot select{
                flex-grow: 1;
                width:20%;
            }
            .loot input{
                width:20%;
            }
        </style>
        <script src="js/common.js"></script>
        <script>
            $(function(){
                var FileSaver = {
                    fileData:{},
                    saveFile:function(){
                        FileSaver.savePage();
                        saveJsonToFile("data", "jobs-list", FileSaver.fileData);
                    },
                    savePage:function(){
                        var currentPageId = $(".job-title-cont.selected").attr("id")
                        if(!currentPageId) return;
                        FileSaver.fileData.jobs[currentPageId] = [];
                        $(".job-tier-cont").each(function(){
                            var tier = {
                                reward:1,
                                weeks:1,
                                reqs:[],
                                stats:[],
                                loots:[],
                                earnings:[]
                            };
                            tier.reward = $(this).children(".job-tier-left-cont").children(".job-tier-item:eq(0)").children("div").children("input").val();
                            tier.weeks = $(this).children(".job-tier-left-cont").children(".job-tier-item:eq(1)").children("div").children("input").val();
                            var stats = $(this).children(".job-tier-left-cont").children(".job-tier-stats-cont").children(".job-tier-stat-button.selected");
                            for(var i=0;i<stats.length;i++){
                                tier.stats.push($(stats[i]).children("span").text());
                            }
                            $(this).children(".job-tier-left-middle-cont").children(".req-cont").each(function(){
                                var value = parseInt($(this).children("div").children("input").val());
                                if(value > 0) tier.reqs.push([$(this).children(".job-category-text").children("span").text(), value]);
                            });
                            
                            $(this).children(".job-tier-middle-cont").children(".earnings-cont").children(".earning").each(function(){
                                var itm = [];
                                $(this).children("select").each(function(){
                                    itm.push($(this).val());
                                });
                                if(itm[2]){
                                    var b = itm[1];
                                    itm[1] = itm[3];
                                    itm[3] = b;
                                }
                                tier.earnings.push(itm);
                            });
                            
                            
                            $(this).children(".job-tier-right-cont").children(".loots-cont").children(".loot").each(function(){
                                var itm = [];
                                $(this).children("select").each(function(){
                                    itm.push($(this).val());
                                });
                                if(itm[2]){
                                    var b = itm[1];
                                    itm[1] = itm[3];
                                    itm[3] = b;
                                }
                                var chance = $(this).children("input").val();
                                tier.loots.push([itm, chance]);
                            });
                            FileSaver.fileData.jobs[currentPageId].push(tier);
                        });
                    }
                };
                var uic = new UIC({
                    topBarProps:{
                        Save:function(){
                            FileSaver.saveFile();
                        },
                        Back:function(){
                            if(promptAboutChanges()) {
                                window.location.href = "index.php";
                            }
                        }
                    },
                    statNames:["str","end","dex","wsk","rfl","ini","enr","skl","eff"],
                    equipmentTypes:["Materials", "Consumables", "Weapons", "Shields", "Armour", "Footwear"]
                });
                uic.createTopMenu($("#editor-content"));
                $.getJSON("../../data/json/data/equipment.json",function(edata){
                    FileSaver.eqData = edata;
                    uic.eqTypesNames = {
                        Materials:Object.keys(edata.Materials),
                        Consumables:Object.keys(edata.Consumables),
                        Weapons:Object.keys(edata.Weapons),
                        Shields:Object.keys(edata.Shields),
                        Armour:Object.keys(edata.Armour),
                        Footwear:Object.keys(edata.Footwear)
                    };
                    $.getJSON("../../data/json/data/jobs-list.json",function(data){
                        FileSaver.fileData = data;
                        function addJobToList(name){
                            if(typeof name !== "string"){ 
                                name = "NewJob"+~~(Math.random()*9000);
                                FileSaver.fileData.jobs[name] = [
                                    {
                                        "reward": 100,
                                        "weeks": 1,
                                        "reqs": [],
                                        "stats":[],
                                        "loots":[],
                                        "earnings":[]
                                    },
                                    {
                                        "reward": 200,
                                        "weeks": 2,
                                        "reqs": [],
                                        "stats":[],
                                        "loots":[],
                                        "earnings":[]
                                    },
                                    {
                                        "reward": 500,
                                        "weeks": 3,
                                        "reqs": [],
                                        "stats":[],
                                        "loots":[],
                                        "earnings":[]
                                    },
                                    {
                                        "reward": 1000,
                                        "weeks": 4,
                                        "reqs": [],
                                        "stats":[],
                                        "loots":[],
                                        "earnings":[]
                                    },
                                    {
                                        "reward": 2000,
                                        "weeks": 5,
                                        "reqs": [],
                                        "stats":[],
                                        "loots":[],
                                        "earnings":[]
                                    }
                                ];
                            }
                            function removeJob(e){
                                if(confirm("Are you sure you want to remove "+e.data.name+"?")){
                                    delete FileSaver.fileData.jobs[e.data.name];
                                    $(e.currentTarget).parent().remove();
                                };
                            };
                            var cont = $("<div class='job-title-cont' id='"+name+"'></div>");
                            var remove = $("<div class='remove-choice'><span>x</span></div>");
                            remove.on("click",{name:name},removeJob);
                            cont.on("click",function(){
                                var id = $(this).attr("id");
                                if($(".job-title-cont.selected").attr("id")===id){
                                    var input = $("<input class='list-item' value='"+id+"'>");
                                    $(this).children(".job-title").replaceWith(input);
                                    $(input).on("focusout",function(){ 
                                        if($(this).val()!==id){
                                            var oldID = $(this).parent().attr("id");
                                            var newID = $(this).val();
                                            $(this).parent().attr("id", newID);
                                            FileSaver.fileData.jobs[newID] = FileSaver.fileData.jobs[oldID];
                                            delete FileSaver.fileData.jobs[oldID];
                                        }
                                        $(this).replaceWith("<div class='job-title'><span>"+$(this).val()+"</span></div>");
                                    });
                                    $(input).focus();
                                    return;
                                } else {
                                    FileSaver.savePage();
                                    showJob(id);
                                    $(".job-title-cont.selected").removeClass("selected");
                                    $(this).addClass("selected");
                                }

                            });
                            cont.append(remove);
                            cont.append("<div class='job-title'><span>"+name+"</span></div>");
                            $("#job-titles").append(cont);
                        }
                        function addEarning(type, name, material, quality){
                            type = type || uic.equipmentTypes[0];
                            name = name || uic.eqTypesNames[type][0];
                            var elm = $("<div class='earning'></div>");
                            var typeSelect = $("<select>"+uic.getOptions(uic.equipmentTypes)+"</select>");
                            elm.append(typeSelect);
                            var nameSelect = $("<select>"+uic.getOptions(uic.eqTypesNames[type])+"</select>");
                            elm.append(nameSelect);
                            function addQualityAndMatOptions(typeVal, nameVal, mat, qual){
                                switch(typeVal){
                                    case "Weapons":
                                    case "Shields":
                                    case "Armour": 
                                    case "Footwear":
                                        var materials = FileSaver.eqData[typeVal][nameVal].materials;
                                        nameSelect.after("<select>"+uic.getOptions(FileSaver.eqData.Quality)+"</select>");
                                        nameSelect.after("<select>"+uic.getOptions(materials)+"</select>");
                                        if(mat){
                                            elm.children("select:eq(2)").val(mat);
                                            elm.children("select:eq(3)").val(qual);
                                        }
                                        break;
                                }
                            }
                            nameSelect.on("change",function(){
                                nameSelect.nextAll().remove();
                                addQualityAndMatOptions($(typeSelect).val(), $(this).val());
                            });
                            typeSelect.on("change",function(){
                                var typeVal = $(typeSelect).val();
                                var val = uic.eqTypesNames[typeVal];
                                $(nameSelect).append(uic.getOptions(val));
                                $(nameSelect).val(val[0]);
                                nameSelect.trigger("change");
                            });
                            nameSelect.on("change");
                            uic.linkSelects(typeSelect, nameSelect, uic.eqTypesNames);
                            typeSelect.val(type);
                            nameSelect.val(name);
                            addQualityAndMatOptions(type, name, material, quality);
                            var remove = $("<div class='remove-choice'><span>x</span></div>"); 
                            elm.append(remove);
                            remove.on("click",function(){
                                $(this).parent().remove();
                            });
                            return elm;
                        }
                        function addLoot(type, name, chance, material, quality){
                            type = type || uic.equipmentTypes[0];
                            name = name || uic.eqTypesNames[type][0];
                            chance = chance || 20;
                            var elm = $("<div class='loot'></div>");
                            elm.append("<input type='number' value='"+chance+"' max='100' min='1'>");
                            var typeSelect = $("<select>"+uic.getOptions(uic.equipmentTypes)+"</select>");
                            elm.append(typeSelect);
                            var nameSelect = $("<select>"+uic.getOptions(uic.eqTypesNames[type])+"</select>");
                            elm.append(nameSelect);
                            function addQualityAndMatOptions(typeVal, nameVal, mat, qual){
                                switch(typeVal){
                                    case "Weapons":
                                    case "Shields":
                                    case "Armour": 
                                    case "Footwear":
                                        var materials = FileSaver.eqData[typeVal][nameVal].materials;
                                        nameSelect.after("<select>"+uic.getOptions(FileSaver.eqData.Quality)+"</select>");
                                        nameSelect.after("<select>"+uic.getOptions(materials)+"</select>");
                                        if(mat){
                                            elm.children("select:eq(2)").val(mat);
                                            elm.children("select:eq(3)").val(qual);
                                        }
                                        break;
                                }
                            }
                            nameSelect.on("change",function(){
                                nameSelect.nextAll().remove();
                                addQualityAndMatOptions($(typeSelect).val(), $(this).val());
                            });
                            typeSelect.on("change",function(){
                                var typeVal = $(typeSelect).val();
                                var val = uic.eqTypesNames[typeVal];
                                $(nameSelect).append(uic.getOptions(val));
                                $(nameSelect).val(val[0]);
                                nameSelect.trigger("change");
                            });
                            nameSelect.on("change");
                            uic.linkSelects(typeSelect, nameSelect, uic.eqTypesNames);
                            typeSelect.val(type);
                            nameSelect.val(name);
                            addQualityAndMatOptions(type, name, material, quality);
                            var remove = $("<div class='remove-choice'><span>x</span></div>"); 
                            elm.append(remove);
                            remove.on("click",function(){
                                $(this).parent().remove();
                            });
                            
                            return elm;
                        }
                        function createJobTier(){
                            var tierCont = $("<div class='job-tier-cont'></div>");
                            var leftCont = $("<div class='job-tier-left-cont'></div>");
                            var reward = $("<div class='job-tier-item'></div>");
                            reward.append("<div class='job-category-text w-70'><span>Reward</span></div>");
                            reward.append("<div><input value='1' type='number' min='1'></div>");
                            leftCont.append(reward);
                            var weeks = $("<div class='job-tier-item'></div>");
                            weeks.append("<div class='job-category-text w-70'><span>Weeks</span></div>");
                            weeks.append("<div><input value='1' type='number' min='1'></div>");
                            leftCont.append(weeks);
                            var statTitle = $("<div class='job-tier-item'></div>");
                            statTitle.append("<div class='job-category-text w-100'><span>Stats Shown</span></div>");
                            leftCont.append(statTitle);
                            var stats = $("<div class='job-tier-stats-cont'></div>");
                            function statButton(name){
                                var stat = $("<div class='job-tier-stat-button'><span>"+name+"</span></div>");
                                stat.on("click",function(){
                                   $(this).toggleClass("selected");
                                });
                                return stat;
                            }
                            var statNames = uic.statNames;
                            for(var j=0;j<statNames.length;j++){
                                stats.append(statButton(statNames[j]));
                            }
                            leftCont.append(stats);
                            var leftMidCont = $("<div class='job-tier-left-middle-cont'></div>");
                            var title  = $("<div class='req-cont'></div>");
                            title.append("<div class='job-category-text w-100'><span>Reqs</span></div>");
                            leftMidCont.append(title);
                            for(var j=0;j<statNames.length;j++){
                                var reqCont = $("<div class='req-cont'></div>");
                                reqCont.append("<div class='job-category-text w-30'><span>"+statNames[j]+"</span></div>");
                                reqCont.append("<div class='w-70'><input value='0' type='number' min='0' class='w-100'></div>");
                                leftMidCont.append(reqCont);
                            }

                            var middleCont = $("<div class='job-tier-middle-cont'></div>");
                            middleCont.append("<div class='req-cont w-50'><span>Earnings</span></div>");
                            var addEarnings = $("<div class='req-cont w-50 text-button'><span>Add</span></div>");
                            var earningsCont = $("<div class='earnings-cont'></div>");
                            addEarnings.on("click",function(){
                                var earning = addEarning();
                                earningsCont.append(earning);
                            });
                            middleCont.append(addEarnings);
                            middleCont.append(earningsCont);

                            var rightCont = $("<div class='job-tier-right-cont'></div>");
                            rightCont.append("<div class='req-cont w-50'><span>Loots</span></div>");
                            var addLoots = $("<div class='req-cont w-50 text-button'><span>Add</span></div>");
                            var lootsCont = $("<div class='loots-cont'></div>");
                            addLoots.on("click",function(){
                                var loot = addLoot();
                                lootsCont.append(loot);
                            });
                            rightCont.append(addLoots);
                            rightCont.append(lootsCont);


                            tierCont.append(leftCont);
                            tierCont.append(leftMidCont);
                            tierCont.append(middleCont);
                            tierCont.append(rightCont);
                            $("#right-cont").append(tierCont);
                        }

                        //Show the job in the right-cont
                        //Pass in the name of the selected job
                        function showJob(name){
                            function displayJobTier(tier, idx){
                                var cont = $(".job-tier-cont:eq("+idx+")");
                                var left = cont.children(".job-tier-left-cont");
                                left.children(".job-tier-item:eq(0)").children("div").children("input").val(tier.reward);
                                left.children(".job-tier-item:eq(1)").children("div").children("input").val(tier.weeks);
                                //Remove selected from all
                                left.children(".job-tier-stats-cont").children(".job-tier-stat-button").removeClass("selected");
                                for(var i=0;i<tier.stats.length;i++){
                                    left.children(".job-tier-stats-cont").children(".job-tier-stat-button:eq("+uic.statNames.indexOf(tier.stats[i])+")").trigger("click");
                                }
                                var leftmid = cont.children(".job-tier-left-middle-cont");
                                leftmid.children(".req-cont").children("div").children("input").val(0);
                                for(var i=0;i<tier.reqs.length;i++){
                                    leftmid.children(".req-cont:eq("+(uic.statNames.indexOf(tier.reqs[i][0]) + 1)+")").children("div").children("input").val(tier.reqs[i][1]);
                                }
                                var earningsCont = cont.children(".job-tier-middle-cont").children(".earnings-cont");
                                earningsCont.empty();
                                for(var i=0;i<tier.earnings.length;i++){
                                    var earning = addEarning(tier.earnings[i][0],tier.earnings[i][3],tier.earnings[i][2],tier.earnings[i][1]);
                                    earningsCont.append(earning);
                                }
                                
                                var lootsCont = cont.children(".job-tier-right-cont").children(".loots-cont");
                                lootsCont.empty();
                                for(var i=0;i<tier.loots.length;i++){
                                    var loot = addLoot(tier.loots[i][0][0],tier.loots[i][0][3],tier.loots[i][1],tier.loots[i][0][2],tier.loots[i][0][1]);
                                    lootsCont.append(loot);
                                }

                            }
                            var tiers = data.jobs[name];
                            for(var i=0;i<tiers.length;i++){
                                displayJobTier(tiers[i], i);
                            }
                        }
                        var jobKeys = Object.keys(data.jobs);
                        for(var i=0;i<jobKeys.length;i++){
                            addJobToList(jobKeys[i]);
                        }
                        //Creates all of the markup for the right-cont
                        createJobTier();
                        createJobTier();
                        createJobTier();
                        createJobTier();
                        createJobTier();
                        //Start with the top item
                        $(".job-title-cont").first().trigger("click");

                        $("#add-new-job").on("click",addJobToList);


                    });
                });
            });
        </script>
    </head>
    <body>
        <div id="editor-content">
            <div id="left-cont" class="menu-box">
                <div id="add-new-job" class="category-button" >Add Job</div>
                <p class="title-text">Jobs</p>
                <div id="job-titles"></div>
            </div>
            <div id="right-cont">
                
            </div>
        </div>
    </body>
</html>