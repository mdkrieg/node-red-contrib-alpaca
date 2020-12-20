/*****************************************************************
 * 
 *  SIMPLE.JS
 * 
 *   As of v1.0.0 I'm creating a new node that can pass a payload
 * to any of the functions from "@alpacahq/alpaca-trade-api".
 * 
 *   These were the first few nodes I made, it's just a small
 * subset of what is available from the official SDK, hence the
 * change explained above. Keeping these around just in case.
 * 
 * ***************************************************************/



const ENV_API_KEY = process.env.APCA_API_KEY_ID;
const ENV_API_SECRET = process.env.APCA_API_SECRET_KEY;
const ENV_API_KEY_PAPER = process.env.APCA_API_KEY_ID_PAPER;
const ENV_API_SECRET_PAPER = process.env.APCA_API_SECRET_KEY_PAPER;

module.exports = function(RED) {
    
    var Alpaca = require('@alpacahq/alpaca-trade-api');
    
    function submitOrder(config) { 
        RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY), 
          secretKey: auth.API_SECRET || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY),
          paper: auth.PAPER
        });
        node.on('input', function(msg) {
            var req = msg.payload;
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
    /*function getOrder(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY), 
          secretKey: auth.API_SECRET || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY),
          paper: auth.PAPER
        });
        node.on('input', function(msg) {
        		var req = msg.payload;
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
	}*/
	function getBars(config) {
	    RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY), 
          secretKey: auth.API_SECRET || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY),
          paper: auth.PAPER
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
    function getAccount(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var auth = RED.nodes.getNode(config.auth);
        var alpaca_conn = new Alpaca({
          keyId: auth.API_KEY || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY), 
          secretKey: auth.API_SECRET || (auth.PAPER ? ENV_API_KEY_PAPER : ENV_API_KEY),
          paper: auth.PAPER
        });
        node.on('input', function(msg) {
            msg.auth = auth;
            alpaca_conn.getAccount()
            .then(function(resp) {
               msg.payload = resp;
		      	node.send(msg); })
            .catch(function(err) {
            	msg.payload = err.error;
            	node.send(msg);
            });
		 });
	}
    RED.nodes.registerType("submit-order",submitOrder);
    /*RED.nodes.registerType("get-order",getOrder);*/
    RED.nodes.registerType("get-bars",getBars);
    RED.nodes.registerType("get-account",getAccount);
};
