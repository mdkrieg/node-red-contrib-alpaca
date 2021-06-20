
const ENV_API_KEY = process.env.APCA_API_KEY_ID;
const ENV_API_SECRET = process.env.APCA_API_SECRET_KEY;
const ENV_API_KEY_PAPER = process.env.APCA_API_KEY_ID_PAPER;
const ENV_API_SECRET_PAPER = process.env.APCA_API_SECRET_KEY_PAPER;

module.exports = function(RED) {
    
    var Alpaca = require('@alpacahq/alpaca-trade-api');
    
    var apca_cx = function(node,config){
        var auth = RED.nodes.getNode(config.auth);
        var cx;
        var cx_status={
            fill:"grey",
            shape:"ring",
            text:"null"
        };
        if(auth.PAPER === "true"){
            cx = new Alpaca({
                keyId: auth.API_KEY || ENV_API_KEY_PAPER, 
                secretKey: auth.API_SECRET || ENV_API_SECRET_PAPER,
                paper: true
            });
            cx_status.shape = "ring";
        }else{
            cx = new Alpaca({
                keyId: auth.API_KEY || ENV_API_KEY, 
                secretKey: auth.API_SECRET || ENV_API_SECRET,
                paper: false
            });
            cx_status.shape = "dot";
        }
        cx_status.fill = (cx ? "green" : "red");
        cx_status.text = (cx ? "connected" : "disconnected");
        node.status(cx_status);
        return cx;
    };
    
    function validTopic(msg_topic,config_topic, validTopics){
        if(validTopics.includes(config_topic)){
            return config_topic;
        }
        else if(validTopics.includes(msg_topic)
                && config_topic == "msgTopic"){
            return msg_topic;
        }
        else {return null;} //invalid topic
    }
    
    function universalAlpacaNode(config) { 
        RED.nodes.createNode(this,config);
        var node = this;
        var alpaca_conn = apca_cx(node,config);
        const validFunctions = [
            "getAccount",
            "getAccountConfigurations",
            "updateAccountConfigurations",
            "getAccountActivities",
            "getPortfolioHistory",
            "getBarsV2",
            "createOrder",
            "getOrders",
            "getOrder",
            "getOrderByClientOrderId",
            "replaceOrder",
            "cancelOrder",
            "cancelAllOrders",
            "getPosition",
            "getPositions",
            "closePosition",
            "closeAllPositions",
            "lastTrade",
            "lastQuote",
            "getAssets",
            "getAsset",
            "getCalendar",
            "getWatchlists",
            "getWatchlist",
            "addWatchlist",
            "addToWatchlist",
            "updateWatchlist",
            "deleteWatchlist",
            "deleteFromWatchlist"
        ];
        node.on('input', function(msg) {
            msg.request = msg.payload;          //store original request
            var success = function(resp) {
                msg.payload = resp;                 //supply response object (PAYLOAD)
                node.send(msg); };                  //send message
            var error = function(err) {
                msg.payload = err.error.message;    //supply error string (PAYLOAD)
            	msg.error = err.error;              //supply error object
            	node.send(msg); };                  //send message
            var topic = validTopic(msg.topic,config.topic,validFunctions);
            if(!topic){
                error({"error":{"message":"Error - Invalid Function","topic":topic}});
            }else if(topic == "getBarsV2"){
                alpaca_conn[topic](msg.symbol, msg.payload).then(success).catch(error);
            // BEGIN WATCHLIST CHECKS --- TODO: separate watchlist stuff into separate node
            }else if([  "addWatchlist",
                        "addToWatchlist",
                        "updateWatchlist",
                        "deleteFromWatchlist"].includes(topic)){
                // above tests for specific functions that use multiple arguments
                let name = msg.payload.name || msg.payload.id;
                let ticker = msg.payload.ticker || msg.payload.tickers;
                ticker = topic == "addWatchlist" ? ticker || [] : ticker || ""; //catch for optional args
                alpaca_conn[topic](name, ticker).then(success).catch(error);
            }else{
                // normal passthru ---- functions that take no input don't seem to mind if they get an input
                alpaca_conn[topic](msg.payload).then(success).catch(error);
            }
        });
    }
    
    
	function socketAlpacaDataV2(config) {
	    RED.nodes.createNode(this,config);
        var node = this;
        var socket = RED.nodes.getNode(config.socket);
        var auth = RED.nodes.getNode(config.socket.wsauth);
    	var subFor = RED.nodes.getNode(config.subscribeFor);
    	var symbol = [RED.nodes.getNode(config.symbol)];// TODO: improve
    	
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          feed: socket.feed || "iex"
        });
        
        var cx_status={
            fill:"grey",
            shape:"dot"
        };
    	node.status(cx_status);
    		
        const data_client = alpaca_conn.data_stream_v2;
        
        data_client.onConnect(function () {
            var msg = {
                'topic':'onConnect',
                'payload':'Connected'};
            cx_status.fill = "green";
            node.status(cx_status);
            
    	    data_client.subscribeForTrades([symbol]);
    	    node.send({
                "topic":"subscribeForTrades",
                "payload": symbol + " - subscribed for trades",
                "symbol": symbol
            });
        });
        data_client.onError((err) => {
            node.error(err, {});
        });
        data_client.onStockTrade((trade) => {
            let msg = {};
            msg.topic = "onStockTrade";
            msg.payload = trade;
            node.send(msg);
        });
        data_client.onStockQuote((quote) => {
            let msg = {};
            msg.topic = "onStockQuote";
            msg.payload = quote;
            node.send(msg);
        });
        data_client.onStockBar((bar) => {
            let msg = {};
            msg.topic = "onStockBar";
            msg.payload = bar;
            node.send(msg);
        });
        data_client.onStateChange((state) => {
            let msg = {};
            msg.topic = "onStateChange";
            msg.payload = state;
            node.send(msg);
        });
        
        data_client.onDisconnect(() => {
            var msg = {
                'topic':'onDisconnect',
                'payload':'Disconnected'};
            node.send(msg);
		    cx_status.fill = "grey";
	        node.status(cx_status);
        });

        data_client.connect();
    }
		

    RED.nodes.registerType("Alpaca",universalAlpacaNode);
    RED.nodes.registerType("Alpaca-DataV2",socketAlpacaDataV2);
};
