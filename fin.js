const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const { stringify } = require('csv-stringify/sync');
const fs = require("fs");
const puppeteer = require("puppeteer");
const url = require('url');

const csv = fs.readFileSync("csv/test.csv");
const records = parse(csv.toString("utf-8"));

// 이부분은 href 를 불러올때 /page/7qwe123 이런식으로 불러와 져서 추가함.
// http 로 바꾸어줌.
function convertToAbsoluteUrl(baseUrl, relativeUrl) {
    return url.resolve(baseUrl, relativeUrl);
}

// 본격 적인 크롤러 실행 함수
async function crawler() {
    try {
        const data = [];
        const browser = await puppeteer.launch({
            headless: false,
        });

        // CSV 파일 records 안에 접근해서 돌림.
        await Promise.all(records.map(async (e) => {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            // e[1] ex) 정치[0].[URL]
            await page.goto(e[1]);

            await page.evaluate((e) => { 
                window.scrollTo(0, window.document.body.scrollHeight);
            }, e);
            // 페이지가 로딩이 다 끝낼때 까지 대기. 
            // 여기선 div.posts 가 다 로딩이 될때까지 대기함.
            await page.waitForSelector('div.posts');
            await page.waitForTimeout(5000);
            // 안에 내분 a.card 내용을 들고옴
            const result = await page.evaluate((e) => {  
                const category = document.querySelectorAll('a.card');

                const urls = [];
                // 들고 오려는 요소. i 가 카테고리의 길이 여기서 크롤링 해보면
                // a.card 가 12개가 있음.
                for (let i = 0; i < category.length; i++) {
                    //     여기는 상대 url 이 들어감.
                    const relativeHref = category[i].getAttribute('href');
                    //    이 함수를 사용해 /page/~~ 를 http 이런식으로 변환함.
                    const absoluteHref = new URL(relativeHref, window.location.href).href;
                    urls.push([e[0], absoluteHref]);
                }
                return urls;
            }, e);
            // 스프레드 메소드를 사용해서 배열에 펼쳐 놓음.
            data.push(...result);

            await page.close();
        }));

        // 크롤링 한 데이터를 디비에 저장함. create 만 써도 되는줄 알았으나.
        // createMany 를 사용해 더 효과적으로 넣을 수 있음.
        await prisma.Newss.createMany({
            data: data.map(([category, url]) => ({
                category,
                url
            }))
        });

        console.log(data);

        const str = stringify(data);
        fs.writeFileSync('./csv/result.csv', str);

        await browser.close();
    } catch (err) {
        console.log(err);
    } finally {
        await prisma.$disconnect();
    }
}

// crawler();

async function crawlerDetail() {
    const csvDetail = fs.readFileSync("./csv/result.csv");
    const recordDetails = parse(csvDetail.toString("utf-8"));

    try {
        const data = [];

        const browser = await puppeteer.launch({
            headless: false,
        });

        for (const [i, r] of recordDetails.entries()) {
            let page;
            try {
                page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                await page.goto(r[1], {
                    waitUntil: 'load',
                    timeout: 0
                });

                await page.waitForSelector('#root > section > div');

                await page.evaluate(() => {
                    window.scrollTo(0, window.document.body.scrollHeight);
                });

                await page.waitForSelector('#root > section > div');

                const result = await page.evaluate(() => {
                    const titleEl = document.querySelector('#root > section > div > header > h2');
                    let title = '';
                    if (titleEl) {
                        title = titleEl.textContent;
                    }
                    const contentEl = document.querySelector('#root > section > div > div > div.post-body').textContent;
                    let content = contentEl;
                    const dateEl = document.querySelector('#root > section > div > header > time');
                    let date = '';
                    if (dateEl) {
                        date = dateEl.textContent;
                    }
                    const imgEl = document.querySelector('#root > section > div > div > div.post-featured > img');
                    let img = '';
                    if (imgEl) {
                        img = imgEl.src;
                    }
                    const hashEl = document.querySelector('#root > section > section');
                    let hash = '';
                    if (hashEl) {
                        hash = hashEl.textContent;
                    }
                    return { title, content, date, img, hash };
                });

                let pushData = {
                    url: r[1],
                    title: '',
                    content: '',
                    date: '',
                    img: '',
                    hash: '',
                }

                console.log(result);

                if (result.title) {
                    pushData.title = result.title;
                }
                if (result.content) {
                    pushData.content = result.content;
                }
                if (result.date) {
                    pushData.date = result.date;
                }
                if (result.hash) {
                    pushData.hash = result.hash;
                }

                data.push(result);

                await prisma.News.create({
                    data: {
                        title: pushData.title,
                        content: pushData.content,
                        date: pushData.date,
                        url: r[1],
                        img: pushData.img,
                        hash: pushData.hash,
                    }
                });

                await page.close();
                await browser.close();
            } catch (err) {
                console.error(err);
                
            }
        }

        console.log(data);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect()
    }
}


crawlerDetail();

module.exports = { crawler, crawlerDetail }