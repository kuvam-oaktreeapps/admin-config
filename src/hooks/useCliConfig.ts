import { useRecoilState } from "recoil";
import type { KitConfig, KitConfigScreen } from "../schema";
import { fetcher } from "../fetcher";
import { projectHasOnlyAtom, resourcesAtom } from "../atoms";
import { useState } from "react";

interface Props {
  localState?: boolean;
}

export default function useCliConfig(opts: Props = { localState: false }) {
  const [resources, setResources] = useRecoilState(resourcesAtom);
  const [projectHasOnly, setProjectHasOnly] = useRecoilState(projectHasOnlyAtom);

  const [localRes, setLocalRes] = useState(resources);

  const { refetch } = fetcher.useQuery<KitConfig & { hasOnly: "webapp" | "server" | undefined }>("config", {
    onSuccess: (data) => {
      const resources: { [key: string]: KitConfigScreen } = {};
      data.resources.forEach((resource) => {
        resources[resource.name.toLowerCase()] = resource;
      });

      if (opts.localState) {
        setLocalRes(resources);
      } else {
        setResources(resources);
      }

      setProjectHasOnly(data.hasOnly);
    },
  });

  return {
    projectHasOnly,
    resources: opts.localState ? localRes : resources,
    refetchResources: refetch,
  };
}
