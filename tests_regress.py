# Regressietest: vul data in met de huidige live-versie (git HEAD~0 vóór wijziging) en laad daarna de nieuwe.
import asyncio, subprocess, sys
from playwright.async_api import async_playwright
OLD, NEW = sys.argv[1], sys.argv[2]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        ctx=await b.new_context(viewport={"width":390,"height":844})
        pg=await ctx.new_page()
        await pg.goto("file://"+OLD); await pg.wait_for_timeout(800)
        await pg.evaluate("""()=>{ S.onboarded=true; S.days['2026-11-12']=true; S.logs.A1=[{key:'2026-11-12',week:0,date:'Do 12 nov',iso:'2026-11-12',sets:[{kg:'10',r:'10',ok:true}]}]; S.ci['0-0']='test-antwoord'; S.rate.smoothie={v:0,n:'lekker'}; save(); }""")
        await pg.goto("file://"+NEW); await pg.wait_for_timeout(800)
        r=await pg.evaluate("""()=>({day:!!S.days['2026-11-12'], log:(S.logs.A1||[]).length, ci:S.ci['0-0'], rate:(S.rate.smoothie||{}).v, rec:document.getElementById('records').innerText.includes('10 kg')})""")
        print(r); ok = r['day'] and r['log']==1 and r['ci']=='test-antwoord' and r['rate']==0 and r['rec']
        print("REGRESSIE OK" if ok else "REGRESSIE FOUT"); await b.close()
asyncio.run(main())
