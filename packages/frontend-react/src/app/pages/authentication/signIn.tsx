// import { emailRegex } from 'src/constants/regex';

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
//     password: {
//         label: 'Password',
//         placeHolder: 'Enter your password',
//         type: 'password',
//         required: true,
//         value: '',
//         requiredLabel: 'Please enter your password',
//     },
// };

export default () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2">
                <p className="text-4xl font-bold">Sign In</p>
                {/* <FormBuilder
            :form="form"
            :call="call"
            button-text="Sign In"
            layout-className="gap-1"
        /> */}
                <div className="w-full border-t border-gray-600"></div>
                <div className="flex flex-row justify-between">
                    <a
                        href="/sign-up"
                        className="text-md underline text-gray-500 hover:text-current"
                    >
                        Create new account
                    </a>
                    <a
                        href="/forgot-password"
                        className="text-md underline text-gray-500 hover:text-current"
                    >
                        Forgot password?
                    </a>
                </div>
            </div>
        </div>
    );
};
