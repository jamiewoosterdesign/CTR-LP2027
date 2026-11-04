"""Package only the current CTR language pages and reachable shared assets."""
from pathlib import Path
import re,json,shutil,zipfile,hashlib,subprocess
R=Path(__file__).resolve().parents[1];D=R/'dist';locales=['en','de','es','fr','it','pt','th']
pages=[D/'concept-traveller-stories-interactive'/('index.html' if l=='en' else l+'/index.html') for l in locales]
oldhost='https://changing-traveller-content-audit.jamiewoo.chatgpt.site'
for p in pages:
 s=p.read_bytes().decode('utf8');s=s.replace(oldhost,'')
 # Keep all language metadata on the host where the report is deployed.
 s=re.sub(r'<link\b[^>]*hreflang="[^"]+"[^>]*>','',s)
 links=''.join('<link href="/concept-traveller-stories-interactive/'+('' if l=='en' else l+'/')+'" hreflang="'+l+'" rel="alternate"/>' for l in locales)
 s=s.replace('</head>',links+'</head>');p.write_bytes(s.encode('utf8'))

allassets={p.relative_to(D).as_posix():p for p in (D/'assets').rglob('*') if p.is_file()}
included={p.relative_to(D).as_posix():p for p in pages};queue=list(pages);missing=set()
while queue:
 p=queue.pop()
 if p.suffix not in ['.html','.css','.js','.json','.svg']:continue
 text=p.read_text('utf8')
 for m in re.finditer(r'/assets/[A-Za-z0-9_./-]+',text):
  name=m.group().lstrip('/')
  if name=='assets/flag-':
   flagcodes=re.search(r"const flags=\[([^]]+)\]",text).group(1)
   for code in re.findall(r"'([^']+)'",flagcodes):
    key='assets/flag-'+code+'.svg'
    if key not in included:included[key]=allassets[key];queue.append(allassets[key])
   continue
  if name not in allassets:missing.add((p.name,name));continue
  if name not in included:included[name]=allassets[name];queue.append(allassets[name])
 # Also resolve relative CSS imports / images and SVG references.
 for m in re.finditer(r'(?:url\(\s*[\"\x27]?|(?:src|href)=[\"\x27])([^\s\"\x27)<>]+)',text):
  name=m.group(1).split('#')[0].split('?')[0]
  if not name or name.startswith(('/','data:','http:','https:')):continue
  target=(p.parent/name).resolve()
  if target.is_file() and target.is_relative_to(D):
   key=target.relative_to(D).as_posix()
   if key not in included:included[key]=target;queue.append(target)
assert not missing,missing
# Brand geometry and flag attribution travel with the handed-over site.
for name in ['assets/brand/arrow-right.svg','assets/flag-icons-LICENSE.txt']:included[name]=D/name

out=R/'handover'/'ctr-2027-lp-2026-11-04';out.mkdir(parents=True,exist_ok=True)
# Never delete or overwrite an existing package; use a new versioned folder.
if any(out.iterdir()):
 n=2
 while (out.parent/(out.name+'-v'+str(n))).exists():n+=1
 out=out.parent/(out.name+'-v'+str(n));out.mkdir()
site=out/'site'
for key,p in included.items():
 target=site/key;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
(site/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./concept-traveller-stories-interactive/"><title>Changing Traveller Report 2027</title><a href="./concept-traveller-stories-interactive/">Open the report</a></html>\n',encoding='utf8')
readme='''# CTR 2027 landing-page handover

Upload the contents of `site/` to the domain's web root. No build step, framework, Node dependencies, Vercel project, or backend is required.

English: `/concept-traveller-stories-interactive/`
Translations: the same path followed by `de/`, `es/`, `fr/`, `it/`, `pt/`, or `th/`.

Keep `/assets/` at the web root and retain these route names. If integrating under a different URL prefix, update the root-relative asset references, language metadata, and `assets/report-locale-navigation.js` base together. Test through an HTTP server, not by double-clicking HTML files.

The report-title links in the header/footer are `#report-top`; they return to the top of the current language page. Section anchors and language navigation use the current host. No internal link points to Vercel or the former audit site. Language metadata is root-relative; production SEO can make these URLs absolute once the final domain is known.

All languages share one assets folder, including the current hero animation. The static dropdown reference, audit/comparison pages, older demos, repository files, deployment metadata and QA captures are excluded.

Traveller-profile PDFs (98 links) and the 12 Hotelier's Playbook editions use the supplied downloads.siteminder.com URLs and open in new tabs. The PDF files are intentionally awaiting publication at those URLs; they are not bundled here. SiteMinder logo links deliberately go to www.siteminder.com. Fonts load from Google Fonts and require internet access.

Serve HTML, CSS, JavaScript, JSON, SVG, WebP, JPEG and WebM with appropriate MIME types. Support byte-range requests for WebM videos. Do not rename assets without updating their references.

## Shared SiteMinder design rule
Use the included exact `assets/brand/arrow-right.svg` for link and CTA arrows; preserve its source geometry and inherit the surrounding colour (CSS masking is permitted). Keep it horizontal and pointing right; rotate the same SVG 180 degrees for Back actions. Do not substitute Unicode, diagonal/external-link, emoji, CSS-drawn, or other icon-library arrows. Chevrons are only for disclosure/dropdown controls. Preserve existing control padding, typography, responsive wrapping and keyboard focus styles.
'''
(out/'README.md').write_text(readme,encoding='utf8')
manifest={key:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for key,p in sorted(included.items())}
(out/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
for p in site.rglob('*'):
 if p.suffix in ['.html','.js','.css','.json','.svg']:
  text=p.read_text('utf8');assert 'vercel.app' not in text and oldhost not in text,p
assert len(list((site/'concept-traveller-stories-interactive').rglob('index.html')))==7
assert not any((site/name).exists() for name in ['concept-static-export','translation-review','hero-videos'])
archive=out.with_suffix('.zip')
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out))
print(json.dumps({'folder':str(out),'zip':str(archive),'zip_bytes':archive.stat().st_size,'shared_assets':sum(k.startswith('assets/') for k in included),'language_pages':7,'excluded_assets':sorted(set(allassets)-set(included))},indent=2))
