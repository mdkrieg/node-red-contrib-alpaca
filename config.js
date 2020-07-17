module.exports = function(RED) {
	 console.log("-----------config node A-----------");	
    RED.nodes.registerType("alpaca-config",    function(n) {
        RED.nodes.createNode(this,n);
		  console.log("-----------config node B-----------");        
        this.API_KEY = n.key-id;
        this.API_SECRET = n.secret-key;
        this.PAPER = n.paper;
    });
 }
 console.log("-----------config node C-----------");	
    