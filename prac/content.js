const axios = require('axios')
const cheerio = require('cheerio')
const pares = require('csv-parse/lib/sync')
const stringify = require('csv-stringify/sync')
const fs = require('fs')
const puppeteer = require('puppeteer')
const puppeteercore =require('puppeteer-core')

const csv = fs.readFileSync('csv/data.csv')
const records = pares(csv.toString('utf-8'))


const crawler = async () => {
    try {
    const result = []
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    for ( const [i, r] of records.entries()) {
        await page.goto(r[1], {
            waitUntil: 'load',
            timeout: 0
        })
        await page.waitForSelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article')
        const pageInfo = await page.evaluate(() => {
            const contentEl = document.querySelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article')
            let content = ''
            if(contentEl) {
                content = contentEl.textContent;
            }
            return { content }
        })
        if(pageInfo.content) {
            console.log(r[0], "tags", pageInfo.content)
            result.push({ tag:r[0], text: pageInfo.content })
        }
        // await page.waitForTimeout(3000)
    }
    await page.close()
    await browser.close()
    const str = JSON.stringify(result, null, 2)
    fs.writeFileSync('csv/result.csv', str)
} catch(err) {
    console.error(err)
}
}

crawler ()