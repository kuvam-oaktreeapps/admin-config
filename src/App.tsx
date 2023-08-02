import { BrowserRouter, Route, Routes } from "react-router-dom";
import ResourcePage from "./routes/ResourcePage";
import Navbar from "./components/Navbar";
import useCliConfig from "./hooks/useCliConfig";

export default function App() {
  const { resources } = useCliConfig();

  return (
    <section>
      <BrowserRouter>
        <Navbar />
        {Object.keys(resources).length > 0 && (
          <Routes>
            <Route path="/:resource" element={<ResourcePage />} />
          </Routes>
        )}
      </BrowserRouter>
    </section>
  );
}
