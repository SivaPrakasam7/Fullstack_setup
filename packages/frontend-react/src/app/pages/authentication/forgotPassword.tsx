// import { emailRegex } from "src/constants/regex";

//
// const form = {
//     email: {
//         label: 'Email',
//         placeHolder: 'Enter your email',
//         type: 'text',
//         required: true,
//         value: '',
//         requiredLabel: 'Please enter your email',
//         validations: [
//             {
//                 type: 'regex',
//                 validate: emailRegex,
//                 message: 'Invalid email',
//             },
//         ],
//     },
// };

export default () => {
    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2">
                <p className="text-4xl font-bold">Forgot Password</p>
                {/* <FormBuilder
                :form="form"
                :call="call"
                button-text="Request reset password link"
                layout-className="gap-1"
            /> */}
                <div className="w-full border-t border-gray-600"></div>
                <a
                    href="/sign-in"
                    className="text-md underline text-gray-500 hover:text-current"
                >
                    Back to login
                </a>
            </div>
        </div>
    );
};
