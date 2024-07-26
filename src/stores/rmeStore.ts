import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";
import { pipewireProfiles } from "../config/pipewireConfig";
import { MixerChannel } from "../types/rmeStore.types";
import {
  mixerChannelsDefault,
  mixerChannelsPro,
  playbackChannelConfig,
} from "../config/channelsConfig";

export const useRmeStore = defineStore("rme", () => {
  const activeProfile = ref<null | string>(null);
  const alsaControls = ref<AudioControls>({});
  const headphoneVolume = ref(0);
  const monitorVolume = ref(0);
  const soundCardNumber = ref<number | null>(null);
  const supportedProfiles = ref<string[]>([]);
  const mixerChannels = ref<MixerChannel[]>([]);
  const playbackChannel = ref<MixerChannel | null>(null);

  const isInitialized = ref<boolean | null>(null);

  const isSupportedProfile = (profile: string) => {
    return supportedProfiles.value.some(
      (supportedProfile) => supportedProfile === profile
    );
  };

  const setActiveProfile = (profile: string) => {
    if (supportedProfiles.value.includes(profile)) {
      activeProfile.value = profile;

      if (profile === pipewireProfiles.proAudio) {
        setMixerChannels(mixerChannelsPro);
      } else if (profile === pipewireProfiles.default) {
        setMixerChannels(mixerChannelsDefault);
      }

      if (!playbackChannel.value) {
        setPlaybackChannel(playbackChannelConfig);
      }
    } else {
      console.warn(`Profile "${profile}" is not supported`);
    }
  };

  const setSoundcardNumber = (cardNumber: number) => {
    soundCardNumber.value = cardNumber;
    isInitialized.value = true;
  };

  const setControls = (newControls: AudioControls) => {
    alsaControls.value = newControls;
  };

  const setMixerChannels = (channels: MixerChannel[]) => {
    mixerChannels.value = channels;
  };
  const setPlaybackChannel = (channel: MixerChannel) => {
    playbackChannel.value = channel;
  };

  const setSupportedProfiles = (profiles: string[]) => {
    supportedProfiles.value = profiles;
  };

  function updateControl(controlName: string, updatedControl: AudioControl) {
    if (alsaControls.value[controlName]) {
      alsaControls.value[controlName] = updatedControl;
    }
  }

  const profileProAudio = computed(() => {
    return supportedProfiles.value.find(
      (profile) => profile === pipewireProfiles.proAudio
    );
  });

  const profileDefault = computed(() => {
    return supportedProfiles.value.find(
      (profile) => profile === pipewireProfiles.default
    );
  });

  return {
    activeProfile,
    alsaControls,
    headphoneVolume,
    isInitialized,
    mixerChannels,
    monitorVolume,
    playbackChannel,
    profileDefault,
    profileProAudio,
    soundCardNumber,
    supportedProfiles,
    isSupportedProfile,
    setActiveProfile,
    setControls,
    setMixerChannels,
    setPlaybackChannel,
    setSoundcardNumber,
    setSupportedProfiles,
    updateControl,
  };
});
