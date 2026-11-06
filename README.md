# Asteriskos

Web do Departamento de Latín e Grego: materiais por materia e unidade, gramática, deberes por grupo, novidades, foros, biblioteca, viaxe e saídas, e un espazo persoal para cada alumno con favoritos e histórico.

O nome vén do *asteriskos* (ἀστερίσκος), o signo que usaban os filólogos de Alexandría para marcar os versos nos textos.

## Onde vive cada cousa

| Peza | Servizo | Custo |
| --- | --- | --- |
| A web | Vercel (plan Hobby) | Gratis. Enderezo tipo `asteriskos.vercel.app` |
| Base de datos | Neon (Postgres) | Gratis (0,5 GB, sobra) |
| Inicio de sesión | Google OAuth | Gratis |
| PDFs e documentos | O teu Google Drive | Gratis. Na web só se garda a ligazón |

GitHub Pages non serve porque só publica páxinas estáticas: non pode comprobar quen entra nin gardar deberes, favoritos ou mensaxes. É a mesma combinación que Palaestra (Vercel + Neon), así que xa coñeces os paneis.

## Cartafoles

```
content/gramatica/      ← a gramática: un ficheiro .md por punto
scripts/seed.ts         ← enche a base de datos coas materias e unidades iniciais
src/app/(main)/         ← as páxinas (inicio, materias, gramática, foros, eu, xestión…)
src/app/entrar/         ← pantalla de acceso
src/lib/schema.ts       ← que se garda na base de datos
src/lib/auth.ts         ← quen pode entrar
src/lib/admin-actions.ts← o que fai o panel de xestión
src/app/globals.css     ← todo o deseño
```

## Posta en marcha (unha soa vez)

### 1. Base de datos en Neon

1. En [console.neon.tech](https://console.neon.tech) crea un proxecto novo chamado `asteriskos` (rexión Europa).
2. Copia a *connection string* (Dashboard → Connect).

### 2. Credenciais de Google

Igual que en Palaestra, coa túa conta persoal de Gmail, porque a do centro ten bloqueada a consola:

1. [console.cloud.google.com](https://console.cloud.google.com) → podes usar o mesmo proxecto de Palaestra.
2. APIs e servizos → Credenciais → Crear credenciais → ID de cliente de OAuth → Aplicación web.
3. En **URI de redirección autorizados** engade:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://asteriskos.vercel.app/api/auth/callback/google` (ou o enderezo que che dea Vercel)
4. Copia o ID de cliente e o segredo.
5. Na **pantalla de consentimento**, se está en modo «Proba», só poden entrar as contas engadidas como probadoras. Para o alumnado, pulsa **Publicar aplicación**: con só correo e perfil non fai falta verificación de Google.

### 3. Ficheiro `.env`

Copia `.env.example` como `.env` e enche os valores. O segredo xérase no Terminal con:

```
openssl rand -base64 32
```

### 4. Crear as táboas e os datos iniciais

No Terminal, dentro do cartafol do proxecto:

```
npm install
npm run setup
npm run dev
```

`npm run setup` crea as táboas e mete as materias e unidades iniciais. Só se fai a primeira vez.

Abre `http://localhost:3000`. En local aparece un recadro «Proba local, sen Google»: escribe un correo de `ADMIN_EMAILS` e entras como profesor. Para ver a web como alumno, dáte de alta en Xestión → Alumnado cun correo de proba, sae e entra con ese correo. Este recadro non existe na web publicada.

Se cambias o esquema da base de datos (`src/lib/schema.ts`): `npm run db:generate` e despois `npm run db:migrate`.

### 5. Publicar en Vercel

1. Sube o proxecto a GitHub (privado) e en [vercel.com](https://vercel.com) → Add New → Project → impórtao.
2. En **Environment Variables** pega as mesmas variables do `.env`, agás `NEXTAUTH_URL`.
3. Deploy. Cada vez que gardes cambios en GitHub, publícase de novo.

## Como se usa no día a día

- **Alumnado:** Xestión → Alumnado → «Dar de alta un grupo enteiro». Pega unha liña por persoa: `Nome Apelidos; correo`. Vale o correo do centro ou un Gmail. Só entra quen estea dado de alta. Dar de baixa non borra nada.
- **Deberes:** Xestión → Deberes. Escolle un ou varios grupos; aparece no inicio de cada alumno, que o marca como feito.
- **Materiais:** Xestión → Materiais. Elixe a unidade e o tipo e pega a ligazón. Para un PDF do Drive: Compartir → «Calquera persoa coa ligazón» → Copiar ligazón.
- **Novidades:** para todo o departamento ou só para un grupo. Pódense fixar arriba.
- **Unidades:** en Xestión → Materias e unidades marcas cal está «Agora», «Vista» ou «Próxima».
- **Gramática:** edita ou engade ficheiros en `content/gramatica/`. A cabeceira de cada ficheiro di o título, a sección, a orde e en que cursos se usa.

## Contas: todo coas persoais

Para non depender do instituto, todas as contas do proxecto van co teu correo persoal (o Gmail), nunca co do centro:

- **GitHub**, onde está o código.
- **Vercel**, onde se publica. Entra en Vercel con «Continue with GitHub» e así as dúas quedan unidas.
- **Neon**, a base de datos. Tamén con GitHub ou co Gmail.
- **Google Cloud**, as credenciais de acceso, no proxecto que xa usas para Palaestra.

O correo do centro só aparece como unha das contas de profesor en `ADMIN_EMAILS`.

## Se cambias de centro

Non hai que refacer nada. En Vercel → Settings → Environment Variables:

1. Cambia `SCHOOL_NAME` polo novo centro.
2. Cambia `SCHOOL_DOMAIN` polo dominio novo, ou déixao baleiro se o alumnado vai entrar con Gmail.
3. En `ADMIN_EMAILS`, cambia o correo do centro antigo polo novo. O Gmail persoal segue igual.
4. Volve publicar (Deployments → Redeploy).

O alumnado novo dáse de alta como sempre, co correo que teña. A web pode ter alumnado con correo do centro e con Gmail ao mesmo tempo.

## Cambio de curso (en xuño)

Cambia `SCHOOL_YEAR` (por exemplo a `2027-28`) en Vercel. Despois, en Xestión → Materias e unidades, crea os grupos do novo curso e mete neles o alumnado. Os grupos dos anos anteriores quedan gardados e forman o histórico de cada alumno.

## Privacidade

Só se garda o nome, o correo, a foto de Google, os deberes marcados, os favoritos e as mensaxes dos foros. Non hai notas nin observacións: iso segue en Xesta. Antes de abrir os foros ao alumnado, convén informar á dirección do centro.
