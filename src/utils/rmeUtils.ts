import { invoke } from "@tauri-apps/api/core";

export const initializeSoundCard = async (soundCardName: string) => {
  try {
    const cardNumber = await invoke("initialize_sound_card", { soundCardName });
    console.log("Sound card initialized:", cardNumber);
    return cardNumber as number;
  } catch (error) {
    console.error("Failed to initialize sound card:", error);
    return null;
  }
};

export const changeBufferSize = async (value: number) => {
  try {
    await invoke("change_buffer_size", { value });
    console.log("Buffer size changed successfully");
  } catch (error) {
    console.error("Failed to change buffer size:", error);
  }
};

export const setVolume = async (controlName: string, volume: number) => {
  try {
    await invoke("set_volume", { controlName, volume });
    console.log("Volume set successfully");
  } catch (error) {
    console.error("Failed to set volume:", error);
  }
};

export const setMonitorVolume = async (volume: number) => {
  if (volume < 0 || volume > 100) {
    console.warn("Volume out of range, will be clamped within 0 - 100");
  }
  const controlNames = ["PCM-AN1-AN1", "PCM-AN2-AN2"];
  for (const controlName of controlNames) {
    await setVolume(controlName, volume);
  }
};

export const setHeadphonesVolume = async (volume: number) => {
  if (volume < 0 || volume > 100) {
    console.warn("Volume out of range, will be clamped within 0 - 100");
  }
  const controlNames = ["PCM-AN1-PH3", "PCM-AN2-PH4"];
  for (const controlName of controlNames) {
    await setVolume(controlName, volume);
  }
};

interface InitialStates {
  headphones_volume: number;
  monitors_volume: number;
}

export const getInitialStates = async (): Promise<InitialStates> => {
  try {
    const states = await invoke("get_initial_states");
    console.log("Initial states retrieved:", states);
    return states as InitialStates;
  } catch (error) {
    console.error("Failed to get initial states:", error);
    throw error;
  }
};
