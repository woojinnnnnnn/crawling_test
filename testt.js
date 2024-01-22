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
    if (err) {
        console.log('image 폴더가 없어 생성.')
        fs.mkdirSync('image')
    }
})

// 스크린샷 저장 폴더 생성
fs.readdir('screenshot', (err) => {
    if (err) {
        console.log('screenshot 폴더가 없어 생성.')
        fs.mkdirSync('screenshot')
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
            const contentSelector = '#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article';
            const pageInfo = await page.evaluate((contentSelector) => {
                const titleEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1');
                const contentEl = document.querySelector(contentSelector);
                const imgEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.article > div:nth-child(1) > div > a > span > img');
                return {
                    title: titleEl ? titleEl.textContent : '',
                    content: contentEl ? contentEl.textContent : '',
                    img: imgEl ? imgEl.src : '',
                };
            }, contentSelector);
            // 결과를 전역 배열에 추가
            result.push({ tag: r[0], url: r[1], text: pageInfo.title });
            result.push({ tag: r[0], text: pageInfo.content });
            if (pageInfo.img) {
                const imgResult = await axios.get(pageInfo.img, {
                    responseType: 'arraybuffer',
                });
                fs.writeFileSync(`image/${r[0]}.jpg`, imgResult.data);
            }
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
