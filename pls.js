const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/data.csv");
const records = parse(csv.toString("utf-8"));

fs.readdir('image', (err) => {
    if(err) {
        console.log('image 폴더가 없어 생성.')
        fs.mkdirSync('image')
    }
})

const resultArray = [];

const crawlCategory = async (page, category) => {
    await page.goto(category.url);
    
    const links = await page.evaluate(() => {
        const links = [];
        const linkElements = document.querySelectorAll('#newsList > li:nth-child(1) > div > div > div.report_tit > a');
        linkElements.forEach(linkElement => links.push(linkElement.href));
        return links;
    });

    for (const link of links) {
        await page.goto(link);
        const result = await page.evaluate(() => {
            const titleEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1') 
            let title = titleEl ? titleEl.textContent : '';
            const contentEl = document.querySelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article');
            let content = contentEl ? contentEl.textContent : '';
            const dateEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > div.article_info > span:nth-child(1)')
            let date = dateEl ? dateEl.textContent : '';
            const imgEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.article > div:nth-child(1) > div > a > span > img') 
            let img = imgEl ? imgEl.src : '';
            return { title, content, date, img };
        });

        if (result.title) {
            console.log(category.name, "제목", result.title);
            resultArray.push({ tag: category.name, url: link, text: result.title });
        }
        if (result.content) {
            console.log(category.name, "내용", result.content);
            resultArray.push({ tag: category.name, content: result.content });
        }
        if (result.date) {
            console.log(category.name, "날짜", result.date);
            resultArray.push({ tag: category.name, date: result.date });
        }
        if (result.img) {
            const imgResult = await axios.get(result.img, { responseType: 'arraybuffer' });
            fs.writeFileSync(`image/${category.name}.jpg`, imgResult.data);
        }
    }
};

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1496,967'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1496, height: 967 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // 카테고리 목록
        const categories = [
            { name: 'main', url: 'https://m.sedaily.com/' },
            // 여기에 다른 카테고리 추가 가능
        ];

        // 각 카테고리에 대해 크롤링 수행
        for (const category of categories) {
            await crawlCategory(page, category);
        }

        await page.close();
        await browser.close();

        const str = JSON.stringify(resultArray, null, 2);
        fs.writeFileSync('csv/result.csv', str);
    } catch (err) {
        console.error(err);
    }
};

crawler();
