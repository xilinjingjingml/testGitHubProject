// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        node_rank     : cc.Node,
        img_award     : cc.Sprite,
        head_me       : cc.Sprite,
        name_me       : cc.Label,
        score_me      : cc.Label,
        rankingNum_me : cc.Label,
        award         : [cc.SpriteFrame],
    },

    onLoad () {
        var self = this;
        
    },

    initRank(data, i){
        var self = this;
        // console.log("jin-----data:", data);
        self.showCrown(data.rankNum);
        self.name_me.string  = self.showName(data.name);
        self.score_me.string = data.score;
        self.showHeadImg(data.headImg);
    },

    //排名
    showCrown(num){
        var self = this;
        // console.log("jin-----------num: ",num);
        if(num == 1 || num == 2 || num == 3){
            self.rankingNum_me.node.active = false;
            // console.log('jin----------self.rankingNum_me.node.active:', self.rankingNum_me.node.active);
        }else{
            self.img_award.node.active = false;
            self.rankingNum_me.string = num;
            return
        }

        self.img_award.spriteFrame = this.award[num-1];
    },

    //name
    showName(str){
        // console.log("jin-----------显示头像", str);
        return str.substr(0,7);
    },

    //headImg
    showHeadImg(url){
        var self = this;
        var selfNode = self.node;
        // console.log("jin-----------显示头像");
        // var remoteUrl = "http://unknown.org/someres.png";
        cc.loader.load(url, (err, texture) => {
            if(selfNode.isValid){
            self.head_me.spriteFrame = new cc.SpriteFrame(texture);
            self.head_me.width = 70; 
            self.head_me.height = 70;
            }
        });
    },

    // update (dt) {},
});
