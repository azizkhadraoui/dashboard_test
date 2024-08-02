import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"; 
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import { ColorModeContext, useMode } from "./theme.js";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Topbar } from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import Sidebar from "./scenes/global/Sidebar";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Invoices from "./scenes/invoices";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar";
import Profile from "./scenes/profile/index.jsx";
import PastFlights from "./scenes/pastflights/index.jsx";
import AddOffer from "./scenes/offers/index.jsx";
import Login from "./scenes/login";
import TabsOpen from "./scenes/tabs/index.jsx";
import Validation from "./scenes/validation/index.jsx";
import Group from "./scenes/groupement/index.jsx";




function App() {
  const [theme, colorMode] = useMode();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  // Determine whether to show the top and sidebar based on the current path
  const showTopbarAndSidebar = currentPath !== "/dashboard_test/login";

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {showTopbarAndSidebar && <Sidebar />}
            <main className={currentPath === "/dashboard_test/login" ? "content centered-content" : "content"}>
              {showTopbarAndSidebar && <Topbar />}
              <Routes>
                <Route path="/dashboard_test/login" element={<Login />} />
                <Route path="/dashboard_test/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/dashboard_test/team" element={<PrivateRoute><Team /></PrivateRoute>} />
                <Route path="/dashboard_test/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
                <Route path="/dashboard_test/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
                <Route path="/dashboard_test/bar" element={<PrivateRoute><Bar /></PrivateRoute>} />
                <Route path="/dashboard_test/form" element={<PrivateRoute><Form /></PrivateRoute>} />
                <Route path="/dashboard_test/line" element={<PrivateRoute><Line /></PrivateRoute>} />
                <Route path="/dashboard_test/pie" element={<PrivateRoute><Pie /></PrivateRoute>} />
                <Route path="/dashboard_test/faq" element={<PrivateRoute><FAQ /></PrivateRoute>} />
                <Route path="/dashboard_test/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
                <Route path="/dashboard_test/geography" element={<PrivateRoute><Geography /></PrivateRoute>} />
                <Route path="/dashboard_test/validation" element={<PrivateRoute><Validation /></PrivateRoute>} />
                <Route path="/dashboard_test/group" element={<PrivateRoute><Group /></PrivateRoute>} />
                <Route
                  path="/dashboard_test/profile/:id"
                  element={<PrivateRoute><Profile /></PrivateRoute>}
                />
                <Route
                  path="/dashboard_test/pastflights"
                  element={<PrivateRoute><PastFlights /></PrivateRoute>}
                />
                <Route
                  path="/dashboard_test/addoffer"
                  element={<PrivateRoute><AddOffer /></PrivateRoute>}
                />
                <Route path="*" element={<Navigate to="/dashboard_test/" replace />} />
                <Route path="/dashboard_test/tab" element={<TabsOpen/>} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;

