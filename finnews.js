const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
// const stringify = require("csv-stringify/sync");
const {stringify} = require('csv-stringify/sync');
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/test.csv");
const records = parse(csv.toString("utf-8"));

async function crawler() {
    try {

        const data = [];

        const browser = await puppeteer.launch({
            headless: false,
        });

        await Promise.all(records.map(async(e)=> {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            
            await page.goto(e[1]);

            await page.evaluate(() => {
                window.scrollTo(0, window.document.body.scrollHeight);
            });


            await page.waitForSelector('div.report_tit');
            await page.waitForTimeout(5000);


            const result = await page.evaluate(() => {
                const news = document.querySelectorAll('div.report_tit');

                const urls = [];

                for(let i = 0; i < news.length; i ++) {
                    urls.push([i,news[i].querySelector('a').href])
                }

                return urls;
            })


            for(let i = 0 ; i< result.length; i ++) {
                data.push([e[0], result[i][1]])
            }




            // await page.waitForTimeout(3000);  

            await page.close();
        }))

        console.log(data);


        const str = stringify(data);
        fs.writeFileSync('./csv/result.csv',str);
            
        await browser.close();
    }catch(err) {
        console.log(err);
    }
}

crawler();
// 



async function crawlerDetail() {


    const csvDetail = fs.readFileSync("./csv/result.csv");
    const recordDetails = parse(csvDetail.toString("utf-8"));

    try {


        const data = [];

        const browser = await puppeteer.launch({
            headless: false,
        });

        for (const [i, r] of recordDetails.entries()) {

            try {

                const page = await browser.newPage();

                await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    
                
                await page.goto(r[1] , { 
                    waitUntil: 'load', 
                    timeout: 0 
                })
    
    
                
            
                await page.waitForSelector('div.ad_banner');
    
                await page.evaluate(() => {
                    window.scrollTo(0, window.document.body.scrollHeight);
                 });
    
                 await page.waitForSelector('div.ad_banner');    
                
            }catch(err) {
                await page.reload();
            }



             const result = await page.evaluate(() => {
                const titleEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1');
                let title = '';
                if (titleEl) {
                    title = titleEl.textContent;
                }
                const contentEl = document.querySelector('div.article').textContent;

                let content = contentEl;

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

            let pushData = {
                url: r[1],
                title: '',
                content : '',
                date: '',
                img : '',
            }

            console.log(result);

            if (result.title) {

                pushData.title = result.title
            }

            if (result.content) {
                pushData.content = result.content;
            }

            if (result.date) {

                pushData.date = result.date

            }

            data.push(result);



            // if (result.img) {
            //     const imgResult = await axios.get(result.img, { responseType: 'arraybuffer' });
            //     fs.writeFileSync(`image/${r[0]}.jpg`, imgResult.data);
            // }

            await page.close();
        }

        console.log(data);

        await browser.close();


    }catch(err) {
        console.log(err);

    }
}

// crawlerDetail();