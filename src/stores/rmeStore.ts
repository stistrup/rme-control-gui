import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";
import { AlsaInput, AlsaOutput, AlsaPlayback, AudioProfile, TauriInputChannelConfig } from "../types/config.types";
import { audioProfilesConfig, babyfaceProConf } from "../config/soundCardConfig";

interface StereoMapping {
  [leftChannelId: string]: {
    left: string;
    right: string;
  };
}

export const useRmeStore = defineStore("rme", () => {
  const soundCardConfig = ref(babyfaceProConf)
  const alsaControls = ref<AudioControls>({});
  const activeProfile = ref<null | AudioProfile>(null);
  const supportedProfiles = ref<string[]>([]);
  const inputs = ref<AlsaInput[]>(babyfaceProConf.inputs);
  const outputs = ref<AlsaOutput[]>(babyfaceProConf.outputs);
  const playback = ref<AlsaPlayback>(babyfaceProConf.playback)
  const stereoMappings = ref<StereoMapping>({})

  const isInitialized = ref<boolean | null>(null);

  // Add a channel pair to stereo mapping
  const addStereoMapping = (channelIndex: number) => {

    const isLeftChannel = channelIndex % 2 === 0

    let leftChannelId
    let rightChannelId

    if (isLeftChannel) {
      leftChannelId = inputs.value.find(input => input.inputIndex === channelIndex)?.controlName
      rightChannelId = inputs.value.find(input => input.inputIndex === (channelIndex + 1))?.controlName
    } else {
      leftChannelId = inputs.value.find(input => input.inputIndex === (channelIndex - 1))?.controlName
      rightChannelId = inputs.value.find(input => input.inputIndex === channelIndex)?.controlName
    }

    if (leftChannelId && rightChannelId) {
      stereoMappings.value[leftChannelId] = {
        left: leftChannelId,
        right: rightChannelId
      };
    } else {
      console.error('Couldnt find both channels. Left:', leftChannelId, 'Right:', rightChannelId)
    }
  };

  // Remove a stereo mapping
  const removeStereoMapping = (leftChannelId: string) => {
    delete stereoMappings.value[leftChannelId];
  };

  // Check if a channel is part of a stereo pair
  const isPartOfStereoPair = (channelId: string) => {
    return Object.values(stereoMappings.value).some(
      mapping => mapping.left === channelId || mapping.right === channelId
    );
  };

  // Get the stereo pair for a channel if it exists
  const getStereoMappingFromLeftChannel = (channelId: string) => {
    
    const leftInput = inputs.value.find(input => input.controlName === channelId)

    if (leftInput){
      const rightInput = inputs.value.find(input => input.inputIndex === (leftInput.inputIndex + 1))
      if (leftInput && rightInput) {
        return {leftInput, rightInput}
      }
    }
  };

  // Filter inputs to only show unpaired channels and left channels of stereo pairs
  const visibleChannels = computed(() => 
    inputs.value.filter(channel => {
      const isPaired = isPartOfStereoPair(channel.controlName);
      // Show the channel if it's not paired, or if it's the left channel of a pair
      return !isPaired || stereoMappings.value[channel.controlName];
  }));
  
  const setActiveProfile = (newProfile: string) => {
    const isSupported = supportedProfiles.value.includes(newProfile)
    const targetProfile = audioProfilesConfig.find(profile => profile.profileName === newProfile)
    if (isSupported && targetProfile) {
      activeProfile.value = targetProfile;
    } else {
      console.warn(`Profile "${newProfile}" is not supported`);
    }
  };

  const setControls = (newControls: AudioControls) => {
    alsaControls.value = newControls;
  };

  const getControlByName = (controlName: string) => {
    return alsaControls.value[controlName]
  }

  const setInputChannelConfig = (inputChannels: TauriInputChannelConfig[]) => {
    inputs.value.forEach((input) => {
      const inputChannelConf = inputChannels.find(inputChannel => inputChannel.control_name === input.controlName)

      if (inputChannelConf) {
        input.displayName = inputChannelConf.display_name
        input.stereoCoupled = inputChannelConf.stereo_coupled
      }
    })
  }

  const setSupportedProfiles = (profiles: string[]) => {
    supportedProfiles.value = profiles;
  };

  function updateControl(controlName: string, updatedControl: AudioControl) {
    if (alsaControls.value[controlName]) {
      alsaControls.value[controlName] = updatedControl;
    }
  }

  return {
    activeProfile,
    alsaControls,
    inputs,
    isInitialized,
    outputs,
    playback,
    soundCardConfig,
    stereoMappings,
    supportedProfiles,
    addStereoMapping,
    getStereoMappingFromLeftChannel,
    getControlByName,
    removeStereoMapping,
    setActiveProfile,
    setControls,
    setInputChannelConfig,
    setSupportedProfiles,
    updateControl,
    visibleChannels,
  };
});
