import { supabase } from './supabase.js'

const $ = (id) => document.getElementById(id)
const ALL = ['tabs', 'emailField', 'passField', 'pass2Field', 'forgot', 'back', 'guest']
const VIEW = {
  login: { show: ['tabs', 'emailField', 'passField', 'forgot', 'guest'], cta: 'Entrar', pass: 'Senha' },
  signup: { show: ['tabs', 'emailField', 'passField', 'guest'], cta: 'Criar conta', pass: 'Senha (mínimo 6 caracteres)' },
  forgot: { show: ['emailField', 'back'], cta: 'Enviar link de recuperação' },
  recovery: { show: ['passField', 'pass2Field'], cta: 'Salvar nova senha', pass: 'Nova senha (mínimo 6 caracteres)' },
}

let mode = 'login'
let session = null
let recovering = false
let nick = ''

const store = {
  get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch { /* sem armazenamento */ } },
  del: (k) => { try { localStorage.removeItem(k) } catch { /* sem armazenamento */ } },
}

function say(text, ok = false) {
  const m = $('msg')
  m.textContent = text || ''
  m.className = text ? (ok ? 'ok' : 'err') : ''
}

function errText(e) {
  const m = (e && e.message ? e.message : '').toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('not confirmed')) return 'Confirme seu e-mail antes de entrar (veja a caixa de entrada e o spam).'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já tem conta. Use a aba Entrar.'
  if (m.includes('at least') || m.includes('weak') || m.includes('password should')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
  if (m.includes('same password') || m.includes('different from the old')) return 'A nova senha precisa ser diferente da atual.'
  if (m.includes('fetch') || m.includes('network')) return 'Sem conexão com o servidor. Verifique a internet.'
  return 'Algo deu errado. Tente novamente.'
}

function busy(on) { $('submit').disabled = on }

function setMode(m, keepMsg) {
  mode = m
  const v = VIEW[m]
  $('auth').dataset.mode = m
  ALL.forEach((id) => { $(id).hidden = !v.show.includes(id) })
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m))
  $('submit').textContent = v.cta
  if (v.pass) $('passText').textContent = v.pass
  $('pass').autocomplete = m === 'login' ? 'current-password' : 'new-password'
  if (!keepMsg) say('')
}

function openAuth(m = 'login') {
  $('auth').hidden = false
  setMode(m)
  setTimeout(() => { const el = m === 'recovery' ? $('pass') : $('email'); if (el) el.focus() }, 50)
}

async function loadNick() {
  try {
    const { data } = await supabase.from('profiles').select('nickname').eq('id', session.user.id).maybeSingle()
    nick = (data && data.nickname) || 'Piloto'
  } catch (e) { console.error(e); nick = 'Piloto' }
}

async function editNick() {
  const n = prompt('Novo apelido (3 a 20 caracteres):', nick)
  if (n === null) return
  const v = n.trim()
  if (v.length < 3 || v.length > 20) { alert('O apelido precisa ter entre 3 e 20 caracteres.'); return }
  const { error } = await supabase.from('profiles').update({ nickname: v }).eq('id', session.user.id)
  if (error) { console.error(error); alert('Não foi possível salvar o apelido. Tente novamente.'); return }
  nick = v
  renderBar()
}

function renderBar() {
  const bar = $('userbar')
  bar.replaceChildren()
  if (recovering) { bar.hidden = true; return }
  bar.hidden = false
  const add = (tag, text, fn) => {
    const el = document.createElement(tag)
    el.textContent = text
    if (fn) { el.type = 'button'; el.onclick = fn }
    bar.append(el)
  }
  if (session) {
    add('span', 'Piloto ' + nick)
    add('button', 'Editar apelido', editNick)
    add('button', 'Sair', () => supabase.auth.signOut())
  } else {
    add('span', 'Visitante')
    add('button', 'Entrar', () => openAuth('login'))
  }
}

async function render() {
  if (recovering) {
    $('auth').hidden = false
    if (mode !== 'recovery') setMode('recovery')
  } else if (session) {
    store.del('tf_guest')
    $('auth').hidden = true
    await loadNick()
  } else if (store.get('tf_guest') === '1') {
    $('auth').hidden = true
  } else if ($('auth').hidden) {
    openAuth('login')
  }
  renderBar()
}

async function onSubmit(ev) {
  ev.preventDefault()
  say('')
  const email = $('email').value.trim()
  const pass = $('pass').value
  const needEmail = mode !== 'recovery'
  if (needEmail && !email.includes('@')) return say('Digite um e-mail válido.')
  if (mode !== 'forgot' && pass.length < 6) return say('A senha precisa ter pelo menos 6 caracteres.')
  busy(true)
  try {
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
      if (error) throw error
    } else if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { emailRedirectTo: location.origin + location.pathname },
      })
      if (error) throw error
      if (!data.session) {
        setMode('login', true)
        say('Conta criada! Enviamos um e-mail de confirmação. Confirme e depois entre.', true)
      }
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname })
      if (error) throw error
      say('Se este e-mail tiver conta, você receberá um link para criar uma nova senha.', true)
    } else if (mode === 'recovery') {
      if (pass !== $('pass2').value) { say('As senhas não são iguais.'); return }
      const { error } = await supabase.auth.updateUser({ password: pass })
      if (error) throw error
      recovering = false
      history.replaceState(null, '', location.pathname)
      $('pass').value = ''
      $('pass2').value = ''
      setMode('login')
      render()
    }
  } catch (e) {
    console.error(e)
    say(errText(e))
  } finally {
    busy(false)
  }
}

export function initAuth() {
  if (location.hash.includes('type=recovery')) recovering = true
  document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)))
  $('forgot').onclick = () => setMode('forgot')
  $('back').onclick = () => setMode('login')
  $('guest').onclick = () => { store.set('tf_guest', '1'); $('auth').hidden = true; renderBar() }
  $('authForm').addEventListener('submit', onSubmit)
  supabase.auth.onAuthStateChange((event, s) => {
    session = s
    if (event === 'PASSWORD_RECOVERY') recovering = true
    setTimeout(render, 0)
  })
}
