import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import ResourcePage from "./routes/ResourcePage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <section>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/:resource" element={<ResourcePage />} />
        </Routes>
      </Router>
    </section>
  );
}
