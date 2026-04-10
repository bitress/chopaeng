import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from "./components/ScrollToTop.tsx";
import { IslandProvider } from './context/IslandContext';
import { AuthProvider } from './context/AuthContext';

const App = () => {
   return (
      <AuthProvider>
         <IslandProvider>
            <Router>
               <ScrollToTop />
               <AppRoutes />
            </Router>
         </IslandProvider>
      </AuthProvider>
   );
}

export default App;