const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.screenshot({ path: "C:\Users\emiez\AppData\Local\Temp\claude\c--Users-emiez-OneDrive-Desktop-NFL-app\50cb5227-1517-479f-8875-1296ea415c43\scratchpad\xos-offensive.png" });

  // Click on first concept to expand
  await page.click('button[class*="px-4 py-4"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: "C:\Users\emiez\AppData\Local\Temp\claude\c--Users-emiez-OneDrive-Desktop-NFL-app\50cb5227-1517-479f-8875-1296ea415c43\scratchpad\xos-expanded.png" });

  // Click on Defensiva tab
  const buttons = await page.$$eval('button', els => els.map((el, idx) => ({ idx, text: el.textContent })));
  const defensivaBtn = buttons.find(b => b.text?.includes('Defensiva'));
  if (defensivaBtn) {
    await page.click(`button:nth-child(${defensivaBtn.idx + 1})`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: "C:\Users\emiez\AppData\Local\Temp\claude\c--Users-emiez-OneDrive-Desktop-NFL-app\50cb5227-1517-479f-8875-1296ea415c43\scratchpad\xos-defensive.png" });
  }

  await browser.close();
  console.log("Screenshots taken successfully");
})();
