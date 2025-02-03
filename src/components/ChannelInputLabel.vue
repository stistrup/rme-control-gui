<script setup lang="ts">
import { inject, nextTick, ref } from 'vue';
import { RmeService } from '../services/RmeService';
import { AlsaInput } from '../types/config.types';
import { useRmeStore } from '../stores/rmeStore';

interface ChannelInputLabelProps {
  input: AlsaInput;
}

const props = defineProps<ChannelInputLabelProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();

const isEditing = ref(false);
const editedDisplayName = ref(props.input.stereoCoupled ? props.input.displayNameStereo ?? "" : props.input.displayName);
const inputRef = ref<HTMLInputElement | null>(null);

const startEditing = () => {
  isEditing.value = true;
  editedDisplayName.value = props.input.stereoCoupled ? props.input.displayNameStereo ?? "" : props.input.displayName;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

const saveChannelconfig = async () => {
  if (!rmeService) return;

  try {

    const displayName = props.input.stereoCoupled ? props.input.displayName : editedDisplayName.value
    const displayNameStereo = props.input.stereoCoupled ? editedDisplayName.value : props.input.displayNameStereo

    await rmeService.setInputChannelConfig(
      props.input.controlName,
      displayName,
      displayNameStereo ?? "",
      props.input.stereoCoupled
    );
    
    // Update the store
    const index = rmeStore.inputs.findIndex(input => input.controlName === props.input.controlName);
    if (index !== -1) {
      if (props.input.stereoCoupled) {
        rmeStore.inputs[index].displayNameStereo = editedDisplayName.value;
      } else {
        rmeStore.inputs[index].displayName = editedDisplayName.value;
      }
    }
    
    console.log("Updated displayname for", props.input.controlName, 'to', editedDisplayName.value)
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to save display name:", error);
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  editedDisplayName.value = props.input.stereoCoupled ? props.input.displayNameStereo ?? "" : props.input.displayName;
};

</script>

<template>
    <div :class="$style.labelContainer">
      <p v-if="!isEditing" :class="$style.label" @click="startEditing">
        {{ input.stereoCoupled ? props.input.displayNameStereo ?? "" : props.input.displayName }}
      </p>
      <input
        v-else
        ref="inputRef"
        v-model="editedDisplayName"
        :class="$style.labelInput"
        @keyup.enter="saveChannelconfig"
        @keyup.esc="cancelEditing"
        @blur="saveChannelconfig"
      />
    </div>
</template>

<style module>
.labelContainer {
  width: 100%;
  text-align: center;
}

.label {
  cursor: pointer;
}

.labelInput {
  width: 134px;
  text-align: center;
  font-family: inherit;
  font-weight: inherit;
  font-size: inherit;
  padding: 2px;
  margin: 13px 0;
  border: 1px solid var(--channel-border-color);
  border-radius: 3px;
}
</style>