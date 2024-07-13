// src/types/alsaConfigTypes.ts

export interface AlsaConfig {
  alsa: {
    destinations: {
      headphones: {
        left: string;
        right: string;
      };
      monitors: {
        left: string;
        right: string;
      };
    };
    sources: {
      mics: {
        mic1: {
          channel: string;
          controls: {
            phantom_power: string;
          };
        };
        mic2: {
          channel: string;
          controls: {
            phantom_power: string;
          };
        };
      };
      lines: {
        line1: {
          channel: string;
          controls: {
            sensitivity: string;
          };
        };
        line2: {
          channel: string;
          controls: {
            sensitivity: string;
          };
        };
      };
    };
  };
}
