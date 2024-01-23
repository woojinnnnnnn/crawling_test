const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify  = require("csv-stringify/sync");
const { promises } = require("dns");
const fs = require("fs");
const { title } = require("process");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/newneek.csv"); // 파일 안을 읽음 data.csv 여기 안에 주소가 들어있음.
const records = parse(csv.toString("utf-8")); // 타입지정 ? json?

// 윗 부분은 필요한 패키지들 불러오기.

fs.readdir('image', (err) => { // 이미지 파일을 저장 하는곳.
    if(err) {
        console.log('image폴더가 없어 생성.')
        fs.mkdirSync('image')
    }
})

const result1 = []

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false
        })
        const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        for (const [i,r] of records.entries()) {
            await page.goto(r[1], {
                waitUntil: 'load',
                timeout: 0
            })
            // await page.click('#root > nav.category > div > a:nth-child(2) > span')
            await page.evaluate(() => {
                window.scrollTo(0, window.document.body.scrollHeight)
                
            })
            const result = await page.evaluate(() => {
                const titleEl = document.querySelector('#root > section > div > header > h2')
                let title = ''
                if(titleEl) {
                    title = titleEl.textContent;
                }
                return { title }
            })
            if(result.title) {
                console.log(r[0], "title", result.title)
                result1.push({ tag:r[0], url: r[1], text: result.title })
            }
        }
        await page.close()
        await browser.close()
        const str = JSON.stringify(result1, null, 2)
        fs.writeFileSync('csv/result1.csv', str)
    } catch (error) {
        console.error(error)
    }
}

crawler()