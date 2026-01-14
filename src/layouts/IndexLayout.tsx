import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";

export function IndexLayout() {
    return (
        <>
            <Navbar/>
            <main id="wrapper" style={{  minHeight: '100vh' }}>
                <Outlet />
            </main>
            <Footer/>
        </>
    );
}