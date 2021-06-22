Alpaca API: https://alpaca.markets/
Official SDK: https://github.com/alpacahq/alpaca-trade-api-js
Project Links
    GitHub: https://github.com/mdkrieg/node-red-contrib-alpaca
    NPM: https://www.npmjs.com/package/node-red-contrib-alpaca
    NodeRed Project: https://flows.nodered.org/node/node-red-contrib-alpaca

# Alpaca Trading with Node-RED
This project wraps the official Node.js library for Alpaca into useful nodes for Node-RED.

Node-RED is a visual programming tool based on NodeJS.
Alpaca is a stock trading API.

# Nodes
## Alpaca
TODO
## Alpaca Websocket
TODO

# Release Notes
### 2.0.0
#### Major Changes
* Removed "simple" nodes and publishing to separate project
* Removed old socket nodes as I don't think they work (replacing with one that does work)

#### Minor Changes
* Added websocket v2 node
* Added Get Trade and Get Quote (aka "Get Last Trade/Quote") functions to main Alpaca node
* Added GetBarsV2 function to main Alpaca node
* Updated help for Watchlist functions

### 1.1.1
* Merged previous two updates and publish to NPM

### 1.1.0
* Developed Websocket node into Datasocket and Updatesocket

### 1.0.1
* Submit-order node had the wrong text in the html display (corrected to ".type")

### 1.0.0
* Created new universal "Alpaca" node which will pass msg.payload to any one of a long list of functions from the official API
   * this provides a different way to access the same functionality as the previous nodes
* Can also use msg.topic to specify which function to use
* Embedded example codes (taken from the GitHub) into the configuration template
* Added the "dot-status" to the Alpaca node, also indicates paper/live with either ring/dot shapes
* (note: this is lost / missing) Added "inject account" node. playing around with the idea of it for now.

### 0.3.1
* Changed submit-order and get-order to forward entire msg.payload object. This will allow the use of Bracket Orders as explained in the docs here: https://alpaca.markets/docs/trading-on-alpaca/orders/

### 0.3.0
* Added on-event node for triggering on the following events:
    *  onStateChange
    *  onOrderUpdate
    *  onAccountUpdate

### 0.2.0
* Added market, limit, stop, or stop limit options for submit-order
* Added configuration node
    * Same ENV vars from previous minor version still work
    * Ability to select "cash trades"
* Added label features
    * get-bars automatically shows symbol on node label
    * configuration node automatically shows Cash or Paper

### 0.1.2
* Four basic nodes available:
    * submit-order
    * get-order
    * get-bars
    * get-account
* Two examples
    * limit-spread
    * basics


# Installation

Project can be installed by searching "alpaca" in the Manage Palette section of your Node-RED session. **There are no dependencies that NPM won't take care of automatically.**

Or to install using npm from your Node-RED home directory (~/.node-red)

```
npm install --save node-red-contrib-alpaca
```

**To define your API keys as environment variables:**
   * APCA_API_KEY_ID=[your API key]
   * APCA_API_SECRET_KEY=[your secret key]

# Dependencies
Requires Alpaca's Official NodeJS SDK, https://github.com/alpacahq/alpaca-trade-api-js
Also see official Alpaca API documentation, https://alpaca.markets/docs/api-documentation/

# To Do
- [x] (0.1.2) Publish to NPM
- [x] (0.1.2) Publish to Node-RED
- [x] (0.2.0) Integrate ability to make all types of orders (market, stop limit, etc)
- [x] (0.2.0) Allow API Keys to be defined in configuration node
- [ ] Provide more examples
- [ ] Enhance template and help features
- [x] Confirm "Cash Trading" works (I've only used paper trading w/ Alpaca)
