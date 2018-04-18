// This is a mixin for use with Wallet.js, Final/Ongoing classes extend on this mix-in to use appropriate wallet calculation.
// example: class Final extends Process(Wallet) { ...

const async  = require('async'),
      bn     = require('bignumber.js'),
      util = require('../utilities')

const Process = (Process) => class extends Process {

  process_key( complete ){
    this.maybe_fix_key()
    complete()
  }

  process_balance_unclaimed( complete ){
    util.balance.unclaimed( this.buys, this.claims, CS_NUMBER_OF_PERIODS, balance => {
      this.balance.set( 'unclaimed', balance )
      complete()
    })
  }

  process_balance_reclaimed( complete ){
    util.balance.reclaimed( this.reclaimables, balance => {
      this.balance.set( 'reclaimed', balance )
      complete()
    })
  }

  process_balance_sum( complete ){
    this.balance.sum()
    complete()
  }

  process_balance_from_wei( complete ){
    this.balance.from_wei()
    complete()
  }

  process_balance_format( complete ){
    this.balance.format()
    complete()
  }

  process_judgement( complete ){
    this.valid() ? this.accept() : this.reject()
    complete()
  }

  process_exclude(complete){
    const exclude = [CS_ADDRESS_CROWDSALE, CS_ADDRESS_TOKEN]
    if(!this.config.include_b1) exclude.push(CS_ADDRESS_B1)
    if(exclude.indexOf(this.address) > -1)
      this.accepted           = false,
      this.register_error     = 'exclude'
    complete()
  }

  process( callback ) {
    async.series([
      ( complete ) => this.process_key( complete ),
      ( complete ) => this.process_balance_wallet( complete ),
      ( complete ) => this.process_balance_unclaimed( complete ),
      ( complete ) => this.process_balance_reclaimed( complete ),
      ( complete ) => this.process_balance_sum( complete ),
      ( complete ) => this.process_balance_from_wei( complete ),
      ( complete ) => this.process_balance_format( complete ),
      ( complete ) => this.process_judgement( complete ),
      ( complete ) => this.process_exclude( complete )
    ],(err, result) => {
      callback( this.json() )
    })
  }

}

module.exports = Process
