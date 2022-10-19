import { NextPage } from "next";

import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(() => import("src/game/Game"), { ssr: false });

const Page: NextPage = () => {
  return <DynamicComponentWithNoSSR />;
};

export default Page;
