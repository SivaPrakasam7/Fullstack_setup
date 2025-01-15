// import { passwordRegex } from "src/constants/regex";

//
// const form = {
//     password: {
//         label: 'New Password',
//         placeHolder: 'Enter your password',
//         type: 'password',
//         required: true,
//         value: '',
//         requiredLabel: 'Please enter your password',
//         validations: [
//             {
//                 type: 'regex',
//                 validate: passwordRegex,
//                 message:
//                     'Password must contain at least one uppercase letter, one lower case, one number, one symbol(@$!%*?&#), and be at least 8 characters long',
//             },
//         ],
//     },
//     confirmPassword: {
//         label: 'Re-Enter New Password',
//         placeHolder: 'Re-enter your password',
//         type: 'password',
//         required: true,
//         value: '',
//         requiredLabel: 'Please enter confirmation password',
//         validations: [
//             {
//                 type: 'function',
//                 validate: (values, name) => {
//                     return values.password === values[name]
//                         ? ''
//                         : 'Password does not match';
//                 },
//             },
//         ],
//     },
// };

export default () => {
    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            <div className="max-w-[400px] w-full flex flex-col gap-2 p-2">
                <p className="text-4xl font-bold">Reset Password</p>
                {/* <FormBuilder
                :form="form"
                :call="call"
                button-text="Change Password"
                layout-class="gap-1"
            /> */}
            </div>
        </div>
    );
};
