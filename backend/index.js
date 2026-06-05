'use strict'

require('dotenv').config();

const mongoConfig = require('./configs/mongoConfig');
const app = require('./configs/app');
const port = process.env.PORT || 3200;

mongoConfig.init();

app.listen(port, () => {
    console.log(`Server http running in port ${port}`);
});
