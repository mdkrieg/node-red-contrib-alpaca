const ENV_API_KEY = process.env.APCA_API_KEY_ID;
const ENV_API_SECRET = process.env.APCA_API_SECRET_KEY;

module.exports = function(RED) {

    var Alpaca = require('@alpacahq/alpaca-trade-api');
    
    function submitOrder(config) { 
        RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          paper: auth.PAPER || true
        });
        node.on('input', function(msg) {
            var req = {};
            	req.symbol = msg.payload.symbol || msg.symbol || config.symbol;
            	req.qty = msg.payload.qty || msg.qty || config.qty;
            	req.type = msg.payload.type ||  msg.type || config.ordertype || "market";
            	if (req.type === "limit" || req.type === "stop_limit"){
            		req.limit_price = msg.payload.limit_price ||  msg.limit_price || config.limit_price; }
            	if (req.type === "stop" || req.type === "stop_limit"){
            		req.stop_price = msg.payload.stop_price ||  msg.stop_price || config.stop_price; }
            	req.time_in_force = msg.payload.tif ||  msg.tif || config.tif || "day";
            	req.side = msg.payload.side ||  msg.side || config.side;
            alpaca_conn.createOrder(req)
            .then(function(resp) {
                msg.payload.response = resp;
                node.send(msg); })
            .catch(function(err) {
            	console.log("Error - Alpaca Submit Order:");
            	console.log(err.error);
            	msg.payload = err.error;
            	node.send(msg);
            });
        });
    }
    function getOrder(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          paper: auth.PAPER || true
        });
        node.on('input', function(msg) {
        		var req = {};
        			req.status = msg.payload.status || msg.status || 'all';
        			req.direction = msg.payload.direction || msg.direction || 'asc';
        		alpaca_conn.getOrders(req)
        		.then(function(resp) {
               msg.payload = resp;
		      	node.send(msg); })
		      .catch(function(err) {
		      	console.log(err.error);
            	msg.payload = err.error;
            	node.send(msg);
		      });
		 });
	}
    function getAccount(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          paper: auth.PAPER || true
        });
        node.on('input', function(msg) {
            alpaca_conn.getAccount()
            .then(function(resp) {
               msg.payload = resp;
		      	node.send(msg); })
            .catch(function(err) {
            	console.log(err.error);
            	msg.payload = err.error;
            	node.send(msg);
            });
		 });
	}
	function getBars(config) {
	    RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          paper: auth.PAPER || true
        });
        node.on('input', function(msg) {
        		var timescale = msg.payload.timescale || msg.timescale || config.timescale || 'minute';
            var symbol = msg.payload.symbol || msg.symbol || config.symbol;
            var limit = msg.payload.limit || msg.limit || config.limit || 1;
            alpaca_conn.getBars(
               timescale,
               symbol,
            	{limit: limit})
            .then(function(resp) {
               msg.payload = resp;
		         node.send(msg); })
		      .catch(function(err) {
		      	console.log(err.error);
            	msg.payload = err.error;
            	node.send(msg);
		      });
        });
	}
	function onEvent(config) {
	    
	    RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || ENV_API_KEY, 
          secretKey: auth.API_SECRET || ENV_API_SECRET,
          paper: auth.PAPER || true
        });
        /*
        const data_client = alpaca_conn.data_ws;
        data_client.onConnect(function () {
            var msg = {
                'topic':'onConnect',
                'payload':'Connected'};
            node.send(msg);
        });
        data_client.onDisconnect(() => {
            var msg {
                'topic':'onDisconnect',
                'payload':'Disconnected'};
            node.send(msg);
        })
        data_client.onStateChange(newState => {
            var msg = {
                'topic':'onStateChange',
                'payload':`State changed to ${newState}`;
            node.send(msg);
        })
        data_client.onStockTrades(function (subject, data) {
            var msg = {
                'topic':'onStockTrades',
                'payload':data,
                'subject':subject
            }
            node.send(msg);
        })
        data_client.onStockQuotes(function (subject, data) {
            var msg = {
                'topic':'onStockQuotes',
                'payload':data,
                'subject':subject
            }
            node.send(msg);
        })
        data_client.onStockAggSec(function (subject, data) {
            var msg = {
                'topic':'onStockAggSec',
                'payload':data,
                'subject':subject
            }
            node.send(msg);
        })
        data_client.onStockAggMin(function (subject, data) {
            var msg = {
                'topic':'onStockAggMin',
                'payload':data,
                'subject':subject
            }
            node.send(msg);
        })
        
        data_client.connect();
        */
        const updates_client = alpaca_conn.trade_ws;
        updates_client.onConnect(function () {
            console.log("Alpaca Event Listener Connected");
            const trade_keys = ['trade_updates', 'account_updates'];
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
    RED.nodes.registerType("submit-order",submitOrder);
    RED.nodes.registerType("get-orders",getOrder);
    RED.nodes.registerType("get-bars",getBars);
    RED.nodes.registerType("get-account",getAccount);
    RED.nodes.registerType("on-event",onEvent);
};
