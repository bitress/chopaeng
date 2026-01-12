import { Routes, Route, Navigate } from 'react-router-dom';

const AppRoutes = () => {
    return (
        <Routes>
            <Route index element={<div>Home Page</div>} />
        </Routes>
    );
};
export default AppRoutes;