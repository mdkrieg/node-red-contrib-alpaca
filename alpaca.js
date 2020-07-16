const API_KEY = process.env.APCA_API_KEY_ID || '';
const API_SECRET = process.env.APCA_API_SECRET_KEY || '';
const PAPER = true;

module.exports = function(RED) {
    var Alpaca = require('@alpacahq/alpaca-trade-api');
    var alpaca = new Alpaca({
      keyId: API_KEY, 
      secretKey: API_SECRET, 
      paper: PAPER
    });
    function submitOrder(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            var req = {};
            	req.symbol = msg.payload.symbol || msg.symbol || config.symbol;
            	req.qty = msg.payload.qty || msg.qty || config.qty;
            	req.type = msg.payload.ordertype ||  msg.ordertype || config.ordertype || "limit";
            	if (req.type === "limit" || req.type === "stop_limit"){
            		req.limit_price = msg.payload.price ||  msg.price || config.price; }
            	if (req.type === "stop" || req.type === "stop_limit"){
            		req.stop_price = msg.payload.price ||  msg.price || config.price; }
            	req.time_in_force = msg.payload.tif ||  msg.tif || config.tif || "day";
            	req.side = msg.payload.side ||  msg.side || config.side;
            alpaca.createOrder(req)
            .then(function(resp) {
                msg.payload.response = resp;
                node.send(msg); })
            .catch((err) => {
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
        node.on('input', function(msg) {
            alpaca.getOrders({
		      status:'all', 
		      direction:'asc'
		    }).then(function(resp) {
                msg.payload = resp;
		        node.send(msg);
            }).catch((err) => {console.log(err.error);});
		 });
	}
    function getAccount(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            alpaca.getAccount().then(function(resp) {
                msg.payload = resp;
		        node.send(msg);
            }).catch((err) => {console.log(err.error);});
		 });
	}
	function getBars(config) {
	    RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            var symbol = msg.symbol || config.symbol;
            var limit = msg.limit || config.limit || 1;
            alpaca.getBars(
                'minute',
                symbol,
                {limit: limit}
                ).then(function(resp) {
                    msg.payload = resp;
		            node.send(msg);
                }
            ).catch((err) => {console.log(err.error);});
        });
	}
	
    RED.nodes.registerType("submit-order",submitOrder);
    RED.nodes.registerType("get-order",getOrder);
    RED.nodes.registerType("get-bars",getBars);
    RED.nodes.registerType("get-account",getAccount);
}
