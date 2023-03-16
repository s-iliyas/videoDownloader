import express from "express";
import cors from "cors";
import morgan from "morgan";
import fs from "fs-extra";
import * as cheerio from "cheerio";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

const videoFetch = async (videolinks) => {
  for (let index = 0; index < videolinks.length; index++) {
    const link = videolinks[index];
    await axios
      .get(link)
      .then(async (response) => {
        const $ = cheerio.load(response.data);
        const aTag = $("video").attr("src");
        const folderName = "downloads";
        const fileName = `${index}.mp4`;
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }
        const filePath = `${folderName}/${fileName}`;
        await axios({
          url: aTag,
          method: "GET",
          responseType: "stream",
        })
          .then(async (video) => {
            video.data.pipe(fs.createWriteStream(filePath));
            video.data.on("end", function () {
              console.log(`File saved as ${fileName}`);
            });
          })
          .catch(function (err) {
            console.log(`Error downloading file: ${err.message}`);
            console.log(`Error  file: ${aTag}`);
          });
      })
      .catch((err) => console.log(err.message, link));
  }
};

app.get("/download", async (req, res) => {
  const html = fs.readFileSync("./madan.html");
  const $ = cheerio.load(html.toString());
  const aTag = $("div.thumb > a");
  let videolinks = [];
  for (const article of aTag) {
    const text = $(article).attr("href");
    videolinks.push(text);
  }
  videoFetch(videolinks);
});

app.listen(8080, console.log("visit http://localhost:8080"));

// mina.kavitaa@gmail.com mmmiitr@gmail.com