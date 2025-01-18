import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

//
import { ErrorBoundaryProvider } from 'src/providers/errorBoundary';
import { UserProvider } from 'src/providers/userContext';
import RouteMain from 'src/app/router';
import { Request } from 'src/libraries/api';
import { ToastProvider } from 'src/providers/toast';

//
function App() {
    useEffect(() => {
        document.getElementsByTagName('title')[0]!.innerText =
            import.meta.env.VITE_APP_NAME;
        Request({
            method: 'get',
            url: `v1/security/get-publicKey`,
        }).then((data) => {
            window.encryptionKey = data.publicKey;
        });
    }, []);

    return (
        <BrowserRouter>
            <ErrorBoundaryProvider>
                <ToastProvider>
                    <UserProvider>
                        <RouteMain />
                    </UserProvider>
                </ToastProvider>
            </ErrorBoundaryProvider>
        </BrowserRouter>
    );
}

export default App;
