import asyncio,sys
from playwright.async_api import async_playwright
TS=[float(x) for x in (sys.argv[1:] or "1 4 8 12 15 17.5 19.5".split())]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1920,'height':1080})
        errs=[]
        pg.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append('pageerror: '+str(e)))
        await pg.goto((__import__('pathlib').Path(__file__).resolve().parents[2]/'motion'/'officequest_intro.html').as_uri()+'?t=0')
        await pg.evaluate('window.__ready')
        fonts=await pg.evaluate("[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.weight).join(',')")
        print('fonts loaded:',fonts)
        for t in TS:
            await pg.evaluate(f'window.__seek({t})')
            await pg.wait_for_timeout(60)
            await pg.screenshot(path=f'shots/t{t:05.2f}.png')
        print('errors:',errs)
        await b.close()
asyncio.run(main())
