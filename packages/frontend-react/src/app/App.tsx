import { useEffect } from 'react';

//
import { ErrorBoundaryProvider } from 'src/providers/errorBoundary';
import { UserProvider } from 'src/providers/userContext';
import RouteMain from 'src/app/router';
import { BrowserRouter } from 'react-router-dom';

//
function App() {
    useEffect(() => {
        document.getElementsByTagName('title')[0]!.innerText =
            import.meta.env.VITE_APP_NAME;
    }, []);

    return (
        <BrowserRouter>
            <ErrorBoundaryProvider>
                <UserProvider>
                    <RouteMain />
                </UserProvider>
            </ErrorBoundaryProvider>
        </BrowserRouter>
    );
}

export default App;
