var express = require("express");
const request = require("postman-request");
var fs = require("fs");
var app = express();
const cors = require("cors");
const cheerio = require("cheerio");
const ytdl = require("ytdl-core");

//start the server in 80 port
const PORT = process.env.PORT || 3000;

var allowedDomain = [
  "http://localhost:3000",
  "https://music-downloader.netlify.app/",
];

var corsOptions = {
  origin: function (origin, callback) {
    if (allowedDomain.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log("Server running", PORT);
});

// Calling homepage ang get this page
app.get("/", (req, res) => {
  res.status(200).send({
    Author: "MD ARIF HASAN",
    Message: "There is nothing to show.",
    Type:
      "This app is  for searching video from youtube and download songs as mp3",
  });
});

//get the search list by calling this url
app.get("/search", (req, res) => {
  var query = req.query.q;
  if (query == undefined) {
    res.status(404).send({
      success: false,
      message: "search with any video name",
    });
  } else {
    getSearchedlist(query, res);
  }
});

app.get("/download", (req, res) => {
  var query = req.query.id;
  if (query == undefined) {
    res.status(404).send({
      success: "false",
      message: "search with any video link",
    });
  } else {
    getAudioLink(query, res);
  }
});

function getSearchedlist(query, res) {
  request(
    `https://www.youtube.com/results?search_query=${query}&pbj=1`,
    function (error, response, body) {
      var arrayOfVideos = [];
      var video;
      const $ = cheerio.load(body);
      for (var i = 0; i <= 10; i++) {
        var videoid = $(
          `#results ol li:nth-child(2) li:nth-child(${i}) div:nth-child(1)`
        )
          .find("a")
          .attr("href");

        if (
          videoid !== undefined &&
          !videoid.includes("/results?search_query") &&
          !videoid.includes("googleadservices.com")
        ) {
          var title = $(
            `#results ol li:nth-child(2) li:nth-child(${i}) div:nth-child(2)`
          )
            .find("a")
            .attr("title");
          var imglink = $(
            `#results ol li:nth-child(2) li:nth-child(${i}) div:nth-child(1)`
          )
            .find("img")
            .attr("data-thumb");

          if (imglink === undefined) {
            var newImageLink = $(
              `#results ol li:nth-child(2) li:nth-child(${i}) div:nth-child(1)`
            )
              .find("img")
              .attr("src");
            video = new VideoInfo(title, videoid, newImageLink);
          } else {
            video = new VideoInfo(title, videoid, imglink);
          }
          arrayOfVideos.push(video);
        }
      }
      res.json(arrayOfVideos);
    }
  );
}

async function getAudioLink(query, res) {
  const info = await ytdl.getInfo(query);
  var AudioInfoArray = [];
  info.formats.forEach((element) => {
    if (element.itag === 140 || element.itag === 171 || element.itag === 251) {
      var audio = new AudioInfo(
        element.itag,
        element.url,
        info.player_response.videoDetails.title
      );
      if (AudioInfoArray.length < 4) {
        AudioInfoArray.push(audio);
      }
    }
  });
  return res.json(AudioInfoArray);
}

function VideoInfo(title, videoId, imgLink) {
  (this.title = title), (this.id = videoId), (this.img = imgLink);
}

function AudioInfo(itag, link, title) {
  this.itag = itag;
  this.link = link;
  this.title = title;
}
