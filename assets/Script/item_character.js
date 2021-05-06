import FBUtils from "./FBUtils";
import PlayerManager from "./PlayerManager";

cc.Class({
    extends: cc.Component,

    properties: {
        img_man     : cc.Sprite,
        btn_Replace : cc.Button,
        btn_seeADS  : cc.Button,
        btn_kuang   : cc.Button,
        manPrice    : cc.RichText,
        img_have    : cc.Sprite,
        _data       : null
    },

    // onLoad () {},

    start () {
         
    },

    initRank(data){
        this._data = data;
        // console.log('jin-----------img/btn', data, this.img_have.node.active);
        this.img_man.node.getComponents(cc.Sprite)[0].spriteFrame = data.img_man.node.getComponents(cc.Sprite)[0].spriteFrame;
        this.setGold(data.buyNum);
        //拥有状态 1.对号 2.pelace
        this.setHaveSta(data.buySta);
        this.setBtnSta(data.btn);
        //钱不够
        if(data.buyNum <= PlayerManager.inst.coin){//
            this.btn_kuang.interactable = true;
            this.btn_kuang.enableAutoGrayEffect = true;
        }else{
            this.btn_kuang.interactable = false;
            this.btn_kuang.enableAutoGrayEffect = false;
        }
    },

    setHaveSta(sta){
        
        if(sta == 1){
            this.img_have.node.active = true;
            this.btn_seeADS.interactable = false;
            this.btn_kuang.interactable = false;
            this.btn_Replace.interactable = true;
        }else if(sta == 0){
            this.img_have.node.active = false;
            this.btn_seeADS.interactable = true;
            this.btn_kuang.interactable = true;
            this.btn_Replace.interactable = false;
        }
    },

    setBtnSta(sta){
        console.log("jin-------222222222", sta);
        if(sta == 0){
            this.btn_seeADS.node.active = true;
            this.btn_kuang.node.active = false;
        }else if(sta == 1){
            this.btn_seeADS.node.active = false;
            this.btn_kuang.node.active = true;
        }else if(sta == 2){
            this.btn_seeADS.node.active = false;
            this.btn_kuang.node.active = false;  
            this.img_have.node.active = false;
        }
    },

    setGold(num){
        this.manPrice.string = "<color=#ffd518 >< outline color=black width=3>" + num + "</outline>";
    },

    onClikeReplace(){
        console.log('jin-----------onClikeReplace');
        // cc.g_Game.currentUser = this._data.manID;
        PlayerManager.inst.changeCurrentCharacterId(this._data.manID, true);
    },

    onClikeseeADS(){
        var self = this;
        console.log('jin-----------onClikeseeADS');
        FBUtils.inst.tryShowInterstitialAd()
        .then((data) =>{
            if(data){
                PlayerManager.inst.changeCurrentCharacterId(this._data.manID, true);
                self.img_have.node.active = true;
            }
        });
    },

    onClikeGold(){
        console.log('jin-----------onClikeGold');
        PlayerManager.inst.addCoin(-(this._data.buyNum), true);
    },
    // update (dt) {},
});
