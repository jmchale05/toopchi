import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PageMeta } from "./components/PageMeta";
import { START_GAME_PATH } from "./config/features";
import { SessionProvider } from "./context/SessionContext";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { GamePage } from "./pages/GamePage";
import { HomePage } from "./pages/HomePage";
import { HowToPlayPage } from "./pages/HowToPlayPage";
import { ModeSelectPage } from "./pages/ModeSelectPage";
import { PremiumPage } from "./pages/PremiumPage";
import { ResultsPage } from "./pages/ResultsPage";
import { SetupPage } from "./pages/SetupPage";
import { TenableGamePage } from "./pages/TenableGamePage";
import { TenableResultsPage } from "./pages/TenableResultsPage";
import { TenableSetupPage } from "./pages/TenableSetupPage";

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <PageMeta />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/start" element={<Navigate to={START_GAME_PATH} replace />} />
          {/* Guess the XI — kept for later; not linked in the main flow */}
          <Route path="/modes" element={<ModeSelectPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/tenable/setup" element={<TenableSetupPage />} />
          <Route path="/tenable/game" element={<TenableGamePage />} />
          <Route path="/tenable/results" element={<TenableResultsPage />} />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
