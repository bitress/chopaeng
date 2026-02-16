import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from "./components/ScrollToTop.tsx";
import { IslandProvider } from './context/IslandContext';

const App = () => {
   return (
      <IslandProvider>
         <Router>
            <ScrollToTop />
            <AppRoutes />
         </Router>
      </IslandProvider>
   );
}

export default App;