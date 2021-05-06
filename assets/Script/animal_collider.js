
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onCollisionEnter : function (other, self) {
        // console.log("jin-----------Tag: " , other.node._name, "self: ", self);
        //noTouchSomething时，改变位置
        if(other.node._name == "noTouchSomething"){
            this.node.dispatchEvent(new cc.Event.EventCustom('hit_animal_move', true));
        }else if(other.node._name == "player"){
            this.node.dispatchEvent(new cc.Event.EventCustom('hit_animal', true));
        }
        
    },
});
