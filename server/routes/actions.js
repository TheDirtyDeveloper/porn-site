const axios = require('axios');
const express = require('express');
var router = express.Router();

var ip = require('ip');
var methodOverride = require('method-override');
var {mongoose} = require('./../db/mongoose');
var {Video} = require('./../models/video');

router.get('/save/:id', (req,res) => {
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

router.delete('/delete/:id', (req,res) => {
    const id = req.params.id;
    const backURL = req.header('Referer') || '/';

    Video.findByIdAndRemove(id).then((video) => {
        if(!video) return res.status(400).render('error', {error_code: 400, error_message: "There were an error deleting your video."})
        res.status(200).redirect(backURL);
    }).catch((e) => res.status(400).send());
})

module.exports = router;