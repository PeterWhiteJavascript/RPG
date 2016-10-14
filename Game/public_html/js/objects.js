Quintus.Objects=function(Q){
    Q.Sprite.extend("Character",{
        init:function(p){
            this._super(p,{
                w:24,h:48,
                type:Q.SPRITE_NONE,
                sprite:"Character"
            });
            this.p.sheet = this.p.unitClass;
            Q.setXY(this,this.p.loc);
            this.add("2d, animation");
            this.play("standingleft");
        }
    });
};