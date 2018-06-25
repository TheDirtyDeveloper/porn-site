var express = require('express');
var axios = require('axios');
var router = express.Router();

router.get('/:star', (req,res) => {
    var page = parseInt(req.query.p);
    if(!page || page == 0) page = 1;
    const star = encodeURIComponent(req.params.star);
    axios.get(`https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&stars[]=${star}&page=${page}`)
         .then((videos) => {
            if(videos.data.count == 0)
                res.render('error',{error_code: 404, error_message: "Pornstar not found"});
            
                
            const next = `stars/${star}?p=${page+1}`;
            const back = `stars/${star}?p=${page-1}`;
            const videoslist = videos.data.videos;
            res.status(200).render('star', {results: videoslist, next: next, back: back, pornstar: star, pornstar_d: decodeURIComponent(star)});
         })
         .catch((e) => res.status(400).send(e));
});

router.get('/', (req,res) => {
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

module.exports = router;