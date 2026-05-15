<!-- components/interview/InterviewTranscript.vue -->
<script setup lang="ts">
const props = defineProps<{
  turns: Array<{ role: 'assistant' | 'user'; content: string; turnIndex: number }>
}>()

const scrollEl = ref<HTMLElement | null>(null)

watch(() => props.turns.length, async () => {
  await nextTick()
  scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight, behavior: 'smooth' })
})
</script>

<template>
  <div ref="scrollEl" class="iv-transcript">
    <div class="iv-transcript-inner">
      <InterviewTurnCard
        v-for="turn in turns"
        :key="turn.turnIndex"
        :role="turn.role"
        :content="turn.content"
        :turn-index="turn.turnIndex"
      />
    </div>
  </div>
</template>

<style scoped>
.iv-transcript {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg, #f8fafc);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border, #e2e8f0) transparent;
}

.iv-transcript::-webkit-scrollbar { width: 4px; }
.iv-transcript::-webkit-scrollbar-track { background: transparent; }
.iv-transcript::-webkit-scrollbar-thumb { background: var(--color-border, #e2e8f0); border-radius: 4px; }

.iv-transcript-inner {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
}
</style>
