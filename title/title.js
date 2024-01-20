const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify  = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/data.csv"); // 파일 안을 읽음 data.csv 여기 안에 주소가 들어있음.
const records = parse(csv.toString("utf-8")); // 타입지정 ? json?

// 윗 부분은 필요한 패키지들 불러오기.

// 본격적인 크롤링 시작 함수.
const crawler = async () => {
    try{
        const result = []; // 긁어온 정보를 담는 곳.
        const browser = await puppeteer.launch({ headless: false }) // 시작한다고 보면됨. headless: false <- 배포시엔 true
    await Promise.all(records.map(async (r, i) => { // 10개의 페이지를 한번에 가져오기에 Promise.all
        try{
            const page = await browser.newPage() // 페이지 켜짐.
            await page.goto(r[1] , { // r[1]은 링크
                waitUntil: 'load', // 긁어오는 시간
                timeout: 0 // 타임아웃 설정 해제
            })
            const text = await page.evaluate(() => { // evaluate 는 어디에서 무슨 정보를 긁어 올건지 결정함 ?
                const score = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1') // 여기서
                // const score2 = document.querySelector('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1')
                if(score) { // 정보가 있다면.
                    return {
                        score: score.textContent, // 긁어오고
                        // score2: score2.textContent
                    }
                }
            })
            if (text) { // 긁어온 값을 text
                console.log(r[0], "tag", text)
                result[i] = { tag: r[0], url: r[1], text: text }; // 여기에 넣는다.
            }
                // result.score, result.score2
                await page.close()
        } catch(err) {
            console.error(err)
        } 
    }))
    await browser.close()
    const str = JSON.stringify(result) // 문자열로 반환
    fs.writeFileSync('csv/result.csv', str ) // 이후에 정보 담기 <---------
    } catch(err) {
        console.error(err)
    }
}

crawler()