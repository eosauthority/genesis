module.exports = ( state, complete ) => {
  const colors = require("colors/safe"),
        series    = require('async').series,
        contract = require('../../helpers/web3-contract.js')

  const is_distribution_over = next => {
    state.crowdsale_over = (state.timestamp_started > CS_END_TIME)
    if(state.crowdsale_over)
      console.log(colors.yellow(`Distribution has ended`))
    else
      console.log(colors.green(`Distribution is active`))
    next()
  }

  const is_token_frozen = next => {
    contract.$token.methods.stopped().call()
      .then( stopped => {
        state.frozen = stopped ? true : false
        next()
      })
  }

  const when_tokens_froze = next => {
    if(!state.frozen) {
      console.log(colors.green("Tokens are liquid"))
      next()
      return
    }

    const _for = require('async-for')

    const settings = {}
    const blocks_per_iteration = 100
    const block_iterations = Math.ceil((state.frozen - state.period_map[CS_NUMBER_OF_PERIODS-1].end)/blocks_per_iteration)
    const block_offset = state.period_map[CS_NUMBER_OF_PERIODS-1].end
    let loop = _for(0, function (i) { return true }, function (i) { return i + 1; },
      function loopBody(i, _break, _continue) {

        //Calculate block ranges to run for each pass
        settings.begin = (i*blocks_per_iteration)+block_offset
        settings.end = settings.begin+blocks_per_iteration-1

        contract.$crowdsale
          .getPastEvents('LogFreeze', { fromBlock : settings.begin, toBlock: settings.end })
          .then( logs => {
            if(logs.length && state.frozen)
              state.freeze_block = logs[0].blockNumber,
              _break()
            else
              _continue()
          })
      });

    loop(() => {
      if(state.freeze_block)
        console.log(colors.yellow(`Tokens were frozen at block ${state.freeze_block}`))
      setTimeout(next, 5000)
    })

  }

  const check = recheck => {
    series([
      is_distribution_over,
      is_token_frozen,
      when_tokens_froze,
    ], () => {
      //The crowdsale is over, and tokens are frozen.
      if(state.frozen === true && state.crowdsale_over) {
          complete(null, state)
      }
      //Tokens aren't frozen, but the mode is set for final. Keep checking until tokens are frozen.
      else if( state.frozen === false && state.crowdsale_over && config.mode == "final" ) {
        setTimeout(() => {
          if(!recheck) console.log(colors.green("The crowdsale is over and your config indicates you would like to generate a mainnet snapshot, however, the tokens are not yet frozen. Will check once a second, until the tokens are frozen."))
          check(true)
        }, 1000)
      }
      else {
        complete(null, state)
      }
    })
  }

  check()

}
