# ThunderFront - Air Combat

Jogo de combate aéreo (shoot 'em up vertical) feito para a web. Mais tarde será empacotado com Capacitor para a Play Store.

## Rodar no seu computador
```
npm install
npm run dev
```
Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

## Estrutura
- `src/game.js` – o jogo (hangar, combate, fases, chefe)
- `src/auth.js` – telas de entrar, criar conta e recuperar senha
- `src/supabase.js` e `src/config.js` – ligação com o Supabase
- `src/assets/` – sprites dos aviões, chefe e cenários das fases

## Publicar (GitHub + Netlify)
1. Crie um repositório **vazio** no GitHub e suba todo o conteúdo desta pasta (sem `node_modules` e sem `dist`).
2. No Netlify: *Add new site → Import an existing project → GitHub* e escolha o repositório. O build já está configurado em `netlify.toml` (`npm run build`, pasta `dist`).
3. No painel do Supabase, em *Authentication → URL Configuration*:
   - **Site URL:** o endereço do seu site no Netlify;
   - **Redirect URLs:** o mesmo endereço e `http://localhost:5173`.
   Sem isso, os e-mails de confirmação e de recuperação de senha apontam para o endereço errado.
4. Para testar rápido, em *Authentication → Sign In / Providers → Email*, você pode desligar *Confirm email*. Religue antes de lançar.

## Segurança
- A chave `sb_publishable_...` em `src/config.js` é pública por design.
- Nunca coloque no código a chave `service_role` ou `secret`.
- Moedas, aviões comprados e XP não podem ser alterados pelo jogo: só por funções do servidor (próximas etapas).
