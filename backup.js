const crawler = async () => {
    const browser = await puppeteer.launch({ headless: false });
    try {
        const result = []
        await Promise.all(records.map(async (r, i) => {
            const page = await browser.newPage();
            await page.goto(r[0]);
            const scoreEl = await page.$('.headline')
            if (scoreEl) {
                const text = await page.evaluate(tag => tag.textContent, scoreEl)
                console.log(text)
            }
            await page.waitForTimeout(3000)
            await page.close();
        }))
        await browser.close()
    } catch (error) {
        console.log(error)
    }

}

crawler()