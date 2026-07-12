<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElSwitch,
} from 'element-plus';
import { useFormDraft } from '@/composables';

defineOptions({ name: 'UseFormDraftDemo' });

const DRAFT_KEY = 'composables-demo:form-draft';

interface FormState {
  name: string;
  email: string;
  remark: string;
}

const defaults: FormState = { name: '', email: '', remark: '' };
const form = ref<FormState>({ ...defaults });
const enabled = ref(true);

const { error, isPending, restore, clear, flush } = useFormDraft({
  form,
  key: DRAFT_KEY,
  enabled,
  defaults,
  debounceMs: 500,
});

const errorLabel = computed(() => {
  if (error.value == null) return '—';
  return error.value instanceof Error
    ? error.value.message
    : String(error.value);
});

function handleRestore() {
  const ok = restore();
  ElMessage[ok ? 'success' : 'info'](ok ? '已恢复草稿' : '无草稿可恢复');
}

function handleClear() {
  clear();
  ElMessage.success('已清除草稿');
}

function handleFlush() {
  const ok = flush();
  ElMessage[ok ? 'success' : 'warning'](ok ? '已立即写入' : '未写入');
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">useFormDraft</h1>
      <p class="demo__desc">
        表单变更 debounce 写入 localStorage（key:
        {{ DRAFT_KEY }}）。刷新后需手动 Restore，避免静默覆盖。
      </p>
    </header>

    <div class="demo__toolbar">
      <label class="demo__control">
        <span>enabled</span>
        <el-switch v-model="enabled" />
      </label>
      <el-button size="small" type="primary" @click="handleRestore">
        Restore
      </el-button>
      <el-button size="small" @click="handleFlush">Flush</el-button>
      <el-button size="small" @click="handleClear">Clear</el-button>
    </div>

    <p class="demo__status">
      isPending: <strong>{{ isPending }}</strong> · error: {{ errorLabel }}
    </p>

    <el-form label-width="72px" class="demo__form">
      <el-form-item label="姓名">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
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
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}
</style>
