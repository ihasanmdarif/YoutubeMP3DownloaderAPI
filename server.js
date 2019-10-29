var express = require("express");
const request = require("postman-request");
var fs = require("fs");
var app = express();
const cheerio = require("cheerio");
const ytdl = require("ytdl-core");

var VideoInfoArray = [];

var AudioInfoArray = [];

//start the server in 80 port
app.listen(80, () => {
    console.log("Server started on PORT 80");
});


// Calling homepage ang get this page
app.get("/", (req, res) => {
    res.status(200).send({
        Author: "MD ARIF HASAN",
        Message: "There is nothing to show.",
        Type: "This app is  for searching video from youtube and download songs as mp3"
    });
});

//get the search list by calling this url
app.get("/search", (req, res) => {
    var query = req.query.q;
    if (query == undefined) {
        res.status(404).send({
            success: "false",
            message: "search with any video name"
        });
    } else {
        getSearchedlist(query);
        res.json(VideoInfoArray);
    }
});


app.get("/download", (req, res) => {

    var query = req.query.id;

    if (query == undefined) {
        res.status(404).send({
            success: "false",
            message: "search with any video link"
        });
    } else {
        getAudioLink(query);
        res.json(AudioInfoArray);
    }

})


function getSearchedlist(query) {

    request(`https://www.youtube.com/results?search_query=${query}&pbj=1`,
        function (error, response, body) {
            const $ = cheerio.load(body);
            for (var i = 0; i <= 10; i++) {
                var videoid = $(`#results ol li:nth-child(2) li:nth-child(${i}) div:nth-child(1)`).find("a").attr("href");

                if (videoid !== undefined &&
                    !videoid.includes("/results?search_query") &&
                    !videoid.includes("googleadservices.com")) {

                    var imglink = $(`#results ol li:nth-child(2) li:nth-child(${i}) div:nth-child(1)`).find("img").attr("src");
                    var title = $(`#results ol li:nth-child(2) li:nth-child(${i}) div:nth-child(2)`).find("a").attr("title");
                    var video = new VideoInfo(title, videoid, imglink);

                    if (VideoInfoArray.length < 10) {
                        VideoInfoArray.push(video);
                    }
                }
            }
        });
}


function getAudioLink(query) {

    ytdl.getInfo(query, (err, info) => {
        info.formats.forEach(element => {

            if (element.itag === "140" ||
                element.itag === "171" ||
                element.itag === "251") {
                    var index = AudioInfoArray.findIndex(x => x.itag==element.itag)

                    var audio = new AudioInfo(element.itag,element.url);
                    if (index === -1){
                        AudioInfoArray.push(audio);
                    }
            }
        })
    });

}

function VideoInfo(title, videoId, imgLink) {
        this.title = title,
        this.id = videoId,
        this.img = imgLink
}

function AudioInfo(itag, link) {
    this.itag = itag;
    this.link = link;
}