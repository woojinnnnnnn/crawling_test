const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify  = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/data.csv"); // 파일 안을 읽음 data.csv 여기 안에 주소가 들어있음.
const records = parse(csv.toString("utf-8")); // 타입지정 ? json?

// 윗 부분은 필요한 패키지들 불러오기.

fs.readdir('image', (err) => {
    if(err) {
        console.log('image폴더가 없어 생성.')
        fs.mkdirSync('image')
    }
})
fs.readdir('screenshot', (err) => {
    if(err) {
        console.log('screenshot 폴더가 없어 생성.')
        fs.mkdirSync('screenshot')
    }
})



const crawler = async () => {
    try{
        const result = []; 
        const browser = await puppeteer.launch({ headless: false }) 
        const page = await browser.newPage() 
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        for (const [i, r] of records.entries()) {
            await page.goto(r[1] , { 
                waitUntil: 'load', 
                timeout: 0 
            })
            const result = await page.evaluate(() => { 
                const titleEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1') 
                let title = ''
                if(titleEl) {
                    title = titleEl.textContent;
                }
                const imgEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.article > div:nth-child(1) > div > a > span > img') 
                let img = '';
                if (imgEl){
                    img = imgEl.src;
                } 
                return { title, img }
            })
            if (result.title) { 
                console.log(r[0], "내용", result.title)
                result.push({ tag: r[0], url: r[1], text: result.title })
            }
            if (result.img){
                const imgResult = await axios.get(result.img, {
                    responseType: 'arraybuffer',
                })
                fs.writeFileSync(`image/${r.tag}.jpg`, imgResult.data)
            }
            await page.waitForTimeout(3000)
    }
    await page.close() 
    await browser.close()
    
    const str = JSON.stringify(result) 
    fs.writeFileSync('csv/result.csv', str )
    } catch(err) {
        console.error(err)
    }
}

crawler()
