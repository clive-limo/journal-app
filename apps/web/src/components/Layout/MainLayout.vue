<template>
  <div class="h-full w-full overflow-x-hidden bg-black">
    <div
      class="absolute -top-10 md:-top-20 ld:-top-40 left-1/2 transform -translate-x-1/2 pointer-events-none"
    >
      <div
        class="rounded-full h-[550px] w-[350px] md:size-[650px] lg:size-[850px] bg-[radial-gradient(circle_at_center,_orange,_white)] opacity-35"
      />
    </div>
    <slot class="z-10 overflow-hidden" />
  </div>
</template>

<style scoped></style>
