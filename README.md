# Alpaca Trading with Node-RED
This project wraps the official Node.js library for Alpaca into useful nodes for Node-RED.

Node-RED is a visual programming tool based on NodeJS.
Alpaca is a stock trading API.

# Installation

**Steps:**
1. Clone this repository to your Node-RED profile folder
   * Usually /home/[user]/.node-red/node_modules
1. run "npm install" from project's root to grab dependencies
1. Define your API keys as environment variables
   * APCA_API_KEY_ID=[your API key]
   * APCA_API_SECRET_KEY=[your secret key]

# Dependencies
Requires Alpaca's NodeJS SDK, https://github.com/alpacahq/alpaca-trade-api-js

To install SDK by itself:

```
npm install @alpacahq/alpaca-trade-api
```

# To Do
- [ ] Integrate additional features from the SDK
- [ ] Publish to NPM
