const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify  = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/data.csv"); // 파일 안을 읽음 data.csv 여기 안에 주소가 들어있음.
const records = parse(csv.toString("utf-8")); // 타입지정 ? json?

// 윗 부분은 필요한 패키지들 불러오기.

fs.readdir('image', (err) => { // 이미지 파일을 저장 하는곳.
    if(err) {
        console.log('image폴더가 없어 생성.')
        fs.mkdirSync('image')
    }
})

const resultArry = []; // 크롤링한 값을 저장하는 곳.

const crawler = async () => { // 크롤링 시작 함수.
    try{
        const browser = await puppeteer.launch({
            headless: false, // headless :true 로 배포 해야함.
            args: ['--window-size=1496,967'] // 맥북 기준 켜지는 사이즈 설정.
        }) 
        const page = await browser.newPage()  // 브라우저를 열고.
        await page.setViewport({
            width: 1496,
            height: 967,
        })// 사용자를 밑 부분 처럼 숨긴다.
        // await page.waitForNavigation()
        // await page.waitForTimeout(5000);
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        for (const [i, r] of records.entries()) {
            await page.goto(r[1] , { 
                waitUntil: 'load', 
                timeout: 0 
            })
            // await page.click('#footer > div.ft_sitemap > ul > li:nth-child(4) > a')
            await page.evaluate(() => {
                window.scrollTo(0, window.document.body.scrollHeight);
                // await page.waitForSelector()
            });
            // await page.
            await page.waitForSelector(
                '.article',
                {visible:true, timeout: 30000}
                );
            const result = await page.evaluate(() => { 
                const titleEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1') 
                let title = ''
                if(titleEl) {
                    title = titleEl.textContent;
                }
                const contentEl = document.querySelector('#contentArea > div.content.article_wrap.mt100 > div.col-left > div > div.article');
                    let content = '';
                    if (contentEl) {
                        content = contentEl.textContent;
                    }
                const dateEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > div.article_info > span:nth-child(1)')
                let date = ''
                if (dateEl) {
                    date = dateEl.textContent
                }
                const imgEl = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.article > div:nth-child(1) > div > a > span > img') 
                let img = '';
                if (imgEl){
                    img = imgEl.src;
                } 
                return { title, content, date, img }
            })
            if (result.title) { 
                console.log(r[0], "제목", result.title)
                resultArry.push({ tag: r[0], url: r[1], text: result.title })
            }
            if (result.content) {
                console.log(r[0], "내용", result.content);
                resultArry.push({ tag: r[0], content: result.content });
            }
            if (result.date) {
                console.log(r[0], "날짜", result.date)
                resultArry.push({ tag: r[0], date: result.date })
            }
            if (result.img) {
                const imgResult = await axios.get(result.img, {
                    responseType: 'arraybuffer',
                })
                fs.writeFileSync(`image/${r[0]}.jpg`, imgResult.data)
            }
    }
    await page.close() 
    await browser.close()
    
    const str = JSON.stringify(resultArry, null, 2) 
    fs.writeFileSync('csv/result.csv', str )
    } catch(err) {
        console.error(err)
    }
}

crawler()
