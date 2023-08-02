import { useRecoilState } from "recoil";
import type { KitConfig, KitConfigScreen } from "../schema";
import { fetcher } from "../fetcher";
import { resourcesAtom } from "../atoms";
import { useState } from "react";

interface Props {
  localState?: boolean;
}

export default function useCliConfig(opts: Props = { localState: false }) {
  const [resources, setResources] = useRecoilState(resourcesAtom);
  const [localRes, setLocalRes] = useState(resources);

  const { refetch } = fetcher.useQuery<KitConfig>("config", {
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
    },
  });

  return {
    resources: opts.localState ? localRes : resources,
    refetchResources: refetch,
  };
}
