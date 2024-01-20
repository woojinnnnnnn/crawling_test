const axios = require("axios");
const cheerio = require("cheerio");
const parse = require("csv-parse/lib/sync");
const { stringify } = require("csv-stringify/sync");
const fs = require("fs");
const puppeteer = require("puppeteer");

const csv = fs.readFileSync("csv/data.csv");
const records = parse(csv.toString("utf-8"));
// console.log(records);

// const urls = [
//   ["politics", "https://m.sedaily.com/NewsView/2D45AI7F1W#cb"],
//   ["world", "https://m.sedaily.com/NewsView/2D45OTX8L8#cb"],
// ];

// async function fetchData() {
//   try {
//     for (const [category, url] of urls) {
//       const response = await axios.get(url);
//       if (response.status === 200) {
//          const html = response.data;
//          const $ = cheerio.load(html)
//          const text = $('#contentArea > div.content.article_wrap > div.col-left > div > div.headline > h1').text()
//          console.log(text)
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

// fetchData();

const crawler = async () => {
  await Promise.all(
    records.map(async (r) => {
      const category = r[0];
      const url = r[1];
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