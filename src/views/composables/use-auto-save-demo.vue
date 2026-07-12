<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElSwitch,
} from 'element-plus';
import { useAutoSave } from '@/composables';

defineOptions({ name: 'UseAutoSaveDemo' });

interface FormState {
  title: string;
  note: string;
}

const form = ref<FormState>({ title: '草稿标题', note: '' });
const serverSnapshot = ref<FormState | null>(null);
const enabled = ref(true);
const debounceMs = ref(500);

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const { status, lastSavedAt, error, flush, withPaused } = useAutoSave({
  source: form,
  enabled,
  debounceMs,
  save: async (value) => {
    await delay(400);
    serverSnapshot.value = structuredClone(value);
  },
});

const lastSavedLabel = computed(() => {
  if (lastSavedAt.value === null) return '—';
  return new Date(lastSavedAt.value).toLocaleTimeString();
});

const errorLabel = computed(() => {
  if (error.value == null) return '—';
  return error.value instanceof Error
    ? error.value.message
    : String(error.value);
});

async function handleFlush() {
  await flush();
}

async function handlePausedEdit() {
  await withPaused(async () => {
    form.value = {
      ...form.value,
      note: `${form.value.note}[paused]`,
    };
    await delay(300);
  });
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">useAutoSave</h1>
      <p class="demo__desc">
        防抖自动保存到模拟服务端；可切换 debounce、暂停编辑、立即 Flush。
      </p>
    </header>

    <div class="demo__toolbar">
      <label class="demo__control">
        <span>enabled</span>
        <el-switch v-model="enabled" />
      </label>
      <label class="demo__control">
        <span>debounceMs</span>
        <el-radio-group v-model="debounceMs" size="small">
          <el-radio-button :value="500">500</el-radio-button>
          <el-radio-button :value="1500">1500</el-radio-button>
        </el-radio-group>
      </label>
      <el-button size="small" type="primary" @click="handleFlush">
        Flush
      </el-button>
      <el-button size="small" @click="handlePausedEdit">withPaused 编辑</el-button>
    </div>

    <p class="demo__status">
      status: <strong>{{ status }}</strong> · lastSavedAt:
      {{ lastSavedLabel }} · error: {{ errorLabel }}
    </p>

    <el-form label-width="72px" class="demo__form">
      <el-form-item label="标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.note" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <div class="demo__snapshot">
      <div class="demo__snapshot-title">服务端快照</div>
      <pre>{{ serverSnapshot ? JSON.stringify(serverSnapshot, null, 2) : '（尚未保存）' }}</pre>
    </div>
  </section>
</template>

<style scoped>
.demo__header {
  margin-bottom: 16px;
}

.demo__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.demo__desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin-bottom: 12px;
}

.demo__control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.demo__status {
  margin: 0 0 16px;
  font-size: 13px;
  color: #606266;
}

.demo__form {
  max-width: 480px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.demo__snapshot {
  max-width: 480px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.demo__snapshot-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.demo__snapshot pre {
  margin: 0;
  font-size: 12px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
