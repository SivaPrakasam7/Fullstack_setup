import express from 'express';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';

dotenv.config();

// Imports
import { errorHandler } from '../src/handler/error';
import { logAccess } from '../src/handler/logger';
import { swaggerSpec } from '../src/swagger';
import userRoutes from '../src/routes/user';
import securityRoutes from '../src/routes/security';
import utilRoutes from '../src/routes/utils';
import {
    clientHandler,
    decryptPayload,
    inputValidationMiddleware,
} from '../src/handler/security';

//
const app = express();
const port = process.env.PORT;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

if (process.env.MODE !== 'development') {
    app.use(limiter);
}
if (process.env.MODE === 'development') {
    app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
}
app.use(bodyParser.json({ limit: '5MB' }));
app.use(bodyParser.urlencoded({ limit: '5MB', extended: true }));
app.use(cookieParser());
app.use(express.json());
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(clientHandler);

app.use('/files', express.static('../assets/files'));

app.get('/', (_, res) => {
    res.send('API running successfully!');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(decryptPayload);
app.use(logAccess);
app.use(inputValidationMiddleware);

app.use('/v1/user', userRoutes);
app.use('/v1/security', securityRoutes);
app.use('/v1/utils', utilRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test')
    app.listen(port, () => {
        console.log(`Server running on ${port}`);
    });

export default app;
