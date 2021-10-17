import express from 'express';
import configureUploadFiles from './upload-files';
import {stat} from 'fs';

import {BASE, PORT} from './config';

const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    console.log(req, res);
});

configureUploadFiles(app);

app.get('/:fileid', (req, res) => {
    let targetFilename: string = `upload/${req.params.fileid}`;
    stat(targetFilename, err => {
        if (!err)
            res.download(targetFilename, )
    });

    stat(`upload/${req.params.fileid}`, (exists) => {
        if (exists == null)
            res.sendFile(`upload/`)
    });
});

app.listen(PORT, () => {
    console.log(`Listening on ${BASE}`);
});