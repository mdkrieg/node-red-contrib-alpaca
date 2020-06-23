const API_KEY = process.env.ALPACA_API_KEY;
const API_SECRET = process.env.ALPACA_API_SECRET;
const PAPER = true;

module.exports = function(RED) {
    Alpaca = require('@alpacahq/alpaca-trade-api');
    alpaca = new Alpaca({
      keyId: API_KEY, 
      secretKey: API_SECRET, 
      paper: PAPER
    });
    function submitOrder(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = alpaca.createOrder({
                symbol: msg.payload.stock, 
                qty: msg.payload.quantity, 
                side: msg.payload.side, 
                type: 'limit', 
                time_in_force: 'day', 
                limit_price: msg.payload.price
            });
            node.send(msg);
        });
    }
    function getOrder(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = alpaca.getOrders({
		      status:'all', 
		      direction:'asc'
		    });
		    node.send(msg);
		 });
	 }
    RED.nodes.registerType("submit-order",submitOrder);
    RED.nodes.registerType("get-order",getOrder);
}