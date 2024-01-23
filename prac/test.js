const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const { stringify } = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/data.csv");
const records = parse(csv.toString("utf-8"));


const crawler = async () => {
  await Promise.all(records.map(async (r, i) => {
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const html = response.data;
          //  console.log(`Category: ${category}, HTML: ${html}`);
          const $ = cheerio.load(html);
          const text = $(
            "#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1"
          ).text();
          console.log(text);
        }
      } catch (error) {
        console.log(error)
      }
    }) 
  );
};

crawler();
// 자리에 위치해 있습니다. 구글링 자료 보면서 작업중 이라 멈춰 보일 수 있숩니다.... <----------