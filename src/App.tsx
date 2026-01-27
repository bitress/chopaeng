import { BrowserRouter as Router } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from "./components/ScrollToTop.tsx";

const App = () => {
  return (
     <Router>
         <ScrollToTop />
      <AppRoutes />
      <Analytics />
   </Router>
  );
}

export default App;