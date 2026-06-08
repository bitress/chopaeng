import { Routes, Route } from 'react-router-dom';
import Home from "../pages/Home.tsx";
import {IndexLayout} from "../layouts/IndexLayout.tsx";
import About from "../pages/About.tsx";
import Guides from "../pages/Guides.tsx";
import TreasureIslands from "../pages/TreasureIslands.tsx";
import Membership from "../pages/Membership.tsx";
import FindItems from "../pages/FindItems.tsx";
import Contact from "../pages/Contact.tsx";
import Maps from "../pages/Maps.tsx";
import IslandDetail from "../pages/IslandDetail.tsx";
import Chopaeng404 from "../errors/404.tsx";
import BlogList from "../pages/BlogList.tsx";
import BlogPost from "../pages/BlogPost.tsx";
import DodoDecryptor from "../pages/DodoDecryptor.tsx";
import PrivacyPolicy from "../pages/PrivacyPolicy.tsx";
import TermsOfService from "../pages/TermsOfService.tsx";
import CookiesPolicy from "../pages/CookiesPolicy.tsx";
import AuthCallback from "../pages/AuthCallback.tsx";
import Profile from "../pages/Profile.tsx";
import RequireMod from "../components/RequireMod.tsx";
import DashboardLayout from "../layouts/DashboardLayout.tsx";
import DashboardHome from "../pages/dashboard/DashboardHome.tsx";
import DashboardIslands from "../pages/dashboard/DashboardIslands.tsx";
import DashboardIslandDetail from "../pages/dashboard/DashboardIslandDetail.tsx";
import DashboardLogs from "../pages/dashboard/DashboardLogs.tsx";
import DashboardWebsiteLogins from "../pages/dashboard/DashboardWebsiteLogins.tsx";
import DashboardStatus from "../pages/dashboard/DashboardStatus.tsx";
import DashboardAnalytics from "../pages/dashboard/DashboardAnalytics.tsx";
import DashboardDatabase from "../pages/dashboard/DashboardDatabase.tsx";
import DashboardForbidden from "../pages/dashboard/DashboardForbidden.tsx";
import DashboardOps from "../pages/dashboard/DashboardOps.tsx";
import DashboardIncidents from "../pages/dashboard/DashboardIncidents.tsx";
import DashboardTrust from "../pages/dashboard/DashboardTrust.tsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<IndexLayout/>}>
                <Route path="/" element={<Home/>}/>
                <Route path="/about" element={<About/>}/>
                <Route path="/guides" element={<Guides/>}/>
                <Route path="/maps" element={<Maps/>}/>
                <Route path="/islands" element={<TreasureIslands/>}/>
                <Route path="/island/:id" element={<IslandDetail />} />
                <Route path="/membership" element={<Membership/>}/>
                <Route path="/find" element={<FindItems/>}/>
                <Route path="/contact" element={<Contact/>}/>
                <Route path="/dodo" element={<DodoDecryptor/>}/>
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogPost />} />

                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
            </Route>

            <Route element={<RequireMod />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="login" element={<DashboardHome />} />
                    <Route path="islands" element={<DashboardIslands />} />
                    <Route path="islands/:id" element={<DashboardIslandDetail />} />
                    <Route path="logs" element={<DashboardLogs />} />
                    <Route path="auth-log" element={<DashboardWebsiteLogins />} />
                    <Route path="status" element={<DashboardStatus />} />
                    <Route path="analytics" element={<DashboardAnalytics />} />
                    <Route path="database" element={<DashboardDatabase />} />
                    <Route path="ops" element={<DashboardOps />} />
                    <Route path="incidents" element={<DashboardIncidents />} />
                    <Route path="trust" element={<DashboardTrust />} />
                </Route>
            </Route>
            <Route path="/dashboard/forbidden" element={<DashboardForbidden />} />
            <Route path="*" element={<Chopaeng404 />} />
        </Routes>

    );
};
export default AppRoutes;
