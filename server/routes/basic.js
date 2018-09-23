const axios = require('axios');
const express = require('express');
let router = express.Router();
let {mongoose} = require('./../db/mongoose');
let {Video} = require('./../models/video');
let ip = require('ip');

router.get('/favorites', (req,res) => {
    Video.find({
        ip: ip.address()
    }).then((videos) => {
        res.status(200).render('favorites', {result: videos});
    }).catch((e) => res.status(400).send());

});

router.get('/about', (req,res) => {
    res.status(200).render('about');
});

router.get('/video/:id', (req,res) => {
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

router.get('/', (req,res) => {

    var page = parseInt(req.query.p);
    if(!page || page === 0) page = 1;
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

module.exports = router;