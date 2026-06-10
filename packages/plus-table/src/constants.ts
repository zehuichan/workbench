import type { InjectionKey } from 'vue';
import type { TableEngine } from './engine';

export const PLUS_TABLE_INJECTION_KEY: InjectionKey<TableEngine> = Symbol('plus-table');

export const SETTINGS_STORAGE_PREFIX = 'plus-table:settings:';
