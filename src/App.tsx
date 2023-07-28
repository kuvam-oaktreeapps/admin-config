import { BrowserRouter, Route, Routes } from "react-router-dom";
import { fetcher } from "./fetcher";
import ResourcePage from "./routes/ResourcePage";
import { KitConfig, KitConfigScreen } from "./schema";
import Navbar from "./components/Navbar";
import { useRecoilState } from "recoil";
import { resourcesAtom } from "./atoms";

export default function App() {
  const [resources, setResources] = useRecoilState(resourcesAtom);

  fetcher.useQuery<KitConfig>("config", {
    onSuccess: (data) => {
      const resources: { [key: string]: KitConfigScreen } = {};
      data.resources.forEach((resource) => {
        resources[resource.name.toLowerCase()] = resource;
      });

      setResources(resources);
    },
  });

  return (
    <section>
      <Navbar />
      <BrowserRouter>
        {Object.keys(resources).length && (
          <Routes>
            <Route path="/:resource" element={<ResourcePage />} />
          </Routes>
        )}
      </BrowserRouter>
    </section>
  );
}
