const async  = require('async'),
      bn     = require('bignumber.js'),
      Wallet = require('./Wallet'),
      Process = require('./Process'),
      util = require('../utilities')

class Final extends Process(Wallet) {
  balance_wallet( complete ){
    util.balance.wallet_token_state( this.address, balance => {
      this.balance.set( 'wallet', balance )
      complete()
    })
  }
}

module.exports = Final
