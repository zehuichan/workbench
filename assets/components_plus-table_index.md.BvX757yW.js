import{A as e,B as t,D as n,G as r,H as i,I as a,St as o,T as s,U as c,V as l,Vt as u,W as d,X as f,Yt as p,_ as m,a as h,b as g,d as _,et as v,f as y,gt as b,it as x,k as S,m as C,p as w,pt as T,qt as E,rt as D,t as O,u as k,v as A,vt as ee,w as j,x as M,xt as N,y as P,z as F}from"./chunks/plugin-vue_export-helper.lnNjcNWu.js";import{Gt as I,Kt as L,Nt as R,Pt as z,pt as B,s as V}from"./chunks/weekYear.Bk__H43W.js";import{a as te,c as H,d as U,i as ne,l as re,o as ie,r as W,s as ae,u as oe}from"./chunks/es.CSN_S0vU.js";import{i as se,n as ce,r as G,t as le}from"./chunks/cloneDeep.CeysB45J.js";const ue=[`selection`,`index`,`expand`],de=Symbol(`PlusTable`);function K(e){let t=e.type;return!!t&&ue.includes(t)}function q(e){let t=[];for(let n of e)n.children?.length?t.push(...q(n.children)):n.prop&&t.push(n);return t}var fe={expand:`展开`,selection:`选择`,index:`序号`};function pe(e){if(e.label)return e.label;if(e.prop)return e.prop;let t=e.type;return t&&t in fe?fe[t]??String(t):e.children?.length?e.label??`分组`:`列`}function J(e){if(e.prop)return e.prop;let t=e.label??e.type??`unknown`;if(e.children?.length)return`_group:${t}`;let n=e.type;return n?`_col:${n}:${String(t)}`:`_col:${String(t)}`}function Y(e){return e.children?.length?e.children.flatMap(Y):e.prop?[e.prop]:[]}function X(e,t,n=0){let r=n===0,i=[];for(let a of e){if(K(a))continue;let e=J(a),o=pe(a);if(a.children?.length){let s=X(a.children,t,n+1);i.push({column:a,id:e,label:o,depth:n,children:s,isTopLevel:r})}else i.push({column:a,id:e,label:o,depth:n,isTopLevel:r})}if(r&&t.length>0){let e=new Map(t.map((e,t)=>[e,t])),n=t=>e.get(t.id)??9999;i.sort((e,t)=>n(e)-n(t))}return i}function me(e){return e.map(e=>e.id)}function he(e){return e.map(e=>J(e))}function ge(e){let t=[];for(let n of e)K(n)&&t.push(J(n));return t}function Z(e){let t=[];for(let n of e)n.children?.length?t.push(...Z(n.children)):n.column.prop&&t.push(n);return t}function _e(e){let t=[];for(let n of e)t.push(n),n.children?.length&&t.push(..._e(n.children));return t}function ve(e,t){if(t.length===0)return e;let n=new Map(t.map((e,t)=>[e,t])),r=e=>n.get(J(e))??9999;return[...e].sort((e,t)=>r(e)-r(t))}var ye=`input, textarea, [contenteditable="true"]`;function be(t){return()=>{e(()=>{e(()=>{let e=t.value;if(!e)return;let n=e.querySelector(`td.plus-table-cell--active`)?.querySelector(ye)??e.querySelector(ye);n&&document.activeElement!==n&&n.focus()})})}}function xe(e,t){let n=t.toLowerCase().split(`+`).map(e=>e.trim()),r=n.find(e=>![`ctrl`,`shift`,`alt`,`meta`].includes(e));return r?e.ctrlKey===n.includes(`ctrl`)&&e.shiftKey===n.includes(`shift`)&&e.altKey===n.includes(`alt`)&&e.metaKey===n.includes(`meta`)&&e.key.toLowerCase()===r:!1}function Se(e){return e.ctrlKey||e.altKey||e.metaKey?!1:e.key.length===1}function Ce(e){let t=e.getBoundingClientRect(),n=getComputedStyle(e),r=parseFloat(n.marginTop)||0,i=parseFloat(n.marginBottom)||0;return t.height+r+i}function we(t){let{adaptive:n,wrapperEl:r}=t,i=T(void 0),o=k(()=>!!n.value),s=k(()=>{let e=n.value;return!e||e===!0?{}:e}),c=e=>{let t=0,n=getComputedStyle(e);t+=parseFloat(n.marginBottom)||0;let r=e.parentElement;if(r){let e=getComputedStyle(r);t+=parseFloat(e.paddingBottom)||0,t+=parseFloat(e.borderBottomWidth)||0}let i=new Set,a=e.nextElementSibling;for(;a;){i.add(a);let e=a.getBoundingClientRect(),n=getComputedStyle(a);t+=e.height,t+=parseFloat(n.marginTop)||0,t+=parseFloat(n.marginBottom)||0,a=a.nextElementSibling}if(s.value.excludeSelectors?.length&&r)for(let n of s.value.excludeSelectors){let a=r.querySelector(n);a&&a!==e&&!i.has(a)&&(t+=a.getBoundingClientRect().height)}return t},l=()=>{if(!o.value){i.value=``;return}let e=r.value;if(!e)return;let t=e.getBoundingClientRect(),n=window.innerHeight,a=s.value.offsetTop??0,l=s.value.offsetBottom??0,u=c(e),d=0,f=e.querySelector(`.plus-table-header`),p=e.querySelector(`.plus-table-footer`);f&&(d+=Ce(f)),p&&(d+=Ce(p));let m=n-t.top-a-l-u-d;i.value=Math.max(m,100)},u=z(l,100);return B(window,`resize`,()=>{o.value&&u()}),v(r,t=>{t&&o.value&&e(l)}),v([o,s],()=>{o.value&&r.value?e(l):o.value||l()}),a(()=>{o.value&&e(l)}),{maxHeight:i,recalculate:l}}var Te={disabled:!1};function Ee(e){let t=new Map,n=q(e);for(let e of n){let n=e.dependencies;if(n?.triggerFields?.length)for(let r of n.triggerFields)t.has(r)||t.set(r,[]),t.get(r).push({column:e,dep:n})}return t}function De(e){let{columns:t,data:n,markDirty:r}=e,i=k(()=>Ee(t.value)),a=!1;function o(e,t,n,i){return{rowIndex:e,row:t,column:n,getFieldValue:e=>t[e],setFieldValue:(n,a)=>{t[n]=a,r?.(e,n),i?.(e,n)}}}function s(e,t){let r=t.dependencies;if(!r)return Te;let i=n.value[e];if(!i)return Te;let a=o(e,i,t);return{disabled:r.disabled?r.disabled(i,a):!1,required:r.required?r.required(i,a):void 0,rules:r.rules?r.rules(i,a):void 0,componentProps:r.componentProps?r.componentProps(i,a):void 0}}function c(e,t){if(a)return;let s=n.value[e];if(!s)return;let c=i.value.get(t);if(c?.length){a=!0;try{for(let{column:t,dep:n}of c)if(n.trigger){let i=o(e,s,t,r??void 0);n.trigger.call(null,s,i)}}finally{a=!1}}}return{resolveDependencyState:s,onFieldChange:c,triggerMap:i}}function Oe(e){let{confirmEdit:t,undo:n,redo:r,markDirty:i,pushChange:a,onFieldChange:o,validateOnCellExit:s,validateFieldsAffectedByChange:c}=e;function l(){let e=t();if(!e)return null;a(e);for(let t of e)i(t.rowIndex,t.colProp),o(t.rowIndex,t.colProp),s.value&&c(t.rowIndex,t.colProp).catch(e=>{});return e}function u(){let e=n();e&&e.forEach(e=>i(e.rowIndex,e.colProp))}function d(){let e=r();e&&e.forEach(e=>i(e.rowIndex,e.colProp))}return{commitEdit:l,undo:u,redo:d}}function ke(e){let{cellActive:t,rowActive:n,activeRowIndex:r,activeColIndex:i,dirtyCells:a,getCellClassName:o,getRowClassName:s,getErrorForCell:c,isCellDirty:l,isRowDirty:u}=e;function d(e){let t=[],n=o(e);n&&t.push(n);let r=e.column?.property,i=e.rowIndex;return r&&c(i,r)&&t.push(`plus-table-cell--error`),r&&l(i,r)&&t.push(`plus-table-cell--dirty`),t.join(` `)}function f(e){let t=[],n=s(e);return n&&t.push(n),u(e.rowIndex)&&t.push(`plus-table-row--dirty`),t.join(` `)}let p=k(()=>[r.value,i.value,a.value]);return{rowClassNameBinding:k(()=>p.value&&n.value?f:void 0),cellClassNameBinding:k(()=>p.value&&t.value?d:void 0)}}function Ae(e){return!(e.hidden||K(e))}function je(t){let{data:n,visibleColumns:r,tableRef:i}=t,a=T(-1),o=T(-1),s=k(()=>q(r.value).filter(Ae)),c=k(()=>{let e=new Map;return n.value.forEach((t,n)=>e.set(t,n)),e}),l=k(()=>o.value>=0?s.value[o.value]??null:null),u=k(()=>a.value>=0?n.value[a.value]??null:null),d=k(()=>a.value>=0&&o.value>=0);function f(){e(()=>{let e=i.value?.$el;e&&e.querySelector(`td.plus-table-cell--active`)?.scrollIntoView({block:`nearest`,inline:`nearest`})})}function p(e,t){let r=n.value.length,i=s.value.length;r===0||i===0||(a.value=Math.max(0,Math.min(e,r-1)),o.value=Math.max(0,Math.min(t,i-1)),f())}function m(e,t){let r=n.value.length,i=s.value.length;if(r===0||i===0)return;let c=a.value<0?0:a.value+e,l=o.value<0?0:o.value+t;l<0?(--c,l=i-1):l>=i&&(c+=1,l=0),c=Math.max(0,Math.min(c,r-1)),a.value=c,o.value=l,f()}function h(e,t){if(!t||t?.type&&K({type:t.type}))return;let n=c.value.get(e)??-1;if(n<0)return;let r=s.value.findIndex(e=>e.prop===t.property);r<0||(a.value=n,o.value=r)}function g({row:e,column:t}){if(!d.value)return``;let n=u.value;return n!=null&&e===n&&t.property===l.value?.prop?`plus-table-cell--active`:``}function _({row:e}){let t=u.value;return t!=null&&e===t?`plus-table-row--active`:``}return{activeRowIndex:a,activeColIndex:o,navigableColumns:s,activeRow:u,activeColumn:l,hasActiveCell:d,navigate:m,focusCell:p,scrollToActiveCell:f,handleCellClick:h,getCellClassName:g,getRowClassName:_}}function Me(e){let{wrapperEl:t,hotkeyEnabled:n,navigate:r,focusCell:i,activeRowIndex:a,activeColIndex:o,data:s,navigableColumns:c,customHotkeys:l,editMode:u,autoTriggerEnabled:d,isEditing:f,editingRowIndex:p,startEdit:m,confirmEdit:h,cancelEdit:g,updateCellValue:_,isCellEditable:v,undo:y,redo:b,canUndo:x,canRedo:S}=e,C=T(!1),w=k(()=>l?.value?.filter(e=>e.override)??[]),E=k(()=>l?.value?.filter(e=>!e.override)??[]);B(t,`focusin`,()=>{C.value=!0}),B(t,`focusout`,e=>{let n=e.relatedTarget;t.value?.contains(n)||n?.closest(`.el-popper, .el-select__popper, .el-picker__popper`)||(C.value=!1)});let D=be(t);function O(e){return{event:e,activeRowIndex:a.value,activeColIndex:o.value,row:a.value>=0?s.value[a.value]??null:null,column:o.value>=0?c.value[o.value]??null:null,tableData:s.value,columns:c.value,navigate:r,startEdit:m,cancelEdit:g,updateCellValue:_}}function A(){return a.value<0||o.value<0?(i(0,0),!0):!1}function ee(e){return!!e.target?.closest(`.plus-table-cell-editor`)}function j(e){if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`z`)return x.value?(e.preventDefault(),y(),!0):!1;if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()===`z`)return S.value?(e.preventDefault(),b(),!0):!1;switch(e.key){case`Escape`:return e.preventDefault(),t.value?.focus({preventScroll:!0}),!0;case`Enter`:return e.preventDefault(),r(e.shiftKey?-1:1,0),D(),!0;case`Tab`:return e.preventDefault(),r(0,e.shiftKey?-1:1),D(),!0;default:return!1}}function M(e){switch(e.key){case`Escape`:return e.preventDefault(),g(),t.value?.focus({preventScroll:!0}),!0;case`Enter`:return e.preventDefault(),h(),r(e.shiftKey?-1:1,0),t.value?.focus({preventScroll:!0}),!0;case`Tab`:if(e.preventDefault(),u.value===`row`){let t=c.value.length,n=p.value,r=o.value+(e.shiftKey?-1:1);return r<0&&(r=t-1),r>=t&&(r=0),i(n,r),m(n,r),D(),!0}return h(),r(0,e.shiftKey?-1:1),t.value?.focus({preventScroll:!0}),!0;default:return!1}}function N(e){let t=s.value.length,n=c.value.length;if(t===0||n===0)return!1;if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`z`)return x.value?(e.preventDefault(),y(),!0):!1;if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()===`z`||e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`y`)return S.value?(e.preventDefault(),b(),!0):!1;if(e.key===`F2`&&d.value)return e.preventDefault(),a.value>=0&&o.value>=0&&v(a.value,o.value)&&(m(),D()),!0;if((e.key===`Delete`||e.key===`Backspace`)&&d.value)return a.value>=0&&o.value>=0&&v(a.value,o.value)?(e.preventDefault(),m(),_(``),D(),!0):!1;let l=u.value===`all`;switch(e.key){case`ArrowUp`:return e.preventDefault(),A()||r(-1,0),l&&D(),!0;case`ArrowDown`:return e.preventDefault(),A()||r(1,0),l&&D(),!0;case`ArrowLeft`:return e.preventDefault(),A()||r(0,-1),l&&D(),!0;case`ArrowRight`:return e.preventDefault(),A()||r(0,1),l&&D(),!0;case`Tab`:return e.preventDefault(),A()||r(0,e.shiftKey?-1:1),l&&D(),!0;case`Enter`:return e.preventDefault(),A()?(l&&D(),!0):(d.value&&v(a.value,o.value)?(m(),D()):(r(e.shiftKey?-1:1,0),l&&D()),!0);case`Home`:return e.preventDefault(),e.ctrlKey?i(0,0):i(Math.max(0,a.value),0),l&&D(),!0;case`End`:return e.preventDefault(),e.ctrlKey?i(t-1,n-1):i(Math.max(0,a.value),n-1),l&&D(),!0;default:return!1}}function P(e){if(!n.value||!C.value)return;if(f.value){let t=O(e);for(let n of w.value)if(xe(e,n.key)&&!(n.when&&!n.when(t))&&(n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t)!==!1))return;M(e);return}if(u.value===`all`&&ee(e))return j(e),void 0;let t=O(e);for(let n of w.value)if(xe(e,n.key)&&!(n.when&&!n.when(t))&&(n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t)!==!1))return;if(!N(e)){for(let n of E.value)if(xe(e,n.key)&&!(n.when&&!n.when(t))){n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t);return}d.value&&Se(e)&&a.value>=0&&o.value>=0&&v(a.value,o.value)&&(e.preventDefault(),e.stopPropagation(),m(),_(e.key),D())}}return B(t,`keydown`,P),{hasFocus:C}}function Ne(e){return e===!1?`none`:e===!0?`all`:e}function Pe(e){let{data:t,navigableColumns:n,activeRowIndex:r,activeColIndex:i,editable:a,isDepDisabled:o,onEditStart:s,onEditEnd:c,onValueChange:l}=e,u=T(!1),d=T(-1),f=T(-1),p=T({}),m=T({}),h=k(()=>Ne(a.value)),g=k(()=>h.value===`cell`||h.value===`row`),_=k(()=>f.value>=0?n.value[f.value]??null:null);function v(e,r){if(h.value===`none`)return!1;let i=n.value[r];if(!i)return!1;let a=t.value[e];return!(!a||i.editable===!1||typeof i.editable==`function`&&!i.editable(a)||o?.(e,i.prop??``))}function y(e,a){let o=e??r.value,c=a??i.value;if(o<0||c<0||h.value===`none`||!v(o,c))return;if(u.value&&d.value===o){if(h.value===`row`){f.value=c;return}if(f.value===c)return}u.value&&b();let l=t.value[o];if(!l)return;if(d.value=o,f.value=c,h.value===`row`){let e={},t={};for(let r=0;r<n.value.length;r++){let i=n.value[r];i.prop&&v(o,r)&&(e[i.prop]=l[i.prop],t[i.prop]=l[i.prop])}if(Object.keys(e).length===0)return;p.value=e,m.value=t}else{let e=n.value[c];if(!e?.prop)return;let t=l[e.prop];p.value={[e.prop]:t},m.value={[e.prop]:t}}u.value=!0;let g=n.value[c];if(g){let e=g.prop?l[g.prop]:void 0;s?.({row:l,column:g,value:e,rowIndex:o,colIndex:c})}}function b(){if(!u.value)return null;let e=d.value,r=t.value[e];if(!r)return S(),null;let i=[];for(let[t,a]of Object.entries(p.value)){let o=m.value[t];if(o!==a){r[t]=a,i.push({rowIndex:e,colProp:t,oldValue:o,newValue:a});let s=n.value.findIndex(e=>e.prop===t);s>=0&&l?.({row:r,column:n.value[s],oldValue:o,newValue:a,value:a,rowIndex:e,colIndex:s})}}let a=f.value,o=n.value[a];return o&&c?.({row:r,column:o,value:p.value[o.prop??``],rowIndex:e,colIndex:a}),S(),i.length>0?i:null}function x(){if(!u.value)return;let e=d.value,r=f.value,i=n.value[r],a=t.value[e];i&&a&&c?.({row:a,column:i,value:m.value[i.prop??``],rowIndex:e,colIndex:r}),S()}function S(){u.value=!1,d.value=-1,f.value=-1,p.value={},m.value={}}function C(e){return p.value[e]}function w(e,t){p.value[e]=t}function E(e){let t=_.value?.prop;t&&(p.value[t]=e)}let D=k({get:()=>{let e=_.value?.prop;return e?p.value[e]:null},set:e=>{let t=_.value?.prop;t&&(p.value[t]=e)}});function O(e,t){if(!t)return!1;if(h.value===`all`){let r=n.value.findIndex(e=>e.prop===t);return r>=0&&v(e,r)}return!u.value||d.value!==e?!1:h.value===`row`?t in p.value:_.value?.prop===t}return{isEditing:u,editingRowIndex:d,editingColIndex:f,editingValue:D,editingValues:p,editingColumn:_,editMode:h,autoTriggerEnabled:g,isCellEditable:v,startEdit:y,confirmEdit:b,cancelEdit:x,getEditingValue:C,setEditingValue:w,updateEditingValue:E,isEditingCell:O}}function Fe(e){let{data:t,maxHistory:n=50}=e,r=T([]),i=T([]),a=k(()=>r.value.length>0),o=k(()=>i.value.length>0);function s(e){let t=Array.isArray(e)?e:[e];t.length!==0&&(r.value.push(t),r.value.length>n&&r.value.shift(),i.value=[])}function c(){let e=r.value.pop();if(e){for(let n of e){let e=t.value[n.rowIndex];e&&(e[n.colProp]=n.oldValue)}return i.value.push(e),e}}function l(){let e=i.value.pop();if(e){for(let n of e){let e=t.value[n.rowIndex];e&&(e[n.colProp]=n.newValue)}return r.value.push(e),e}}function u(){r.value=[],i.value=[]}return{canUndo:a,canRedo:o,pushChange:s,undo:c,redo:l,clearHistory:u}}function Ie(e){let t=new Map;for(let n of e){if(!n.prop)continue;let e=Array.isArray(n.rules)?n.rules:n.rules?[n.rules]:[];for(let r of e){let e=r.dependencies;if(e?.length)for(let r of e)t.has(r)||t.set(r,new Set),t.get(r).add(n.prop)}}return t}function Le(t){let{data:n,columns:r,tableRules:i,tableEl:a,trigger:o=T(`manual`),validateOnCellExit:s=T(!1),resolveDeps:c}=t,l=T(new Map),u=k(()=>Ie(r.value));function d(e,t,n){let r=i.value?.[e],a=t.rules,o=[];if(r&&o.push(...Array.isArray(r)?r:[r]),a&&o.push(...Array.isArray(a)?a:[a]),n!=null&&c&&t.dependencies){let r=c(n,t);r.rules&&o.push(...Array.isArray(r.rules)?r.rules:[r.rules]),r.required&&o.push({required:!0,message:`${t.label??e} 必填`})}return o}async function f(e){let t=n.value[e];if(!t)return{};let i={},a={};for(let t of r.value){if(!t.prop)continue;let n=d(t.prop,t,e);n.length>0&&(a[t.prop]=n)}if(Object.keys(a).length===0)return{};let o=new V(a);try{await o.validate(t,{firstFields:!0})}catch(e){let t=e?.errors;if(t)for(let e of t)i[e.field]=e.message}return i}function p(e){return e===!0?n.value.map((e,t)=>t):e===!1?[]:typeof e==`number`?[e]:e}async function m(e=!0){let t=p(e),n={},i=new Map(l.value);for(let e of t)for(let t of r.value)t.prop&&i.delete(`${e}:${t.prop}`);for(let e of t){let t=await f(e);if(Object.keys(t).length>0){n[e]=t;for(let[n,r]of Object.entries(t))i.set(`${e}:${n}`,r)}}return l.value=i,{valid:Object.keys(n).length===0,errors:n}}async function h(e,t){let i=n.value[e];if(!i)return!0;let a=r.value.find(e=>e.prop===t);if(!a)return!0;let o=d(t,a,e);if(o.length===0)return!0;let s=new V({[t]:o}),c=`${e}:${t}`,u=new Map(l.value);try{return await s.validate(i,{firstFields:!0}),u.delete(c),l.value=u,!0}catch(e){let t=(e?.errors)?.[0]?.message??`Invalid`;return u.set(c,t),l.value=u,!1}}async function g(e,t){let n=new Set([t]),r=u.value.get(t);if(r)for(let e of r)n.add(e);for(let t of n)await h(e,t)}function _(e,t){if(e===void 0){l.value=new Map;return}let n=new Map(l.value);if(t)n.delete(`${e}:${t}`);else for(let t of[...n.keys()])t.startsWith(`${e}:`)&&n.delete(t);l.value=n}function v(){let t=a.value;if(!t||l.value.size===0)return;let n=1/0;for(let e of l.value.keys()){let[t]=e.split(`:`),r=Number(t);!Number.isNaN(r)&&r<n&&(n=r)}n!==1/0&&e(()=>{((t.querySelector?.(`.el-table__body-wrapper`))?.querySelector?.(`tbody tr:nth-child(${n+1})`))?.scrollIntoView({block:`center`,inline:`nearest`})})}function y(e,t){return l.value.get(`${e}:${t}`)}return{errors:l,validate:m,validateField:h,validateFieldsAffectedByChange:g,clearValidation:_,scrollToFirstError:v,getErrorForCell:y}}function Re(e,t,n){if(e===t)return n;let r=e>t?e-1:e;return r>=n?r+1:r}function ze(e){let{data:t,onDataChange:n,activeRowIndex:r}=e;function i(e,r={},i=1){if(i<1)return;let a=[...t.value],o=e??a.length,s=Math.max(0,Math.min(o,a.length)),c=Array.from({length:i},()=>({...r}));a.splice(s,0,...c),n(a)}function a(e){let r=(e==null?[]:G(e)).filter(e=>e>=0&&e<t.value.length);if(!r.length)return;let i=new Set(r);n(t.value.filter((e,t)=>!i.has(t)))}function o(e,i){let a=[...t.value],o=a.length;if(e<0||e>=o||i<0||i>=o||e===i)return;let[s]=a.splice(e,1);s&&(a.splice(i,0,s),n(a),r!=null&&r.value>=0&&(r.value=Re(r.value,e,i)))}function s(e){let r=e==null?[]:G(e),i=[...new Set(r)].filter(e=>e>=0&&e<(t.value.length??0)).sort((e,t)=>e-t);if(!i.length)return;let a=[...t.value],o=0;for(let e of i)a.splice(e+1+o,0,structuredClone(t.value[e])),o++;n(a)}return{insertRow:i,deleteRow:a,moveRow:o,duplicateRow:s}}function Be(e,t){return t.length>0?t:he(e)}function Ve(e){return`plus-table:${e}:columns`}function He(e){try{return e===`local`?localStorage:sessionStorage}catch{return null}}function Ue(e){let{initialColumns:t,tableKey:n,storage:r=!1}=e,i=T([]),a=T(new Set),o=T({}),s=null;function c(){s={order:[...i.value],hidden:new Set(a.value),widths:{...o.value}}}function l(){s&&(i.value=s.order,a.value=new Set(s.hidden),o.value={...s.widths},s=null,d())}function u(){if(!r||!n)return;let e=He(r);if(e)try{let r=e.getItem(Ve(n));if(!r)return;let s=JSON.parse(r),c=[],l=new Set,u={},d=t.value,f=new Map(d.map(e=>[J(e),e]));for(let e of s.sort((e,t)=>e.order-t.order)){if(c.push(e.prop),e.hidden){let t=f.get(e.prop);t?.children?.length?Y(t).forEach(e=>l.add(e)):l.add(e.prop)}e.width!=null&&e.width>0&&(u[e.prop]=e.width)}i.value=c,a.value=l,o.value=u}catch{}}let d=R(f,100);function f(){if(!r||!n)return;let e=He(r);if(!e)return;let s=t.value,c=Be(s,i.value),l=o.value,u=[];c.forEach((e,t)=>{let n=s.find(t=>J(t)===e),r={prop:e,hidden:n?.children?.length?Y(n).every(e=>a.value.has(e)):a.value.has(e),order:t};l[e]!=null&&l[e]>0&&(r.width=l[e]),u.push(r)});try{e.setItem(Ve(n),JSON.stringify(u))}catch{}}let p=e=>e.prop&&a.value.has(e.prop)?!0:e.hidden===!0;function m(e,t){let n=[];for(let r of e)if(r.children?.length){let e=m(r.children,t);if(e.length===0)continue;n.push({...r,children:e})}else t(r)||n.push(r);return n}let h=k(()=>{let e=t.value,n=m(ve(e,Be(e,i.value)),p),r=o.value;return n.map(e=>!e.prop||r[e.prop]==null?e:{...e,width:r[e.prop]})});function g(e,n){let r=new Set(a.value),i=t.value.find(t=>J(t)===e),o=i?.children?.length?Y(i):[e];for(let e of o)n?r.delete(e):r.add(e);a.value=r,d()}function _(e){let n=ge(t.value),r=new Set(n),a=e.filter(e=>!r.has(e));i.value=[...n,...a],d()}function y(){let e=t.value;return X(e,Be(e,i.value))}function b(e,n){let r=t.value,a=[...Be(r,i.value)];if(e<0||e>=a.length||n<0||n>=a.length)return;let[o]=a.splice(e,1);o!=null&&(a.splice(n,0,o),i.value=a,d())}function x(e){if(e==null||e===``)return;let t=typeof e==`number`?e:Number(e);return Number.isFinite(t)&&t>0?t:void 0}function S(e,t){if(!e)return;let n=x(t),r={...o.value};n==null?delete r[e]:r[e]=n,o.value=r,d()}function C(){i.value=[],a.value=new Set,o.value={},r&&n&&He(r)?.removeItem(Ve(n))}function w(){let e=q(t.value);if(!i.value.length)return e;let n=new Map(e.filter(e=>e.prop).map(e=>[e.prop,e])),r=[];for(let e of i.value){let t=n.get(e);t&&(r.push(t),n.delete(e))}return[...r,...n.values()]}return u(),v(()=>t.value.map(e=>J(e)).join(`,`),u),{visibleColumns:h,hiddenColumns:a,columnWidths:o,columnOrder:i,toggleColumn:g,reorderColumns:b,setColumnOrderByIds:_,setColumnWidth:S,resetColumns:C,snapshotColumnState:c,restoreColumnState:l,getOrderedColumnsWithProp:w,getColumnSettingTree:y,isColumnHidden:e=>a.value.has(e),isNodeHidden:e=>e.column.children?.length?Y(e.column).every(e=>a.value.has(e)):!!e.column.prop&&a.value.has(e.column.prop)}}function We(e){let{data:t}=e,n=b(new Map),r=e.cachedData??b([]);e.cachedData||v(()=>t.value,e=>{e?.length&&!r.value.length&&(r.value=le(e))},{immediate:!0});function i(e,i){let a=r.value[e]?.[i],o=t.value[e]?.[i],s=n.value;if(se(a,o)){let t=s.get(e);t&&(t.delete(i),t.size===0&&s.delete(e),N(n))}else{let t=s.get(e);t||(t=new Set,s.set(e,t)),t.add(i),N(n)}}function a(e,t){return n.value.get(e)?.has(t)??!1}function o(e){return(n.value.get(e)?.size??0)>0}function s(e,t){if(e===void 0){n.value=new Map;return}let r=n.value;if(t!==void 0){let n=r.get(e);if(!n)return;n.delete(t),n.size===0&&r.delete(e)}else if(!r.delete(e))return;N(n)}function c(){let e=t.value,r=new Set(n.value.keys());return e.filter((e,t)=>r.has(t))}function l(){r.value=le(t.value),n.value=new Map}function u(){let e=new Set;for(let[t,r]of n.value)for(let n of r)e.add(`${t}:${n}`);return e}return{dirtyCells:n,markDirty:i,resetTracking:l,getDirtyCells:u,isCellDirty:a,isRowDirty:o,clearDirty:s,getModifiedRows:c}}function Ge(){let e=n(de);if(!e)throw Error(`[PlusTable] usePlusTableContext() must be used inside <PlusTable>`);return e}function Ke(){let e=T(),t=T({top:0,left:0,bottom:0,right:0,width:0,height:0}),n=T({getBoundingClientRect:()=>t.value});function r(n){let{clientX:r,clientY:i}=n;t.value=DOMRect.fromRect({x:r,y:i}),e.value?.handleOpen()}function i(){e.value?.handleClose()}return{dropdownRef:e,triggerRef:n,open:r,close:i}}const qe={input:U,"input-number":ae,select:te,"date-picker":H,switch:ne,"time-picker":oe,"time-select":W};var Je={class:`plus-table-cell-content plus-table-cell-content--with-tooltip`},Ye=M({name:`PlusTableCell`,inheritAttrs:!1,__name:`plus-table-cell`,props:{item:{},scope:{}},setup(t){let n=Ge(),a=k(()=>n.getErrorForCell(d.scope.$index,d.item.prop??``)),l=k(()=>n.resolveDependencyState(d.scope.$index,d.item)),d=t,f=k(()=>n.editMode.value===`all`),m=k(()=>n.isEditingCell(d.scope.$index,d.item.prop)),g=k(()=>f.value?d.item.prop?d.scope.row[d.item.prop]:void 0:n.getEditingValue(d.item.prop));function v(e){let t=d.item.prop;if(t){if(f.value){let r=d.scope.row[t];d.scope.row[t]=e,r!==e&&(n.markDirty(d.scope.$index,t),n.onFieldChange(d.scope.$index,t));return}n.setEditingValue(t,e)}}let b=k(()=>({row:d.scope.row,column:d.item,modelValue:g.value,"onUpdate:modelValue":v,confirm:n.confirmEdit,cancel:n.cancelEdit})),x=k(()=>O(d.item.component)),w=k(()=>{let e=d.item.componentProps;return e?typeof e==`function`?e(d.scope.row,d.item):e:{}}),T=k(()=>({...w.value,...l.value.componentProps??{}}));function O(e){if(!e)return qe.input;let t=u(e)?qe?.[e]:e;return t||console.warn(`[PlusTable] Component "${e}" is not registered`),t}function A(){n.cancelEdit(),e(()=>{n.tableEl.value?.focus({preventScroll:!0})})}return(e,n)=>{let u=c(`el-tooltip`);return m.value?(F(),C(h,{key:0},[e.$slots[`editor-${t.item.prop}`]?i(e.$slots,`editor-${t.item.prop}`,E(S({key:0},b.value))):(F(),y(r(x.value),S({key:1,"model-value":g.value},T.value,{disabled:l.value.disabled,class:`plus-table-cell-editor`,size:`small`,"onUpdate:modelValue":v,onKeydownCapture:I(L(A,[`stop`]),[`esc`])}),null,16,[`model-value`,`disabled`,`onKeydownCapture`]))],64)):a.value?(F(),y(u,{key:1,content:a.value},{default:D(()=>[_(`span`,Je,[e.$slots[`cell-${t.item.prop}`]?i(e.$slots,`cell-${t.item.prop}`,E(S({key:0},t.scope))):t.item.render?(F(),y(r(s(t.item.render,t.scope,e.$slots)),{key:1})):(F(),C(h,{key:2},[P(p(o(ce)(t.scope.row,t.item.prop,``)),1)],64))])]),_:3},8,[`content`])):e.$slots[`cell-${t.item.prop}`]?i(e.$slots,`cell-${t.item.prop}`,E(S({key:2},t.scope))):t.item.render?(F(),y(r(s(t.item.render,t.scope,e.$slots)),{key:3})):(F(),C(h,{key:4},[P(p(o(ce)(t.scope.row,t.item.prop,``)),1)],64))}}}),Xe={key:0,class:`plus-table-header--required`},Ze={key:0,class:`plus-table-header--required`},Qe=M({name:`PlusTableColumn`,inheritAttrs:!1,__name:`plus-table-column`,props:{item:{}},setup(e){let t=e,n=k(()=>!!t.item?.children?.length),a=k(()=>o.value.some(e=>e.required)),o=k(()=>{let{item:e}=t,{required:n}=e,r=[];return e.rules&&r.push(...G(e.rules)),n!==void 0&&r.push({required:n}),r}),s=k(()=>{let{hidden:e,editable:n,component:r,componentProps:i,rules:a,required:o,render:s,renderHeader:c,children:l,dependencies:u,...d}=t.item;return d});return(t,o)=>{let u=c(`el-table-column`);return n.value?(F(),y(u,E(S({key:0},s.value)),{header:D(n=>[t.$slots[`header-${e.item.prop}`]?i(t.$slots,`header-${e.item.prop}`,E(S({key:0},n))):e.item.renderHeader?(F(),y(r(()=>e.item.renderHeader?.(n)),{key:1})):(F(),C(h,{key:2},[a.value?(F(),C(`span`,Xe)):w(``,!0),P(` `+p(e.item.label),1)],64))]),default:D(()=>[(F(!0),C(h,null,l(e.item.children,(e,n)=>(F(),y(Qe,{key:e.key??e.prop??e.label??n,item:e},m({_:2},[l(t.$slots,(e,n)=>({name:n,fn:D(e=>[i(t.$slots,n,S({ref_for:!0},e??{}))])}))]),1032,[`item`]))),128))]),_:3},16)):(F(),y(u,E(S({key:1},s.value)),{header:D(n=>[t.$slots[`header-${e.item.prop}`]?i(t.$slots,`header-${e.item.prop}`,E(S({key:0},n))):e.item.renderHeader?(F(),y(r(()=>e.item.renderHeader?.(n)),{key:1})):(F(),C(h,{key:2},[a.value?(F(),C(`span`,Ze)):w(``,!0),P(` `+p(e.item.label),1)],64))]),default:D(n=>[g(Ye,{item:e.item,scope:n},m({_:2},[l(t.$slots,(e,n)=>({name:n,fn:D(e=>[i(t.$slots,n,E(j(e??{})))])}))]),1032,[`item`,`scope`])]),_:3},16))}}}),$e={class:`plus-table-column-setting`},et={class:`column-setting-header`},tt={class:`column-setting-item`},nt={class:`column-setting-footer`},rt=M({name:`PlusTableColumnSetting`,__name:`plus-table-column-setting`,setup(e,{expose:t}){let n=Ge(),r=T(!1),i=T(null),{dropdownRef:a,triggerRef:s,open:l}=Ke(),u=k(()=>n.columnOptions??null);v(r,e=>{e&&u.value?.snapshotColumnState?.()});let d=k(()=>u.value?.getColumnSettingTree()??[]),f=e=>u.value?.isNodeHidden(e)??!1;function m(e,t){u.value?.toggleColumn(e.id,t)}function b(e){let t=u.value?.columnWidths?.value??{};return e.prop&&e.prop in t?t[e.prop]:e.width}function x(e,t){u.value?.setColumnWidth(e,t??``)}let S=k(()=>{let e=u.value;if(!e||d.value.length===0)return!1;let t=Z(d.value);return t.length===0?!0:t.every(t=>!e.isNodeHidden(t))}),E=k(()=>{let e=u.value;if(!e||d.value.length===0)return!1;let t=Z(d.value);if(t.length===0)return!1;let n=t.filter(t=>e.isNodeHidden(t)).length;return n>0&&n<t.length});function O(e){let t=_e(d.value);for(let n of t)u.value?.toggleColumn(n.id,e)}function A(){u.value?.restoreColumnState?.(),r.value=!1}function ee(){r.value=!1}function j(){u.value?.resetColumns()}function M(e){return e.data?.isTopLevel===!0}function N(e,t,n){return n===`inner`?!1:t.data?.isTopLevel===!0}function I(){let e=me(d.value);u.value?.setColumnOrderByIds(e)}function R(e,t){i.value=t,l(e)}function z(e){if(e===`setting`)r.value=!0;else if(e===`hide`){let e=i.value?.property;e&&u.value?.toggleColumn(e,!1)}}return t({openContextMenu:R}),(e,t)=>{let n=c(`el-dropdown-item`),l=c(`el-dropdown-menu`),u=c(`el-dropdown`),v=c(`el-checkbox`),T=c(`el-input`),k=c(`el-tree`),R=c(`el-scrollbar`),B=c(`el-button`),V=c(`el-drawer`);return F(),C(h,null,[g(u,{ref_key:`dropdownRef`,ref:a,"virtual-ref":o(s),"show-arrow":!1,"popper-options":{modifiers:[{name:`offset`,options:{offset:[0,0]}}]},"virtual-triggering":``,trigger:`contextmenu`,placement:`bottom-start`,onCommand:z},{dropdown:D(()=>[g(l,{style:{"min-width":`120px`}},{default:D(()=>[g(n,{command:`setting`},{default:D(()=>[...t[3]||=[P(`设置`,-1)]]),_:1}),g(n,{command:`hide`,disabled:!i.value?.property},{default:D(()=>[...t[4]||=[P(` 隐藏 `,-1)]]),_:1},8,[`disabled`])]),_:1})]),_:1},8,[`virtual-ref`]),g(V,{modelValue:r.value,"onUpdate:modelValue":t[2]||=e=>r.value=e,title:`列设置`,size:`360`,direction:`rtl`,"append-to-body":``,class:`plus-table-column-setting-drawer`},{default:D(()=>[g(R,{class:`column-setting-scrollbar`},{default:D(()=>[_(`div`,$e,[_(`div`,et,[g(v,{"model-value":S.value,indeterminate:E.value,"onUpdate:modelValue":O},{default:D(()=>[...t[5]||=[P(` 全部 `,-1)]]),_:1},8,[`model-value`,`indeterminate`])]),t[6]||=_(`p`,{class:`column-setting-hint`},` 勾选显示列，拖拽调整顺序（仅顶层可拖拽） `,-1),g(k,{data:d.value,"node-key":`id`,"default-expand-all":``,draggable:``,"allow-drag":M,"allow-drop":N,class:`column-setting-tree`,onNodeDrop:I},{default:D(({data:e})=>[_(`div`,tt,[g(v,{"model-value":!f(e),"onUpdate:modelValue":t=>m(e,t),onClick:t[0]||=L(()=>{},[`stop`]),class:`column-setting-checkbox`},{default:D(()=>[P(p(e.label),1)]),_:2},1032,[`model-value`,`onUpdate:modelValue`]),e.column.prop?(F(),y(T,{key:0,"model-value":b(e.column),"onUpdate:modelValue":t=>x(e.column.prop,t),placeholder:`宽度`,class:`column-width-input`,onClick:t[1]||=L(()=>{},[`stop`])},null,8,[`model-value`,`onUpdate:modelValue`])):w(``,!0)])]),_:1},8,[`data`])])]),_:1})]),footer:D(()=>[_(`div`,nt,[g(B,{onClick:A},{default:D(()=>[...t[7]||=[P(`取消`,-1)]]),_:1}),g(B,{type:`warning`,onClick:j},{default:D(()=>[...t[8]||=[P(`重置`,-1)]]),_:1}),g(B,{type:`primary`,onClick:ee},{default:D(()=>[...t[9]||=[P(`确认`,-1)]]),_:1})])]),_:1},8,[`modelValue`])],64)}}}),it={class:`plus-table-pagination`},at=M({name:`PlusTablePagination`,__name:`plus-table-pagination`,props:{currentPage:{default:1},pageSize:{default:10},total:{default:0},pageSizes:{},layout:{}},emits:[`current-change`,`size-change`],setup(e){let t=e,n=k(()=>t.pageSizes??[10,20,50,100]),r=k(()=>t.layout??`total, sizes, prev, pager, next, jumper`);return(t,i)=>{let a=c(`el-pagination`);return F(),C(`div`,it,[g(a,{"current-page":e.currentPage,"page-size":e.pageSize,total:e.total,"page-sizes":n.value,layout:r.value,background:``,onCurrentChange:i[0]||=e=>t.$emit(`current-change`,e),onSizeChange:i[1]||=e=>t.$emit(`size-change`,e)},null,8,[`current-page`,`page-size`,`total`,`page-sizes`,`layout`])])}}}),ot={key:0,class:`plus-table-header`},st={key:1,class:`plus-table-footer`},Q=M({name:`PlusTable`,inheritAttrs:!1,__name:`plus-table`,props:{data:{default:()=>[]},columns:{default:()=>[]},rowKey:{},stripe:{type:Boolean,default:!1},border:{type:Boolean,default:!0},showOverflowTooltip:{type:Boolean,default:!0},maxHeight:{},cellActive:{type:Boolean,default:!0},rowActive:{type:Boolean,default:!0},editable:{type:[Boolean,String],default:!1},rules:{},validateTrigger:{default:`manual`},validateOnCellExit:{type:Boolean,default:!1},columnSetting:{type:Boolean,default:!0},columnSettingKey:{},hotkeys:{},hotkeyEnabled:{type:Boolean,default:!0},currentPage:{},pageSize:{},pageSizes:{},total:{},paginationLayout:{},adaptive:{type:[Boolean,Object],default:!1}},emits:[`scroll`,`update:data`,`cell-edit-start`,`cell-edit-end`,`cell-value-change`,`update:currentPage`,`update:pageSize`,`pagination`],setup(n,{expose:r,emit:a}){let s=n,u=a,d=f(),p=T(null),b=T(null),x=k(()=>!!d.title||!!d.actions),E=k(()=>s.total!=null||!!d.summary||!!d.pagination),O=k(()=>s.total!=null),A=k(()=>s.data??[]);function j(e){u(`update:currentPage`,e),u(`pagination`,{currentPage:e,pageSize:s.pageSize??10})}function M(e){u(`update:pageSize`,e),u(`pagination`,{currentPage:s.currentPage??1,pageSize:e})}let N=T(null),P=Ue({initialColumns:k(()=>s.columns??[]),tableKey:s.columnSetting?s.columnSettingKey??`plus-table-default`:void 0,storage:s.columnSetting?`local`:!1}),I=P.visibleColumns,{maxHeight:L}=we({adaptive:ee(()=>s.adaptive),wrapperEl:p});v(L,()=>{(L.value===``||L.value==null)&&e(()=>b.value?.doLayout?.())});let{activeRowIndex:R,activeColIndex:z,navigableColumns:B,activeRow:V,activeColumn:te,navigate:H,focusCell:U,handleCellClick:ne,getCellClassName:re,getRowClassName:ie}=je({data:A,visibleColumns:I,tableRef:b}),{insertRow:W,deleteRow:ae,moveRow:oe,duplicateRow:se}=ze({data:A,onDataChange:e=>u(`update:data`,e),activeRowIndex:R}),{dirtyCells:ce,markDirty:G,clearDirty:le,getModifiedRows:ue,isRowDirty:K,isCellDirty:q,resetTracking:fe,getDirtyCells:pe}=We({data:A}),{resolveDependencyState:J,onFieldChange:Y}=De({columns:I,data:A,markDirty:G}),{isEditing:X,editingRowIndex:me,editingColIndex:he,editingValue:ge,editMode:Z,autoTriggerEnabled:_e,isCellEditable:ve,startEdit:ye,confirmEdit:xe,cancelEdit:Se,getEditingValue:Ce,setEditingValue:Te,updateEditingValue:Ee,isEditingCell:Ae}=Pe({data:A,navigableColumns:B,activeRowIndex:R,activeColIndex:z,editable:k(()=>s.editable??!1),isDepDisabled:(e,t)=>{let n=B.value.find(e=>e.prop===t);return n?J(e,n).disabled:!1},onEditStart:e=>u(`cell-edit-start`,e),onEditEnd:e=>u(`cell-edit-end`,e),onValueChange:e=>u(`cell-value-change`,e)}),{validate:Ne,validateField:Ie,validateFieldsAffectedByChange:Re,clearValidation:Be,scrollToFirstError:Ve,getErrorForCell:He}=Le({data:A,columns:B,tableRules:k(()=>s.rules),tableEl:p,trigger:k(()=>s.validateTrigger??`manual`),validateOnCellExit:k(()=>s.validateOnCellExit??!1),resolveDeps:J}),{canUndo:Ge,canRedo:Ke,pushChange:qe,undo:Je,redo:Ye,clearHistory:Xe}=Fe({data:A}),{rowClassNameBinding:Ze,cellClassNameBinding:$e}=ke({cellActive:k(()=>s.cellActive??!0),rowActive:k(()=>s.rowActive??!0),activeRowIndex:R,activeColIndex:z,dirtyCells:ce,getCellClassName:re,getRowClassName:ie,getErrorForCell:He,isCellDirty:q,isRowDirty:K}),{commitEdit:et,undo:tt,redo:nt}=Oe({confirmEdit:xe,undo:Je,redo:Ye,markDirty:G,pushChange:qe,onFieldChange:Y,validateOnCellExit:k(()=>s.validateOnCellExit??!1),validateFieldsAffectedByChange:Re}),it=be(p);function Q(e,t){ye(e,t),X.value&&it()}function ct(e,t,n,r){let i=!!r.target?.closest(`.plus-table-cell-editor`),a=R.value,o=z.value;ne(e,t),X.value&&a>=0&&(Z.value===`row`?R.value!==a&&et():(R.value!==a||z.value!==o)&&et()),i||p.value?.focus({preventScroll:!0})}function lt(e){let t=B.value.findIndex(t=>t.prop===e);return t>=0?t:0}function ut(e,t){let n=lt(t);U(e,n),Q(e,n)}function dt(e,t){_e.value&&(ne(e,t),R.value>=0&&z.value>=0&&Q())}function ft(e,t,n){!s.columnSetting||!n?.property||typeof e!=`number`||e<=0||P.setColumnWidth(n.property,e)}function pt(e,t){s.columnSetting&&(t.preventDefault(),N.value?.openContextMenu(t,e))}Me({wrapperEl:p,hotkeyEnabled:k(()=>s.hotkeyEnabled??!0),navigate:H,focusCell:U,activeRowIndex:R,activeColIndex:z,data:A,navigableColumns:B,customHotkeys:k(()=>s.hotkeys),editMode:Z,autoTriggerEnabled:_e,isEditing:X,editingRowIndex:me,startEdit:Q,confirmEdit:et,cancelEdit:Se,updateCellValue:Ee,isCellEditable:ve,undo:tt,redo:nt,canUndo:Ge,canRedo:Ke}),t(de,{tableEl:p,tableInstance:b,rules:k(()=>s.rules),columns:k(()=>s.columns??[]),visibleColumns:I,navigableColumns:B,data:A,editable:k(()=>s.editable??!1),activeRowIndex:R,activeColIndex:z,navigate:H,editMode:Z,isEditing:X,editingRowIndex:me,editingColIndex:he,editingValue:ge,isEditingCell:Ae,isCellEditable:ve,startEdit:Q,confirmEdit:et,cancelEdit:Se,updateEditingValue:Ee,getEditingValue:Ce,setEditingValue:Te,getErrorForCell:He,resolveDependencyState:J,onFieldChange:Y,markDirty:G,columnOptions:s.columnSetting?{toggleColumn:P.toggleColumn,reorderColumns:P.reorderColumns,setColumnOrderByIds:P.setColumnOrderByIds,setColumnWidth:P.setColumnWidth,resetColumns:P.resetColumns,snapshotColumnState:P.snapshotColumnState,restoreColumnState:P.restoreColumnState,getOrderedColumnsWithProp:P.getOrderedColumnsWithProp,getColumnSettingTree:P.getColumnSettingTree,isColumnHidden:P.isColumnHidden,isNodeHidden:P.isNodeHidden,columnWidths:P.columnWidths}:void 0});let $=()=>b.value;return r({getElTable:$,navigate:H,focusCell:U,getColIndexByProp:lt,focusAndEditByProp:ut,activeRowIndex:R,activeColIndex:z,activeRow:V,activeColumn:te,editMode:Z,isEditing:X,startEdit:Q,confirmEdit:et,cancelEdit:Se,validate:Ne,validateField:Ie,clearValidation:Be,scrollToFirstError:Ve,insertRow:W,deleteRow:ae,moveRow:oe,duplicateRow:se,getModifiedRows:ue,markDirty:G,clearDirty:le,resetTracking:fe,getDirtyCells:pe,isCellDirty:q,isRowDirty:K,toggleColumn:P.toggleColumn,reorderColumns:P.reorderColumns,setColumnWidth:P.setColumnWidth,resetColumns:P.resetColumns,undo:tt,redo:nt,canUndo:Ge,canRedo:Ke,clearHistory:Xe,clearSelection:()=>$()?.clearSelection(),getSelectionRows:()=>$()?.getSelectionRows(),toggleRowSelection:(...e)=>$()?.toggleRowSelection(...e),toggleAllSelection:()=>$()?.toggleAllSelection(),toggleRowExpansion:(...e)=>$()?.toggleRowExpansion(...e),setCurrentRow:(...e)=>$()?.setCurrentRow(...e),clearSort:()=>$()?.clearSort(),clearFilter:(...e)=>$()?.clearFilter(...e),doLayout:()=>$()?.doLayout(),sort:(...e)=>$()?.sort(...e),scrollTo:(...e)=>$()?.scrollTo(...e),setScrollTop:(...e)=>$()?.setScrollTop(...e),setScrollLeft:(...e)=>$()?.setScrollLeft(...e)}),(e,t)=>{let r=c(`el-table-column`),a=c(`el-table`);return F(),C(`div`,{ref_key:`wrapperEl`,ref:p,class:`plus-table-wrapper`,tabindex:`0`},[x.value?(F(),C(`div`,ot,[i(e.$slots,`title`),_(`div`,null,[i(e.$slots,`actions`)])])):w(``,!0),g(a,S(e.$attrs,{ref_key:`tableRef`,ref:b,data:A.value,"row-key":n.rowKey,stripe:n.stripe,border:n.border,"show-overflow-tooltip":n.showOverflowTooltip,"max-height":n.maxHeight??o(L),"cell-class-name":o($e),"row-class-name":o(Ze),"highlight-current-row":``,onCellClick:ct,onCellDblclick:dt,onHeaderDragend:ft,onHeaderContextmenu:pt}),{default:D(()=>[i(e.$slots,`default`,{},()=>[(F(!0),C(h,null,l(o(I),(t,n)=>(F(),C(h,{key:t.key??t.prop??t.type??n},[[o(`selection`),o(`index`)].includes(t.type)?(F(),y(r,S({key:0,ref_for:!0},t),null,16)):t.type===o(`expand`)?(F(),y(r,S({key:1,ref_for:!0},t),{default:D(t=>[i(e.$slots,`expand`,S({ref_for:!0},t))]),_:3},16)):(F(),y(Qe,{key:2,item:t},m({_:2},[l(e.$slots,(t,n)=>({name:n,fn:D(t=>[i(e.$slots,n,S({ref_for:!0},t??{}))])}))]),1032,[`item`]))],64))),128))])]),append:D(()=>[i(e.$slots,`append`)]),empty:D(()=>[i(e.$slots,`empty`)]),_:3},16,[`data`,`row-key`,`stripe`,`border`,`show-overflow-tooltip`,`max-height`,`cell-class-name`,`row-class-name`]),E.value?(F(),C(`div`,st,[i(e.$slots,`summary`),i(e.$slots,`pagination`,{},()=>[O.value?(F(),y(at,{key:0,"current-page":n.currentPage??1,"page-size":n.pageSize??10,total:n.total??0,"page-sizes":n.pageSizes,layout:n.paginationLayout,onCurrentChange:j,onSizeChange:M},null,8,[`current-page`,`page-size`,`total`,`page-sizes`,`layout`])):w(``,!0)])])):w(``,!0),n.columnSetting?(F(),y(rt,{key:2,ref_key:`columnSettingRef`,ref:N},null,512)):w(``,!0)],512)}}}),ct=M({__name:`basic`,setup(e){let t=T([{id:1,name:`需求评审`,amount:1200},{id:2,name:`接口开发`,amount:3400},{id:3,name:`联调测试`,amount:800}]),n=[{type:`index`,label:`#`,width:60},{prop:`id`,label:`ID`,width:80},{prop:`name`,label:`名称`,editable:!0,component:`input`},{prop:`amount`,label:`金额`,align:`right`,editable:!0,component:`input-number`,componentProps:{min:0,step:100,controls:!1},formatter:e=>`¥ ${(e.amount??0).toLocaleString(`zh-CN`)}`}];return(e,r)=>(F(),y(o(Q),{data:t.value,"onUpdate:data":r[0]||=e=>t.value=e,columns:n,"row-key":`id`,border:``,editable:`cell`},null,8,[`data`]))}}),lt=`<script setup lang="ts">
import { ref } from 'vue';

import { PlusTable } from '@labs/plus-table';
import type { PlusTableColumn } from '@labs/plus-table';

interface Row {
  id: number;
  name: string;
  amount: number;
}

const data = ref<Row[]>([
  { id: 1, name: '需求评审', amount: 1200 },
  { id: 2, name: '接口开发', amount: 3400 },
  { id: 3, name: '联调测试', amount: 800 },
]);

const columns: PlusTableColumn<Row>[] = [
  { type: 'index', label: '#', width: 60 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', editable: true, component: 'input' },
  {
    prop: 'amount',
    label: '金额',
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, controls: false },
    formatter: (row: Row) => \`¥ \${(row.amount ?? 0).toLocaleString('zh-CN')}\`,
  },
];
<\/script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border editable="cell" />
</template>
`,ut={class:`page-toolbar`},dt={class:`demo-statusbar`,role:`status`,"aria-live":`polite`},ft={class:`demo-statusbar__item`},pt={class:`demo-statusbar__item`},$={class:`demo-statusbar__item`},mt={class:`demo-statusbar__item`},ht={class:`demo-statusbar__item`},gt={class:`demo-statusbar__item demo-statusbar__item--grow`},_t={class:`demo-table-heading`},vt={class:`assignee-cell`},yt={class:`expand-content`},bt=O(M({__name:`playground`,setup(e){let t={pending:{label:`待开始`,type:`info`},active:{label:`进行中`,type:`warning`},done:{label:`已完成`,type:`success`}},n={high:{label:`高`,color:`#F56C6C`},medium:{label:`中`,color:`#E6A23C`},low:{label:`低`,color:`#909399`}},r={label:`未知`,type:`info`},i={label:`未知`,color:`#909399`},l=[`技术部`,`产品部`,`设计部`,`市场部`],u={技术部:[`张三`,`李四`],产品部:[`王五`,`赵六`],设计部:[`陈七`,`周八`],市场部:[`周八`,`陈七`]},f=[`前端组`,`后端组`,`UI组`,`运营组`,`增长组`],m=[{label:`待开始`,value:`pending`},{label:`进行中`,value:`active`},{label:`已完成`,value:`done`}],h=[{label:`高`,value:`high`},{label:`中`,value:`medium`},{label:`低`,value:`low`}];function v(e){let t=[`pending`,`active`,`done`],n=[`low`,`medium`,`high`],r=t[e%3],i=l[e%l.length],a=u[i]??[],o=a[0],s=a[e%Math.max(1,a.length)]??o??``;return{id:e+1,name:`任务 ${e+1} — ${[`需求评审`,`接口开发`,`联调测试`,`UI 走查`,`性能优化`][e%5]}`,status:r,priority:n[e%3],progress:r===`done`?100:r===`active`?20+e%6*15:0,amount:1e3+e%20*500,department:i,assignee:s,team:f[e%f.length],startDate:`2025-0${e%9+1}-${String(e%28+1).padStart(2,`0`)}`,endDate:`2025-0${e%9+1}-${String(e%28+15).padStart(2,`0`)}`,remark:`备注 ${e+1}`}}let b=T(Array.from({length:30},(e,t)=>v(t))),E=T(1),O=T(10),A=T(!1),ee=k(()=>b.value.length);function j(){A.value=!0,setTimeout(()=>{A.value=!1},200)}function M(e){E.value=e.currentPage,O.value=e.pageSize,j()}a(()=>{j()});let N=[{type:`expand`,width:55},{type:`selection`,width:55},{type:`index`,label:`#`,width:55,fixed:`left`},{prop:`id`,label:`ID`,editable:!1,sortable:!0},{prop:`name`,label:`任务名称`,editable:!0,component:`input`,sortable:!0,rules:[{required:!0,message:`请输入任务名称`},{min:2,max:100,message:`长度 2–100`}]},{prop:`status`,label:`状态`,editable:!0,component:`select`,componentProps:{clearable:!0,options:m},sortable:!0,render:e=>{let n=t[e?.row?.status]??r;return s(re,{type:n.type,size:`small`,disableTransitions:!0},()=>n.label)}},{prop:`progress`,label:`进度`,render:e=>{let t=e.row.progress;return s(`div`,{class:`demo-progress-cell`},[s(`span`,{class:`demo-progress-cell__pct`},`${t}%`),s(ie,{percentage:t,strokeWidth:5,showText:!1,status:t===100?`success`:void 0,style:{width:`76px`}})])}},{prop:`priority`,label:`优先级`,editable:!0,component:`select`,componentProps:{clearable:!0,options:h},dependencies:{triggerFields:[`status`],disabled(e){return e.status===`done`}},render:e=>{let t=n[e?.row?.priority]??i;return s(`span`,{style:{color:t.color,fontWeight:600}},t.label)}},{prop:`amount`,label:`金额`,align:`right`,editable:!0,component:`input-number`,componentProps:{min:0,step:100,controls:!1},formatter:e=>`¥ ${(e.amount??0).toLocaleString(`zh-CN`)}`,rules:[{required:!0,message:`请输入金额`},{type:`number`,min:0,message:`金额不能为负`}]},{prop:`assignee`,label:`负责人`,editable:!0,component:`select`,componentProps:{options:[`张三`,`李四`,`王五`,`赵六`,`陈七`,`周八`].map(e=>({label:e,value:e}))},dependencies:{triggerFields:[`department`],required(e){return e.status===`active`},componentProps(e){let t=e.department;return{options:(t?u[t]??[]:[]).map(e=>({label:e,value:e}))}}}},{label:`组织信息`,children:[{prop:`department`,label:`部门`,editable:e=>e.status!==`done`,component:`select`,componentProps:{options:l.map(e=>({label:e,value:e}))}},{prop:`team`,label:`团队`}]},{prop:`startDate`,label:`开始日期`,sortable:!0},{prop:`endDate`,label:`截止日期`,sortable:!0,renderHeader:({column:e})=>s(`span`,{style:`color: var(--el-color-danger); font-weight: 600`},`⏰ ${e.label}`)},{prop:`remark`,label:`备注`,editable:!0,showOverflowTooltip:!0,dependencies:{triggerFields:[`name`],trigger(e,t){t.setFieldValue(`remark`,``)}}},{prop:`_action`,label:`操作`,editable:!1,fixed:`right`}],R={name:[{required:!0,message:`任务名称必填`}]},z=T(null),B=T({prop:``,order:``}),V=T(!0),te=T(!0),H=T(`manual`),U=T(`cell`),ne=T(`—`),W=T(`—`);function ae(e){B.value={prop:e.prop??``,order:e.order??``}}let oe=[{key:`ctrl+g`,handler:e=>{ne.value=`Ctrl+G → 行 ${e.activeRowIndex+1} / 列 ${e.activeColIndex+1}`},preventDefault:!0}];function se(e){W.value=`开始编辑：行 ${e.rowIndex+1} / ${e.column.prop} = "${e.value}"`}function ce(e){W.value=`结束编辑：行 ${e.rowIndex+1} / ${e.column.prop} = "${e.value}"`}function G(e){W.value=`值变更：行 ${e.rowIndex+1} / ${e.column.prop}："${e.oldValue}" → "${e.newValue}"`}function le(e,t){z.value?.focusAndEditByProp?.(e,t)}function ue(){let e=z.value?.activeRowIndex??b.value.length;z.value?.insertRow(e+1,v(b.value.length))}function de(){let e=z.value?.activeRowIndex??-1;e>=0&&z.value?.deleteRow(e)}function K(){let e=z.value?.activeRowIndex??-1;e>=0&&z.value?.duplicateRow(e)}let q=T(``);async function fe(){let e=await z.value?.validate();e?.valid?q.value=`OK`:(q.value=`${Object.keys(e?.errors??{}).length} 行有错误`,z.value?.scrollToFirstError())}function pe(){z.value?.resetTracking()}let J=k(()=>z.value?.getDirtyCells()?.size??0),Y=k(()=>z.value?.getModifiedRows()?.length??0);return(e,t)=>{let n=c(`el-radio-button`),r=c(`el-radio-group`),i=c(`el-divider`),a=c(`el-checkbox`),s=c(`el-button`),l=c(`el-button-group`),u=c(`el-space`),f=c(`el-avatar`),m=c(`el-input`),h=c(`el-card`),v=d(`loading`);return F(),C(`div`,null,[_(`div`,ut,[t[27]||=_(`span`,{class:`label`},`编辑模式`,-1),g(r,{modelValue:U.value,"onUpdate:modelValue":t[0]||=e=>U.value=e,size:`small`},{default:D(()=>[g(n,{value:!1},{default:D(()=>[...t[10]||=[P(`只读`,-1)]]),_:1}),g(n,{value:`cell`},{default:D(()=>[...t[11]||=[P(`cell`,-1)]]),_:1}),g(n,{value:`row`},{default:D(()=>[...t[12]||=[P(`row`,-1)]]),_:1}),g(n,{value:`manual`},{default:D(()=>[...t[13]||=[P(`manual`,-1)]]),_:1}),g(n,{value:!0},{default:D(()=>[...t[14]||=[P(`all`,-1)]]),_:1})]),_:1},8,[`modelValue`]),g(i,{direction:`vertical`}),t[28]||=_(`span`,{class:`label`},`校验时机`,-1),g(r,{modelValue:H.value,"onUpdate:modelValue":t[1]||=e=>H.value=e,size:`small`},{default:D(()=>[g(n,{value:`manual`},{default:D(()=>[...t[15]||=[P(`手动`,-1)]]),_:1}),g(n,{value:`change`},{default:D(()=>[...t[16]||=[P(`change`,-1)]]),_:1}),g(n,{value:`blur`},{default:D(()=>[...t[17]||=[P(`blur`,-1)]]),_:1})]),_:1},8,[`modelValue`]),g(a,{modelValue:te.value,"onUpdate:modelValue":t[2]||=e=>te.value=e,size:`small`},{default:D(()=>[...t[18]||=[P(` 离格校验 `,-1)]]),_:1},8,[`modelValue`]),g(i,{direction:`vertical`}),g(a,{modelValue:V.value,"onUpdate:modelValue":t[3]||=e=>V.value=e,size:`small`},{default:D(()=>[...t[19]||=[P(`热键`,-1)]]),_:1},8,[`modelValue`]),g(i,{direction:`vertical`}),t[29]||=_(`span`,{class:`label`},`行操作`,-1),g(l,{size:`small`},{default:D(()=>[g(s,{onClick:ue},{default:D(()=>[...t[20]||=[P(`插入行`,-1)]]),_:1}),g(s,{onClick:de},{default:D(()=>[...t[21]||=[P(`删除行`,-1)]]),_:1}),g(s,{onClick:K},{default:D(()=>[...t[22]||=[P(`复制行`,-1)]]),_:1})]),_:1}),g(i,{direction:`vertical`}),g(l,{size:`small`},{default:D(()=>[g(s,{disabled:!z.value?.canUndo,onClick:t[4]||=e=>z.value?.undo()},{default:D(()=>[...t[23]||=[P(` 撤销 `,-1)]]),_:1},8,[`disabled`]),g(s,{disabled:!z.value?.canRedo,onClick:t[5]||=e=>z.value?.redo()},{default:D(()=>[...t[24]||=[P(` 重做 `,-1)]]),_:1},8,[`disabled`])]),_:1}),g(s,{size:`small`,type:`primary`,onClick:fe},{default:D(()=>[...t[25]||=[P(` 校验 `,-1)]]),_:1}),g(s,{size:`small`,onClick:pe},{default:D(()=>[...t[26]||=[P(` 重置脏标记 `,-1)]]),_:1})]),_(`div`,dt,[_(`span`,ft,[t[30]||=_(`span`,{class:`demo-statusbar__k`},`排序`,-1),P(` `+p(B.value.prop?`${B.value.prop} (${B.value.order})`:`无`),1)]),t[36]||=_(`span`,{class:`demo-statusbar__sep`,"aria-hidden":`true`},`|`,-1),_(`span`,pt,[t[31]||=_(`span`,{class:`demo-statusbar__k`},`激活`,-1),P(` 行 `+p((z.value?.activeRowIndex??-1)+1)+` / 列 `+p((z.value?.activeColIndex??-1)+1),1)]),t[37]||=_(`span`,{class:`demo-statusbar__sep`,"aria-hidden":`true`},`|`,-1),_(`span`,$,[t[32]||=_(`span`,{class:`demo-statusbar__k`},`脏数据`,-1),P(` `+p(J.value)+` 格 / `+p(Y.value)+` 行 `,1)]),t[38]||=_(`span`,{class:`demo-statusbar__sep`,"aria-hidden":`true`},`|`,-1),_(`span`,mt,[t[33]||=_(`span`,{class:`demo-statusbar__k`},`校验`,-1),P(` `+p(q.value||`—`),1)]),t[39]||=_(`span`,{class:`demo-statusbar__sep`,"aria-hidden":`true`},`|`,-1),_(`span`,ht,[t[34]||=_(`span`,{class:`demo-statusbar__k`},`Ctrl+G`,-1),P(` `+p(ne.value),1)]),t[40]||=_(`span`,{class:`demo-statusbar__sep`,"aria-hidden":`true`},`|`,-1),_(`span`,gt,[t[35]||=_(`span`,{class:`demo-statusbar__k`},`编辑`,-1),P(` `+p(W.value),1)])]),g(h,{class:`demo-table-card`,shadow:`never`},{default:D(()=>[x((F(),y(o(Q),{ref_key:`tableRef`,ref:z,data:b.value,"onUpdate:data":t[7]||=e=>b.value=e,"current-page":E.value,"onUpdate:currentPage":t[8]||=e=>E.value=e,"page-size":O.value,"onUpdate:pageSize":t[9]||=e=>O.value=e,total:ee.value,columns:N,rules:R,"validate-on-cell-exit":te.value,"validate-trigger":H.value,"hotkey-enabled":V.value,hotkeys:oe,editable:U.value,"cell-active":``,"row-active":``,border:``,"row-key":`id`,"column-setting":``,onSortChange:ae,onPagination:M,onCellEditStart:se,onCellEditEnd:ce,onCellValueChange:G},{title:D(()=>[_(`div`,_t,[t[41]||=_(`span`,{class:`demo-table-heading__title`},`任务管理`,-1),g(o(re),{size:`small`,round:``,type:`info`,effect:`plain`,"disable-transitions":!0},{default:D(()=>[P(p(b.value.length)+` 条 `,1)]),_:1})])]),actions:D(()=>[g(u,null,{default:D(()=>[z.value?.isEditing?(F(),y(o(re),{key:0,type:`warning`,size:`small`,"disable-transitions":!0},{default:D(()=>[...t[42]||=[P(` 编辑中 `,-1)]]),_:1})):w(``,!0)]),_:1})]),"cell-assignee":D(({row:e})=>[_(`div`,vt,[g(f,{size:22,class:`avatar`},{default:D(()=>[P(p(e?.assignee?.charAt(0)??``),1)]),_:2},1024),_(`span`,null,p(e?.assignee??``),1)])]),"header-assignee":D(()=>[...t[43]||=[_(`span`,{class:`demo-col-head--primary`},`负责人`,-1)]]),expand:D(({row:e})=>[_(`div`,yt,[_(`p`,null,[t[44]||=_(`strong`,null,`任务：`,-1),P(p(e?.name),1)]),_(`p`,null,[t[45]||=_(`strong`,null,`时间：`,-1),P(p(e?.startDate)+` ~ `+p(e?.endDate),1)]),_(`p`,null,[t[46]||=_(`strong`,null,`备注：`,-1),P(p(e?.remark),1)])])]),"editor-remark":D(e=>[g(m,S(e,{placeholder:`请输入备注…`,class:`plus-table-cell-editor`,onKeydown:t[6]||=I(L(()=>{},[`stop`,`prevent`]),[`esc`])}),null,16)]),"cell-_action":D(({$index:e})=>[g(s,{link:``,type:`primary`,size:`small`,onClick:L(t=>le(e,`name`),[`stop`])},{default:D(()=>[...t[47]||=[P(` 编辑名称 `,-1)]]),_:1},8,[`onClick`]),g(s,{link:``,type:`primary`,size:`small`,onClick:L(t=>le(e,`remark`),[`stop`])},{default:D(()=>[...t[48]||=[P(` 编辑备注 `,-1)]]),_:1},8,[`onClick`])]),summary:D(()=>[...t[49]||=[_(`span`,{class:`demo-table-summary`},` 提示：分页为前端全量数据演示；接入服务端时请按页更新 data。 `,-1)]]),_:1},8,[`data`,`current-page`,`page-size`,`total`,`validate-on-cell-exit`,`validate-trigger`,`hotkey-enabled`,`editable`])),[[v,A.value]])]),_:1})])}}}),[[`__scopeId`,`data-v-ba36f008`]]),xt=`<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { ElProgress, ElTag } from 'element-plus';

import { PlusTable } from '@labs/plus-table';
import type {
  DependencyApi,
  HotkeyContext,
  PlusTableColumn,
} from '@labs/plus-table';
import type { RuleItem } from 'async-validator';
// ──── 数据类型 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  amount: number;
  assignee: string;
  department: string;
  team: string;
  startDate: string;
  endDate: string;
  remark: string;
  [key: string]: unknown;
}

// ──── 映射与选项 ────

const statusMap: Record<
  string,
  { label: string; type: 'info' | 'warning' | 'success' }
> = {
  pending: { label: '待开始', type: 'info' },
  active: { label: '进行中', type: 'warning' },
  done: { label: '已完成', type: 'success' },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#F56C6C' },
  medium: { label: '中', color: '#E6A23C' },
  low: { label: '低', color: '#909399' },
};

const defaultStatus = { label: '未知', type: 'info' as const };
const defaultPriority = { label: '未知', color: '#909399' };

const departments = ['技术部', '产品部', '设计部', '市场部'];
const departmentAssignees: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  产品部: ['王五', '赵六'],
  设计部: ['陈七', '周八'],
  市场部: ['周八', '陈七'],
};
const teams = ['前端组', '后端组', 'UI组', '运营组', '增长组'];

const statusOptions = [
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'done' },
];

const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
];

function createRow(i: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  const status = statuses[i % 3]!;
  const dept = departments[i % departments.length]!;
  const assigneesForDept = departmentAssignees[dept] ?? [];
  const a0 = assigneesForDept[0];
  const assignee =
    assigneesForDept[i % Math.max(1, assigneesForDept.length)] ?? a0 ?? '';
  return {
    id: i + 1,
    name: \`任务 \${i + 1} — \${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][i % 5]}\`,
    status,
    priority: priorities[i % 3]!,
    progress:
      status === 'done' ? 100 : status === 'active' ? 20 + (i % 6) * 15 : 0,
    amount: 1000 + (i % 20) * 500,
    department: dept,
    assignee,
    team: teams[i % teams.length]!,
    startDate: \`2025-0\${(i % 9) + 1}-\${String((i % 28) + 1).padStart(2, '0')}\`,
    endDate: \`2025-0\${(i % 9) + 1}-\${String((i % 28) + 15).padStart(2, '0')}\`,
    remark: \`备注 \${i + 1}\`,
  };
}

const tableData = ref<TaskRow[]>(
  Array.from({ length: 30 }, (_, i) => createRow(i)),
);

// ──── 分页 ────

const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const total = computed(() => tableData.value.length);

function simulateLoading() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 200);
}

function handlePagination(payload: { currentPage: number; pageSize: number }) {
  currentPage.value = payload.currentPage;
  pageSize.value = payload.pageSize;
  simulateLoading();
}

onMounted(() => {
  simulateLoading();
});

// ──── 列配置（含 dependencies）────

const columns: PlusTableColumn<TaskRow>[] = [
  { type: 'expand', width: 55 },
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55, fixed: 'left' },
  {
    prop: 'id',
    label: 'ID',
    editable: false,
    sortable: true,
  },
  {
    prop: 'name',
    label: '任务名称',
    editable: true,
    component: 'input',
    sortable: true,
    rules: [
      { required: true, message: '请输入任务名称' },
      { min: 2, max: 100, message: '长度 2–100' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    editable: true,
    component: 'select',
    componentProps: {
      clearable: true,
      options: statusOptions,
    },
    sortable: true,
    render: (scope: { row: TaskRow }) => {
      const info = statusMap[scope?.row?.status as string] ?? defaultStatus;
      return h(
        ElTag,
        { type: info.type, size: 'small', disableTransitions: true },
        () => info.label,
      );
    },
  },
  {
    prop: 'progress',
    label: '进度',
    render: (scope: { row: TaskRow }) => {
      const row = scope.row as TaskRow;
      const p = row.progress;
      return h('div', { class: 'demo-progress-cell' }, [
        h('span', { class: 'demo-progress-cell__pct' }, \`\${p}%\`),
        h(ElProgress, {
          percentage: p,
          strokeWidth: 5,
          showText: false,
          status: p === 100 ? 'success' : undefined,
          style: { width: '76px' },
        }),
      ]);
    },
  },
  {
    prop: 'priority',
    label: '优先级',
    editable: true,
    component: 'select',
    componentProps: {
      clearable: true,
      options: priorityOptions,
    },
    dependencies: {
      triggerFields: ['status'],
      disabled(values: TaskRow) {
        return values.status === 'done';
      },
    },
    render: (scope: { row: TaskRow }) => {
      const priority =
        priorityMap[scope?.row?.priority as string] ?? defaultPriority;
      return h(
        'span',
        { style: { color: priority.color, fontWeight: 600 } },
        priority.label,
      );
    },
  },
  {
    prop: 'amount',
    label: '金额',
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: {
      min: 0,
      step: 100,
      controls: false,
    },
    formatter: (row: TaskRow) =>
      \`¥ \${(row.amount ?? 0).toLocaleString('zh-CN')}\`,
    rules: [
      { required: true, message: '请输入金额' },
      { type: 'number', min: 0, message: '金额不能为负' },
    ],
  },
  {
    prop: 'assignee',
    label: '负责人',
    editable: true,
    component: 'select',
    componentProps: {
      options: ['张三', '李四', '王五', '赵六', '陈七', '周八'].map((a) => ({
        label: a,
        value: a,
      })),
    },
    dependencies: {
      triggerFields: ['department'],
      required(values: TaskRow) {
        return values.status === 'active';
      },
      componentProps(values: TaskRow) {
        const dept = values.department;
        const list = dept ? (departmentAssignees[dept] ?? []) : [];
        return {
          options: list.map((a) => ({ label: a, value: a })),
        };
      },
    },
  },
  {
    label: '组织信息',
    children: [
      {
        prop: 'department',
        label: '部门',
        editable: (row) => row.status !== 'done',
        component: 'select',
        componentProps: {
          options: departments.map((d) => ({ label: d, value: d })),
        },
      },
      { prop: 'team', label: '团队' },
    ],
  },
  {
    prop: 'startDate',
    label: '开始日期',
    sortable: true,
  },
  {
    prop: 'endDate',
    label: '截止日期',
    sortable: true,
    renderHeader: ({ column }) =>
      h(
        'span',
        { style: 'color: var(--el-color-danger); font-weight: 600' },
        \`⏰ \${column.label}\`,
      ),
  },
  {
    prop: 'remark',
    label: '备注',
    editable: true,
    showOverflowTooltip: true,
    dependencies: {
      triggerFields: ['name'],
      trigger(_values, api: DependencyApi<TaskRow>) {
        api.setFieldValue('remark', '');
      },
    },
  },
  {
    prop: '_action',
    label: '操作',
    editable: false,
    fixed: 'right',
  },
];

const tableRules: Record<string, RuleItem | RuleItem[]> = {
  name: [{ required: true, message: '任务名称必填' }],
};

// ──── 状态与控制 ────

const tableRef = ref<InstanceType<typeof PlusTable> | null>(null);
const sortInfo = ref({ prop: '', order: '' });
const hotkeyEnabled = ref(true);
const validateOnCellExit = ref(true);
const validateTrigger = ref<'manual' | 'change' | 'blur'>('manual');
const editableMode = ref<boolean | 'cell' | 'row' | 'manual'>('cell');
const lastHotkeyLog = ref<string>('—');
const editLog = ref('—');

function handleSortChange(payload: { prop: string; order: string }) {
  sortInfo.value = { prop: payload.prop ?? '', order: payload.order ?? '' };
}

const customHotkeys = [
  {
    key: 'ctrl+g',
    handler: (ctx: HotkeyContext) => {
      lastHotkeyLog.value = \`Ctrl+G → 行 \${ctx.activeRowIndex + 1} / 列 \${ctx.activeColIndex + 1}\`;
    },
    preventDefault: true,
  },
];

function onEditStart(payload: {
  rowIndex: number;
  column: { prop?: string };
  value: unknown;
}) {
  editLog.value = \`开始编辑：行 \${payload.rowIndex + 1} / \${payload.column.prop} = "\${payload.value}"\`;
}

function onEditEnd(payload: {
  rowIndex: number;
  column: { prop?: string };
  value: unknown;
}) {
  editLog.value = \`结束编辑：行 \${payload.rowIndex + 1} / \${payload.column.prop} = "\${payload.value}"\`;
}

function onValueChange(payload: {
  rowIndex: number;
  column: { prop?: string };
  oldValue: unknown;
  newValue: unknown;
}) {
  editLog.value = \`值变更：行 \${payload.rowIndex + 1} / \${payload.column.prop}："\${payload.oldValue}" → "\${payload.newValue}"\`;
}

function editField(rowIndex: number, prop: string) {
  tableRef.value?.focusAndEditByProp?.(rowIndex, prop);
}

// ──── 行操作 ────

function handleInsertRow() {
  const idx = tableRef.value?.activeRowIndex ?? tableData.value.length;
  tableRef.value?.insertRow(idx + 1, createRow(tableData.value.length));
}

function handleDeleteRow() {
  const idx = tableRef.value?.activeRowIndex ?? -1;
  if (idx >= 0) tableRef.value?.deleteRow(idx);
}

function handleDuplicateRow() {
  const idx = tableRef.value?.activeRowIndex ?? -1;
  if (idx >= 0) tableRef.value?.duplicateRow(idx);
}

// ──── 校验 & 脏数据 ────

const validationResult = ref('');

async function handleValidate() {
  const result = await tableRef.value?.validate();
  if (result?.valid) {
    validationResult.value = 'OK';
  } else {
    const count = Object.keys(result?.errors ?? {}).length;
    validationResult.value = \`\${count} 行有错误\`;
    tableRef.value?.scrollToFirstError();
  }
}

function handleResetTracking() {
  tableRef.value?.resetTracking();
}

const dirtyCount = computed(() => {
  const cells = tableRef.value?.getDirtyCells();
  return cells?.size ?? 0;
});

const modifiedRowCount = computed(() => {
  return tableRef.value?.getModifiedRows()?.length ?? 0;
});
<\/script>

<template>
  <div>
    <div class="page-toolbar">
      <span class="label">编辑模式</span>
      <el-radio-group v-model="editableMode" size="small">
        <el-radio-button :value="false">只读</el-radio-button>
        <el-radio-button value="cell">cell</el-radio-button>
        <el-radio-button value="row">row</el-radio-button>
        <el-radio-button value="manual">manual</el-radio-button>
        <el-radio-button :value="true">all</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <span class="label">校验时机</span>
      <el-radio-group v-model="validateTrigger" size="small">
        <el-radio-button value="manual">手动</el-radio-button>
        <el-radio-button value="change">change</el-radio-button>
        <el-radio-button value="blur">blur</el-radio-button>
      </el-radio-group>
      <el-checkbox v-model="validateOnCellExit" size="small">
        离格校验
      </el-checkbox>

      <el-divider direction="vertical" />
      <el-checkbox v-model="hotkeyEnabled" size="small">热键</el-checkbox>

      <el-divider direction="vertical" />
      <span class="label">行操作</span>
      <el-button-group size="small">
        <el-button @click="handleInsertRow">插入行</el-button>
        <el-button @click="handleDeleteRow">删除行</el-button>
        <el-button @click="handleDuplicateRow">复制行</el-button>
      </el-button-group>

      <el-divider direction="vertical" />
      <el-button-group size="small">
        <el-button
          :disabled="!tableRef?.canUndo"
          @click="tableRef?.undo()"
        >
          撤销
        </el-button>
        <el-button
          :disabled="!tableRef?.canRedo"
          @click="tableRef?.redo()"
        >
          重做
        </el-button>
      </el-button-group>
      <el-button size="small" type="primary" @click="handleValidate">
        校验
      </el-button>
      <el-button size="small" @click="handleResetTracking">
        重置脏标记
      </el-button>
    </div>

    <div class="demo-statusbar" role="status" aria-live="polite">
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">排序</span>
        {{ sortInfo.prop ? \`\${sortInfo.prop} (\${sortInfo.order})\` : '无' }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">激活</span>
        行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
        {{ (tableRef?.activeColIndex ?? -1) + 1 }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">脏数据</span>
        {{ dirtyCount }} 格 / {{ modifiedRowCount }} 行
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">校验</span>
        {{ validationResult || '—' }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">Ctrl+G</span>
        {{ lastHotkeyLog }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item demo-statusbar__item--grow">
        <span class="demo-statusbar__k">编辑</span>
        {{ editLog }}
      </span>
    </div>

    <el-card class="demo-table-card" shadow="never">
      <PlusTable
        ref="tableRef"
        v-loading="loading"
        v-model:data="tableData"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :columns="columns"
        :rules="tableRules"
        :validate-on-cell-exit="validateOnCellExit"
        :validate-trigger="validateTrigger"
        :hotkey-enabled="hotkeyEnabled"
        :hotkeys="customHotkeys"
        :editable="editableMode"
        cell-active
        row-active
        border
        row-key="id"
        column-setting
        @sort-change="handleSortChange"
        @pagination="handlePagination"
        @cell-edit-start="onEditStart"
        @cell-edit-end="onEditEnd"
        @cell-value-change="onValueChange"
      >
        <template #title>
          <div class="demo-table-heading">
            <span class="demo-table-heading__title">任务管理</span>
            <el-tag
              size="small"
              round
              type="info"
              effect="plain"
              :disable-transitions="true"
            >
              {{ tableData.length }} 条
            </el-tag>
          </div>
        </template>
        <template #actions>
          <el-space>
            <el-tag
              v-if="tableRef?.isEditing"
              type="warning"
              size="small"
              :disable-transitions="true"
            >
              编辑中
            </el-tag>
          </el-space>
        </template>

        <template #cell-assignee="{ row }">
          <div class="assignee-cell">
            <el-avatar :size="22" class="avatar">
              {{ (row as TaskRow)?.assignee?.charAt(0) ?? '' }}
            </el-avatar>
            <span>{{ (row as TaskRow)?.assignee ?? '' }}</span>
          </div>
        </template>

        <template #header-assignee>
          <span class="demo-col-head--primary">负责人</span>
        </template>

        <template #expand="{ row }">
          <div class="expand-content">
            <p><strong>任务：</strong>{{ (row as TaskRow)?.name }}</p>
            <p>
              <strong>时间：</strong>{{ (row as TaskRow)?.startDate }} ~
              {{ (row as TaskRow)?.endDate }}
            </p>
            <p><strong>备注：</strong>{{ (row as TaskRow)?.remark }}</p>
          </div>
        </template>

        <template #editor-remark="scope">
          <el-input
            v-bind="scope"
            placeholder="请输入备注…"
            class="plus-table-cell-editor"
            @keydown.esc.stop.prevent
          />
        </template>

        <template #cell-_action="{ $index }">
          <el-button
            link
            type="primary"
            size="small"
            @click.stop="editField($index, 'name')"
          >
            编辑名称
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click.stop="editField($index, 'remark')"
          >
            编辑备注
          </el-button>
        </template>

        <template #summary>
          <span class="demo-table-summary">
            提示：分页为前端全量数据演示；接入服务端时请按页更新 data。
          </span>
        </template>
      </PlusTable>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  .label {
    font-size: 12px;
    font-weight: 500;
    color: var(--muted-foreground);
  }
}

.demo-statusbar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 4px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted-foreground);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-variant-numeric: tabular-nums;

  &__k {
    margin-right: 4px;
    font-weight: 500;
    color: var(--foreground);
  }

  &__sep {
    margin: 0 6px;
    color: var(--border);
    user-select: none;
  }

  &__item {
    min-width: 0;

    &--grow {
      flex: 1 1 200px;
    }
  }
}

.demo-table-card {
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.demo-table-heading {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  &__title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: -0.2px;
    color: var(--foreground);
  }
}

.demo-col-head--primary {
  color: var(--foreground);
  font-weight: 500;
}

.demo-table-summary {
  font-size: 12px;
  color: var(--muted-foreground);
}

:deep(.demo-progress-cell) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

:deep(.demo-progress-cell__pct) {
  min-width: 2.75rem;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--muted-foreground);
}

.assignee-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .avatar {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 12px;
  }
}

.expand-content {
  padding: 12px 16px;
  line-height: 1.75;
  font-size: 12px;
  color: var(--muted-foreground);
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0;

  p {
    margin: 0 0 4px;
  }
}
</style>
`;const St=JSON.parse(`{"title":"PlusTable","description":"基于 Element Plus el-table 的增强表格","frontmatter":{"title":"PlusTable","description":"基于 Element Plus el-table 的增强表格"},"headers":[],"relativePath":"components/plus-table/index.md","filePath":"components/plus-table/index.md"}`);var Ct=M({name:`components/plus-table/index.md`,setup(e){return(e,t)=>{let n=c(`ClientOnly`),r=c(`DemoBlock`);return F(),C(`div`,null,[t[0]||=_(`h1`,{id:`plustable`,tabindex:`-1`},[P(`PlusTable `),_(`a`,{class:`header-anchor`,href:`#plustable`,"aria-label":`Permalink to “PlusTable”`},`​`)],-1),t[1]||=_(`p`,null,[P(`基于 Element Plus `),_(`code`,null,`el-table`),P(` 的增强表格：配置式列、可编辑单元格、键盘导航与热键、校验、行增删改与撤销重做、列设置持久化、单元格联动（dependencies）、脏数据追踪、分页与自适应高度。`)],-1),g(r,{title:`基础用法`,description:`配置式列 + cell 编辑模式，双击单元格即可编辑。`,source:o(lt)},{default:D(()=>[g(n,null,{default:D(()=>[g(ct)]),_:1})]),_:1},8,[`source`]),t[2]||=A(`<h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to “快速开始”">​</a></h2><div class="language-vue line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ref } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { PlusTable } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@labs/plus-table&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { PlusTableColumn } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@labs/plus-table&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Row</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Row</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;([{ id: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;示例&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }]);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> columns</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PlusTableColumn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Row</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;selection&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">48</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { prop: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;id&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ID&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { prop: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;name&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;名称&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, editable: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, component: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;input&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">PlusTable</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model:data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;data&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> :columns</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;columns&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> row-key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;id&quot;</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> border</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><h2 id="综合示例" tabindex="-1">综合示例 <a class="header-anchor" href="#综合示例" aria-label="Permalink to “综合示例”">​</a></h2><p>涵盖编辑模式切换、校验、行操作、撤销重做、脏数据追踪、单元格联动、分页、列设置等能力。先点击表格区域聚焦，再用键盘导航与快捷键。</p>`,4),g(r,{title:`交互示例`,description:`完整功能演示：双击编辑、键盘导航、热键、校验、行操作与分页。`,source:o(xt)},{default:D(()=>[g(n,null,{default:D(()=>[g(bt)]),_:1})]),_:1},8,[`source`]),t[3]||=A(`<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to “Props”">​</a></h2><p>未列出的属性通过 <code>v-bind=&quot;$attrs&quot;</code> 透传给 <code>el-table</code>（如 <code>sort-change</code>）。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>data</code></td><td><code>T[]</code></td><td><code>[]</code></td><td>表格数据，支持 <code>v-model:data</code></td></tr><tr><td><code>columns</code></td><td><code>PlusTableColumn[]</code></td><td><code>[]</code></td><td>列配置</td></tr><tr><td><code>rowKey</code></td><td><code>string | (row) =&gt; string | number</code></td><td>—</td><td>与 <code>el-table</code> 一致</td></tr><tr><td><code>stripe</code> / <code>border</code> / <code>showOverflowTooltip</code></td><td><code>boolean</code></td><td><code>false</code> / <code>true</code> / <code>true</code></td><td>展示相关</td></tr><tr><td><code>maxHeight</code></td><td><code>string | number</code></td><td>—</td><td>固定最大高度；未设且开启 adaptive 时由自适应计算</td></tr><tr><td><code>cellActive</code> / <code>rowActive</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否高亮当前激活单元格 / 行</td></tr><tr><td><code>editable</code></td><td><code>boolean | &#39;cell&#39; | &#39;row&#39; | &#39;manual&#39;</code></td><td><code>false</code></td><td>cell 双击进入；row 行编辑；manual 需 startEdit</td></tr><tr><td><code>rules</code></td><td><code>Record&lt;string, RuleItem | RuleItem[]&gt;</code></td><td>—</td><td>表级校验（async-validator），按列 prop 聚合</td></tr><tr><td><code>validateTrigger</code></td><td><code>&#39;change&#39; | &#39;blur&#39; | &#39;manual&#39;</code></td><td><code>manual</code></td><td>校验触发时机</td></tr><tr><td><code>validateOnCellExit</code></td><td><code>boolean</code></td><td><code>false</code></td><td>离开单元格（确认编辑）时是否校验</td></tr><tr><td><code>columnSetting</code></td><td><code>boolean</code></td><td><code>true</code></td><td>列设置（显隐、排序、列宽，可本地持久化）</td></tr><tr><td><code>hotkeyEnabled</code> / <code>hotkeys</code></td><td><code>boolean</code> / <code>HotkeyBinding[]</code></td><td><code>true</code> / —</td><td>键盘导航与自定义热键</td></tr><tr><td><code>currentPage</code> / <code>pageSize</code> / <code>total</code></td><td><code>number</code></td><td>—</td><td>传入 total 即启用底部分页；data 须由父组件按页传入，组件不切片</td></tr><tr><td><code>pageSizes</code> / <code>paginationLayout</code></td><td>—</td><td>—</td><td>分页器配置，见 <code>plus-table-pagination.vue</code></td></tr><tr><td><code>adaptive</code></td><td><code>boolean | AdaptiveConfig</code></td><td><code>false</code></td><td>视口自适应 maxHeight；AdaptiveConfig：offsetTop、offsetBottom、excludeSelectors</td></tr><tr><td><code>columnSettingKey</code></td><td><code>string</code></td><td><code>&#39;plus-table-default&#39;</code></td><td>列设置持久化 key；多实例时需各自不同，否则互相覆盖</td></tr></tbody></table><h2 id="事件" tabindex="-1">事件 <a class="header-anchor" href="#事件" aria-label="Permalink to “事件”">​</a></h2><p><code>el-table</code> 原生事件（如 <code>sort-change</code>）可直接监听。</p><table tabindex="0"><thead><tr><th>事件</th><th>载荷</th><th>说明</th></tr></thead><tbody><tr><td><code>update:data</code></td><td><code>T[]</code></td><td>数据变更（编辑、行操作等）</td></tr><tr><td><code>cell-edit-start</code> / <code>cell-edit-end</code></td><td><code>{ rowIndex, column, value }</code></td><td>单元格进入 / 退出编辑</td></tr><tr><td><code>cell-value-change</code></td><td><code>{ rowIndex, column, oldValue, newValue }</code></td><td>单元格值变化</td></tr><tr><td><code>update:currentPage</code> / <code>update:pageSize</code></td><td><code>number</code></td><td>分页同步</td></tr><tr><td><code>pagination</code></td><td><code>{ currentPage, pageSize }</code></td><td>页码或每页条数变化，用于拉取数据</td></tr></tbody></table><h2 id="插槽" tabindex="-1">插槽 <a class="header-anchor" href="#插槽" aria-label="Permalink to “插槽”">​</a></h2><table tabindex="0"><thead><tr><th>插槽</th><th>说明</th></tr></thead><tbody><tr><td><code>title</code></td><td>顶部左侧标题区</td></tr><tr><td><code>actions</code></td><td>顶部右侧，与列设置按钮同排</td></tr><tr><td><code>summary</code></td><td>底部左侧（与分页同排）</td></tr><tr><td><code>pagination</code></td><td>覆盖默认分页器；<code>total != null</code> 时默认显示内置分页</td></tr><tr><td><code>expand</code></td><td><code>type: &#39;expand&#39;</code> 列的展开内容</td></tr><tr><td><code>append</code> / <code>empty</code></td><td>透传 <code>el-table</code></td></tr><tr><td><code>cell-\${prop}</code></td><td>按列 prop 自定义展示单元格</td></tr><tr><td><code>header-\${prop}</code></td><td>自定义表头</td></tr><tr><td><code>editor-\${prop}</code></td><td>按列自定义编辑器（需该列 editable）</td></tr></tbody></table><h2 id="列配置-plustablecolumn" tabindex="-1">列配置 PlusTableColumn <a class="header-anchor" href="#列配置-plustablecolumn" aria-label="Permalink to “列配置 PlusTableColumn”">​</a></h2><ul><li><code>hidden</code>：列设置中可隐藏。</li><li><code>editable</code>：是否可编辑，可为 <code>(row) =&gt; boolean</code>。</li><li><code>component</code>：编辑组件标识或组件，内置映射见 <code>adapters/index.ts</code>（input、input-number、select、date-picker、switch、time-picker、time-select）。</li><li><code>componentProps</code>：编辑组件 props，或 <code>(row, column) =&gt; props</code>。</li><li><code>rules</code> / <code>required</code>：列级校验（可与表级 <code>rules</code> 合并）。</li><li><code>render</code>：展示态 VNode <code>(ctx: CellContext) =&gt; VNode</code>。</li><li><code>formatter</code>：与 <code>el-table-column</code> 一致。</li><li><code>renderHeader</code>：自定义表头（无 <code>header-\${prop}</code> 插槽时）。</li><li><code>dependencies</code>：单元格联动（见下节）。</li><li><code>children</code>：多级表头。</li><li>特殊 <code>type</code>：<code>selection</code>、<code>index</code>、<code>expand</code>。</li></ul><h2 id="编辑模式" tabindex="-1">编辑模式 <a class="header-anchor" href="#编辑模式" aria-label="Permalink to “编辑模式”">​</a></h2><p><code>editable</code> prop 决定表格的编辑行为，支持 5 种模式：</p><ul><li><code>false</code>（默认）：只读模式，不可编辑。</li><li><code>&#39;cell&#39;</code>：单元格模式，双击 / F2 / 可打印字符进入编辑，Enter 确认并下移，Esc 取消，Tab 横移并确认。</li><li><code>&#39;row&#39;</code>：行模式，同一行所有可编辑列同时进入编辑态；Tab 在行内循环而非确认；切换到其他行时整行确认。</li><li><code>&#39;manual&#39;</code>：手动模式，需通过 <code>startEdit(rowIndex, colIndex)</code> 或 <code>focusAndEditByProp(rowIndex, prop)</code> 触发，不响应双击或 F2。</li><li><code>true</code>：全量模式（all），所有可编辑单元格始终展示编辑器，无需进入/退出编辑。方向键和 Tab 直接在编辑器间移动焦点。</li></ul><p>编辑支持 <strong>Ctrl+Z / Ctrl+Shift+Z</strong> 撤销重做（最多 50 步），undo/redo 后脏标记自动同步。</p><h2 id="单元格联动-dependencies" tabindex="-1">单元格联动 dependencies <a class="header-anchor" href="#单元格联动-dependencies" aria-label="Permalink to “单元格联动 dependencies”">​</a></h2><p><code>DependencyApi</code> 提供 <code>rowIndex</code>、<code>row</code>、<code>column</code>、<code>getFieldValue</code>、<code>setFieldValue</code>。</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dependencies</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  triggerFields</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;department&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  disabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">api</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  required</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">api</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> values.status </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;active&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  rules</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">api</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [{ required: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;...&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  componentProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">api</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ options: [</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] }),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  trigger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">api</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { api.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setFieldValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;remark&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><h2 id="脏数据追踪" tabindex="-1">脏数据追踪 <a class="header-anchor" href="#脏数据追踪" aria-label="Permalink to “脏数据追踪”">​</a></h2><p>组件内部自动维护一份基线快照（data 首次非空值的深拷贝），编辑后通过对比判断哪些单元格被修改。脏单元格左上角显示红色三角角标（<code>plus-table-cell--dirty</code>），脏行加 <code>plus-table-row--dirty</code>。</p><ul><li><code>markDirty(rowIndex, prop)</code>：手动标记（通常由编辑系统自动调用）。</li><li><code>clearDirty(rowIndex?, prop?)</code>：清除脏标记；无参清空全部，仅 rowIndex 清该行，rowIndex + prop 清单格。</li><li><code>resetTracking()</code>：将当前 data 作为新基线，清空所有脏标记。</li><li><code>getModifiedRows()</code>：返回至少有一个脏单元格的行数据数组。</li><li><code>getDirtyCells()</code>：返回所有脏单元格 key 集合（格式 <code>rowIndex:prop</code>）。</li><li><code>isCellDirty(rowIndex, prop)</code> / <code>isRowDirty(rowIndex)</code>：单格 / 行级查询。</li></ul><h2 id="暴露方法-ref" tabindex="-1">暴露方法（ref） <a class="header-anchor" href="#暴露方法-ref" aria-label="Permalink to “暴露方法（ref）”">​</a></h2><ul><li><strong>导航</strong>：<code>navigate</code>、<code>focusCell</code>、<code>getColIndexByProp</code>、<code>focusAndEditByProp</code>、<code>activeRowIndex</code>、<code>activeColIndex</code>、<code>activeRow</code>、<code>activeColumn</code></li><li><strong>编辑</strong>：<code>startEdit</code>、<code>confirmEdit</code>、<code>cancelEdit</code>、<code>editMode</code>、<code>isEditing</code></li><li><strong>校验</strong>：<code>validate(rows?)</code>、<code>validateField(rowIndex, prop)</code>、<code>clearValidation(rowIndex?, prop?)</code>、<code>scrollToFirstError()</code></li><li><strong>行操作</strong>：<code>insertRow(index?, defaultRow?, count?)</code>、<code>deleteRow(index?)</code>、<code>moveRow(from, to)</code>、<code>duplicateRow(index?)</code></li><li><strong>脏数据</strong>：<code>markDirty</code>、<code>clearDirty</code>、<code>resetTracking</code>、<code>getModifiedRows</code>、<code>getDirtyCells</code>、<code>isCellDirty</code>、<code>isRowDirty</code></li><li><strong>撤销重做</strong>：<code>undo</code>、<code>redo</code>、<code>canUndo</code>、<code>canRedo</code>、<code>clearHistory</code></li><li><strong>列操作</strong>：<code>toggleColumn</code>、<code>reorderColumns</code>、<code>setColumnWidth</code>、<code>resetColumns</code></li><li><strong>el-table 透传</strong>：<code>getElTable</code>、<code>clearSelection</code>、<code>getSelectionRows</code>、<code>toggleRowSelection</code>、<code>toggleAllSelection</code>、<code>doLayout</code>、<code>sort</code>、<code>scrollTo</code> 等</li></ul><p>行操作下标均为<strong>当前 data 数组下标</strong>（与服务端分页时「仅含当前页数据」一致）。</p><h2 id="内置键盘行为" tabindex="-1">内置键盘行为 <a class="header-anchor" href="#内置键盘行为" aria-label="Permalink to “内置键盘行为”">​</a></h2><p>表格容器需获得焦点（点击表格区域）后生效。</p><ul><li><strong>方向键</strong>：移动激活单元格。</li><li><strong>Tab / Shift+Tab</strong>：横向移动；编辑中在 row 模式下行内循环。</li><li><strong>Enter / Esc</strong>：进入编辑或换行；取消编辑。</li><li><strong>Home / End</strong>：行首或行尾格；<strong>Ctrl+Home / Ctrl+End</strong>：全表首尾。</li><li><strong>F2</strong>、<strong>Delete / Backspace</strong>：进入编辑或清空（自动触发模式）。</li><li><strong>Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y</strong>：撤销 / 重做。</li><li>可打印字符：自动触发模式下可直接开编并填入首字符。</li></ul><p>自定义热键：<code>{ key, handler, preventDefault?, override?, when? }</code>；<code>override: true</code> 时优先于内置处理。</p><h2 id="分页" tabindex="-1">分页 <a class="header-anchor" href="#分页" aria-label="Permalink to “分页”">​</a></h2><p>设置 <code>total</code> 后出现分页条。<strong>请将当前页数据通过 data 传入</strong>，组件内部不对数据进行分页切片。<code>pagination</code> 与 <code>update:currentPage</code> / <code>update:pageSize</code> 在变化时触发，用于请求接口。</p><blockquote><p>综合示例为客户端全量数据，仅用于演示分页条 UI 与事件；接入服务端时请按页更新 <code>data</code>。</p></blockquote><h2 id="样式类名" tabindex="-1">样式类名 <a class="header-anchor" href="#样式类名" aria-label="Permalink to “样式类名”">​</a></h2><p><code>plus-table-cell--active</code>、<code>plus-table-row--active</code>、<code>plus-table-cell--error</code>、<code>plus-table-cell--dirty</code>、<code>plus-table-row--dirty</code> 等，可用全局样式覆盖。</p><h2 id="类型导出" tabindex="-1">类型导出 <a class="header-anchor" href="#类型导出" aria-label="Permalink to “类型导出”">​</a></h2><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 公共 API（从 index.ts 导出）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { PlusTable, PLUS_TABLE_INJECTION_KEY } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@labs/plus-table&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PlusTableColumn,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PlusTableProps,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  RowData,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  CellContext,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  DependencyApi,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  DependencyState,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ColumnDependencies,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  HotkeyBinding,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  HotkeyContext,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  AdaptiveConfig,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PaginationPayload,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@labs/plus-table&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 内部类型（子组件 inject 用）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { PlusTableContext } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@labs/plus-table/types&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div>`,34)])}}});export{St as __pageData,Ct as default};