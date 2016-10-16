Quintus.Objects=function(Q){
    Q.Sprite.extend("Character",{
        init:function(p){
            this._super(p,{
                w:24,h:48,
                type:Q.SPRITE_NONE,
                sprite:"Character"
            });
            this.p.sheet = this.p.charClass;
            Q.setXY(this,this.p.loc);
            this.add("2d, animation");
            this.play("standingleft");
            //Equipment level is random enemy only as it is used for generating equipment at that level
            if(this.p.equipmentLevel){
                this.randomizeEquipment();
            }
            this.setCharData();
        },
        randomizeEquipment:function(){
            var t = this;
            var el = this.p.equipmentLevel;
            var equipment = Q.state.get("equipment");
            var types = ["weapon","shield","body","feet","accessory"];
            
            function rand(type){
                //Chance of going up or down in rank
                var lv = el;
                lv+=Math.floor(Math.random()*3)-1;
                if(lv===0) lv=1;
                return equipment[type+"Sorted"][lv-1][Math.floor(Math.random()*equipment[type+"Sorted"][lv-1].length)];
            }
            t.p.equipment={
                righthand:rand(types[Math.floor(Math.random()*2)]),
                lefthand:rand(types[Math.floor(Math.random()*2)]),
                body:rand(types[2]),
                feet:rand(types[3]),
                accessory:rand(types[4])
            };
            //Make sure that they are not holding two shields (unless we want that :D)
            if(t.p.equipment.righthand.weaponType==="shield"&&t.p.equipment.lefthand==="shield"){
                var rand = Math.floor(Math.random()*2);
            }
        },
        setCharData:function(){
            var data = Q.state.get("charClasses")[this.p.charClass];
            this.p.desc = data.description;
            this.p.name = data.name;
            this.p.stats = this.generateStats();
            console.log(this.p.name+"'s Equipment: ");
            console.log(this.p.equipment);
            console.log(this.p.name+"'s Stats: ");
            console.log(this.p.stats);
            console.log("---------------------------");
        },
        generateStats:function(){
            var lv = this.p.level;
            var base = Q.state.get("charClasses")[this.p.charClass].baseStats;
            return {
                str:Math.floor(Math.random()*lv+base.str*(lv/3)+1),
                end:Math.floor(Math.random()*lv+base.end*(lv/3)+1),
                dex:Math.floor(Math.random()*lv+base.dex*(lv/3)+1),
                wsk:Math.floor(Math.random()*lv+base.wsk*(lv/3)+1),
                rfl:Math.floor(Math.random()*lv+base.rfl*(lv/3)+1)
            };
        }
    });
};