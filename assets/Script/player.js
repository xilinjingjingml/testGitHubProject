
        cc.Class({
            extends: cc.Component,
        
            properties: {

            },

            onLoad(){
                // console.log("jin-------playonLoad");
                // cc.director.getCollisionManager().enabled = true;
            },
            update(dt){
                // console.log("jin-------this.node.x: ", this.node.x);
                //限制小球不出左右边框
                if(this.node.x < -300){
                    this.node.x = -300
                }
                
                if(this.node.x > 300){
                    this.node.x = 300
                }
            }

        })