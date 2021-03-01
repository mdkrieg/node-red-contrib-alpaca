
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
            }else{
                alpaca_conn[topic](msg.payload).then(success).catch(error);
            }
        });
    }
    
    
	function socketAlpacaData(config) {
	    
	    RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
	var socket = RED.nodes.getNode(config.socket);
	var sub_keys = RED.nodes.getNode(config.subkeys).split(","); // TODO: improve
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          paper: auth.PAPER || true
        });
	const validFunctions = [
		"onStateChange",
		"onStockTrades",
		"onStockQuotes",
		"onStockAggMin"]; //not used currently
      
        var cx_status={
            fill:"grey",
            shape:"dot"
        };
		
        const data_client = alpaca_conn.data_ws;
        data_client.onConnect(function () {
            var msg = {
                'topic':'onConnect',
                'payload':'Connected'};
	    data_client.subscribe(subkeys);
            node.send(msg);
		cx_status.fill = "green";
	        node.status(cx_status);
        });
        data_client.onDisconnect(() => {
            var msg = {
                'topic':'onDisconnect',
                'payload':'Disconnected'};
            node.send(msg);
		cx_status.fill = "grey";
	        node.status(cx_status);
        })
	if(socket == "onStateChange"){
		data_client.onStateChange(newState => {
		    var msg = {
			'topic':'onStateChange',
			'payload':newState
		    };
		    node.send(msg);
		})
	}
	if(socket == "onStockTrades"){
		data_client.onStockTrades(function (subject, data) {
		    var msg = {
			'topic':'onStockTrades',
			'payload':data,
			'subject':subject
		    };
		    node.send(msg);
		})
	}
	if(socket == "onStockQuotes"){
		data_client.onStockQuotes(function (subject, data) {
		    var msg = {
			'topic':'onStockQuotes',
			'payload':data,
			'subject':subject
		    }
		    node.send(msg);
		})
	}
	if(socket == "onStockAggSec"){
		data_client.onStockAggSec(function (subject, data) {
		    var msg = {
			'topic':'onStockAggSec',
			'payload':data,
			'subject':subject
		    }
		    node.send(msg);
		})
	}
	if(socket == "onStockAggMin"){
		data_client.onStockAggMin(function (subject, data) {
		    var msg = {
			'topic':'onStockAggMin',
			'payload':data,
			'subject':subject
		    }
		    node.send(msg);
		})
	}
		
        data_client.connect();
}
		

	function socketAlpacaUpdates(config) {

	    RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          paper: auth.PAPER || true
        });
	const validFunctions = [
		"onStateChange",
		"onOrderUpdate",
		"onAccountUpdate"];
		
        const updates_client = alpaca_conn.trade_ws;
        updates_client.onConnect(function () {
            const trade_keys = ['trade_updates', 'account_updates'];
            console.log("Alpaca Event Listener Connected");
            updates_client.subscribe(trade_keys);
        });
        updates_client.onDisconnect(() => {
            console.log("Alpaca Event Listener Disconnected");
        });
        updates_client.onStateChange(newState => {
            var msg = {
                'topic':'onStateChange',
                'payload':newState
            };
            node.send(msg);
        });
        updates_client.onOrderUpdate(data => {
            var msg = {
                'topic':'onOrderUpdate',
                'payload':data
            };
            node.send(msg);
        });
        updates_client.onAccountUpdate(data => {
            var msg = {
                'topic':'onAccountUpdate',
                'payload':data
            };
            node.send(msg);
        });
        updates_client.connect();
	}
    RED.nodes.registerType("Alpaca",universalAlpacaNode);
    RED.nodes.registerType("Alpaca-Datasocket",socketAlpacaData);
    RED.nodes.registerType("Alpaca-Updatesocket",socketAlpacaUpdates);
};
