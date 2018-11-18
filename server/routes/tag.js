const express = require('express');
const axios = require('axios');
var router = express.Router();

router.get('/:tag', (req,res) => {
    var page = parseInt(req.query.p);
    if(!page || page == 0) page = 1;
    const tag = req.params.tag;
    axios.get(`https://api.redtube.com/?data=redtube.Tags.getTagList&output=json}`)
         .then((tags) => {
            if(tags.data.count == 0)
                return res.render('error', {error_code: 404, error_message: "Not videos founds with this tag"});
                
            
            const next = `tag/${tag}?p=${page+1}`;
            const back = `tag/${tag}?p=${page-1}`;
            const result = videos.data.videos;
            res.status(200).render('tag', {results: result,next: next, back: back, tag: tag});
         })
         .catch((e) => res.status(400).send(e));
});

router.get('/', (req,res) => {
    var page = parseInt(req.query.p);
    if(!page || page == 0) page = 1;

    const next = `tags?p=${page+1}`;
    const back = `tags?p=${page-1}`;
    axios.get(`https://api.redtube.com/?data=redtube.Tags.getTagList&output=json}`)
        .then((stars) => {
            if(stars.data.count == 0)
                return res.render('error', {error_code: 404, error_message: "Oopsie, there are no pornstars"});
            const tags = stars.data.stars;
            res.status(200).render('tags', {tags: tags, next: next, back: back});
        })
        .catch((e) => res.status(400).send(e));
});

module.exports = router;