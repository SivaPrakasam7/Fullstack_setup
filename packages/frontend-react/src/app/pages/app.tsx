import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//
import { routes } from 'services/constants/routes';
import { FormDemo } from './demos/formDemo';
import FormDemoRaw from './demos/formDemo?raw';
import { TableDemo } from './demos/tableDemo';
import TableDemoRaw from './demos/tableDemo?raw';
import { FilterTableDemo } from './demos/filterTableDemo';
import FilterTableDemoRaw from './demos/filterTableDemo?raw';
import { CodeBlock } from './demos/codeBlock';
import { Avatar } from 'src/app/components/avatar';
import { Copy } from 'src/app/components/copy';
import { DialogView } from 'src/app/components/dialog';
import { FileViewer } from 'src/app/components/fileViewer';
import SvgIcon from 'src/app/components/svg';
import { Thumbnail } from 'src/app/components/thumbnail';

export default () => {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);

    return (
        <div className="max-w-screen-md app-width mx-auto py-8 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Pages Showcase
            </h1>
            <section className="block">
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.signIn)}
                >
                    Sign In
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.signUp)}
                >
                    Sign Up
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.forgotPassword)}
                >
                    Forgot password
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() =>
                        navigate(
                            routes.resetPassword + '?token=EMAIL_TOKEN_HERE'
                        )
                    }
                >
                    Reset password
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes.maintenance)}
                >
                    Maintenance
                </button>
                <button
                    className="app-button whitespace-nowrap float-left m-2 app-shadow"
                    onClick={() => navigate(routes['404'])}
                >
                    404
                </button>
            </section>

            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-10">
                Components Showcase
            </h1>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Form Demo
                </h2>
                <FormDemo />
                <CodeBlock code={FormDemoRaw} />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Table Demo
                </h2>
                <TableDemo />
                <CodeBlock code={TableDemoRaw} />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Filter Table Demo
                </h2>
                <FilterTableDemo />
                <CodeBlock code={FilterTableDemoRaw} />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Avatar Demo
                </h2>
                <div className="flex gap-4">
                    <Avatar name="John Doe" />
                    <Avatar name="Jane Smith" image="/images/profile.jpg" />
                </div>
                <CodeBlock
                    code={`
<div className="flex gap-4">
    <Avatar name="John Doe" />
    <Avatar name="Jane Smith" image="/images/profile.jpg" />
</div>
                `}
                />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Copy Demo
                </h2>
                <Copy content="Text to copy">
                    <span className="mr-2">Click to copy: </span>
                </Copy>
                <CodeBlock
                    code={`
<Copy content="Text to copy">
    <span className="mr-2">Click to copy: </span>
</Copy>
                `}
                />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Dialog Demo
                </h2>
                <button
                    className="app-button app-shadow w-32"
                    onClick={() => setDialogOpen(true)}
                >
                    Open Dialog
                </button>
                <DialogView
                    open={dialogOpen}
                    close={() => setDialogOpen(false)}
                >
                    <div className="p-6">
                        <h3 className="text-lg font-semibold">
                            Dialog Content
                        </h3>
                        <p>This is a sample dialog content.</p>
                    </div>
                </DialogView>
                <CodeBlock
                    code={`
const [dialogOpen, setDialogOpen] = useState(false);

<button
    className="app-button app-shadow w-32"
    onClick={() => setDialogOpen(true)}
>
    Open Dialog
</button>
<DialogView
    open={dialogOpen}
    close={() => setDialogOpen(false)}
>
    <div className="p-6">
        <h3 className="text-lg font-semibold">Dialog Content</h3>
        <p>This is a sample dialog content.</p>
    </div>
</DialogView>
                `}
                />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    FileViewer Demos
                </h2>
                <div className="flex gap-4">
                    <button
                        className="app-button app-shadow w-32"
                        onClick={() => setImageDialogOpen(true)}
                    >
                        View Image
                    </button>
                    <button
                        className="app-button app-shadow w-32"
                        onClick={() => setVideoDialogOpen(true)}
                    >
                        View Video
                    </button>
                </div>

                <DialogView
                    open={imageDialogOpen}
                    close={() => setImageDialogOpen(false)}
                    contentClass="p-2"
                >
                    <FileViewer url="/images/profile.jpg" />
                </DialogView>

                <DialogView
                    open={videoDialogOpen}
                    close={() => setVideoDialogOpen(false)}
                    contentClass="p-2"
                >
                    <FileViewer url="/images/setup_and_test.mp4" />
                </DialogView>
                <CodeBlock
                    code={`
const [imageDialogOpen, setImageDialogOpen] = useState(false);
const [videoDialogOpen, setVideoDialogOpen] = useState(false);

<div className="flex gap-4">
    <button
        className="app-button app-shadow w-32"
        onClick={() => setImageDialogOpen(true)}
    >
        View Image
    </button>
    <button
        className="app-button app-shadow w-32"
        onClick={() => setVideoDialogOpen(true)}
    >
        View Video
    </button>
</div>

<DialogView
    open={imageDialogOpen}
    close={() => setImageDialogOpen(false)}
    contentClass="p-2"
>
    <FileViewer url="/images/profile.jpg" />
</DialogView>

<DialogView
    open={videoDialogOpen}
    close={() => setVideoDialogOpen(false)}
    contentClass="p-2"
>
    <FileViewer url="/images/setup_and_test.mp4" />
</DialogView>
                `}
                />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    SVG Icon Demo
                </h2>
                <div className="flex gap-4">
                    <SvgIcon
                        path="/icons/svg/github.svg"
                        className="w-6 h-6 text-green-500"
                    />
                    <SvgIcon
                        path="/icons/svg/linkedIn.svg"
                        className="w-6 h-6 text-gray-500"
                    />
                </div>
                <CodeBlock
                    code={`
<div className="flex gap-4">
    <SvgIcon
        path="/icons/svg/github.svg"
        className="w-6 h-6 text-green-500"
    />
    <SvgIcon
        path="/icons/svg/linkedIn.svg"
        className="w-6 h-6 text-gray-500"
    />
</div>
                `}
                />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Thumbnail Demo
                </h2>
                <div className="flex gap-4">
                    <Thumbnail url="/images/maintenance.png" />
                    <Thumbnail url="invalid-url" />
                </div>
                <CodeBlock
                    code={`
<div className="flex gap-4">
    <Thumbnail url="/images/maintenance.png" />
    <Thumbnail url="invalid-url" />
</div>
                `}
                />
            </section>
        </div>
    );
};
