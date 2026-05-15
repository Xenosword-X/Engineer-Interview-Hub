<!-- components/interview/InterviewTurnCard.vue -->
<script setup lang="ts">
defineProps<{
  role: 'assistant' | 'user'
  content: string
  turnIndex: number
}>()
</script>

<template>
  <div :class="['iv-turn', role === 'user' && 'iv-turn--user']">

    <div :class="['iv-avatar', role === 'user' && 'iv-avatar--user']">
      <svg v-if="role === 'assistant'" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
      <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>

    <div :class="['iv-bubble', role === 'user' && 'iv-bubble--user']">
      {{ content }}
    </div>

  </div>
</template>

<style scoped>
.iv-turn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: iv-turn-in 0.22s ease-out both;
}

.iv-turn--user { flex-direction: row-reverse; }

@keyframes iv-turn-in {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}

.iv-avatar {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light, #eef2ff);
  color: var(--color-primary, #6366f1);
  border: 1px solid var(--color-primary-border, #c7d2fe);
}

.iv-avatar--user {
  background: var(--color-primary, #6366f1);
  color: white;
  border-color: var(--color-primary, #6366f1);
}

.iv-bubble {
  max-width: min(78%, 520px);
  padding: 10px 14px;
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--color-text-primary, #0f172a);
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-left: 2px solid var(--color-primary-border, #c7d2fe);
}

.iv-bubble--user {
  border-radius: 14px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 14px;
  background: var(--color-primary, #6366f1);
  border: 1px solid var(--color-primary, #6366f1);
  color: #ffffff;
}
</style>
