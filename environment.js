const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/environment.csv");
const records = parse(csv.toString("utf-8"));

fs.readdir('image', (err) => {
    if (err) {
        console.log('image 폴더가 없어 생성.');
        fs.mkdirSync('image');
    }
});

const resultArray = [];

const Environmentcrawler = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto('https://m.sedaily.com/');
        await page.evaluate(() => {
            window.scrollTo(0, window.document.body.scrollHeight);
        });

        for (const [i, r] of records.entries()) {
            await page.goto(r[1]);
            await page.waitForTimeout(5000);
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForTimeout(2000);
            await page.waitForSelector('#footer > div.ft_sitemap > ul');
            await page.click('#footer > div.ft_sitemap > ul > li:nth-child(9) > a');
            await page.waitForSelector('#newsList > li:nth-child(1) > div > div > div.report_tit > a');
            await page.click('#newsList > li:nth-child(1) > div > div > div.report_tit > a');
            
            await page.waitForTimeout(8000);

            await page.evaluate(() => {
                window.scrollTo(0, window.document.body.scrollHeight);
            });
            await page.waitForSelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article');

            const result = await page.evaluate(() => {
                const titleEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1');
                let title = '';
                if (titleEl) {
                    title = titleEl.textContent;
                }
                const contentEl = document.querySelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article');
                let content = '';
                if (contentEl) {
                    content = contentEl.textContent;
                }
                const dateEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > div.article_info > span:nth-child(1)');
                let date = '';
                if (dateEl) {
                    date = dateEl.textContent;
                }
                const imgEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.article > div:nth-child(1) > div > a > span > img');
                let img = '';
                if (imgEl) {
                    img = imgEl.src;
                }
                return { title, content, date, img };
            });

            if (result.title) {
                console.log(r[0], "제목", result.title);
                resultArray.push({ tag: r[0], url: r[1], text: result.title });
            }

            if (result.content) {
                console.log(r[0], "내용", result.content);
                resultArray.push({ tag: r[0], content: result.content });
            }

            if (result.date) {
                console.log(r[0], "날짜", result.date);
                resultArray.push({ tag: r[0], date: result.date });
            }

            if (result.img) {
                const imgResult = await axios.get(result.img, { responseType: 'arraybuffer' });
                fs.writeFileSync(`image/${r[0]}.jpg`, imgResult.data);
            }
        }

        await page.close();
        await browser.close();

        const str = JSON.stringify(resultArray, null, 2);
        fs.writeFileSync('csv/enviromentresult.csv', str);  // Fix the typo here
    } catch (err) {
        console.error(err);
    }
}

Environmentcrawler();


module.exports = { Environmentcrawler }