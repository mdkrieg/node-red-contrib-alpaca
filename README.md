Alpaca API: https://alpaca.markets/

Introduction: https://www.matthewdkrieg.com/projects/node-red-node-for-the-alpaca-stock-trading-api

# Alpaca Trading with Node-RED
This project wraps the official Node.js library for Alpaca into useful nodes for Node-RED.

Node-RED is a visual programming tool based on NodeJS.
Alpaca is a stock trading API.

# Installation

Project can be installed by searching "alpaca" in the Manage Palette section of your Node-RED session. There are no dependencies that NPM won't take care of automatically.

Or to install using npm from your Node-RED home directory (~/.node-red)

```
npm install node-red-contrib-alpaca
```

**Manual install from GitHub:**
1. Clone this repository to your Node-RED profile folder
   * Usually /home/[user]/.node-red/node_modules
1. Move to the repository's root and run "npm install" to grab dependencies


**Define your API keys as environment variables:**
   * APCA_API_KEY_ID=[your API key]
   * APCA_API_SECRET_KEY=[your secret key]

# Dependencies
Requires Alpaca's Official NodeJS SDK, https://github.com/alpacahq/alpaca-trade-api-js

Will install automatically if using npm or nodered directly, or to install SDK by itself:

```
npm install @alpacahq/alpaca-trade-api
```

# To Do
- [x] Publish to NPM
- [x] Publish to Node-RED
- [ ] Integrate ability to make all types of orders (market, stop limit, etc)
- [ ] Allow API Keys to be defined in configuration node
