import express from 'express';

//
import { fileUpload } from '../../src/libraries/fileUpload';
import { decryptPayload, filePathScanner } from '../../src/handler/security';
import { uploadFileController } from '../../src/controller/utils';
import { tokenChecker } from '../../src/handler/tokenVerification';

//
const router = express.Router();

//
router
    .route('/file-upload')
    .post(
        fileUpload,
        decryptPayload,
        tokenChecker,
        filePathScanner,
        uploadFileController
    );

export default router;
