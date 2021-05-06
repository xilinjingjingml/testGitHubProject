// var manDate = [
//     {
//         manID : 0,
//         img_man : null,
//         btn : 2,     //按钮状态：0：ADS  1:GOLD  2:没有按钮
//         buySta : 1,  //0 : 没有拥有  1：拥有
//         buyNum : 0,  
//         allGold : 1000
//     },
//     {
//         manID : 1,
//         img_man : null,
//         btn : 0,     //按钮状态：0：ADS  1:GOLD
//         buySta : 1,  //0 : 没有拥有  1：拥有
//         buyNum : 0, 
//         allGold : 1000, 
//     },
//     {
//         manID : 2,
//         img_man : null,
//         btn : 1,     //按钮状态：0：ADS  1:GOLD
//         buySta : 0,  //0 : 没有拥有  1：拥有
//         buyNum : 500,  
//         allGold : 1000,
//     },
//     {
//         manID : 3,
//         img_man : null,
//         btn : 1,     //按钮状态：0：ADS  1:GOLD
//         buySta : 0,  //0 : 没有拥有  1：拥有
//         buyNum : 1000,  
//         allGold : 1000,
//     },
//     {
//         manID : 4,
//         img_man : null,
//         btn : 1,     //按钮状态：0：ADS  1:GOLD
//         buySta : 0,  //0 : 没有拥有  1：拥有
//         buyNum : 1500, 
//         allGold : 1000,
//     },
//     {
//         manID : 5,
//         img_man : null,
//         btn : 1,     //按钮状态：0：ADS  1:GOLD
//         buySta : 0,  //0 : 没有拥有  1：拥有
//         buyNum : 2000,
//         allGold : 1000,
//     }
// ]

import PlayerManager from "./PlayerManager";
import FBUtils from "./FBUtils";

cc.Class({
    extends: cc.Component,

    properties: {
        goldIcon : cc.RichText,
        characterLayout : cc.Node,
        item_character : cc.Prefab,
        img_manArr : [cc.Sprite],
    },

    // onLoad () {},

    start () {
        //从facebook获取data
        
        // var tmp = [1,0,0,0,0,0]
        //data更新UI
        var manDate = PlayerManager.inst.characterDetailsList;
        console.log("jin-----------data: ", PlayerManager.inst.characterDetailsList.length);
        this.goldIcon.string = "<color=#ffd518 >< outline color=black width=3>" + PlayerManager.inst.coin + "</outline>";
        for(var i = 0; i < PlayerManager.inst.characterDetailsList.length; i++){
            var key_0 = 'img_man';
            var key_1 = 'buySta';
            manDate[i][key_0] = this.img_manArr[i];
            manDate[i][key_1] = FBUtils.inst.playerData.characterList[i];//tmp[i]    PlayerManager.inst.characterDetailsList
            this.createCharacterItem(manDate[i]);
        }
    },

    createCharacterItem(data){
        var item, itemJs;
        item = cc.instantiate(this.item_character);
        itemJs = item.getComponent("item_character");
        itemJs.initRank(data);
        this.characterLayout.addChild(item);
    },

    onClikeQuit(){
        console.log("jin---------onClikeQuit");
        this.node.active = false;
    },

    onClikeShare(){
        console.log("jin---------onClikeShare");
        
    }

    // update (dt) {},
});
