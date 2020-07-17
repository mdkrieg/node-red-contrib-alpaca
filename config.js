module.exports = function(RED) {
    RED.nodes.registerType("alpaca-config", function(n) {       
        RED.nodes.createNode(this,n);
        this.API_KEY = n.keyid;
        this.API_SECRET = n.secretkey;
        this.PAPER = n.paper;
    });
 };
