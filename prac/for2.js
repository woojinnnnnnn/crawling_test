const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const stringify = require("csv-stringify/sync");
const fs = require("fs");

const csv = fs.readFileSync("csv/data.csv");
const records = parse(csv.toString("utf-8"));

const result = [];

// 이미지 저장 폴더 생성
fs.readdir('image', (err) => {
    if (err) {
        console.log('image 폴더가 없어 생성.')
        fs.mkdirSync('image')
    }
})


const crawler = async () => {
    try {
        for (const [i, r] of records.entries()) {
            const response = await axios.get(r[1]);
            const $ = cheerio.load(response.data);

            // 여기에서 적절한 선택자로 대상 요소를 선택합니다.
            const title = $("div.headline > h1").text().trim();
            const date = $("#contentArea > div.content.article_wrap > div.col-left > div > div.headline > div.article_info > span:nth-child(1)").text()
            const content = $("div.article").text().trim();
            const img = $("div.article > div:nth-child(1) > div > a > span > img").attr("src");

            if (title) {
                console.log(r[0], "<-태그", title);
                result.push({ tag: r[0], url: r[1], title });
            }
            if (content) {
                console.log(r[0], "<-태그", content);
                result.push({ tag: r[0], text: content });
            }
            if (date) {
                result.push({ tag: r[0], text: date })
            }
            if (img) {
                const imgResult = await axios.get(img, { responseType: 'arraybuffer' });
                fs.writeFileSync(`image/${r[0]}.jpg`, imgResult.data);
            }
        }

        const str = JSON.stringify(result, null, 2);
        fs.writeFileSync('csv/result.csv', str);
    } catch (err) {
        console.error(err);
    }
};

crawler();
