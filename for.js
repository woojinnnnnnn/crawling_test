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

// 수정된 부분: 크롤링 결과를 담을 배열을 함수 외부에서 선언
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
            await page.waitForSelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article');
            const pageInfo = await page.evaluate(() => {
                try {
                    const contentEl = document.querySelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article');
                    let text = '';
                    if (contentEl) {
                        text = contentEl.textContent;
                    }
                    return { text };
                } catch (error) {
                    console.error(error);
                    return { error: error.message };  // 에러 메시지를 반환하도록 수정
                }
            });
            console.log('Page Info:', pageInfo);
            if (pageInfo.text) {
                console.log(r[0], "<-태그", pageInfo.text);
                result.push({ tag: r[0], text: pageInfo.text });
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
