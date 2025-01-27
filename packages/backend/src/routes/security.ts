import express from 'express';

//
import { tokenChecker } from '../../src/handler/tokenVerification';
import {
    getClientPublicKeyController,
    getKeyPairsController,
} from '../../src/controller/security';

//
const router = express.Router();

router.route('/keyPair').get((req, res, next) => {
    const optional = true;
    tokenChecker(req, res, next, optional);
}, getKeyPairsController);

router.route('/client-publicKey').get(getClientPublicKeyController);

export default router;
