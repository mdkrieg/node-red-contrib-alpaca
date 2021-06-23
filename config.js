module.exports = function(RED) {
    
    var Alpaca = require('@alpacahq/alpaca-trade-api');
    
    RED.nodes.registerType("alpaca-config", function(n) {       
        RED.nodes.createNode(this,n);
        this.API_KEY = n.keyid;
        this.API_SECRET = n.secretkey;
        this.PAPER = n.paper;
    });
    
    RED.nodes.registerType("alpaca-websocket", function(n) {       
        RED.nodes.createNode(this,n);
        this.wsauth = n.wsauth;
        this.feed = n.feed;
        this.debug = n.debug;
        
        var auth = RED.nodes.getNode(this.wsauth);
        
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY, 
          secretKey: auth.API_SECRET,
          feed: this.feed || "iex"
        });
        
        this.data_client = alpaca_conn.data_stream_v2;
        
        this.on('close', function(){
            this.data_client.disconnect();
        });
        /**/
        //if(data_client.session.currentState != "connected"){
            this.data_client.connect();
        //}
    });
 };
