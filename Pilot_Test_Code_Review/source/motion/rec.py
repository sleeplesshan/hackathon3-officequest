import asyncio,subprocess,os,shutil
from playwright.async_api import async_playwright
FPS=30; DUR=20.0; HOLD=0.6
async def main():
    os.makedirs('frames',exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1920,'height':1080})
        errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto((__import__('pathlib').Path(__file__).resolve().parents[2]/'motion'/'officequest_intro.html').as_uri()+'?t=0')
        await pg.evaluate('window.__ready')
        await pg.add_style_tag(content='#rbtn,#endc{display:none!important}')
        n=int((DUR+HOLD)*FPS)
        for i in range(n):
            t=min(i/FPS,DUR)
            await pg.evaluate(f'window.__seek({t})')
            await pg.screenshot(path=f'frames/f{i:04d}.jpg',type='jpeg',quality=93)
        print('errors',errs)
        await b.close()
    subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(FPS),'-i','frames/f%04d.jpg','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','slow','-movflags','+faststart','officequest_intro.mp4'],check=True)
    print('done')
asyncio.run(main())
