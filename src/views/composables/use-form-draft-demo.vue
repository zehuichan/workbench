<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useFormDraft } from '@/composables';
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoPage from '@/components/demo/demo-page.vue';

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
const omitRemark = ref(false);

const { error, isPending, restore, clear, flush, withPaused } = useFormDraft(form, DRAFT_KEY, {
  enabled,
  defaults,
  omit: () => (omitRemark.value ? (['remark'] as const) : []),
  debounceMs: 500,
});

const errorLabel = computed(() => {
  if (error.value == null) return '—';
  return error.value instanceof Error ? error.value.message : String(error.value);
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

async function handleSimulateServerLoad() {
  await withPaused(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    form.value = {
      name: '服务端姓名',
      email: 'server@example.com',
      remark: '服务端备注（异步子字段）',
    };
    restore({
      merge: (draft, current, fallback) => {
        const next = { ...fallback, ...current };
        for (const [key, value] of Object.entries(draft)) {
          if (value == null || value === '') continue;
          next[key as keyof FormState] = value as never;
        }
        return next;
      },
    });
  });
  // Simulate a late child write after withPaused ends (e.g. listOrders fetch).
  setTimeout(() => {
    form.value.remark = `${form.value.remark} · 迟到回写`;
  }, 50);
  ElMessage.success('已模拟服务端加载；迟到回写在 omit remark 开启时不会产生幻影草稿');
}
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      把表单对象 debounce 写入
      <code>localStorage</code>，用于崩溃/刷新后恢复。
      <strong>恢复必须显式调用</strong>
      <code>restore()</code>，且应在
      <code>withPaused</code>
      内先加载服务端数据再恢复，避免本地草稿静默覆盖服务端字段。
    </template>

    <template #api>
      <DemoApiTable title="Options">
        <tr>
          <td><code>form</code></td>
          <td><code>Ref&lt;T&gt;</code></td>
          <td>必填。可变表单状态，须为可 JSON 序列化的普通对象。</td>
        </tr>
        <tr>
          <td><code>key</code></td>
          <td><code>MaybeRefOrGetter&lt;string&gt;</code></td>
          <td>必填。完整 storage key。key 变化不会自动迁移旧数据。</td>
        </tr>
        <tr>
          <td><code>enabled</code></td>
          <td><code>MaybeRefOrGetter&lt;boolean&gt;</code></td>
          <td>默认 <code>true</code>。为 false 时不写入。</td>
        </tr>
        <tr>
          <td><code>defaults</code></td>
          <td><code>MaybeRefOrGetter&lt;Partial&lt;T&gt;&gt;</code></td>
          <td>可选。Restore 时浅合并到底层（草稿覆盖其上）。</td>
        </tr>
        <tr>
          <td><code>omit</code></td>
          <td><code>MaybeRefOrGetter&lt;ReadonlyArray&lt;keyof T&gt;&gt;</code></td>
          <td>可选。永不持久化、也不恢复的字段（如服务端托管集合）。</td>
        </tr>
        <tr>
          <td><code>debounceMs</code></td>
          <td><code>MaybeRefOrGetter&lt;number&gt;</code></td>
          <td>默认 <code>500</code>。变更后多久写入。</td>
        </tr>
        <tr>
          <td><code>onError</code></td>
          <td><code>(error: unknown) =&gt; void</code></td>
          <td>可选。key / 序列化 / storage 失败回调。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Returns">
        <tr>
          <td><code>isPending</code></td>
          <td><code>Ref&lt;boolean&gt;</code></td>
          <td>是否仍在 debounce 等待写入。</td>
        </tr>
        <tr>
          <td><code>error</code></td>
          <td><code>Ref&lt;unknown | null&gt;</code></td>
          <td>最近一次失败原因。</td>
        </tr>
        <tr>
          <td><code>restore</code></td>
          <td><code>(options?) =&gt; boolean</code></td>
          <td>
            读取当前 key 的草稿并合并进 form；可传
            <code>merge(draft, current, defaults)</code>
            。无草稿返回 false。
          </td>
        </tr>
        <tr>
          <td><code>clear</code></td>
          <td><code>() =&gt; boolean</code></td>
          <td>删除当前 key 的草稿。</td>
        </tr>
        <tr>
          <td><code>flush</code></td>
          <td><code>() =&gt; boolean</code></td>
          <td>取消 debounce，立即写入当前 form（不受基线跳过影响）。</td>
        </tr>
        <tr>
          <td><code>withPaused</code></td>
          <td><code>(task) =&gt; Promise&lt;R&gt;</code></td>
          <td>
            执行期间忽略 form 变更；最外层退出时记录干净基线，之后与基线相同的 debounce
            写入会被跳过。
          </td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock>
      <template #hint>
        <ol class="demo__rules">
          <li>先在 <code>withPaused</code> 内加载服务端数据，再调用 <code>restore</code>。</li>
          <li>
            异步子组件（如列表）可能在 pause 结束后才回写：配合
            <code>omit</code>
            与基线，避免写成幻影草稿。
          </li>
          <li>服务端托管字段放进 <code>omit</code>，不要让旧草稿冲掉它们。</li>
        </ol>
        编辑表单 → 等 debounce 或点 Flush → 刷新页面 → 点 Restore 回填。当前 key：
        <code>{{ DRAFT_KEY }}</code>
      </template>

      <div class="demo__toolbar">
        <label class="demo__control">
          <span>enabled</span>
          <el-switch v-model="enabled" />
        </label>
        <label class="demo__control">
          <span>omit remark</span>
          <el-switch v-model="omitRemark" />
        </label>
        <el-button size="small" type="primary" @click="handleRestore"> Restore </el-button>
        <el-button size="small" @click="handleFlush">Flush</el-button>
        <el-button size="small" @click="handleClear">Clear</el-button>
        <el-button size="small" @click="handleSimulateServerLoad">模拟服务端加载</el-button>
      </div>

      <p class="demo__status">
        isPending: <strong>{{ isPending }}</strong> · error: {{ errorLabel }}
      </p>

      <div class="demo__panels">
        <el-form label-width="72px" class="demo__form">
          <el-form-item label="姓名">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="4" />
          </el-form-item>
        </el-form>

        <div class="demo__panel">
          <div class="demo__panel-title">当前 form</div>
          <pre class="demo__pre">{{ JSON.stringify(form, null, 2) }}</pre>
        </div>
      </div>
    </DemoBlock>
  </DemoPage>
</template>

<style scoped>
.demo__rules {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
}

.demo__rules li + li {
  margin-top: 0.25rem;
}
</style>
