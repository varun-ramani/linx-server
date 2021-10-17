import multer, { diskStorage, StorageEngine, Multer, FileFilterCallback } from 'multer';
import { Express, Request, Response } from 'express';
import { BASE, UPLOAD_ROOT } from './config';
import { LinxFileUploadRequest, LinxFileUploadResponse } from './LinxFileUpload';
import { LinxFile } from './LinxFile';
import hash from 'object-hash';

console.log(`> [UPLOADER]: Using UPLOAD_ROOT: ${UPLOAD_ROOT}`);

const storageEngine: StorageEngine = diskStorage({
    destination: (req, file, callback) => {
        callback(null, UPLOAD_ROOT);
    },
    filename: (req: LinxFileUploadRequest, file, callback) => {
        callback(null, req.body.file_hash);
    }
});

let fileHashSet = new Set<string>();
let lookupMap = new Map<string, LinxFile>();

function computeLookupKey(file: LinxFile) {
    return hash(file);
}

function handleUploads(req: LinxFileUploadRequest, response: LinxFileUploadResponse) {
    let linxFile: LinxFile = {
        file_path: req.file.path,
        file_size: req.file.size,
        file_hash: req.body.file_hash,
        file_name: req.body.filename
    };

    let lookupKey = computeLookupKey(linxFile);
    lookupMap.set(computeLookupKey(linxFile), linxFile);

    response.send({link: `${BASE}/download/${lookupKey}`});
}

function handleDownload(req: Request<{ lookupKey: string }>, response: Response) {
    let lookupKey = req.params.lookupKey;

    if (!lookupMap.has(lookupKey))
        response.send('Invalid key');
    else {
        let linxFile = lookupMap.get(lookupKey);
        response.download(linxFile.file_path, linxFile.file_name);
    }
}

function filterFiles(req: LinxFileUploadRequest, file: Express.Multer.File, callback: FileFilterCallback) {
    callback(null, !fileHashSet.has(req.body.file_hash));
}

export default function configure(app: Express) {
    const upload: Multer = multer({ storage: storageEngine, fileFilter: filterFiles });

    app.post('/upload', upload.single('file'), handleUploads);
    app.get('/download/:lookupKey', handleDownload);
}