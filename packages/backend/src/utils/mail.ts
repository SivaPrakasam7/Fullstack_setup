import { logMail } from '../../src/handler/logger';
import { readFileData } from '../../src/libraries/fileSystem';
import { testTransporter, transporter } from '../../src/libraries/mail';
import { renderHTML } from '../../src/libraries/renderer';

export const sendMail: ISendMail = async (templatePath, data, config) => {
    const mailConfigurations = {
        from: process.env.APP_NAME,
        ...config,
    };
    const template = await readFileData(templatePath);
    mailConfigurations.html = renderHTML(template, data);

    const _transporter =
        process.env.MODE === 'development' && testTransporter
            ? await testTransporter
            : transporter;

    return new Promise((resolve) => {
        _transporter.sendMail(mailConfigurations, (error, data) => {
            logMail({ config, error, data });

            if (error) throw error;
            resolve(data);
        });
    });
};

export type ISendMail = (
    template: string,
    data: Record<string, string | number>,
    config: {
        form?: string;
        to?: string | string[];
        bcc?: string | string[];
        subject: string;
        html?: string;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;
