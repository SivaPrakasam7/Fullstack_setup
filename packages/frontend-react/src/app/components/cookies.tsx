import { useEffect, useState } from 'react';

//
export const Cookies = () => {
    const [accepted, setAccept] = useState(false);

    const acceptCookies = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        setAccept(true);
    };

    useEffect(() => {
        if (localStorage.getItem('cookiesAccepted') === 'true') setAccept(true);
    }, [localStorage.getItem('cookiesAccepted')]);

    return accepted ? (
        <></>
    ) : (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
            <p className="text-sm">
                We use cookies to enhance your experience. By using our app, you
                agree to our cookie usage.
            </p>
            <button
                onClick={acceptCookies}
                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
                Accept
            </button>
        </div>
    );
};
