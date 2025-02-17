import { IError, IMiddleWare } from '../../src/handler/middleware';
import messages from '../../src/utils/messages';

export const uploadFileController: IMiddleWare = async (req, res, next) => {
    try {
        res.status(200).json({
            message: messages.responses.success,
            data: `${process.env.ASSET_URL}${req.file?.filename}`,
        });
    } catch (e) {
        next(e as IError);
    }
};
