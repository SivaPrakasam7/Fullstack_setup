import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

//
import { links, routes } from 'services/constants/routes';
import { UserContext } from 'src/providers/context';
import { Avatar } from '../components/avatar';
import SvgIcon from '../components/svg';
// import { FormBuilder } from '../components/form/main';
// import { IFormField } from '../components/form/form.types';
// import { emailRegex } from 'services/constants/regex';

//
const skills = [
    {
        icon: '/icons/svg/code.svg',
        title: 'Frontend Development',
        skills: ['React', 'Vue', 'TypeScript', 'Tailwind CSS', 'MUI'],
    },
    {
        icon: '/icons/svg/storage.svg',
        title: 'Backend Development',
        skills: ['Node.js', 'Express'],
    },
    {
        icon: '/icons/svg/stack.svg',
        title: 'Database & DevOps',
        skills: ['MySql', 'MongoDB', 'AWS', 'CI/CD'],
    },
];

const projects: ILargeRecord[] = [];

// const contactForm = {
//     name: {
//         label: 'Name',
//         type: 'text',
//         required: true,
//         requiredLabel: 'Please enter your name',
//     },
//     email: {
//         label: 'Email',
//         type: 'text',
//         required: true,
//         requiredLabel: 'Please enter your email',
//         validations: [
//             {
//                 type: 'regex',
//                 validate: emailRegex,
//             },
//         ],
//     },
//     subject: {
//         label: 'Subject',
//         type: 'text',
//         required: true,
//         requiredLabel: 'Please enter your subject',
//         alignClass: 'col-span-1 sm:col-span-2',
//     },
//     message: {
//         label: 'Message',
//         type: 'textarea',
//         rows: 4,
//         required: true,
//         requiredLabel: 'Please enter your message',
//         alignClass: 'col-span-1 sm:col-span-2',
//     },
// } as Record<string, IFormField>;

//
export default () => {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    // const call = async (payload: ILargeRecord) => {
    //     console.log(payload);
    //     return false;
    // };

    return (
        <div className="max-w-screen-xl app-width flex flex-col gap-3 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full app-height items-center justify-center">
                <div className="flex flex-col gap-7">
                    <p className="text-6xl font-bold">Full-Stack Developer</p>
                    <p className="text-xl">
                        I build modern web applications with cutting-edge
                        technologies
                    </p>
                    <div className="flex gap-3">
                        {user?.signedIn ? (
                            <></>
                        ) : (
                            <button
                                className="text-xl app-button app-shadow"
                                onClick={() => navigate(routes.signUp)}
                            >
                                Get Started
                            </button>
                        )}
                        <button
                            className="text-xl app-button app-shadow"
                            onClick={() => navigate(routes.app)}
                        >
                            App
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href={links.github}
                            target="_blank"
                            className="app-shadow p-2.5 rounded-full"
                        >
                            <SvgIcon
                                path="/icons/svg/github.svg"
                                className="w-7 h-7"
                            />
                        </a>
                        <a
                            href={links.linkedIn}
                            target="_blank"
                            className="app-shadow p-2.5 rounded-full"
                        >
                            <SvgIcon
                                path="/icons/svg/linkedIn.svg"
                                className="w-7 h-7"
                            />
                        </a>
                        <a
                            href={links.mail}
                            target="_blank"
                            className="app-shadow p-2.5 rounded-full"
                        >
                            <SvgIcon
                                path="/icons/svg/mail.svg"
                                className="w-7 h-7"
                            />
                        </a>
                    </div>
                </div>
                <Avatar
                    image="/images/profile.jpg"
                    name="Siva prakasam"
                    className="w-72 h-72 p-3 mx-auto text-[10rem]"
                />
            </div>
            <div className="flex flex-col gap-10 items-center my-10">
                <p className="text-5xl font-bold text-center">About Me</p>
                <div className="flex flex-col gap-3 app-container app-shadow max-w-screen-lg text-xl">
                    <p>
                        I'm a passionate full-stack developer with expertise in
                        building modern web applications. With a strong
                        foundation in both frontend and backend technologies, I
                        create seamless user experiences backed by robust server
                        architectures.
                    </p>
                    <p>
                        My journey in software development began 3 years ago,
                        and since then, I've worked on a diverse range of
                        projects from e-commerce platforms to real-time
                        analytics dashboards. I'm constantly learning and
                        adapting to new technologies to deliver the best
                        solutions.
                    </p>
                    <p>
                        When I'm not coding, you can find me hiking, reading
                        tech blogs, or experimenting with new frameworks and
                        libraries.
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-10 items-center my-10">
                <p className="text-5xl font-bold text-center">
                    Skills & Technologies
                </p>
                <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
                    {skills.map((skill) => (
                        <div className="flex flex-col gap-5 app-container app-shadow text-xl h-52">
                            <div className="flex gap-2 items-center">
                                <div className="p-3 rounded-lg app-shadow">
                                    <SvgIcon
                                        path={skill.icon}
                                        className="w-8 h-8"
                                    />
                                </div>
                                <p className="text-xl font-bold">
                                    {skill.title}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {skill.skills.map((_skill) => (
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="rounded-full bg-gray-400 p-1"></span>
                                        {_skill}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-10 items-center my-10">
                <p className="text-5xl font-bold text-center">
                    Featured Projects
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                    {projects.length ? (
                        projects.map((skill) => (
                            <div className="flex flex-col gap-3 app-container app-shadow w-full text-xl">
                                <div className="flex gap-2 items-center">
                                    <div className="p-3 rounded-lg app-shadow">
                                        <SvgIcon
                                            path={skill.icon}
                                            className="w-8 h-8"
                                        />
                                    </div>
                                    <p className="text-xl font-bold">
                                        {skill.title}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-3xl text-center sm:col-span-2 font-bold text-gray-400 my-10">
                            No Projects Available
                        </p>
                    )}
                </div>
            </div>
            {/* <div className="flex flex-col gap-10 items-center my-10">
                <p className="text-5xl font-bold text-center">Get In Touch</p>
                <div className="app-container app-shadow w-full max-w-screen-lg">
                    <FormBuilder
                        layoutClass="grid grid-cols-1 sm:grid-cols-2 gap-5"
                        form={contactForm}
                        call={call}
                        formBottom={
                            <div className="flex ml-auto sm:col-span-2">
                                <button
                                    type="submit"
                                    className="app-button app-shadow flex items-center gap-2"
                                >
                                    Send Message
                                    <SvgIcon
                                        path="/icons/svg/send.svg"
                                        className="w-5 h-5"
                                    />
                                </button>
                            </div>
                        }
                    />
                </div>
            </div> */}
        </div>
    );
};
