const fs = require("fs");
const https = require("https")
const http = require("http")
const cheerio = require("cheerio");

const PORT = process.env.PORT || 3000;
const getDataPromise = new Promise(async (resolve, reject) => {
    try {
        await https.get('http://time.com/', (res) => {
            const data = [];
            res.on('data', (d) => {
                data.push(d);
            });
            res.on('end', () => {
                const result = data.join("")
                const $ = cheerio.load(result);
                const listItems = $(".latest-stories ul li");
                const scrapeData = [];
                listItems.each((idx, el) => {
                    const scrape = { title: "", link: "" };
                    scrape.title = $(el).children("a").children("h3").text();
                    scrape.link = 'https://time.com/' + $(el).children("a").attr("href");
                    scrapeData.push(scrape);
                });
                resolve(scrapeData)
            });
        })
    }
    catch (err) {
        reject('Some Error Occured !!!')
    }
})
const server = http.createServer(async (req, response) => {
    if (req.url === "/getTimeStories" && req.method === "GET") {
        response.writeHead(200, { "Content-Type": "application/json" });
        await getDataPromise
            .then(data => {
                response.write(JSON.stringify(data));
                response.end();
            })
            .catch(err => {
                response.write(err);
                response.end();
            })
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});
server.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
});