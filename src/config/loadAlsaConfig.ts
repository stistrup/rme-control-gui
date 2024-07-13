import yaml from "js-yaml";
import { AlsaConfig } from "../types/alsaConfig.types";

export const loadAlsaConfig = async () => {
  try {
    const response = await fetch("/alsa_config.yml");
    const text = await response.text();
    return yaml.load(text) as AlsaConfig;
  } catch (error) {
    console.error("Error loading YAML file:", error);
  }
};
