<script setup lang="ts">
import { ref } from 'vue';
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElSwitch,
} from 'element-plus';
import { useSaveHotkey } from '@/composables';
import SaveHotkeyDialogPanel from './save-hotkey-dialog-panel.vue';

defineOptions({ name: 'UseSaveHotkeyDemo' });

const title = ref('主表单标题');
const enabled = ref(true);
const active = ref(true);
const saveCount = ref(0);
const dialogVisible = ref(false);

const save = () => {
  saveCount.value += 1;
  ElMessage.success(`主表单保存 #${saveCount.value}`);
};

useSaveHotkey({ handler: save, enabled, active });
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">useSaveHotkey</h1>
      <p class="demo__desc">
        Ctrl/Cmd+S 与「保存」共用 handler。打开对话框后由嵌套组件抢占热键；关闭后回到本页。
      </p>
    </header>

    <div class="demo__toolbar">
      <label class="demo__control">
        <span>enabled</span>
        <el-switch v-model="enabled" />
      </label>
      <label class="demo__control">
        <span>active</span>
        <el-switch v-model="active" />
      </label>
      <el-button size="small" type="primary" @click="save">保存</el-button>
      <el-button size="small" @click="dialogVisible = true">打开对话框</el-button>
    </div>

    <p class="demo__status">主表单保存次数：{{ saveCount }}</p>

    <el-form label-width="72px" class="demo__form">
      <el-form-item label="标题">
        <el-input v-model="title" />
      </el-form-item>
    </el-form>

    <el-dialog v-model="dialogVisible" title="嵌套保存" width="420px">
      <SaveHotkeyDialogPanel v-if="dialogVisible" />
    </el-dialog>
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
