import { defineComponent } from 'vue';

import { isFunction } from '@/utils';

export default defineComponent({
  name: 'Renderer',
  props: {
    render: {
      type: [Function, Object],
      default: undefined,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    return () => (
      <>{isFunction(props.render) ? props.render(props.data) : props.render}</>
    );
  },
});
