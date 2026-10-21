import asyncio,sys,pathlib
HERE=pathlib.Path(__file__).resolve().parent;(HERE/'out').mkdir(exist_ok=True)
from playwright.async_api import async_playwright
IDS=sys.argv[1:] or ['01','02','03','04','05','06','07','08','09','10']
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for i in IDS:
            pg=await b.new_page(viewport={'width':1920,'height':1080})
            errs=[]
            pg.on('pageerror',lambda e: errs.append(str(e)))
            pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
            await pg.goto((HERE/'index.html').as_uri()+f'?p={i}')
            await pg.evaluate('window.__ready'); await pg.wait_for_timeout(150)
            # overflow check: elements whose content is clipped horizontally
            ov=await pg.evaluate("""[...document.querySelectorAll('.card,.modal,.teams')].filter(e=>e.scrollHeight>e.clientHeight+2&&getComputedStyle(e).overflow!=='visible').map(e=>e.className+':'+e.scrollHeight+'>'+e.clientHeight).slice(0,5)""")
            vov=await pg.evaluate("document.documentElement.scrollHeight>1080||[...document.querySelectorAll('.shell .card')].some(e=>e.getBoundingClientRect().bottom>1081)")
            await pg.screenshot(path=str(HERE/'out'/f'{i}.png'))
            print(i,'errs',errs,'clip',ov,'vertOverflow',vov)
            await pg.close()
        await b.close()
asyncio.run(main())
