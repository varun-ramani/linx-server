import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';

export type LinxFileUploadBody = {
    filename: string,
    file_hash: string
};

export type LinxLinkResponse = {
    link: string
};

export type LinxFileUploadRequest = Request<ParamsDictionary, {}, LinxFileUploadBody>;
export type LinxFileUploadResponse = Response<LinxLinkResponse>;