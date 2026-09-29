# -*- coding: utf-8 -*-
"""Génère les instantanés de publication des Chroniques N°011 à 018.

Pour chaque chronique N, le dossier programme/NNN/ contient l'état complet des fichiers à
déposer sur le FTP le jour de sa sortie : toutes les chroniques 011..N (desktop + mobile), la
010 recâblée vers la 011, les deux listings et le sitemap. Chaque instantané est cumulatif :
si un mardi échoue, le suivant remet tout d'aplomb.

Chaque page porte le nom de son article (« slug » dans articles.py) : <slug>.html et
mobile/<slug>.html, servis sans extension par le .htaccess (studio-toinon.fr/<slug>).

manifest.json liste les fichiers dans l'ordre d'envoi (articles d'abord, listings et
sitemap ensuite), chemins relatifs à la racine www/ du site.

Base : l'état publié du dépôt (dernière chronique en ligne = BASE, la 010). Le script refuse
de tourner si la suivante est déjà intégrée au dépôt, pour ne jamais insérer deux fois.
L'en-tête des pages est calqué sur la 009, dont les chaînes propres sont remplacées.

Lancement : python tools/chroniques/build.py  (depuis la racine du dépôt du site)
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from articles import ARTICLES, PRECEDENTE  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent / "programme"
SIGN = '&mdash; Studio Toinon'
BASE = 10  # dernière chronique déjà en ligne et intégrée au dépôt
SLUG_009 = PRECEDENTE['slug']
SLUG = {x['num']: x['slug'] for x in ARTICLES}
SLUG[PRECEDENTE['num']] = SLUG_009


def t(s):
    """Texte courant : on échappe &, < et >, les accents restent en UTF-8 comme dans les 001-009."""
    return html.escape(s, quote=False)


def a(s):
    """Valeur d'attribut entre guillemets doubles."""
    return html.escape(s, quote=False).replace('"', '&quot;')


def sans_point(titre):
    return titre[:-1] if titre.endswith('.') else titre


def num3(n):
    return f"{n:03d}"


def corps_blocs(src):
    blocs = []
    for ligne in src.strip().splitlines():
        ligne = ligne.strip()
        if not ligne:
            continue
        if ligne.startswith('## '):
            blocs.append(('h2', ligne[3:]))
        elif ligne.startswith('> '):
            avant, vive = [x.strip() for x in ligne[2:].split('|', 1)]
            blocs.append(('quote', avant, vive))
        else:
            blocs.append(('p', ligne))
    return blocs


def corps_html(art, indent):
    pad = ' ' * indent
    out = []
    for b in corps_blocs(art['corps']):
        if b[0] == 'h2':
            if out:
                out.append('')
            out.append(f'{pad}<h2>{t(b[1])}</h2>')
        elif b[0] == 'quote':
            out.append('')
            out.append(f'{pad}<blockquote>')
            out.append(f'{pad}  <p>{t(b[1])} <span class="vive">{t(b[2])}</span></p>')
            out.append(f'{pad}</blockquote>')
            out.append('')
        else:
            out.append(f'{pad}<p>{t(b[1])}</p>')
    return '\n'.join(out)


# ─── Desktop ────────────────────────────────────────────────────────────────

SRC_009 = (ROOT / f'{SLUG_009}.html').read_text(encoding='utf-8')
SRC_009_M = (ROOT / 'mobile' / f'{SLUG_009}.html').read_text(encoding='utf-8')
SRC_BASE = (ROOT / f'{SLUG[BASE]}.html').read_text(encoding='utf-8')
META_009 = re.search(r'<meta name="description" content="([^"]+)"', SRC_009).group(1)


def head_desktop(art):
    head = SRC_009.split('<body', 1)[0]
    n = num3(art['num'])
    # Redirection mobile, canonical, og:url et mainEntityOfPage.
    head = head.replace(SLUG_009, art['slug'])
    head = head.replace('<title>La grille et le chaos &mdash; Chroniques &mdash; Studio Toinon</title>',
                        f'<title>{t(sans_point(art["titre"]))} &mdash; Chroniques &mdash; Studio Toinon</title>')
    head = head.replace('La grille et le chaos &mdash; Studio Toinon',
                        f'{a(sans_point(art["titre"]))} &mdash; Studio Toinon')
    head = head.replace(META_009, a(art['meta']))
    head = head.replace('"headline": "La grille et le chaos"',
                        '"headline": ' + json.dumps(sans_point(art['titre']), ensure_ascii=False))
    head = re.sub(r'"description": "[^"]*",\n(\s+)"image"',
                  lambda m: '"description": ' + json.dumps(art['ld'], ensure_ascii=False) + ',\n' + m.group(1) + '"image"',
                  head, count=1)
    head = head.replace('"datePublished": "2026-08-18"', f'"datePublished": "{art["date"]}"')
    assert '009' not in head and 'grille' not in head, f'reste de la 009 dans la tête de {n}'
    return head


def nav_item(cible, sens, titre, num, cat):
    if sens == 'suivante':
        direction = 'Chronique suivante &rarr;'
    else:
        direction = 'Chronique pr&eacute;c&eacute;dente &larr;'
    return (f'    <a href="{SLUG[cible]}" class="projet-nav-item reveal reveal-d1">\n'
            f'      <span class="projet-nav-direction">{direction}</span>\n'
            f'      <span class="projet-nav-name">{t(titre)}</span>\n'
            f'      <span class="projet-nav-type">Note N&deg; {num3(num)} &mdash; {t(cat)}</span>\n'
            f'    </a>')


def page_desktop(art, derniere, par_num):
    n = num3(art['num'])
    if derniere:
        p = par_num.get(art['num'] - 1, PRECEDENTE)
        nav = nav_item(art['num'] - 1, 'precedente', p['titre'], art['num'] - 1, p['cat'])
    else:
        s = par_num[art['num'] + 1]
        nav = nav_item(art['num'] + 1, 'suivante', s['titre'], art['num'] + 1, s['cat'])
    body = f'''<body class="page-light" data-page="chronique" data-default-dark="false">

  <div id="cursor"></div>
  <div id="cursor-trail"></div>

  <div id="site-header-placeholder"></div>

  <section id="hero">
    <div class="hero-top reveal">
      <div class="hero-breadcrumb">
        <a href="chroniques.html">Chroniques</a>
        <span class="sep">&mdash;</span>
        <span>Note N&deg; {n}</span>
      </div>
      <span class="hero-cat">{t(art['cat'])}</span>
    </div>
    <h1 class="hero-title reveal reveal-d1">{t(art['titre'])}</h1>
    <div class="hero-meta reveal reveal-d2">
      <div class="hero-meta-item">
        <span class="hero-meta-label">Publié le</span>
        <span class="hero-meta-val">{art['date_fr']}</span>
      </div>
      <div class="hero-meta-item">
        <span class="hero-meta-label">Rubrique</span>
        <span class="hero-meta-val">{t(art['cat'])}</span>
      </div>
      <div class="hero-meta-item">
        <span class="hero-meta-label">Lecture</span>
        <span class="hero-meta-val">{art['lecture']}</span>
      </div>
    </div>
  </section>

  <div id="corps">

    <p class="chro-lede reveal">{t(art['lede'])}</p>

    <article class="chro-corps reveal reveal-d1">

{corps_html(art, 6)}
      <div class="chro-sign">{SIGN}</div>
    </article>

  </div>

  <div class="projet-nav">
    <a href="chroniques.html" class="projet-nav-item reveal">
      <span class="projet-nav-direction">&larr; Toutes les chroniques</span>
      <span class="projet-nav-name">Le journal</span>
      <span class="projet-nav-type">Retour au sommaire</span>
    </a>
{nav}
  </div>

  <div id="site-footer-placeholder"></div>
  <div id="tab-bar-placeholder"></div>

  <script src="js/includes.js"></script>
  <script src="js/consent.js"></script>
  <script src="js/main.js"></script>

</body>
</html>
'''
    return head_desktop(art) + body


def page_base_recablee(par_num):
    """La BASE (010) perd son lien « précédente » (vers la 009) au profit de « suivante » vers la
    011, comme la 009 l'a fait à la sortie de la 010."""
    s = par_num[BASE + 1]
    bloc = re.compile(r'    <a href="' + re.escape(SLUG[BASE - 1]) + r'" class="projet-nav-item reveal reveal-d1">.*?</a>', re.S)
    assert bloc.search(SRC_BASE), f'nav de la {num3(BASE)} introuvable'
    return bloc.sub(lambda m: nav_item(BASE + 1, 'suivante', s['titre'], BASE + 1, s['cat']), SRC_BASE, count=1)


# ─── Mobile ─────────────────────────────────────────────────────────────────

def head_mobile(art):
    head = SRC_009_M.split('<body>', 1)[0]
    n = num3(art['num'])
    head = head.replace('<title>La grille et le chaos &mdash; Chroniques</title>',
                        f'<title>{t(sans_point(art["titre"]))} &mdash; Chroniques</title>')
    head = head.replace('La grille et le chaos &mdash; Studio Toinon',
                        f'{a(sans_point(art["titre"]))} &mdash; Studio Toinon')
    head = head.replace(META_009, a(art['meta']))
    head = head.replace(SLUG_009, art['slug'])
    assert '009' not in head and 'grille' not in head, f'reste de la 009 dans la tête mobile de {n}'
    return head


def page_mobile(art):
    n = num3(art['num'])
    body = f'''<body>

<div id="app">

  <section id="hero">
    <div class="breadcrumb">
      <a href="chroniques-mobile.html">Chroniques</a>
      <span class="sep">&mdash;</span>
      <span>Note N&deg; {n}</span>
    </div>
    <span class="h-cat">{t(art['cat'])}</span>
    <h1 class="h-title">{t(art['titre'])}</h1>
    <div class="h-meta">
      <div class="h-meta-item"><span class="h-meta-label">Publié le</span><span class="h-meta-val">{art['date_fr']}</span></div>
      <div class="h-meta-item"><span class="h-meta-label">Rubrique</span><span class="h-meta-val">{t(art['cat'])}</span></div>
      <div class="h-meta-item"><span class="h-meta-label">Lecture</span><span class="h-meta-val">{art['lecture']}</span></div>
    </div>
  </section>

  <div id="corps">
    <p class="lede">{t(art['lede'])}</p>

    <article class="corps">

{corps_html(art, 6)}
      <div class="sign">{SIGN}</div>
    </article>
  </div>

  <a href="chroniques-mobile.html" class="back">
    <span class="back-dir">&larr; Toutes les chroniques</span>
    <span class="back-name">Le journal</span>
  </a>

</div>

<nav id="tab-bar">
  <a href="index-mobile.html" class="tab-item"><span class="tab-icon">⌂</span><span>Accueil</span></a>
  <a href="manifeste-mobile.html" class="tab-item"><span class="tab-icon">◎</span><span>Manifeste</span></a>
  <a href="archives-mobile.html" class="tab-item"><span class="tab-icon">◫</span><span>Archives</span></a>
  <a href="contact-mobile.html" class="tab-item"><span class="tab-icon">✉</span><span>Contact</span></a>
</nav>

<script src="../js/consent.js"></script>
</body>
</html>
'''
    return head_mobile(art) + body


# ─── Listings et sitemap ────────────────────────────────────────────────────

SRC_LIST = (ROOT / 'chroniques.html').read_text(encoding='utf-8')
SRC_LIST_M = (ROOT / 'mobile' / 'chroniques-mobile.html').read_text(encoding='utf-8')
SRC_SITEMAP = (ROOT / 'sitemap.xml').read_text(encoding='utf-8')
ANCRE_LIST = f'      <a href="{SLUG[BASE]}" class="chro-card reveal"'
ANCRE_LIST_M = f'  <!-- ── NOTE {num3(BASE)} ── -->'
ANCRE_SITEMAP = f'  <url><loc>https://studio-toinon.fr/{SLUG[BASE]}</loc><lastmod>2026-09-29</lastmod></url>\n'

# Titres mobiles trop longs pour le clamp par défaut du .chro-title : même réduction que la 008.
STYLE_TITRE_LONG = ' style="font-size:clamp(1.8rem,8.2vw,2.5rem)"'


def carte(art):
    n = num3(art['num'])
    return (f'      <a href="{art["slug"]}" class="chro-card reveal" data-jur="{art["jur"]}">\n'
            f'        <div class="chro-card-head"><span class="chro-card-num">N&deg; {n}</span><span class="chro-card-cat">{t(art["cat"])}</span></div>\n'
            f'        <h2 class="chro-card-title">{t(art["titre"])}</h2>\n'
            f'        <p class="chro-card-desc">{t(art["carte"])}</p>\n'
            f'        <div class="chro-card-foot"><span class="chro-card-meta">{art["date_fr"]} &middot; {art["lecture"]}</span><span class="chro-card-cta">Lire &rarr;</span></div>\n'
            f'      </a>\n\n')


def ecran(art):
    n = num3(art['num'])
    style = STYLE_TITRE_LONG if art.get('titre_long') else ''
    return (f'  <!-- ── NOTE {n} ── -->\n'
            f'  <section class="screen chro">\n'
            f'    <div class="chro-index reveal">Note N&deg; {n}</div>\n'
            f'    <div class="chro-cat reveal d1">{t(art["cat"])}</div>\n'
            f'    <div class="chro-date reveal d1">{art["date_fr"]}</div>\n'
            f'    <h2 class="chro-title reveal d2"{style}>{t(art["titre"])}</h2>\n'
            f'    <p class="chro-desc reveal d2">{t(art["mobile"])}</p>\n'
            f'    <a href="{art["slug"]}" class="chro-cta reveal d3"><span>Lire la chronique</span><span>&rarr;</span></a>\n'
            f'  </section>\n\n')


def listing(publies):
    assert SRC_LIST.count(ANCRE_LIST) == 1
    cartes = ''.join(carte(x) for x in reversed(publies))
    return SRC_LIST.replace(ANCRE_LIST, cartes + ANCRE_LIST, 1)


def listing_mobile(publies):
    assert SRC_LIST_M.count(ANCRE_LIST_M) == 1
    ecrans = ''.join(ecran(x) for x in reversed(publies))
    doc = SRC_LIST_M.replace(ANCRE_LIST_M, ecrans + ANCRE_LIST_M, 1)
    # Alternance des fonds recalculée de haut en bas : la plus récente sur fond base, puis une sur deux.
    compteur = iter(range(10_000))
    return re.sub(r'<section class="screen chro(?: alt)?">',
                  lambda m: '<section class="screen chro alt">' if next(compteur) % 2 else '<section class="screen chro">',
                  doc)


def sitemap(publies):
    assert SRC_SITEMAP.count(ANCRE_SITEMAP) == 1
    lignes = ''.join(f'  <url><loc>https://studio-toinon.fr/{x["slug"]}</loc><lastmod>{x["date"]}</lastmod></url>\n'
                     for x in publies)
    doc = SRC_SITEMAP.replace(ANCRE_SITEMAP, ANCRE_SITEMAP + lignes, 1)
    return re.sub(r'(<loc>https://studio-toinon\.fr/chroniques\.html</loc><lastmod>)[^<]+',
                  lambda m: m.group(1) + publies[-1]['date'], doc, count=1)


# ─── Assemblage ─────────────────────────────────────────────────────────────

def main():
    if f'href="{SLUG[BASE + 1]}"' in SRC_LIST:
        sys.exit(f'La {num3(BASE + 1)} est déjà dans chroniques.html : la base n\'est plus l\'état {num3(BASE)}, rien généré.')
    par_num = {x['num']: x for x in ARTICLES}
    for x in ARTICLES:
        x['titre_long'] = len(x['titre']) > 40
    a_publier = [x for x in ARTICLES if x['num'] > BASE]
    if OUT.exists():
        shutil.rmtree(OUT)
    for i, art in enumerate(a_publier):
        publies = a_publier[: i + 1]
        dossier = OUT / num3(art['num'])
        fichiers = {}
        for x in publies:
            derniere = x is art
            fichiers[f'mobile/{x["slug"]}.html'] = page_mobile(x)
            fichiers[f'{x["slug"]}.html'] = page_desktop(x, derniere, par_num)
        fichiers[f'{SLUG[BASE]}.html'] = page_base_recablee(par_num)
        fichiers['chroniques.html'] = listing(publies)
        fichiers['mobile/chroniques-mobile.html'] = listing_mobile(publies)
        fichiers['sitemap.xml'] = sitemap(publies)
        for chemin, contenu in fichiers.items():
            f = dossier / chemin
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(contenu, encoding='utf-8', newline='\n')
        manifest = {
            'num': art['num'], 'date': art['date'], 'titre': art['titre'],
            'url': f'https://studio-toinon.fr/{art["slug"]}',
            'fichiers': list(fichiers.keys()),
        }
        (dossier / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'{num3(art["num"])} {art["date"]} : {len(fichiers)} fichiers')


if __name__ == '__main__':
    main()
