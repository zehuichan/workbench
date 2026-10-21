<script setup lang="ts">
import type { MockRecord } from './mock-records';

import type { PlusDialogAction } from '@/components/plus-dialog';

import { computed, onMounted, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoPage from '@/components/demo/demo-page.vue';
import { PlusDialog, useDialog } from '@/components/plus-dialog';
import { defineColumns, PlusTable } from '@/components/plus-table';

import {
  emptyRecord,
  fetchPage,
  getById,
  getTotal,
  insertRecord,
  removeRecord,
  updateRecord,
} from './mock-records';

defineOptions({ name: 'PlusDialogBasicDemo' });

const page = ref(1);
const pageSize = ref(5);
const total = ref(0);
const pageRows = ref<MockRecord[]>([]);
const listLoading = ref(false);

const flags = reactive({
  canEdit: true,
  canRemove: true,
  canView: true,
  showDrill: true,
  showRowOp: true,
});

async function loadPage(nextPage: number) {
  page.value = nextPage;
  listLoading.value = true;
  try {
    const result = await fetchPage(nextPage, pageSize.value);
    pageRows.value = result.rows;
    total.value = result.total;
  } finally {
    listLoading.value = false;
  }
}

onMounted(() => {
  void loadPage(page.value);
});

const { bindings, form, open, openCreate } = useDialog(
  { page, pageSize, rows: pageRows, total, loadPage },
  {
    empty: emptyRecord,
    fetch: (row) => getById(row.id),
    save: updateRecord,
    create: async ({ amount, name, note, owner }) => {
      await insertRecord({ amount, name, note, owner });
    },
    remove: removeRecord,
  },
);

const columns = defineColumns<MockRecord>([
  { type: 'index', label: '#', width: 60 },
  { prop: 'name', label: '名称', minWidth: 140 },
  { prop: 'owner', label: '负责人', width: 100 },
  { prop: 'amount', label: '金额', width: 100 },
  {
    prop: 'id',
    label: '操作',
    width: 140,
    fixed: 'right',
  },
]);

function validate(): boolean {
  if (!form.value.name.trim()) {
    ElMessage.warning('请填写名称');
    return false;
  }
  return true;
}

const permissions = computed(() => ({
  view: flags.canView,
  edit: flags.canEdit,
  remove: flags.canRemove,
}));

const actions = computed((): PlusDialogAction<MockRecord>[] => {
  const list: PlusDialogAction<MockRecord>[] = [];
  if (flags.showRowOp) {
    list.push({
      key: 'archive',
      label: '归档',
      when: (row) => row.amount > 0,
      fallback: 'disable',
      handler: () => {
        ElMessage.success('已触发归档（演示）');
      },
    });
  }
  if (flags.showDrill) {
    list.push({
      key: 'drill',
      label: '关联单据',
      handler: () => {
        ElMessage.info('打开关联列表（演示，当前弹框不关）');
      },
    });
  }
  return list;
});

function handlePageChange(payload: { page: number; pageSize: number }) {
  pageSize.value = payload.pageSize;
  void loadPage(payload.page);
}
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      列表打开同一
      <code>PlusDialog</code>
      承载查看、编辑与新建。标题栏含翻页、查看/编辑切换、删除与三种形态；底栏按场景增减按钮。形态切换保留已填内容，并记住上次选择。
      <code>useDialog</code> 把分页列表接到弹框，宿主只写列表与接口。
    </template>

    <template #api>
      <DemoApiTable title="PlusDialog Props">
        <tr>
          <td><code>v-model</code></td>
          <td><code>boolean</code></td>
          <td>弹框可见。</td>
        </tr>
        <tr>
          <td><code>v-model:mode</code></td>
          <td><code>'view' | 'edit' | 'create'</code></td>
          <td>当前角色。</td>
        </tr>
        <tr>
          <td><code>v-model:index</code></td>
          <td><code>number | undefined</code></td>
          <td>整表 0 起位置；新建为 <code>undefined</code>。</td>
        </tr>
        <tr>
          <td><code>v-model:form</code></td>
          <td><code>T</code></td>
          <td>表单模型。</td>
        </tr>
        <tr>
          <td><code>total</code></td>
          <td><code>number</code></td>
          <td>整表条数，供翻页显示。</td>
        </tr>
        <tr>
          <td><code>load</code></td>
          <td><code>(index) =&gt; Promise&lt;T&gt;</code></td>
          <td>按整表位置拉数；宿主负责跨页切页。</td>
        </tr>
        <tr>
          <td><code>save</code> / <code>create</code> / <code>remove</code></td>
          <td><code>(form) =&gt; Promise&lt;…&gt;</code></td>
          <td>持久化回调；保存须返回已落库记录以重建表单。</td>
        </tr>
        <tr>
          <td><code>permissions</code></td>
          <td><code>{ view?, edit?, remove? }</code></td>
          <td>标题栏记录操作显隐。</td>
        </tr>
        <tr>
          <td><code>actions</code></td>
          <td><code>PlusDialogAction[]</code></td>
          <td>底栏业务按钮；新建不显示。</td>
        </tr>
      </DemoApiTable>
      <DemoApiTable title="useDialog(list, api)">
        <tr>
          <td><code>list</code></td>
          <td>
            <code>{ page, pageSize, rows, total, loadPage }</code>
          </td>
          <td>
            宿主的服务端分页列表；跨页翻记录时经 <code>loadPage</code> 切页。
          </td>
        </tr>
        <tr>
          <td><code>api</code></td>
          <td>
            <code>{ empty, fetch, save?, create?, remove? }</code>
          </td>
          <td><code>fetch</code> 按行取完整记录；增删改后自动重载当前页。</td>
        </tr>
        <tr>
          <td><code>bindings</code></td>
          <td><code>DialogBindings</code></td>
          <td>
            整体 <code>v-bind</code> 到 <code>PlusDialog</code>，替代上表的
            v-model、<code>total</code>、<code>load</code>
            与持久化回调。
          </td>
        </tr>
        <tr>
          <td><code>open</code> / <code>openCreate</code></td>
          <td><code>(row, 'view' | 'edit')</code> / <code>()</code></td>
          <td>打开当前页某行或空白新建；查看态再点另一行装入同一弹框。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock>
      <template #hint>
        点行上「查看 /
        编辑」或工具栏「新建」。改字段后关弹框、翻页、切查看会询问是否放弃；刷新与删除不会。侧边面板查看态可继续点列表另一行，装入同一面板。
      </template>

      <div class="demo__toolbar">
        <label class="demo__control">
          <span>可查看</span>
          <el-switch v-model="flags.canView" />
        </label>
        <label class="demo__control">
          <span>可编辑</span>
          <el-switch v-model="flags.canEdit" />
        </label>
        <label class="demo__control">
          <span>可删除</span>
          <el-switch v-model="flags.canRemove" />
        </label>
        <label class="demo__control">
          <span>归档按钮</span>
          <el-switch v-model="flags.showRowOp" />
        </label>
        <label class="demo__control">
          <span>关联单据</span>
          <el-switch v-model="flags.showDrill" />
        </label>
      </div>

      <PlusTable
        :data="pageRows"
        :columns="columns"
        row-key="id"
        mode="none"
        border
        :loading="listLoading"
        :total="total"
        :page="page"
        :page-size="pageSize"
        :page-sizes="[5, 10]"
        @page-change="handlePageChange"
      >
        <template #title>记录列表（共 {{ getTotal() }} 条）</template>
        <template #toolbar>
          <el-button type="primary" @click="openCreate">新建</el-button>
        </template>
        <template #cell-id="{ row }">
          <el-button link type="primary" @click="open(row, 'view')">
            查看
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="!flags.canEdit"
            @click="open(row, 'edit')"
          >
            编辑
          </el-button>
        </template>
      </PlusTable>
    </DemoBlock>

    <PlusDialog
      v-bind="bindings"
      :validate="validate"
      :permissions="permissions"
      :actions="actions"
    >
      <template #default="{ readonly, loading, submitting }">
        <el-form
          label-width="72px"
          :disabled="readonly || loading || submitting"
          @submit.prevent
        >
          <el-form-item label="名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="form.owner" />
          </el-form-item>
          <el-form-item label="金额">
            <el-input-number v-model="form.amount" :controls="false" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.note" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
      </template>
    </PlusDialog>
  </DemoPage>
</template>
