import { IError, IMiddleWare } from '../../src/handler/middleware';
import {
    getClientPublicKeyService,
    getKeyPairService,
} from '../../src/services/security';

//
import messages from '../../src/utils/messages';

//
export const getKeyPairsController: IMiddleWare = async (req, res, next) => {
    try {
        const data = {
            userId: req.body.userId,
            clientId: req.cookies.clientId,
            browserId: req.cookies.browserId,
        };

        const result = await getKeyPairService(data);

        res.cookie('clientId', result.clientId, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: +process.env.KEY_ROTATION_INTERVAL!,
        });
        res.status(200).json({
            message: messages.responses.success,
            publicKey: result.publicKey,
            privateKey: result.privateKey,
        });
    } catch (e) {
        next(e as IError);
    }
};

export const getClientPublicKeyController: IMiddleWare = async (
    req,
    res,
    next
) => {
    try {
        const data = req.body;
        const result = await getClientPublicKeyService(data);

        res.status(200).json({
            message: messages.responses.success,
            publicKey: result,
        });
    } catch (e) {
        next(e as IError);
    }
};
