// const { default: axios } = require("axios");
// const { Cheerio, text } = require("cheerio");
const parse = require("csv-parse/lib/sync");
const fs = require("fs")
const puppeteer = require("puppeteer")


const csv = fs.readFileSync('csv/data.csv')
const records = parse(csv.toString('utf-8'))
records.forEach((r, i) => {
    console.log(i, r) // r[0]이 title, r[1]이 링크
})


// const crawler = async () => {
//     const browser = await puppeteer.launch({ headless: false }); // 헤드 리스 false -> 눈으로 보임 창이 켜지는게 // 실무시 process.env
//     const [page, page2, page3] = await Promise.all([
//         browser.newPage(),
//         browser.newPage(),
//         browser.newPage()
//     ])
//     await Promise.all ([
//         page.goto('https://www.naver.com/'),
//         page2.goto('https://www.daum.net/'),
//         page3.goto('https://www.google.com/')
//     ]);
//     console.log('working')
//     await Promise.all([
//         page.waitForTimeout(10000),
//         page2.waitForTimeout(3000),
//         page3.waitForTimeout(3000)
//     ])
//     await page.close()
//     await page2.close()
//     await page3.close()
//     await browser.close()
// }

// const crawler = async () => {
//     const browser = await puppeteer.launch({ headless: false })
//     const page = await Promise.all([
//         browser.newPage()
//     ]);
//     await Promise.all ([
//         page.goto('https://m.sedaily.com/NewsView/2D45AI7F1W#cb')
//     ]);
//     const scoreEl = await page.$('.headline')
//     if (scoreEl) {
//         const text = await page.evaluate(tag => tag.textContent, scoreEl)
//         console.log(text)
//     }
//     console.log('working')
//     await Promise.all ([
//         page.waitForTimeout(10000),
//     ])
//     await page.close()
//     await browser.close()
// }

// crawler()
// // records.forEach((r, i) => {
//     console.log(i, r)// r[0] 이 영화제목 r[1]이 영화 링크
// })
