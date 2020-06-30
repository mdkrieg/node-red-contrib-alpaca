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
            const symbol = msg.symbol || config.symbol;
            const qty = msg.qty || config.qty;
            const price = msg.price || config.price;
            const tif = msg.tif || config.tif || "day";
            const side = msg.side || config.side;
            alpaca.createOrder({
                symbol: symbol,
                qty: qty,
                side: side,
                type: 'limit',
                time_in_force: tif,
                limit_price: price
            }).then(function(resp) {
                msg.payload = resp;
                node.send(msg);
            }).catch((err) => {console.log(err.error);});
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
            const symbol = msg.symbol || config.symbol;
            const limit = msg.limit || config.limit || 1;
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
