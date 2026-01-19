import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Onboarding": Onboarding,
    "Chat": Chat,
    "Dashboard": Dashboard,
    "Settings": Settings,
    "ParentDashboard": ParentDashboard,
    "TeacherDashboard": TeacherDashboard,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};