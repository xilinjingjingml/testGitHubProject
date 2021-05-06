cc.Class({
    extends: cc.Component,

    properties: {
        _touch : false,

    },
    statics: {
        instance: null,
    },
    
    onLoad () {

    },

    onCollisionEnter: function (other, self) {
        // console.log("jin----------情侣1的碰撞判断", other, self, other.node._name);
        if(other.node._name == "player_2" && cc.g_Game.invincible){
            this.node.dispatchEvent( new cc.Event.EventCustom('player_2', true));
        }

        if(other.node._name == "player"){
            this.node.dispatchEvent( new cc.Event.EventCustom('player_lovers', true));
        }
    },

    // update (dt) {},
});