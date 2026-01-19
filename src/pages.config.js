import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import ParentDashboard from './pages/ParentDashboard';
import Settings from './pages/Settings';
import TeacherDashboard from './pages/TeacherDashboard';
import Shop from './pages/Shop';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Dashboard": Dashboard,
    "Home": Home,
    "Onboarding": Onboarding,
    "ParentDashboard": ParentDashboard,
    "Settings": Settings,
    "TeacherDashboard": TeacherDashboard,
    "Shop": Shop,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};