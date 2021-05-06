
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {

    },

    onCollisionEnter: function (other, self) {
        // console.log("jin----------nonono的碰撞判断", other, self, other.node._name);
        if(other.node._name == "player_2" && cc.g_Game.invincible){
            this.node.dispatchEvent( new cc.Event.EventCustom('noTouch', true));
        }

        if(other.node._name == "player"){
            this.node.dispatchEvent( new cc.Event.EventCustom('noTouch', true));
        }
    },

    // update (dt) {},
});