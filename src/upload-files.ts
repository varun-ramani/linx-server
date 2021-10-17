import multer, { diskStorage, StorageEngine, Multer, FileFilterCallback } from 'multer';
import { Express, Request, Response } from 'express';
import { BASE, UPLOAD_ROOT } from './config';
import { LinxFileUploadRequest, LinxFileUploadResponse } from './LinxFileUpload';
import { LinxFile, LinxLinkInfo } from './LinxLinkInfo';
import hash from 'object-hash';

console.log(`> [UPLOADER]: Using UPLOAD_ROOT: ${UPLOAD_ROOT}`);

let fileHashMap = new Map<string, LinxFile>();
let lookupKeyMap = new Map<string, LinxLinkInfo>();

function computeFileDestination(req, file) {
    return UPLOAD_ROOT;
}

function computeFilename(req: LinxFileUploadRequest, file) {
    return req.body.file_hash;
}

function computeFilePath(req: LinxFileUploadRequest, file) {
    return `${computeFileDestination(req, file)}/${computeFilename(req, file)}`;
}

function computeLookupKey(file: LinxFile) {
    return hash(file);
}

function handleUploads(req: LinxFileUploadRequest, response: LinxFileUploadResponse) {
    let linxFile: LinxFile = fileHashMap.get(req.body.file_hash);

    let linkInfo: LinxLinkInfo = {
        file_path: linxFile.file_path,
        file_hash: req.body.file_hash,
        file_name: req.body.filename,
    };

    let lookupKey = computeLookupKey(linkInfo);
    lookupKeyMap.set(lookupKey, linkInfo);

    console.log(fileHashMap);
    console.log(lookupKeyMap);

    response.send({link: `${BASE}/download/${lookupKey}`});
}

function handleDownload(req: Request<{ lookupKey: string }>, response: Response) {
    let lookupKey = req.params.lookupKey;

    if (!lookupKeyMap.has(lookupKey)) {
        response.send('Invalid key');
    } else {
        let linxFile = lookupKeyMap.get(lookupKey);
        response.download(linxFile.file_path, linxFile.file_name);
    }
}

function filterFiles(req: LinxFileUploadRequest, file: Express.Multer.File, callback: FileFilterCallback) {
    if (fileHashMap.has(req.body.file_hash)) {
        console.log(fileHashMap);
        callback(null, false);
    } else {
        let linxFile: LinxFile = {
            file_path: computeFilePath(req, file),
            file_hash: req.body.file_hash
        };

        fileHashMap.set(req.body.file_hash, linxFile);
        console.log(fileHashMap);
        callback(null, true);
    }
}

const storageEngine: StorageEngine = diskStorage({
    destination: (req, file, callback) => {
        callback(null, computeFileDestination(req, file));
    },
    filename: (req: LinxFileUploadRequest, file, callback) => {
        callback(null, computeFilename(req, file));
    }
});

export default function configure(app: Express) {
    const upload: Multer = multer({ storage: storageEngine, fileFilter: filterFiles });

    app.post('/upload', upload.single('file'), handleUploads);
    app.get('/download/:lookupKey', handleDownload);
}