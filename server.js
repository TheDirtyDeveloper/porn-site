const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const axios = require('axios');

const methodOverride = require('method-override');

const pornstars = require('./server/routes/pornstar');
const tags = require('./server/routes/tag');
const basics = require('./server/routes/basic');
const actions = require('./server/routes/actions');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
hbs.registerPartials(__dirname + '/views/partials');

app.use('/tags', tags);
app.use('/stars', pornstars);
app.use('/action', actions);
app.use('/', basics);

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
