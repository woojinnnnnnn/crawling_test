const puppeteer = require('puppeteer')

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()
        await page.goto('https://m.sedaily.com/')
        await page.evaluate(() => {
            window.scrollTo(0, window.document.body.scrollHeight);
            document.querySelector('#footer > div.ft_sitemap > ul > li:nth-child(4) > a').click()
        })
        await page.waitForTimeout(4000)
        await page.mouse.move(100,100)
        await page.click()
        console.log('hit mouse')
        await page.close()
        await browser.close()
    } catch (error) {
        console.error(error)
    }
}

crawler()