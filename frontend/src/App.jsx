import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import RecipeContextProvider from "./context/RecipeContext";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Layout from "./layouts/Layout";
import Favorites from "../src/pages/Favorites";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileWelcomePage from "./pages/profilepage/ProfileWelcomePage";
import ResultPage from "./pages/ResultPage";
import RecipeDetails from "./pages/RecipeDetails";
import MyShoppingList from "./pages/MyShoppingList";
import NotFound from "./pages/NotFound";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import EmailVerifyTokenPage from "./pages/EmailVerifyTokenPage";
import AuthContextProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MyCulinaryJournal from "./pages/MyCulinaryJournal";

function App() {
  return (
    <AuthContextProvider>
      <RecipeContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="profile" element={<ProfileWelcomePage />} />
              <Route path="login" element={<LoginPage />} /> {/* Login-Seite */}
              <Route path="register" element={<RegisterPage />} />{" "}
              {/* Register-Seite */}
              <Route path="results" element={<ResultPage />} />
              <Route path="recipe-details/:id" element={<RecipeDetails />} />
              <Route
                path="favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="shopping-list"
                element={
                  <ProtectedRoute>
                    <MyShoppingList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="journal"
                element={
                  <ProtectedRoute>
                    <MyCulinaryJournal />
                  </ProtectedRoute>
                }
              />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route
                path="email-verify/:token"
                element={<EmailVerifyTokenPage />}
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </RecipeContextProvider>
    </AuthContextProvider>
  );
}

export default App;
