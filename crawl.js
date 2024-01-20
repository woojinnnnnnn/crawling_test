const parse = require('csv-parse/lib/sync')
const { stringify } = require('csv-stringify/sync')
const fs = require('fs')
const puppeteer = require('puppeteer')

const csv = fs.readFileSync('csv/data.csv')
const records = parse(csv.toString('utf-8'))

const crawler = async () => {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto('https://m.sedaily.com/NewsView/2D45AI7F1W#cb')
    // const scoreEl = await page.$("[class='headline']")
    const scoreEl2 = await page.$('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > div.article_info')
    const text = await (await scoreEl2.getProperties('textContent'))
    console.log("제발" + text)
    // console.log('woking')
    // await Promise.all([
    //     page.waitForTimeout(10000)
    // ])
    await page.close()
    await browser.close()
}

crawler()

// #contentArea > div.content.article_wrap > div.col-left > div > div.headline > div.article_info