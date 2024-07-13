export interface AudioControl {
  name: string;
  capabilities: string[];
  channels: string;
  limits: {
    min: number;
    max: number;
  };
  values: {
    [key: string]: number;
  };
}

export interface AudioControls {
  [key: string]: AudioControl;
}
