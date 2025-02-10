import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

//
import { ErrorBoundaryProvider } from 'src/providers/errorBoundary';
import { UserProvider } from 'src/providers/userContext';
import { ToastProvider } from 'src/providers/toast';
import RouteMain from 'src/app/router';

//
function App() {
    useEffect(() => {
        document.getElementsByTagName('title')[0]!.innerText =
            import.meta.env.VITE_APP_NAME;

        document.documentElement.style.setProperty(
            '--scale-factor',
            window.devicePixelRatio.toString()
        );
        if (window.devicePixelRatio >= 1) {
            const scale = 1 / window.devicePixelRatio;
            document.body.style.zoom = `${scale}`;
        }
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
