Alpaca API: https://alpaca.markets/

Introduction: https://www.matthewdkrieg.com/projects/node-red-node-for-the-alpaca-stock-trading-api

# Alpaca Trading with Node-RED
This project wraps the official Node.js library for Alpaca into useful nodes for Node-RED.

Node-RED is a visual programming tool based on NodeJS.
Alpaca is a stock trading API.

# Release Notes

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
npm install node-red-contrib-alpaca
```

**Manual install from GitHub:**
1. Clone this repository to your Node-RED profile folder
   * Usually /home/[user]/.node-red/node_modules
1. Move to the repository's root and run "npm install" to grab dependencies


**To define your API keys as environment variables:**
   * APCA_API_KEY_ID=[your API key]
   * APCA_API_SECRET_KEY=[your secret key]

# Dependencies
Requires Alpaca's Official NodeJS SDK, https://github.com/alpacahq/alpaca-trade-api-js

Will install automatically if using npm or nodered directly, or to install SDK by itself:

```
npm install @alpacahq/alpaca-trade-api
```

# To Do
- [x] (0.1.2) Publish to NPM
- [x] (0.1.2) Publish to Node-RED
- [x] (0.2.0) Integrate ability to make all types of orders (market, stop limit, etc)
- [x] (0.2.0) Allow API Keys to be defined in configuration node
- [ ] Provide more examples
- [ ] Enhance template and help features
- [ ] Confirm "Cash Trading" works (I've only used paper trading w/ Alpaca)