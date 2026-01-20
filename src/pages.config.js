import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import ParentDashboard from './pages/ParentDashboard';
import ParentHistory from './pages/ParentHistory';
import ParentLogin from './pages/ParentLogin';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherLogin from './pages/TeacherLogin';
import Ecosystem from './pages/Ecosystem';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Dashboard": Dashboard,
    "History": History,
    "Home": Home,
    "Onboarding": Onboarding,
    "ParentDashboard": ParentDashboard,
    "ParentHistory": ParentHistory,
    "ParentLogin": ParentLogin,
    "Settings": Settings,
    "Shop": Shop,
    "TeacherDashboard": TeacherDashboard,
    "TeacherLogin": TeacherLogin,
    "Ecosystem": Ecosystem,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};