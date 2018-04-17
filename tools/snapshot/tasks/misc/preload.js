const colors = require('colors/safe')

module.exports = (state, complete) => {
  const util = require('../../utilities'),
        series = require('async').series

  //Set daily totals array to global. Take note of "complete()" assumes this is the only async operation
  function dailyTotals() {

    util.period.daily_totals( totals => {
      global.CS_PERIOD_ETH = totals
      console.log(colors.green(`Set Daily Totals: ${totals.length}`))
      complete( null, state )
    })
  }

  dailyTotals()

  //If more than one, adapt the above.
  /*series([
    dailyTotals,
    newFn()
  ],
 () => complete(null, state))*/

}
