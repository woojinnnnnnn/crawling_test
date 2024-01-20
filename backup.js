const crawler = async () => {
    const browser = await puppeteer.launch({ headless: false });
    try {
        const result = []
        await Promise.all(records.map(async (r, i) => {
            const page = await browser.newPage();
            await page.goto(r[0]);
            const scoreEl = await page.$('.headline')
            if (scoreEl) {
                const text = await page.evaluate(tag => tag.textContent, scoreEl)
                console.log(text)
            }
            await page.waitForTimeout(3000)
            await page.close();
        }))
        await browser.close()
    } catch (error) {
        console.log(error)
    }

}

crawler()

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