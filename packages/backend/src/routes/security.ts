import express from 'express';

//
import { decryptPayload, getPublicKey } from '../../src/handler/security';

//
const router = express.Router();

router.route('/get-publicKey').get(getPublicKey);

router.route('/decryptPayload').post(decryptPayload);

export default router;
