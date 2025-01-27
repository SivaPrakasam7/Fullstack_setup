import express from 'express';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
// import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';

dotenv.config();

// Files imports here
import { errorHandler } from '../src/handler/error';
import { logAccess } from '../src/handler/logger';
import { swaggerSpec } from '../src/swagger';
import userRotes from '../src/routes/user';
import securityRoutes from '../src/routes/security';
import { clientHandler, decryptPayload } from '../src/handler/security';

//
const app = express();
const port = process.env.PORT;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.use(limiter);
app.use(bodyParser.json({ limit: '5MB' }));
app.use(bodyParser.urlencoded({ limit: '5MB', extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.disable('x-powered-by');
// app.use(helmet());
// app.use(helmet.xssFilter());
// app.use(helmet.noSniff());
// app.use(helmet.hidePoweredBy());
app.use(clientHandler);

app.get('/', (_, res) => {
    res.send('API running successfully!');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(decryptPayload);
app.use(logAccess);

app.use('/v1/user', userRotes);
app.use('/v1/security', securityRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test')
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

export default app;
