<script setup lang="ts">
// Your script setup code here
</script>

<template>
  <div :class="$style.faderThumb">
    <div :class="$style.grooveDummy"></div>
    <div :class="$style.groove"></div>
    <div :class="$style.groove"></div>
    <div :class="$style.thumbCenterLine"></div>
    <div :class="$style.groove"></div>
    <div :class="$style.groove"></div>
    <div :class="$style.grooveDummy"></div>
  </div>
</template>

<style module>
.faderThumb {
  width: 40px;
  height: 70px;
  background: linear-gradient(to bottom, 
    #585858 0%,
    #333333 20%,
    #252525 40%,
    #3a3a3a 60%,
    #4a4a4a 80%,
    #2c2c2c 100%
  );
  border-radius: 4px;
  cursor: ns-resize;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  user-select: none; 
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.thumbCenterLine {
  height: 2px;
  background-color: rgba(224, 224, 224, 0.486);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.groove {
  background-color: rgba(131, 131, 131, 0.5);
  height: 1px;
  width: 70%;
  align-self: center;
}

.grooveDummy {
  height: 1px;
}
</style>