import { defineAsyncComponent } from 'vue';

const loadComponent = (name: string) =>
  defineAsyncComponent(() =>
    Promise.all([
      import(`../../node_modules/element-plus/es/components/${name}/index.mjs`),
      import(
        `../../node_modules/element-plus/es/components/${name}/style/css.mjs`
      ),
    ]).then(([mod]) => {
      const pascalName = `El${name
        .split('-')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join('')}`;
      return mod[pascalName] ?? mod.default;
    }),
  );

const ElInput = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/input/index'),
    import('element-plus/es/components/input/style/css'),
  ]).then(([res]) => res.ElInput),
);

const ElInputNumber = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/input-number/index'),
    import('element-plus/es/components/input-number/style/css'),
  ]).then(([res]) => res.ElInputNumber),
);

const ElSelect = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/select/index'),
    import('element-plus/es/components/select/style/css'),
  ]).then(([res]) => res.ElSelect),
);

const ElDatePicker = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/date-picker/index'),
    import('element-plus/es/components/date-picker/style/css'),
  ]).then(([res]) => res.ElDatePicker),
);

const ElTimePicker = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/time-picker/index'),

    import('element-plus/es/components/time-picker/style/css'),
  ]).then(([res]) => res.ElTimePicker),
);

const ElSwitch = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/switch/index'),
    import('element-plus/es/components/switch/style/css'),
  ]).then(([res]) => res.ElSwitch),
);

const ElCheckbox = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/checkbox/index'),
    import('element-plus/es/components/checkbox/style/css'),
  ]).then(([res]) => res.ElCheckbox),
);

const ElCascader = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/cascader/index'),
    import('element-plus/es/components/cascader/style/css'),
  ]).then(([res]) => res.ElCascader),
);

export default {
  Input: ElInput,
  InputNumber: ElInputNumber,
  Select: ElSelect,
  DatePicker: ElDatePicker,
  TimePicker: ElTimePicker,
  Switch: ElSwitch,
  Checkbox: ElCheckbox,
  Cascader: ElCascader,
};
