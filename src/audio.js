// Áudio do jogo (Web Audio): músicas em loop, tiros em loop contínuo e efeitos.
// Os navegadores só liberam o som depois do primeiro toque ou tecla, então tudo começa aí.
import safeMp3 from './assets/audio/music/safe-zone.mp3'
import safeOgg from './assets/audio/music/safe-zone.ogg'
import combMp3 from './assets/audio/music/combate.mp3'
import combOgg from './assets/audio/music/combate.ogg'
import chefMp3 from './assets/audio/music/chefe.mp3'
import chefOgg from './assets/audio/music/chefe.ogg'
import tiroComum from './assets/audio/sfx/tiro-comum.wav'
import tiroRapido from './assets/audio/sfx/tiro-rapido.wav'
import bomba from './assets/audio/sfx/bomba.wav'

// loopStart = ponto (em segundos) para onde a música volta ao chegar no fim do arquivo
const MUSIC = {
  safe: { mp3: safeMp3, ogg: safeOgg, loopStart: 11.122 },
  combate: { mp3: combMp3, ogg: combOgg, loopStart: 4.017 },
  chefe: { mp3: chefMp3, ogg: chefOgg, loopStart: 7.012 },
}
const SFX = { 'tiro-comum': tiroComum, 'tiro-rapido': tiroRapido, bomba }
const VOICE = Object.fromEntries(Object.entries(import.meta.glob('./assets/audio/radio/*.mp3', { eager: true, import: 'default' })).map(([p, u]) => [p.split('/').pop().replace('.mp3', ''), u]))
const VOL = { music: 0.5, sfx: 0.9, gun: 0.3, bomba: 0.9, voice: 1 }

const AC = globalThis.AudioContext || globalThis.webkitAudioContext
const A = { ctx: null, master: null, mGain: null, sGain: null, muted: false, music: { name: null, node: null }, gun: { name: null, node: null }, voice: { node: null }, buf: new Map() }
try { A.muted = localStorage.getItem('tf_mute') === '1' } catch { /* sem armazenamento */ }

const useOgg = (() => {
  try { return !!document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"') } catch { return false }
})()

export const isMuted = () => A.muted

export function toggleMute() {
  A.muted = !A.muted
  try { localStorage.setItem('tf_mute', A.muted ? '1' : '0') } catch { /* sem armazenamento */ }
  if (A.master) A.master.gain.value = A.muted ? 0 : 1
  return A.muted
}

export function unlockAudio() {
  if (A.ctx || !AC) return
  try {
    A.ctx = new AC()
    A.master = A.ctx.createGain(); A.master.gain.value = A.muted ? 0 : 1; A.master.connect(A.ctx.destination)
    A.mGain = A.ctx.createGain(); A.mGain.gain.value = VOL.music; A.mGain.connect(A.master)
    A.sGain = A.ctx.createGain(); A.sGain.gain.value = VOL.sfx; A.sGain.connect(A.master)
    if (A.ctx.resume) A.ctx.resume()
    // pré-carrega o que será usado primeiro, para não haver atraso
    load('m:safe', pickMusic('safe')); load('s:bomba', SFX.bomba); load('s:tiro-comum', SFX['tiro-comum']); load('s:tiro-rapido', SFX['tiro-rapido'])
    for (const id of Object.keys(VOICE)) load('v:' + id, VOICE[id])
  } catch (e) { console.error('áudio indisponível', e); A.ctx = null }
}
for (const ev of ['pointerdown', 'keydown', 'touchstart']) addEventListener(ev, unlockAudio, { capture: true, passive: true })
try { document.addEventListener('visibilitychange', () => { if (!A.ctx) return; if (document.hidden) A.ctx.suspend && A.ctx.suspend(); else A.ctx.resume && A.ctx.resume() }) } catch { /* sem document */ }

const pickMusic = (name) => (useOgg ? MUSIC[name].ogg : MUSIC[name].mp3)

function load(key, url) {
  if (A.buf.has(key)) return A.buf.get(key)
  const p = fetch(url).then((r) => r.arrayBuffer()).then((ab) => new Promise((res, rej) => {
    const r = A.ctx.decodeAudioData(ab, res, rej)
    if (r && r.then) r.then(res, rej)
  })).catch((e) => { console.error('áudio', key, e); A.buf.delete(key); return null })
  A.buf.set(key, p)
  return p
}

function stopNode(slot, sec) {
  const n = slot.node; slot.node = null
  if (!n || !A.ctx) return
  const t = A.ctx.currentTime
  n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(n.g.gain.value, t); n.g.gain.linearRampToValueAtTime(0, t + sec)
  try { n.s.stop(t + sec + 0.05) } catch { /* já parou */ }
}

function startLoop(slot, buf, { loopStart = 0, vol = 1, fade = 1 }) {
  const t = A.ctx.currentTime
  const g = A.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + fade); g.connect(slot === A.music ? A.mGain : A.sGain)
  const s = A.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = loopStart; s.loopEnd = buf.duration; s.connect(g); s.start()
  slot.node = { s, g }
}

function setMusic(name) {
  if (A.music.name === name) return
  A.music.name = name; stopNode(A.music, 0.9)
  if (!name) return
  load('m:' + name, pickMusic(name)).then((buf) => { if (buf && A.music.name === name && !A.music.node) startLoop(A.music, buf, { loopStart: MUSIC[name].loopStart, fade: 1 }) })
}

function setGun(name) {
  if (A.gun.name === name) return
  A.gun.name = name; stopNode(A.gun, 0.12)
  if (!name) return
  load('s:' + name, SFX[name]).then((buf) => { if (buf && A.gun.name === name && !A.gun.node) startLoop(A.gun, buf, { vol: VOL.gun, fade: 0.12 }) })
}

// Chamado a cada quadro: diz qual música e qual som de tiro devem estar tocando agora
export function syncAudio(want) { if (!A.ctx) return; setMusic(want.music); setGun(want.gun) }

export function playSfx(name) {
  if (!A.ctx) return
  load('s:' + name, SFX[name]).then((buf) => {
    if (!buf) return
    const g = A.ctx.createGain(); g.gain.value = VOL[name] || 1; g.connect(A.sGain)
    const s = A.ctx.createBufferSource(); s.buffer = buf; s.connect(g); s.start()
  })
}

// Fala de rádio: toca por cima dos efeitos e abaixa a música enquanto dura
export function playVoice(id) {
  if (!A.ctx || !VOICE[id]) return
  load('v:' + id, VOICE[id]).then((buf) => {
    if (!buf) return
    stopNode(A.voice, 0.08)
    const g = A.ctx.createGain(); g.gain.value = VOL.voice; g.connect(A.sGain)
    const s = A.ctx.createBufferSource(); s.buffer = buf; s.connect(g); s.start()
    A.voice.node = { s, g }
    const t = A.ctx.currentTime, m = A.mGain.gain
    m.cancelScheduledValues(t); m.setValueAtTime(m.value, t)
    m.linearRampToValueAtTime(VOL.music * 0.45, t + 0.15)
    m.setValueAtTime(VOL.music * 0.45, t + 0.15 + buf.duration)
    m.linearRampToValueAtTime(VOL.music, t + 0.65 + buf.duration)
  })
}
