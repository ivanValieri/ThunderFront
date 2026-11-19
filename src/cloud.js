import { supabase } from './supabase.js'

// Estado da conta do jogador logado (vem do servidor; o jogo só lê e pede ações)
export const cloud = { user: null, state: null }

export async function refresh() {
  if (!cloud.user) { cloud.state = null; return null }
  const { data, error } = await supabase.rpc('get_my_state')
  if (error) { console.error(error); return cloud.state }
  cloud.state = data
  return data
}

// Envia o resultado da partida; o servidor valida e credita as moedas
export async function submitRun(mode, stage, durationSec, kills, bosses, coins) {
  const { data, error } = await supabase.rpc('submit_run', {
    p_mode: mode,
    p_stage: stage,
    p_duration: Math.round(durationSec),
    p_kills: kills,
    p_bosses: bosses,
    p_coins: Math.floor(coins),
  })
  if (error) { console.error(error); return { error: error.message || 'erro' } }
  await refresh()
  return data
}

export async function chooseCloudPlane(planeId) {
  const { error } = await supabase.rpc('select_plane', { p_plane_id: planeId })
  if (error) { console.error(error); return false }
  if (cloud.state) cloud.state.selected = planeId
  return true
}

// Compra de avião: o servidor confere saldo e posse, desconta as moedas e libera o avião
export async function buyCloudPlane(planeId) {
  const { data, error } = await supabase.rpc('buy_plane', { p_plane_id: planeId })
  if (error) { console.error(error); return { error: error.message || 'erro' } }
  await refresh()
  return data
}
