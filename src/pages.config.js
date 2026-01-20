import Chat from './pages/Chat';
import Onboarding from './pages/Onboarding';
import ParentDashboard from './pages/ParentDashboard';
import ParentLogin from './pages/ParentLogin';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import TeacherDashboard from './pages/TeacherDashboard';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import TeacherLogin from './pages/TeacherLogin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Onboarding": Onboarding,
    "ParentDashboard": ParentDashboard,
    "ParentLogin": ParentLogin,
    "Settings": Settings,
    "Shop": Shop,
    "TeacherDashboard": TeacherDashboard,
    "Dashboard": Dashboard,
    "Home": Home,
    "TeacherLogin": TeacherLogin,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};