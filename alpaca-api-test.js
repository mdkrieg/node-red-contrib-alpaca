const API_KEY = process.env.ALPACA_API_KEY;
const API_SECRET = process.env.ALPACA_API_SECRET;
const PAPER = true;


var Alpaca = require('@alpacahq/alpaca-trade-api');
var alpaca = new Alpaca({
  keyId: API_KEY, 
  secretKey: API_SECRET, 
  paper: PAPER
});

var payload = {
    "stock": "AAPL",
    "quantity": 10,
    "side": "buy",
    "type":"limit",
    "time_in_force":"day",
    "price":100
};
var msg = {"payload":payload};


/*alpaca.createOrder({
        symbol: msg.payload.stock, 
        qty: msg.payload.quantity, 
        side: msg.payload.side, 
        type: 'limit', 
        time_in_force: 'day', 
        limit_price: msg.payload.price
    }).then(function(foo){
        console.log(foo);
    });*/
alpaca.getAggregates('AAPL', 'minute', '2020-04-20', '2020-04-21').then(function(response) {
          console.log(response)
        });
//console.log(payload);