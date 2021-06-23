
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
                alpaca_conn[topic](msg.symbol || msg.ticker, msg.payload).then(success).catch(error);
            // BEGIN WATCHLIST CHECKS --- TODO: separate watchlist stuff into separate node
            }else if([  "addWatchlist",
                        "addToWatchlist",
                        "updateWatchlist",
                        "deleteFromWatchlist"].includes(topic)){
                // above tests for specific functions that use multiple arguments
                let name = msg.payload.name || msg.payload.id;
                let ticker = msg.payload.ticker || msg.payload.tickers || msg.symbol || msg.symbols;
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
        var data_client = socket.data_client;
    	var subFor = config.subscribeFor;
    	var symbol = config.symbol;
    	var debug = socket.debug;
    	const validDataTopics = [
    	    "trades",
    	    "quotes",
    	    "bars"
    	];
    	
        var cx_status={
            fill:"grey",
            shape:"dot",
        };
    	node.status(cx_status);
        
        var updateContext = function(){
            if(debug){
                node.context().global.set("alpaca_websocket_session",data_client.session);
            }
        };
        
        var subscribe = function(){
            let msg = {
                "symbol": symbol
            };
            let functionCalls = {
                "trades":"subscribeForTrades",
                "quotes":"subscribeForQuotes",
                "bars":  "subscribeForBars",
            };
            let functionPayloads = {
                "trades":"Subscribed For Trades",
                "quotes":"Subscribed For Quotes",
                "bars":  "Subscribed For Bars",
            };
            let fnCall = functionCalls[subFor];
            let payload = functionPayloads[subFor];
    	    msg.topic = fnCall;
    	    msg.payload = symbol + " - " + payload;
    	    // do the work:
    	    if(!fnCall) return;
    	    data_client[fnCall]([symbol]);
            if(config.onSubscribeMsg) {
                node.send(msg);
            }
            updateContext();
            //update status
    	    cx_status.fill = "green";
            cx_status.text = subFor + ": " + symbol;
    	    node.status(cx_status);
        };
        
        var unsubscribe = function(){
            let msg = {
                "symbol": symbol
            };
            let functionCalls = {
                "trades":"unsubscribeFromTrades",
                "quotes":"unsubscribeFromQuotes",
                "bars":  "unsubscribeFromBars",
            };
            let functionPayloads = {
                "trades":"Unsubscribed From Trades",
                "quotes":"Unsubscribed From Quotes",
                "bars":  "Unsubscribed From Bars",
            };
            let fnCall = functionCalls[subFor];
            let payload = functionPayloads[subFor];
    	    msg.topic = fnCall;
    	    msg.payload = symbol + " - " + payload;
    	    // do the work:
    	    if(!fnCall) return;
    	    data_client[fnCall]([symbol]);
            if(config.onSubscribeMsg) {
                node.send(msg);
            }
            updateContext();
    	    cx_status.fill = "grey";
            cx_status.text = "";
    	    node.status(cx_status);
        };
        
        // not fond of the below statement, but onConnect isn't
        // getting called when nodes re-deploy without restart
        if(data_client.session.currentState != 'connecting'){
            subscribe();
        }
        
        data_client.onConnect(function () {
            subscribe();
            var msg = {
                'topic':'onConnect',
                'payload':'Connected',
                'data_client':data_client,
                'config':config
            };
            cx_status.fill = "green";
            cx_status.text = subFor + ": " + symbol;
            node.status(cx_status);
            if(config.onConnectMsg){
                node.send(msg);
            }
            updateContext();
        });
        
        data_client.onError((err) => {
            node.error(err, {});
            node.send({
                "data_client":data_client,
                "payload":err
            });
            cx_status.fill = "red";
            node.status(cx_status);
        });
        
        data_client.onStockTrade((trade) => {
            let msg = {};
            msg.topic = "onStockTrade";
            msg.payload = trade;
            if(trade.Symbol == symbol){
                node.send(msg);
            }
        });
        
        data_client.onStockQuote((quote) => {
            let msg = {};
            msg.topic = "onStockQuote";
            msg.payload = quote;
            if(quote.Symbol == symbol){
                node.send(msg);
            }
        });
        
        data_client.onStockBar((bar) => {
            let msg = {};
            msg.topic = "onStockBar";
            msg.payload = bar;
            if(bar.Symbol == symbol){
                node.send(msg);
            }
        });
        
        data_client.onStateChange((state) => {
            let msg = {};
            msg.topic = "onStateChange";
            msg.payload = state;
            if(config.onStateMsg) {
                node.send(msg);
            }
            updateContext();
        });
        
        data_client.onDisconnect(() => {
            var msg = {
                'topic':'onDisconnect',
                'payload':'Disconnected'};
            if(config.onDisconnectMsg) {
                node.send(msg);
            }
		    cx_status.fill = "grey";
	        node.status(cx_status);
	        updateContext();
        });
        
        node.on("close",unsubscribe);
        node.on("input", function(msg){
            let new_symbol = msg.payload;
            let new_subFor = msg.topic;
            unsubscribe();
            if (validDataTopics.includes(new_subFor)){
                subFor = new_subFor;
            }else if(new_subFor != "" && !!new_subFor){
                node.error("Invalid Topic: '" + new_subFor
                    + "'   Use: " + validDataTopics.join(", "));
            }
            symbol=new_symbol;
            subscribe();
        });
    }

    RED.nodes.registerType("Alpaca",universalAlpacaNode);
    RED.nodes.registerType("Alpaca-Websocket",socketAlpacaDataV2);
};
