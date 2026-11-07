# asteriskos

Web do Departamento de Latín e Grego: avisos, deberes por grupo, materias con lecturas e textos, unidades con materiais, gramática, calendario, biblioteca, viaxe e saídas.

É unha **web estática**: non hai contas, nin base de datos, nin servidor. Calquera abre a ligazón e le. O que é persoal (os materiais gardados co corazón, os deberes marcados como feitos e «o meu grupo») queda gardado no navegador de cada alumno.

O nome vén do *asteriskos* (ἀστερίσκος), o signo co que os filólogos de Alexandría marcaban os versos nos textos.

**Enderezo:** https://moronbandin.github.io/asteriskos

## Onde está cada cousa

```
src/content/avisos/      un ficheiro por aviso
src/content/deberes/     un ficheiro por deber
src/content/materias/    as catro materias (nome, curso, cor)
src/content/unidades/    unha unidade por ficheiro, cos seus materiais
src/content/gramatica/   un punto da gramática por ficheiro
src/content/saidas/      viaxe e saídas
src/data/sitio.json      axustes: nome do centro, curso, calendario, ligazóns
src/data/biblioteca.json ligazóns da biblioteca
src/styles/global.css    todo o deseño
.pages.yml               o panel de edición (Pages CMS)
```

## Como se edita

### Opción 1: co panel (sen tocar código)

1. Entra en [app.pagescms.org](https://app.pagescms.org) con GitHub.
2. Escolle o repositorio `asteriskos`.
3. Á esquerda tes Avisos, Deberes, Unidades e materiais, Gramática… Cambias o que queiras e pulsas **Save**.
4. En 1-2 minutos está publicado.

### Opción 2: cos ficheiros

Edita ou crea ficheiros en `src/content/` e despois:

```
git add .
git commit -m "Novo aviso"
git push
```

Exemplo dun deber (`src/content/deberes/2026-11-12-ficha-3a.md`):

```markdown
---
titulo: Facer a ficha 3A
grupos: [latin-1]
data: 2026-11-12
ligazon: https://drive.google.com/…
---
Exercicios 1 a 5. Traédeos para corrixir.
```

Os grupos son: `latin-4`, `latin-1`, `latin-2` e `grego-2`. Un aviso sen grupos é para todo o departamento.

Para ligar un PDF do Drive: Compartir → «Calquera persoa coa ligazón» → Copiar ligazón.

### Lecturas e textos de cada materia

Van no ficheiro da materia (`src/content/materias/latin-2.md`) ou no panel, en Materias → «Lecturas, textos e recursos». Se a ligazón é dun PDF do Drive, a web ábreo dentro dunha páxina propia.

```yaml
biblioteca:
  - seccion: lecturas        # lecturas, textos ou recursos
    titulo: Aulularia
    autor: Plauto
    url: https://drive.google.com/file/d/…/view
    descricion: A comedia da ola do ouro.
```

## Ver a web no teu ordenador

```
npm install
npm run dev
```

E abre http://localhost:4321/asteriskos

## Calendario

1. En Google Calendar, co Gmail persoal, crea un calendario chamado «Asteriskos».
2. Configuración do calendario → Permisos de acceso → **Facer dispoñible publicamente**.
3. Máis abaixo, en **Integrar calendario**, copia o enderezo que vai dentro de `src="…"`.
4. Pégao en `src/data/sitio.json`, en `"calendario"`, ou en Axustes do sitio no panel.

## Se cambias de centro

Cambia `centro` en `src/data/sitio.json`. Nada máis: a web non depende do correo nin das contas do instituto.

## Cambio de curso

Cambia `curso` en `src/data/sitio.json`, move os avisos e deberes vellos a outro cartafol ou bórraos, e pon as unidades en «próxima».
