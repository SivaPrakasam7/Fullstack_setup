import express from 'express';

//
import { getPublicKey } from '../../src/handler/security';

//
const router = express.Router();

router.route('/publicKey').get(getPublicKey);

export default router;
