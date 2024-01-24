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
            } catch (err) {
                console.error(err);
                await page?.close();
            }
        }

        console.log(data);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect()
    }
}

// crawlerDetail();


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

            await page.waitForSelector('div.posts');
            await page.waitForTimeout(5000);

            const result = await page.evaluate(() => {
                const category = document.querySelectorAll('a.card');

                const urls = [];

                for (let i = 0; i < category.length; i++) {
                    const relativeHref = category[i].getAttribute('href');
                    const absoluteHref = new URL(relativeHref, window.location.href).href;
                    urls.push([i, absoluteHref]);
                }        
                return urls;
            })
            for(let i = 0 ; i< result.length; i ++) {
                data.push([e[0], result[i][1]])
            }
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
