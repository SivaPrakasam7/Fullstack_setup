import { useNavigate } from 'react-router-dom';

//
import { links, routes } from 'services/constants/routes';
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
        skills: ['MySql', 'MongoDB', 'AWS', 'CI/CD', 'Cypress', 'Firebase'],
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
    const navigate = useNavigate();

    const calculateExperience = () => {
        const start = new Date('2021-08-13');
        const end = new Date(); // Today: March 19, 2025

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        // Adjust if the current month/day hasn't reached the start month/day
        if (months < 0 || (months === 0 && days < 0)) {
            years--;
            months += 12;
        }
        if (days < 0) {
            const lastMonth = new Date(
                end.getFullYear(),
                end.getMonth() - 1,
                start.getDate()
            );
            days = Math.floor(
                (end.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24)
            );
            months--;
        }

        return `${years} years, ${months} months`;
    };

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
                        <a
                            className="text-xl app-button app-shadow"
                            href="/documents/sivaprakasam.pdf"
                            download="sivaprakasam.pdf"
                        >
                            Resume
                        </a>
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
                        <a
                            href={links.contact}
                            target="_blank"
                            className="app-shadow p-2.5 rounded-full"
                        >
                            <SvgIcon
                                path="/icons/svg/whatsapp.svg"
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
                    <p className="mb-4">
                        I’m a{' '}
                        <strong className="text-blue-500">
                            passionate Full-Stack Developer
                        </strong>{' '}
                        with
                        <strong className="text-blue-500 ml-1">
                            {calculateExperience()} years of professional
                            experience
                        </strong>{' '}
                        in building modern, scalable web applications. With
                        expertise in
                        <span className="font-semibold">
                            React, Vue, TypeScript, Node.js, MySQL, Firebase,
                            AWS, Google Cloud, GitHub CI/CD, and Cypress
                        </span>
                        , I specialize in crafting seamless user experiences
                        backed by robust and secure backend architectures.
                    </p>

                    <p className="mb-4">
                        I have a{' '}
                        <strong className="text-blue-500">
                            ready-to-use project setup
                        </strong>{' '}
                        that includes a{' '}
                        <strong className="text-blue-500">
                            base authentication flow with security features
                        </strong>
                        , enabling me to rapidly build secure and scalable
                        applications. My experience spans across
                        <span className="font-semibold">
                            e-commerce, SaaS platforms, real-time analytics, and
                            multiplayer applications
                        </span>
                        .
                    </p>

                    <h2 className="text-xl font-semibold mt-6">🚀 What I Do</h2>
                    <ul className="list-disc list-inside mb-4">
                        <li>
                            <strong>Frontend Development</strong> – Building
                            dynamic, responsive UIs with{' '}
                            <span className="text-blue-500">
                                React, Vue, TypeScript, and Tailwind CSS
                            </span>
                            .
                        </li>
                        <li>
                            <strong>Backend Development</strong> – Developing
                            APIs and microservices using{' '}
                            <span className="text-blue-500">
                                Node.js, Express, and MySQL
                            </span>
                            .
                        </li>
                        <li>
                            <strong>Security & Authentication</strong> –
                            Implementing secure authentication with{' '}
                            <span className="text-blue-500">
                                JWT, OAuth, RBAC
                            </span>
                            .
                        </li>
                        <li>
                            <strong>Performance Optimization</strong> –
                            Improving app speed with{' '}
                            <span className="text-blue-500">
                                caching, indexing, and serverless architectures
                            </span>
                            .
                        </li>
                        <li>
                            <strong>Automation & Testing</strong> – Writing
                            tests using{' '}
                            <span className="text-blue-500">
                                Cypress, Jest, and CI/CD pipelines
                            </span>
                            .
                        </li>
                        <li>
                            <strong>Cloud & DevOps</strong> – Deploying
                            applications on{' '}
                            <span className="text-blue-500">
                                AWS, Google Cloud, and Firebase
                            </span>
                            .
                        </li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-6">
                        💻 Tech Stack
                    </h2>
                    <p className="mb-4">
                        <strong className="text-blue-500">Frontend:</strong>{' '}
                        React, Vue, TypeScript, Tailwind CSS, Vite <br />
                        <strong className="text-blue-500">Backend:</strong>{' '}
                        Node.js, Express, MySQL, Firebase <br />
                        <strong className="text-blue-500">
                            Cloud & DevOps:
                        </strong>{' '}
                        AWS, Google Cloud, GitHub Actions, CI/CD <br />
                        <strong className="text-blue-500">
                            Testing & Automation:
                        </strong>{' '}
                        Cypress, Jest
                    </p>

                    <p className="mb-4">
                        I’m always exploring{' '}
                        <strong className="text-blue-500">
                            new technologies, frameworks, and best practices
                        </strong>{' '}
                        to stay ahead in the ever-evolving tech world. When I’m
                        not coding, you can find me
                        <strong className="text-blue-500">
                            experimenting with new tech, reading dev blogs, or
                            hiking in nature
                        </strong>
                        .
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
                        layoutClassName="grid grid-cols-1 sm:grid-cols-2 gap-5"
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
