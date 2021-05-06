
const Animal_Type = {CROCODILE : "CROCODILE", CAMEL : "CAMEL", SHEEP : "SHEEP"};

cc.Class({
    extends: cc.Component,

    properties: {
        anim : cc.Animation,
        inst_type : "",
        cro_collider : cc.Collider,
        cam_colloder : cc.Collider,
        she_collider : cc.Collider,
        _colliderOnOff : true,  //防止重复相撞
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.cro_collider.node.active = this.cam_colloder.node.active = this.she_collider.node.active = false;
    },

    start () {
        var self = this;
        let aniName = "";
        switch(this.inst_type) {
            case Animal_Type.CROCODILE:
                aniName = "crocodile";
                this.cro_collider.node.active = true;
                break;
            case Animal_Type.CAMEL:
                aniName = "camel";
                this.cam_colloder.node.active = true;
                break;
            case Animal_Type.SHEEP:
                aniName = "sheep";
                this.she_collider.node.active = true;
                break;
            default:
                break;
        }
        let aniState = this.anim.play(aniName);
        aniState.wrapMode = cc.WrapMode.Loop;
        
        this.node.on('hit_animal', (eve) => {
            eve.stopPropagation();
            if(self._colliderOnOff){
                self._colliderOnOff = false;
                // console.log("jin------小动物有反应", cc.g_Game.invincible);
                if(!cc.g_Game.invincible){
                    self.node.dispatchEvent(new cc.Event.EventCustom('game_over2', true));
                }
            }
        });

        this.node.on('hit_animal_move', (eve) => {
            eve.stopPropagation();
            
            self.node.y = self.node.y - 500;
        });
    },

    // update (dt) {},
});
