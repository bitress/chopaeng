import { Routes, Route } from 'react-router-dom';
import Home from "../pages/Home.tsx";
import {IndexLayout} from "../layouts/IndexLayout.tsx";
import About from "../pages/About.tsx";
import Guides from "../pages/Guides.tsx";
import TreasureIslands from "../pages/TreasureIslands.tsx";
import Membership from "../pages/Membership.tsx";
import FindItems from "../pages/FindItems.tsx";
import Contact from "../pages/Contact.tsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<IndexLayout/>}>
                <Route path="/" element={<Home/>}/>
                <Route path="/about" element={<About/>}/>
                <Route path="/guides" element={<Guides/>}/>
                <Route path="/islands" element={<TreasureIslands/>}/>
                <Route path="/membership" element={<Membership/>}/>
                <Route path="/find" element={<FindItems/>}/>
                <Route path="/contact" element={<Contact/>}/>
            </Route>
        </Routes>

    );
};
export default AppRoutes;