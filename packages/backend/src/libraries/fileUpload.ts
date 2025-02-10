import multer from 'multer';
import path from 'path';

//
export const fileUpload = multer({
    storage: multer.diskStorage({
        destination: function (_, __, cb) {
            cb(
                null,
                path.join(
                    __dirname,
                    process.env.MODE === 'development'
                        ? '../../../assets/files'
                        : '../assets/files'
                )
            );
        },
        filename: function (_, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        },
    }),
    fileFilter: async (req, file, cb) => {
        req.headers['content-type'] = 'application/json';
        const filetypes = /jpg|jpeg|png|gif/;
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Unsupported file'));
        }
    },
}).single('file');
