require('./lib/globals')

module.exports = () => {
  const Table = require('ascii-table'),
        colors = require("colors/safe"),
        waterfall = require('async').waterfall,
        async = require('async'),
        fs = require('fs')

  const boot = () => {
    waterfall([
      next => {
        prompt = require('./prompt')
        prompt.start()
        prompt.get( prompt.schema, (error, config) => {
          if(error)
            throw new Error(error)
          else
            next(null, config)
        })
      },
      (config, next) => {

        if(config.load_config) {
          try { config = require('../../config') }
          catch(e) {
            console.log("It appears you've set load_config somehow without having a config file you rascal. Set to false.")
            throw new Error(e)
          }
        }

        if(typeof config.period === "undefined") {
          let period  = require('./utilities/periods')
          config.period = period.last_closed()
        }

        if(config.period > CS_NUMBER_OF_PERIODS-1)
          config.period = CS_NUMBER_OF_PERIODS-1

        config = Object.assign( require('../../config.default'), config )

        next(null, config)
      }],
      //complete
      (error, config) => {
        let table = new Table('Settings')
        Object.keys(config).forEach((key,index) => {
          table.addRow([key, config[key]])
        })
        console.log(colors.bold.white(table.setAlign(0, Table.RIGHT).setAlign(1, Table.LEFT).render()))
        console.log(colors.white('Starting in 5 seconds.'))

        //Save config globally
        global.config = config;

        setTimeout( () => {
          let   state = {}
                state.timestamp_started = (Date.now() / 1000 | 0)

          waterfall([
            next => next(null, state),
            //Connect and check connections before starting
            require('./tasks/misc/connections'),
            //Dynamically set globals
            require('./tasks/misc/preload'),
            //Set the period map
            require('./tasks/sync/periods'),
            //Check if the crowdsale is ongoing and the token is stopped, "frozen"
            require('./tasks/sync/distribution-status'),
            //truncate all databases (except state) if config permits
            require('./tasks/sync/block-range'),
            //Sync events from the crowdsale contract
            require('./tasks/misc/truncate-db'),
            //Set the block range of the snapshot.
            require('./tasks/sync/contract'),
            //Calculate and validate each wallet.
            require('./tasks/sync/wallets'),
            //Run tests against data to spot any issues with integrity
            require('./tasks/misc/tests'),
            //Maybe run native registration fallback (v0.1) NOT RECOMMENDED.
            require('./tasks/sync/fallback'),
            //Generate output files.
            require('./tasks/export')
          ], (error, result) => {
              console.log(`Snapshot for Period #${config.period} Completed.`)
            if(error)
              console.log('Error:', error)
          })

        }, 5000)
    })
  }

  boot()
}
