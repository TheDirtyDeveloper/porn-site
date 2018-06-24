const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const axios = require('axios');

var ip = require('ip');
var methodOverride = require('method-override');
var {mongoose} = require('./server/db/mongoose');
var {Video} = require('./server/models/video');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
hbs.registerPartials(__dirname + '/views/partials');

app.get('/tag/:tag', (req,res) => {
    var page = parseInt(req.query.p);
    if(!page || page == 0) page = 1;
    const tag = req.params.tag;
    axios.get(`https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&tags[]=${tag}&page=${page}`)
         .then((videos) => {
            if(videos.data.count == 0)
                return res.render('error', {error_code: 404, error_message: "Not videos founds with this tag"});
                
            
            const next = `tag/${tag}?p=${page+1}`;
            const back = `tag/${tag}?p=${page-1}`;
            const result = videos.data.videos;
            res.status(200).render('tag', {results: result,next: next, back: back, tag: tag});
         })
         .catch((e) => res.status(400).send(e));
})

app.get('/star/:star', (req,res) => {
    var page = parseInt(req.query.p);
    if(!page || page == 0) page = 1;
    const star = encodeURIComponent(req.params.star);
    axios.get(`https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&stars[]=${star}&page=${page}`)
         .then((videos) => {
            if(videos.data.count == 0)
                res.render('error',{error_code: 404, error_message: "Pornstar not found"});
            
                
            const next = `star/${star}?p=${page+1}`;
            const back = `star/${star}?p=${page-1}`;
            const videoslist = videos.data.videos;
            res.status(200).render('star', {results: videoslist, next: next, back: back, pornstar: star, pornstar_d: decodeURIComponent(star)});
         })
         .catch((e) => res.status(400).send(e));
});

app.get('/stars', (req,res) => {
    var page = parseInt(req.query.p);
    if(!page || page == 0) page = 1;    

    const next = `stars?p=${page+1}`;
    const back = `stars?p=${page-1}`;
    axios.get(`https://api.redtube.com/?data=redtube.Stars.getStarDetailedList&output=json&page=${page}`)
         .then((stars) => {
            if(stars.data.count == 0)
                return res.render('error', {error_code: 404, error_message: "Oopsie, there are no pornstars"});
            const pornstars = stars.data.stars;
            res.status(200).render('stars', {pornstars: pornstars, next: next, back: back});
         })
         .catch((e) => res.status(400).send(e));
});

app.get('/favorites', (req,res) => {
    Video.find({
        ip: ip.address()
    }).then((videos) => {
        res.status(200).render('favorites', {result: videos});
    }).catch((e) => res.status(400).send());

});

app.get('/about', (req,res) => {
    res.status(200).render('about');
})

app.get('/video/:id', (req,res) => {
    const id = req.params.id;
    axios.get(`https://api.redtube.com/?data=redtube.Videos.getVideoById&video_id=${id}&output=json`)
         .then((video) => {    
            if(video.data.code && video.data.code !== 200) 
                return res.render('error', {error_code: 404, error_message: "Video not found."});        
            axios.get(` https://api.redtube.com/?data=redtube.Videos.getVideoEmbedCode&video_id=${id}&output=json`)
                 .then(embed => {      
                    if(embed.data.code && embed.data.code !== 200)       
                        return res.render('error', {error_code: 404, error_message: "Embed not found"});
                    const buffer = new Buffer(embed.data.embed.code, 'base64');  
                    const embed_video = buffer.toString('ascii');

                    res.status(200).render('video', {result: video.data.video, embed: embed_video});
                 })
                 .catch((e) => res.status(400).send(e));    
         })
         .catch((e) => res.status(400).send(e));
});

app.get('/save/:id', (req,res) => {
    const id = req.params.id;
    const backURL = req.header('Referer') || '/';
    axios.get(`https://api.redtube.com/?data=redtube.Videos.getVideoById&video_id=${id}&output=json&thumbsize=all`)
         .then((video) => {
            if(video.data.code && video.data.code !== 200)
                return res.render('error', {error_code: 404, error_message: "Video not found"});
            video = video.data.video;
            
            const videom = new Video({
                video_id: video.video_id,
                title: video.title,
                ip: ip.address(),
                thumb: video.thumb
            });

            videom.save().then((nvideo) => {
                if(!nvideo) 
                    return res.status(400).render('error', {error_code: 400, error_message: "There were an error saving your video."})
                res.status(200).redirect(backURL);
            }).catch((e) => res.status(400).send(e));
         }).catch((e) => res.status(400).send(e));
});

app.delete('/delete/:id', (req,res) => {
    const id = req.params.id;
    const backURL = req.header('Referer') || '/';

    Video.findByIdAndRemove(id).then((video) => {
        if(!video) return res.status(400).render('error', {error_code: 400, error_message: "There were an error deleting your video."})
        res.status(200).redirect(backURL);
    }).catch((e) => res.status(400).send());
})

app.get('/', (req,res) => {

    var page = parseInt(req.query.p);
    if(!page || page == 0) page = 1;    
    var find = req.query.search;
    if(!req.query.search) find = "";   

    axios.get(`https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&thumbsize=large&page=${page}&search=${find}`)
        .then((videos) => {
            if(videos.data.count == 0 || (videos.data.code && videos.data.code !== 200)) 
                return res.render('error.hbs', {error_code: "404", error_message: "Videos not found"});
            axios.get(`https://api.redtube.com/?data=redtube.Tags.getTagList&output=json`)
                 .then((tags) => {
                    var taglist = tags.data.tags;
                    if(!taglist) taglist = "";
                    const result = videos.data.videos;    
                    if(find) find = `&search=${find}`;
                    const next = `?p=${page+1}${find}`;
                    const back = `?p=${page-1}${find}`;                
                    res.status(200).render('index.hbs', {results: result,next: next, back: back, find: find, tags: taglist});
                 }).catch((e) => res.status(400).send(e));   
        }).catch((e) => res.status(400).send(e));
});

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})
