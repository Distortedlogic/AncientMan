interface ITiledEnum {
  id: 1;
  name: string;
  storageType: string;
  type: "enum";
  values: number[] | string[];
  valuesAsFlags: boolean;
}

interface ITiledClass {
  color: string;
  id: number;
  members: {
    name: string;
    type: string;
    value: any;
  }[];
  name: string;
  type: "class";
  useAs: string[];
}
