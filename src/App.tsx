import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from "./components/ScrollToTop.tsx";
const App = () => {
  return (
     <Router>
         <ScrollToTop />
      <AppRoutes />
   </Router>
  );
}

export default App;