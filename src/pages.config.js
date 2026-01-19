import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ParentDashboard from './pages/ParentDashboard';


export const PAGES = {
    "Onboarding": Onboarding,
    "Chat": Chat,
    "Dashboard": Dashboard,
    "Settings": Settings,
    "ParentDashboard": ParentDashboard,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
};