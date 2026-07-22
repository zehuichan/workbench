<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  exchangeWechatQrCode,
  useWechatQrAuth,
  type WechatQrToken,
} from '@/composables';
import { Button } from '@/ui/button';

defineOptions({ name: 'WechatQrAuthCallback' });

const router = useRouter();
const { code, stateValid, returnTo, clearCallbackParams } = useWechatQrAuth();

const exchanging = ref(false);
const token = ref<WechatQrToken | undefined>(undefined);
const exchangeError = ref<string | undefined>(undefined);
const savedReturnTo = ref<string | undefined>(undefined);
let exchangedFor: string | undefined;

watch(
  [stateValid, code],
  async ([valid, oauthCode]) => {
    if (valid !== true || !oauthCode) return;
    if (exchangedFor === oauthCode) return;
    exchangedFor = oauthCode;

    exchanging.value = true;
    exchangeError.value = undefined;
    try {
      savedReturnTo.value = returnTo.value;
      token.value = await exchangeWechatQrCode(oauthCode);
      clearCallbackParams();
    } catch (error) {
      exchangeError.value =
        error instanceof Error ? error.message : String(error);
    } finally {
      exchanging.value = false;
    }
  },
  { immediate: true },
);

function goReturnTo() {
  if (!savedReturnTo.value) return;
  void router.push(savedReturnTo.value);
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4 p-8">
    <h1 class="text-xl font-semibold">微信扫码回调</h1>
    <p class="text-sm text-muted-foreground">
      当前为 stub 换票（
      <code>exchangeWechatQrCode</code>
      ）。替换
      <code>exchange-wechat-qr-code.ts</code>
      即可对接真实后端。
    </p>

    <dl class="space-y-2 text-sm">
      <div>
        <dt class="text-muted-foreground">stateValid</dt>
        <dd>
          <code>{{ stateValid }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">code</dt>
        <dd>
          <code>{{ code ?? '—' }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">returnTo</dt>
        <dd>
          <code>{{ savedReturnTo ?? returnTo ?? '—' }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">exchanging</dt>
        <dd>
          <code>{{ exchanging }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">token</dt>
        <dd>
          <code>{{ token ? JSON.stringify(token) : '—' }}</code>
        </dd>
      </div>
      <div v-if="exchangeError">
        <dt class="text-muted-foreground">exchangeError</dt>
        <dd class="text-destructive">
          <code>{{ exchangeError }}</code>
        </dd>
      </div>
      <div v-if="stateValid === false">
        <dt class="text-muted-foreground">error</dt>
        <dd class="text-destructive">state 校验失败，未换票</dd>
      </div>
    </dl>

    <Button v-if="token && savedReturnTo" type="button" @click="goReturnTo">
      前往 {{ savedReturnTo }}
    </Button>
  </div>
</template>
