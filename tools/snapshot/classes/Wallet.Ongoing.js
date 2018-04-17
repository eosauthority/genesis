const async  = require('async'),
      bn     = require('bignumber.js'),
      Wallet = require('./Wallet'),
      Process = require('./Process'),
      util = require('../utilities')

class Ongoing extends Process(Wallet) {
  balance_wallet( complete ){
    util.balance.wallet_cumulative( this.transfers, balance => {
      this.balance.set( 'wallet', balance )
      complete()
    })
  }
}

module.exports = Ongoing
