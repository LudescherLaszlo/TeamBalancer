import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import PresentationPage from "./pages/presentation";
import MasterPage from "./pages/master";
import DetailPage from "./pages/detail";
import StatisticsPage from "./pages/statistics";
import SynergyPage from "./pages/synergy";
import RootLayout from "./layouts/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: PresentationPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "matches", Component: MasterPage },
      { path: "matches/:id", Component: DetailPage },
      { path: "statistics", Component: StatisticsPage },
      { path: "synergy", Component: SynergyPage },
    ],
  },
]);