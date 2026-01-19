import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';


export const PAGES = {
    "Onboarding": Onboarding,
    "Chat": Chat,
    "Dashboard": Dashboard,
    "Settings": Settings,
    "ParentDashboard": ParentDashboard,
    "TeacherDashboard": TeacherDashboard,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
};