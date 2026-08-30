import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import { SuggestionModal } from "../components/suggestions/SuggestionModal.tsx";
import GlobalOrderTrackerPill from "../components/GlobalOrderTrackerPill.tsx";
import CommandPalette from "../components/CommandPalette.tsx";
import OfflineIndicator from "../components/OfflineIndicator.tsx";

export function IndexLayout() {
    return (
        <>
            <Navbar />
            <main id="wrapper" style={{ minHeight: '100vh' }}>
                <Outlet />
            </main>
            <Footer />
            <SuggestionModal />
            <GlobalOrderTrackerPill />
            <CommandPalette />
            <OfflineIndicator />
        </>
    );
}