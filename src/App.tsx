import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from "./components/ScrollToTop.tsx";
import { IslandProvider } from './context/IslandContext';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
   return (
      <ErrorBoundary>
         <IslandProvider>
            <Router>
               <ScrollToTop />
               <AppRoutes />
            </Router>
         </IslandProvider>
      </ErrorBoundary>
   );
}

export default App;