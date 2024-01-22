const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/data.csv");
const records = parse(csv.toString("utf-8"));

// 이미지 저장 폴더 생성
fs.readdir('image', (err) => {
    if(err) {
        console.log('image 폴더가 없어 생성.')
        fs.mkdirSync('image')
    }
})

const result = []; // 크롤링 결과를 담을 배열

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({ 
            headless: false, 
            args: ['--window-size=1496,967']
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1496,
            height: 967,
        })
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        for (const [i, r] of records.entries()) {
            await page.goto(r[1], {
                waitUntil: 'load',
                timeout: 0
            });
            // 수정된 부분: 크롤링 결과를 담은 pageInfo 변수 생성
            const pageInfo = await page.evaluate(() => {
                const titleEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1');
                let title = '';
                if (titleEl) {
                    title = titleEl.textContent;
                }
                const imgEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.article > div:nth-child(1) > div > a > span > img');
                let img = '';
                if (imgEl) {
                    img = imgEl.src;
                }
                return { title, img };
            }); 
            if (pageInfo.title) {
                console.log(r[0], "<-태그", pageInfo.title);
                result.push({ tag: r[0], url: r[1], text: pageInfo.title });
            } 
            if (pageInfo.img) {
                const imgResult = await axios.get(pageInfo.img, {
                    responseType: 'arraybuffer',
                });
                fs.writeFileSync(`image/${r[0]}.jpg`, imgResult.data);
            }
            await page.waitForTimeout(3000);
        }
        await page.close();
        await browser.close();

        const str = JSON.stringify(result, null, 2);
        fs.writeFileSync('csv/result.csv', str);
    } catch (err) {
        console.error(err);
    }
};

crawler();
