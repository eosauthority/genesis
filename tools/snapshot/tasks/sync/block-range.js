module.exports = ( state, complete )  => {
  if(state.frozen > 0 && state.freeze_block) {
    state.block_begin         = CS_BLOCK_FIRST
    state.block_end           = state.freeze_block
    global.config.mode        = "final"
  } else {
    state.block_begin         = state.period_map[0].begin
    state.block_end           = state.period_map[config.period].end
    global.config.mode        = "ongoing"
  }
  console.log(`Block range set to ${state.block_begin} -> ${state.block_end} for mode ${config.mode}`)
  complete(null, state)
}
