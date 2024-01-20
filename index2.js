// xlsx
const xlsx = require("xlsx");
const axios = require("axios"); // ajax 라이브러리
const cheerio = require("cheerio"); // html 파싱.
const fs = require("fs");

const workbook = xlsx.readFile("./xlsx/data.json");

const records = xlsx.utils.sheet_to_json(workbook)
console.log(records)
for (const [i, r] of records.entries()) {
  console.log(i, r)
}
// const jsonFile = fs.readFileSync("./xlsx/data.json");
// const jsonData = JSON.parse(jsonFile);

// const jsonRealData = jsonData.data;
// console.log(jsonData.data);

// const ws = workbook.Sheets.영화목록;
// // xlsx.utils.sheet_to_json
// //
// const records = xlsx.utils.sheet_to_json(ws);

// for (const e of jsonData.data) {
//   const title = e["제목"];
//   const link = e["링크"];
// }
// const crawler = async () => {
//   await Promise.all(
//     jsonRealData.map(async (r) => {
//       const title = r["제목"];
//       const link = r["링크"];
//       console.log(link);

//       const response = await axios.get("https://m.sedaily.com");
//       //   console.log(response.status);
//       if (response.status === 200) {
//         const html = response.data;
//         console.log(html);
//         // console.log(html);
//         const $ = cheerio.load(html);
//         const text = $(".info txt_3 .info_group ").text();
//         // console.log(text);
//         // console.log(r.제목, "평점", text.trim());
//       }
//     })
//   );
// };
// crawler();
