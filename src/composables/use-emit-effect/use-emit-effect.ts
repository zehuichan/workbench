import { cloneDeep } from 'es-toolkit';
import { ref, type Ref } from 'vue';
import {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  removeLineMutation,
  type DetailChangeCommand,
  type DocumentDraft,
  type DocumentLine,
  type EmitEffectConfirmation,
  type EmitEffectMutation,
  type EmitEffectRules,
} from './emit-effect';

export interface UseEmitEffectOptions<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  rules: EmitEffectRules<H, L>;
  initialDraft: DocumentDraft<H, L>;
  confirm?: (
    confirmation: EmitEffectConfirmation,
  ) => boolean | Promise<boolean>;
}

export interface UseEmitEffectReturn<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  draft: Ref<DocumentDraft<H, L>>;
  changeHeader: (field: string, value: unknown) => Promise<boolean>;
  changeCell: (command: DetailChangeCommand) => Promise<boolean>;
  addLine: (id: string) => void;
  removeLine: (id: string) => void;
  reset: (next?: DocumentDraft<H, L>) => void;
}

export function useEmitEffect<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
>(options: UseEmitEffectOptions<H, L>): UseEmitEffectReturn<H, L> {
  const initial = cloneDeep(options.initialDraft);
  const draft = ref(cloneDeep(initial)) as Ref<DocumentDraft<H, L>>;

  async function commit(mutation: EmitEffectMutation): Promise<boolean> {
    if (mutation.confirmation) {
      const accepted = await (options.confirm?.(mutation.confirmation) ?? true);
      if (!accepted) return false;
    }
    draft.value = mutation.nextDraft as DocumentDraft<H, L>;
    return true;
  }

  return {
    draft,
    changeHeader: (field, value) =>
      commit(buildHeaderMutation(options.rules, draft.value, field, value)),
    changeCell: (command) =>
      commit(applyDetailMutation(options.rules, draft.value, command)),
    addLine: (id) => {
      draft.value = addLineMutation(options.rules, draft.value, id)
        .nextDraft as DocumentDraft<H, L>;
    },
    removeLine: (id) => {
      draft.value = removeLineMutation(options.rules, draft.value, id)
        .nextDraft as DocumentDraft<H, L>;
    },
    reset: (next) => {
      draft.value = cloneDeep(next ?? initial);
    },
  };
}
