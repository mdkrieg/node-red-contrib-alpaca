module.exports = function(RED) {
    //if(!RED.nodes.registry.getModule("node-red-contrib-alpaca-auth")){
        RED.nodes.registerType("alpaca-config", function(n) {       
            RED.nodes.createNode(this,n);
            this.API_KEY = n.keyid;
            this.API_SECRET = n.secretkey;
            this.PAPER = n.paper;
        });
    //}
 };
