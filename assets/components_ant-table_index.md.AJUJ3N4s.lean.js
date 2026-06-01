import{A as e,B as t,D as n,G as r,H as i,I as a,Jt as o,Kt as s,St as c,T as l,U as u,V as d,Vt as f,X as p,Yt as m,_ as h,a as g,b as _,d as v,et as y,f as b,gt as x,k as S,m as C,o as w,p as T,pt as E,qt as D,rt as O,t as k,u as A,v as j,vt as M,w as N,x as P,xt as F,y as I,z as L}from"./chunks/plugin-vue_export-helper.lnNjcNWu.js";import{Gt as R,Kt as z,Nt as B,Pt as ee,pt as V,s as H}from"./chunks/weekYear.Bk__H43W.js";import{a as te,c as ne,d as U,f as re,h as ie,i as ae,l as oe,m as se,n as W,o as ce,p as G,r as le,s as ue,u as de}from"./chunks/es.LxIuVRVG.js";import{i as fe,n as pe,r as me,t as K}from"./chunks/cloneDeep.CeysB45J.js";const he=Symbol(`AntTable`);function q(e){if(typeof e.dataIndex==`string`)return e.dataIndex}function J(e){if(typeof e.dataIndex==`string`)return e.dataIndex;if(Array.isArray(e.dataIndex))return e.dataIndex.join(`.`);if(typeof e.key==`string`)return e.key;let t=typeof e.title==`string`?e.title:e.key??`unknown`;return e.children?.length?`_group:${t}`:`_col:${String(t)}`}function ge(e){return typeof e.title==`string`&&e.title?e.title:typeof e.dataIndex==`string`?e.dataIndex:Array.isArray(e.dataIndex)?e.dataIndex.join(`.`):typeof e.key==`string`?e.key:e.children?.length?`分组`:`列`}function Y(e){let t=[];for(let n of e)n.children?.length?t.push(...Y(n.children)):t.push(n);return t}function X(e){return e.children?.length?e.children.flatMap(X):[J(e)]}function _e(e,t,n=0){let r=n===0,i=[];for(let a of e){let e=J(a),o=ge(a);a.children?.length?i.push({column:a,id:e,label:o,depth:n,children:_e(a.children,t,n+1),isTopLevel:r}):i.push({column:a,id:e,label:o,depth:n,isTopLevel:r})}if(r&&t.length>0){let e=new Map(t.map((e,t)=>[e,t])),n=t=>e.get(t.id)??9999;i.sort((e,t)=>n(e)-n(t))}return i}function Z(e){return e.map(e=>J(e))}function ve(e,t){if(t.length===0)return e;let n=new Map(t.map((e,t)=>[e,t])),r=e=>n.get(J(e))??9999;return[...e].sort((e,t)=>r(e)-r(t))}function ye(e){let t=[];for(let n of e)n.children?.length?t.push(...ye(n.children)):t.push(n);return t}var be=`input, textarea, [contenteditable="true"], .ant-select-selector`;function xe(t){return()=>{e(()=>{e(()=>{let e=t.value;if(!e)return;let n=e.querySelector(`.atbl-cell--active`)?.querySelector(be)??e.querySelector(be);n&&document.activeElement!==n&&n.focus()})})}}function Se(e,t){let n=t.toLowerCase().split(`+`).map(e=>e.trim()),r=n.find(e=>![`ctrl`,`shift`,`alt`,`meta`].includes(e));return r?e.ctrlKey===n.includes(`ctrl`)&&e.shiftKey===n.includes(`shift`)&&e.altKey===n.includes(`alt`)&&e.metaKey===n.includes(`meta`)&&e.key.toLowerCase()===r:!1}function Ce(e){return e.ctrlKey||e.altKey||e.metaKey?!1:e.key.length===1}function we(e){let t=e.getBoundingClientRect(),n=getComputedStyle(e),r=parseFloat(n.marginTop)||0,i=parseFloat(n.marginBottom)||0;return t.height+r+i}function Te(t){let{adaptive:n,wrapperEl:r}=t,i=E(void 0),o=A(()=>!!n.value),s=A(()=>{let e=n.value;return!e||e===!0?{}:e}),c=e=>{let t=0,n=getComputedStyle(e);t+=parseFloat(n.marginBottom)||0;let r=e.parentElement;if(r){let e=getComputedStyle(r);t+=parseFloat(e.paddingBottom)||0,t+=parseFloat(e.borderBottomWidth)||0}let i=new Set,a=e.nextElementSibling;for(;a;){i.add(a);let e=a.getBoundingClientRect(),n=getComputedStyle(a);t+=e.height,t+=parseFloat(n.marginTop)||0,t+=parseFloat(n.marginBottom)||0,a=a.nextElementSibling}if(s.value.excludeSelectors?.length&&r)for(let n of s.value.excludeSelectors){let a=r.querySelector(n);a&&a!==e&&!i.has(a)&&(t+=a.getBoundingClientRect().height)}return t},l=()=>{if(!o.value){i.value=void 0;return}let e=r.value;if(!e)return;let t=e.getBoundingClientRect(),n=window.innerHeight,a=s.value.offsetTop??0,l=s.value.offsetBottom??0,u=c(e),d=0,f=e.querySelector(`.atbl-header`),p=e.querySelector(`.atbl-footer`);f&&(d+=we(f)),p&&(d+=we(p));let m=e.querySelector(`.ant-table-thead`),h=m?m.getBoundingClientRect().height:55,g=n-t.top-a-l-u-d-h;i.value=Math.max(g,100)},u=ee(l,100);return V(window,`resize`,()=>{o.value&&u()}),y(r,t=>{t&&o.value&&e(l)}),y([o,s],()=>{o.value&&r.value?e(l):o.value||l()}),a(()=>{o.value&&e(l)}),{scrollY:i,recalculate:l}}var Ee={disabled:!1};function De(e){let t=new Map,n=Y(e);for(let e of n){let n=e.dependencies;if(n?.triggerFields?.length)for(let r of n.triggerFields)t.has(r)||t.set(r,[]),t.get(r).push({column:e,dep:n})}return t}function Oe(e){let{columns:t,data:n,markDirty:r}=e,i=A(()=>De(t.value)),a=!1;function o(e,t,n,i){return{rowIndex:e,row:t,column:n,getFieldValue:e=>t[e],setFieldValue:(n,a)=>{t[n]=a,r?.(e,n),i?.(e,n)}}}function s(e,t){let r=t.dependencies;if(!r)return Ee;let i=n.value[e];if(!i)return Ee;let a=o(e,i,t);return{disabled:r.disabled?r.disabled(i,a):!1,required:r.required?r.required(i,a):void 0,rules:r.rules?r.rules(i,a):void 0,componentProps:r.componentProps?r.componentProps(i,a):void 0}}function c(e,t){if(a)return;let s=n.value[e];if(!s)return;let c=i.value.get(t);if(c?.length){a=!0;try{for(let{column:t,dep:n}of c)if(n.trigger){let i=o(e,s,t,r??void 0);n.trigger.call(null,s,i)}}finally{a=!1}}}return{resolveDependencyState:s,onFieldChange:c,triggerMap:i}}function ke(e){let{confirmEdit:t,undo:n,redo:r,markDirty:i,pushChange:a,onFieldChange:o,validateOnCellExit:s,validateFieldsAffectedByChange:c}=e;function l(){let e=t();if(!e)return null;a(e);for(let t of e)i(t.rowIndex,t.field),o(t.rowIndex,t.field),s.value&&c(t.rowIndex,t.field).catch(e=>{});return e}function u(){let e=n();e&&e.forEach(e=>i(e.rowIndex,e.field))}function d(){let e=r();e&&e.forEach(e=>i(e.rowIndex,e.field))}return{commitEdit:l,undo:u,redo:d}}function Ae(t){let{data:n,visibleColumns:r,wrapperEl:i}=t,a=E(-1),o=E(-1),s=A(()=>Y(r.value).filter(e=>!e.hidden&&!!q(e))),c=A(()=>o.value>=0?s.value[o.value]??null:null),l=A(()=>a.value>=0?n.value[a.value]??null:null);function u(){e(()=>{(i.value?.querySelector(`.atbl-cell--active`))?.scrollIntoView({block:`nearest`,inline:`nearest`})})}function d(e,t){let r=n.value.length,i=s.value.length;r===0||i===0||(a.value=Math.max(0,Math.min(e,r-1)),o.value=Math.max(0,Math.min(t,i-1)),u())}function f(e,t){let r=n.value.length,i=s.value.length;if(r===0||i===0)return;let c=a.value<0?0:a.value+e,l=o.value<0?0:o.value+t;l<0?(--c,l=i-1):l>=i&&(c+=1,l=0),c=Math.max(0,Math.min(c,r-1)),a.value=c,o.value=l,u()}function p(e,t){if(e<0||!t)return;let n=s.value.findIndex(e=>q(e)===t);n<0||(a.value=e,o.value=n)}function m(e,t){return!t||a.value!==e?!1:q(c.value??{})===t}return{activeRowIndex:a,activeColIndex:o,navigableColumns:s,activeRow:l,activeColumn:c,navigate:f,focusCell:d,scrollToActiveCell:u,handleCellClick:p,isActiveCell:m}}var je=`.ant-select-dropdown, .ant-picker-dropdown, .ant-dropdown, .ant-popover`;function Me(e){let{wrapperEl:t,hotkeyEnabled:n,navigate:r,focusCell:i,activeRowIndex:a,activeColIndex:o,data:s,navigableColumns:c,customHotkeys:l,editMode:u,autoTriggerEnabled:d,isEditing:f,editingRowIndex:p,startEdit:m,confirmEdit:h,cancelEdit:g,updateCellValue:_,isCellEditable:v,undo:y,redo:b,canUndo:x,canRedo:S}=e,C=E(!1),w=A(()=>l?.value?.filter(e=>e.override)??[]),T=A(()=>l?.value?.filter(e=>!e.override)??[]);V(t,`focusin`,()=>{C.value=!0}),V(t,`focusout`,e=>{let n=e.relatedTarget;t.value?.contains(n)||n?.closest(je)||(C.value=!1)});let D=xe(t);function O(e){return{event:e,activeRowIndex:a.value,activeColIndex:o.value,row:a.value>=0?s.value[a.value]??null:null,column:o.value>=0?c.value[o.value]??null:null,tableData:s.value,columns:c.value,navigate:r,startEdit:m,cancelEdit:g,updateCellValue:_}}function k(){return a.value<0||o.value<0?(i(0,0),!0):!1}function j(e){return!!e.target?.closest(`.atbl-cell-editor`)}function M(e){if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`z`)return x.value?(e.preventDefault(),y(),!0):!1;if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()===`z`)return S.value?(e.preventDefault(),b(),!0):!1;switch(e.key){case`Escape`:return e.preventDefault(),t.value?.focus({preventScroll:!0}),!0;case`Enter`:return e.preventDefault(),r(e.shiftKey?-1:1,0),D(),!0;case`Tab`:return e.preventDefault(),r(0,e.shiftKey?-1:1),D(),!0;default:return!1}}function N(e){switch(e.key){case`Escape`:return e.preventDefault(),g(),t.value?.focus({preventScroll:!0}),!0;case`Enter`:return e.preventDefault(),h(),r(e.shiftKey?-1:1,0),t.value?.focus({preventScroll:!0}),!0;case`Tab`:if(e.preventDefault(),u.value===`row`){let t=c.value.length,n=p.value,r=o.value+(e.shiftKey?-1:1);return r<0&&(r=t-1),r>=t&&(r=0),i(n,r),m(n,r),D(),!0}return h(),r(0,e.shiftKey?-1:1),t.value?.focus({preventScroll:!0}),!0;default:return!1}}function P(e){let t=s.value.length,n=c.value.length;if(t===0||n===0)return!1;if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`z`)return x.value?(e.preventDefault(),y(),!0):!1;if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()===`z`||e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`y`)return S.value?(e.preventDefault(),b(),!0):!1;if(e.key===`F2`&&d.value)return e.preventDefault(),a.value>=0&&o.value>=0&&v(a.value,o.value)&&(m(),D()),!0;if((e.key===`Delete`||e.key===`Backspace`)&&d.value)return a.value>=0&&o.value>=0&&v(a.value,o.value)?(e.preventDefault(),m(),_(``),D(),!0):!1;let l=u.value===`all`;switch(e.key){case`ArrowUp`:return e.preventDefault(),k()||r(-1,0),l&&D(),!0;case`ArrowDown`:return e.preventDefault(),k()||r(1,0),l&&D(),!0;case`ArrowLeft`:return e.preventDefault(),k()||r(0,-1),l&&D(),!0;case`ArrowRight`:return e.preventDefault(),k()||r(0,1),l&&D(),!0;case`Tab`:return e.preventDefault(),k()||r(0,e.shiftKey?-1:1),l&&D(),!0;case`Enter`:return e.preventDefault(),k()?(l&&D(),!0):(d.value&&v(a.value,o.value)?(m(),D()):(r(e.shiftKey?-1:1,0),l&&D()),!0);case`Home`:return e.preventDefault(),e.ctrlKey?i(0,0):i(Math.max(0,a.value),0),l&&D(),!0;case`End`:return e.preventDefault(),e.ctrlKey?i(t-1,n-1):i(Math.max(0,a.value),n-1),l&&D(),!0;default:return!1}}function F(e){if(!n.value||!C.value)return;if(f.value){let t=O(e);for(let n of w.value)if(Se(e,n.key)&&!(n.when&&!n.when(t))&&(n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t)!==!1))return;N(e);return}if(u.value===`all`&&j(e))return M(e),void 0;let t=O(e);for(let n of w.value)if(Se(e,n.key)&&!(n.when&&!n.when(t))&&(n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t)!==!1))return;if(!P(e)){for(let n of T.value)if(Se(e,n.key)&&!(n.when&&!n.when(t))){n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t);return}d.value&&Ce(e)&&a.value>=0&&o.value>=0&&v(a.value,o.value)&&(e.preventDefault(),e.stopPropagation(),m(),_(e.key),D())}}return V(t,`keydown`,F),{hasFocus:C}}function Ne(e){return e===!1?`none`:e===!0?`all`:e}function Pe(e){let{data:t,navigableColumns:n,activeRowIndex:r,activeColIndex:i,editable:a,isDepDisabled:o,onEditStart:s,onEditEnd:c,onValueChange:l}=e,u=E(!1),d=E(-1),f=E(-1),p=E({}),m=E({}),h=A(()=>Ne(a.value)),g=A(()=>h.value===`cell`||h.value===`row`),_=A(()=>f.value>=0?n.value[f.value]??null:null);function v(e,r){if(h.value===`none`)return!1;let i=n.value[r];if(!i)return!1;let a=t.value[e];return!(!a||i.editable===!1||typeof i.editable==`function`&&!i.editable(a)||o?.(e,q(i)??``))}function y(e,a){let o=e??r.value,c=a??i.value;if(o<0||c<0||h.value===`none`||!v(o,c))return;if(u.value&&d.value===o){if(h.value===`row`){f.value=c;return}if(f.value===c)return}u.value&&b();let l=t.value[o];if(!l)return;if(d.value=o,f.value=c,h.value===`row`){let e={},t={};for(let r=0;r<n.value.length;r++){let i=n.value[r],a=q(i);a&&v(o,r)&&(e[a]=l[a],t[a]=l[a])}if(Object.keys(e).length===0)return;p.value=e,m.value=t}else{let e=n.value[c],t=q(e);if(!t)return;let r=l[t];p.value={[t]:r},m.value={[t]:r}}u.value=!0;let g=n.value[c];if(g){let e=q(g),t=e?l[e]:void 0;s?.({row:l,column:g,value:t,rowIndex:o,colIndex:c})}}function b(){if(!u.value)return null;let e=d.value,r=t.value[e];if(!r)return S(),null;let i=[];for(let[t,a]of Object.entries(p.value)){let o=m.value[t];if(o!==a){r[t]=a,i.push({rowIndex:e,field:t,oldValue:o,newValue:a});let s=n.value.findIndex(e=>q(e)===t);s>=0&&l?.({row:r,column:n.value[s],oldValue:o,newValue:a,value:a,rowIndex:e,colIndex:s})}}let a=f.value,o=n.value[a];return o&&c?.({row:r,column:o,value:p.value[q(o)??``],rowIndex:e,colIndex:a}),S(),i.length>0?i:null}function x(){if(!u.value)return;let e=d.value,r=f.value,i=n.value[r],a=t.value[e];i&&a&&c?.({row:a,column:i,value:m.value[q(i)??``],rowIndex:e,colIndex:r}),S()}function S(){u.value=!1,d.value=-1,f.value=-1,p.value={},m.value={}}function C(e){return p.value[e]}function w(e,t){p.value[e]=t}function T(e){let t=q(_.value??{});t&&(p.value[t]=e)}function D(e,t){if(!t)return!1;if(h.value===`all`){let r=n.value.findIndex(e=>q(e)===t);return r>=0&&v(e,r)}return!u.value||d.value!==e?!1:h.value===`row`?t in p.value:q(_.value??{})===t}return{isEditing:u,editingRowIndex:d,editingColIndex:f,editingValues:p,editingColumn:_,editMode:h,autoTriggerEnabled:g,isCellEditable:v,startEdit:y,confirmEdit:b,cancelEdit:x,getEditingValue:C,setEditingValue:w,updateEditingValue:T,isEditingCell:D}}function Fe(e){let{data:t,maxHistory:n=50}=e,r=E([]),i=E([]),a=A(()=>r.value.length>0),o=A(()=>i.value.length>0);function s(e){let t=Array.isArray(e)?e:[e];t.length!==0&&(r.value.push(t),r.value.length>n&&r.value.shift(),i.value=[])}function c(){let e=r.value.pop();if(e){for(let n of e){let e=t.value[n.rowIndex];e&&(e[n.field]=n.oldValue)}return i.value.push(e),e}}function l(){let e=i.value.pop();if(e){for(let n of e){let e=t.value[n.rowIndex];e&&(e[n.field]=n.newValue)}return r.value.push(e),e}}function u(){r.value=[],i.value=[]}return{canUndo:a,canRedo:o,pushChange:s,undo:c,redo:l,clearHistory:u}}function Ie(e){let t=new Map;for(let n of e){let e=q(n);if(!e)continue;let r=Array.isArray(n.rules)?n.rules:n.rules?[n.rules]:[];for(let n of r){let r=n.dependencies;if(r?.length)for(let n of r)t.has(n)||t.set(n,new Set),t.get(n).add(e)}}return t}function Le(t){let{data:n,columns:r,tableRules:i,tableEl:a,trigger:o=E(`manual`),validateOnCellExit:s=E(!1),resolveDeps:c}=t,l=E(new Map),u=A(()=>Ie(r.value));function d(e,t,n){let r=i.value?.[e],a=t.rules,o=[];if(r&&o.push(...Array.isArray(r)?r:[r]),a&&o.push(...Array.isArray(a)?a:[a]),t.required&&o.push({required:!0}),n!=null&&c&&t.dependencies){let r=c(n,t);if(r.rules&&o.push(...Array.isArray(r.rules)?r.rules:[r.rules]),r.required){let n=typeof t.title==`string`?t.title:e;o.push({required:!0,message:`${n} 必填`})}}return o}async function f(e){let t=n.value[e];if(!t)return{};let i={},a={};for(let t of r.value){let n=q(t);if(!n)continue;let r=d(n,t,e);r.length>0&&(a[n]=r)}if(Object.keys(a).length===0)return{};let o=new H(a);try{await o.validate(t,{firstFields:!0})}catch(e){let t=e?.errors;if(t)for(let e of t)i[e.field]=e.message}return i}function p(e){return e===!0?n.value.map((e,t)=>t):e===!1?[]:typeof e==`number`?[e]:e}async function m(e=!0){let t=p(e),n={},i=new Map(l.value);for(let e of t)for(let t of r.value){let n=q(t);n&&i.delete(`${e}:${n}`)}for(let e of t){let t=await f(e);if(Object.keys(t).length>0){n[e]=t;for(let[n,r]of Object.entries(t))i.set(`${e}:${n}`,r)}}return l.value=i,{valid:Object.keys(n).length===0,errors:n}}async function h(e,t){let i=n.value[e];if(!i)return!0;let a=r.value.find(e=>q(e)===t);if(!a)return!0;let o=d(t,a,e);if(o.length===0)return!0;let s=new H({[t]:o}),c=`${e}:${t}`,u=new Map(l.value);try{return await s.validate(i,{firstFields:!0}),u.delete(c),l.value=u,!0}catch(e){let t=e?.errors?.[0]?.message??`Invalid`;return u.set(c,t),l.value=u,!1}}async function g(e,t){let n=new Set([t]),r=u.value.get(t);if(r)for(let e of r)n.add(e);for(let t of n)await h(e,t)}function _(e,t){if(e===void 0){l.value=new Map;return}let n=new Map(l.value);if(t)n.delete(`${e}:${t}`);else for(let t of[...n.keys()])t.startsWith(`${e}:`)&&n.delete(t);l.value=n}function v(){let t=a.value;if(!t||l.value.size===0)return;let n=1/0;for(let e of l.value.keys()){let[t]=e.split(`:`),r=Number(t);!Number.isNaN(r)&&r<n&&(n=r)}n!==1/0&&e(()=>{t.querySelectorAll(`.ant-table-tbody tr.ant-table-row`)[n]?.scrollIntoView({block:`center`,inline:`nearest`})})}function y(e,t){return l.value.get(`${e}:${t}`)}return{errors:l,validate:m,validateField:h,validateFieldsAffectedByChange:g,clearValidation:_,scrollToFirstError:v,getErrorForCell:y}}function Re(e,t,n){if(e===t)return n;let r=e>t?e-1:e;return r>=n?r+1:r}function ze(e){let{data:t,onDataChange:n,activeRowIndex:r}=e;function i(e,r={},i=1){if(i<1)return;let a=[...t.value],o=e??a.length,s=Math.max(0,Math.min(o,a.length)),c=Array.from({length:i},()=>({...r}));a.splice(s,0,...c),n(a)}function a(e){let r=(e==null?[]:me(e)).filter(e=>e>=0&&e<t.value.length);if(!r.length)return;let i=new Set(r);n(t.value.filter((e,t)=>!i.has(t)))}function o(e,i){let a=[...t.value],o=a.length;if(e<0||e>=o||i<0||i>=o||e===i)return;let[s]=a.splice(e,1);s&&(a.splice(i,0,s),n(a),r!=null&&r.value>=0&&(r.value=Re(r.value,e,i)))}function s(e){let r=e==null?[]:me(e),i=[...new Set(r)].filter(e=>e>=0&&e<(t.value.length??0)).sort((e,t)=>e-t);if(!i.length)return;let a=[...t.value],o=0;for(let e of i)a.splice(e+1+o,0,structuredClone(t.value[e])),o++;n(a)}return{insertRow:i,deleteRow:a,moveRow:o,duplicateRow:s}}function Be(e,t){return t.length>0?t:Z(e)}function Ve(e){return`ant-table:${e}:columns`}function He(e){try{return e===`local`?localStorage:sessionStorage}catch{return null}}function Ue(e){let{initialColumns:t,tableKey:n,storage:r=!1}=e,i=E([]),a=E(new Set),o=E({}),s=null;function c(){s={order:[...i.value],hidden:new Set(a.value),widths:{...o.value}}}function l(){s&&(i.value=s.order,a.value=new Set(s.hidden),o.value={...s.widths},s=null,d())}function u(){if(!r||!n)return;let e=He(r);if(e)try{let r=e.getItem(Ve(n));if(!r)return;let s=JSON.parse(r),c=[],l=new Set,u={},d=t.value,f=new Map(d.map(e=>[J(e),e]));for(let e of s.sort((e,t)=>e.order-t.order)){if(f.has(e.id)&&(c.push(e.id),e.hidden)){let t=f.get(e.id);t?.children?.length?X(t).forEach(e=>l.add(e)):l.add(e.id)}e.width!=null&&e.width>0&&(u[e.id]=e.width)}i.value=c,a.value=l,o.value=u}catch{}}let d=B(f,100);function f(){if(!r||!n)return;let e=He(r);if(!e)return;let s=t.value,c=Be(s,i.value),l=o.value,u=[];c.forEach((e,t)=>{let n=s.find(t=>J(t)===e),r={id:e,hidden:n?.children?.length?X(n).every(e=>a.value.has(e)):a.value.has(e),order:t};l[e]!=null&&l[e]>0&&(r.width=l[e]),u.push(r)});let d=new Set(c);for(let[e,t]of Object.entries(l))t>0&&!d.has(e)&&u.push({id:e,hidden:!1,order:u.length,width:t});try{e.setItem(Ve(n),JSON.stringify(u))}catch{}}let p=e=>a.value.has(J(e))?!0:e.hidden===!0;function m(e,t){let n=[];for(let r of e)if(r.children?.length){let e=m(r.children,t);if(e.length===0)continue;n.push({...r,children:e})}else t(r)||n.push(r);return n}function h(e,t){return e.map(e=>{if(e.children?.length)return{...e,children:h(e.children,t)};let n=J(e);return t[n]==null?e:{...e,width:t[n]}})}let g=A(()=>{let e=t.value;return h(m(ve(e,Be(e,i.value)),p),o.value)});function _(e,n){let r=new Set(a.value),i=t.value.find(t=>J(t)===e),o=i?.children?.length?X(i):[e];for(let e of o)n?r.delete(e):r.add(e);a.value=r,d()}function v(e){i.value=[...e],d()}function b(){let e=t.value;return _e(e,Be(e,i.value))}function x(e,n){let r=t.value,a=[...Be(r,i.value)],o=a.indexOf(e);if(o<0)return;let s=o+n;if(s<0||s>=a.length)return;let[c]=a.splice(o,1);a.splice(s,0,c),i.value=a,d()}function S(e){if(e==null||e===``)return;let t=typeof e==`number`?e:Number(e);return Number.isFinite(t)&&t>0?t:void 0}function C(e,t){if(!e)return;let n=S(t),r={...o.value};n==null?delete r[e]:r[e]=n,o.value=r,d()}function w(){i.value=[],a.value=new Set,o.value={},r&&n&&He(r)?.removeItem(Ve(n))}return u(),y(()=>t.value.map(e=>J(e)).join(`,`),u),{visibleColumns:g,hiddenColumns:a,columnWidths:o,columnOrder:i,toggleColumn:_,moveColumn:x,setColumnOrderByIds:v,setColumnWidth:C,resetColumns:w,snapshotColumnState:c,restoreColumnState:l,getColumnSettingTree:b,isColumnHidden:e=>a.value.has(e),isNodeHidden:e=>e.column.children?.length?X(e.column).every(e=>a.value.has(e)):a.value.has(e.id)}}function We(e){let{data:t}=e,n=x(new Map),r=e.cachedData??x([]);e.cachedData||y(()=>t.value,e=>{e?.length&&!r.value.length&&(r.value=K(e))},{immediate:!0});function i(e,i){let a=r.value[e]?.[i],o=t.value[e]?.[i],s=n.value;if(fe(a,o)){let t=s.get(e);t&&(t.delete(i),t.size===0&&s.delete(e),F(n))}else{let t=s.get(e);t||(t=new Set,s.set(e,t)),t.add(i),F(n)}}function a(e,t){return n.value.get(e)?.has(t)??!1}function o(e){return(n.value.get(e)?.size??0)>0}function s(e,t){if(e===void 0){n.value=new Map;return}let r=n.value;if(t!==void 0){let n=r.get(e);if(!n)return;n.delete(t),n.size===0&&r.delete(e)}else if(!r.delete(e))return;F(n)}function c(){let e=t.value,r=new Set(n.value.keys());return e.filter((e,t)=>r.has(t))}function l(){r.value=K(t.value),n.value=new Map}function u(){let e=new Set;for(let[t,r]of n.value)for(let n of r)e.add(`${t}:${n}`);return e}return{dirtyCells:n,markDirty:i,resetTracking:l,getDirtyCells:u,isCellDirty:a,isRowDirty:o,clearDirty:s,getModifiedRows:c}}function Ge(){let e=n(he);if(!e)throw Error(`[AntTable] useAntTableContext() must be used inside <AntTable>`);return e}const Ke={input:{component:ue,valueProp:`value`},"input-number":{component:ce,valueProp:`value`},select:{component:ie,valueProp:`value`},"date-picker":{component:oe,valueProp:`value`},"time-picker":{component:W,valueProp:`value`},switch:{component:ae,valueProp:`checked`},checkbox:{component:re,valueProp:`checked`}};var qe={class:`atbl-cell-content atbl-cell-content--error`},Je=P({name:`AntTableCell`,inheritAttrs:!1,__name:`ant-table-cell`,props:{column:{},record:{},rowIndex:{}},setup(t){let n=t,i=Ge(),a=A(()=>q(n.column)),o=A(()=>{let e=n.column.dataIndex;if(typeof e==`string`||Array.isArray(e))return e}),l=A(()=>{let e=o.value;if(e!=null)return pe(n.record,e)}),u=A(()=>l.value??``),d=A(()=>{let e=n.column.customRender;return e?()=>e({text:l.value,value:l.value,record:n.record,index:n.rowIndex,column:n.column}):null}),p=A(()=>i.editMode.value===`all`),h=A(()=>i.isEditingCell(n.rowIndex,a.value)),_=A(()=>i.cellActive.value&&i.isActiveCell(n.rowIndex,a.value)),y=A(()=>!!a.value&&i.isCellDirty(n.rowIndex,a.value)),x=A(()=>a.value?i.getErrorForCell(n.rowIndex,a.value):void 0),w=A(()=>i.resolveDependencyState(n.rowIndex,n.column)),T=A(()=>{if(a.value)return p.value?n.record[a.value]:i.getEditingValue(a.value)});function E(e){let t=a.value;if(t){if(p.value){let r=n.record[t];n.record[t]=e,r!==e&&(i.markDirty(n.rowIndex,t),i.onFieldChange(n.rowIndex,t));return}i.setEditingValue(t,e)}}let D=A(()=>{let e=n.column.component;return e?f(e)?Ke[e]||(console.warn(`[AntTable] 编辑器 "${e}" 未注册`),Ke.input):{component:e,valueProp:`value`}:Ke.input}),k=A(()=>D.value.component),j=A(()=>{let e=n.column.componentProps;return e?typeof e==`function`?e(n.record,n.column):e:{}}),M=A(()=>{let{valueProp:e}=D.value;return{[e]:T.value,[`onUpdate:${e}`]:E,...j.value,...w.value.componentProps??{},disabled:w.value.disabled,size:`small`,class:`atbl-cell-editor`}});function N(){i.cancelEdit(),e(()=>{i.tableEl.value?.focus({preventScroll:!0})})}return(e,n)=>(L(),C(`div`,{class:s([`atbl-cell`,{"atbl-cell--active":_.value,"atbl-cell--dirty":y.value,"atbl-cell--error":!!x.value,"atbl-cell--editing":h.value}])},[h.value?(L(),b(r(k.value),S({key:0},M.value,{onKeydownCapture:R(z(N,[`stop`]),[`esc`])}),null,16,[`onKeydownCapture`])):x.value?(L(),b(c(se),{key:1,title:x.value},{default:O(()=>[v(`span`,qe,[t.column.customRender?(L(),b(r(d.value),{key:0})):(L(),C(g,{key:1},[I(m(u.value),1)],64))])]),_:1},8,[`title`])):(L(),C(g,{key:2},[t.column.customRender?(L(),b(r(d.value),{key:0})):(L(),C(g,{key:1},[I(m(u.value),1)],64))],64))],2))}}),Ye={class:`atbl-column-setting`},Xe={class:`atbl-column-setting__header`},Ze={class:`atbl-column-setting__list`},Q={class:`atbl-column-setting__row`},Qe={class:`atbl-column-setting__row-actions`},$e={class:`atbl-column-setting__footer`},et=P({name:`AntTableColumnSetting`,__name:`ant-table-column-setting`,setup(e,{expose:t}){let n=Ge(),r=E(!1),i=A(()=>n.columnOptions??null);y(r,e=>{e&&i.value?.snapshotColumnState?.()});let a=A(()=>i.value?.getColumnSettingTree()??[]),l=e=>i.value?.isNodeHidden(e)??!1;function u(e){return e.children?.length?ye(e.children):[]}function f(e){let t=u(e);if(t.length===0)return!1;let n=t.filter(e=>l(e)).length;return n>0&&n<t.length}function p(e,t){i.value?.toggleColumn(e.id,t)}function h(e){let t=i.value?.columnWidths?.value??{};if(e.id in t)return t[e.id];let n=e.column.width;return typeof n==`number`?n:void 0}function x(e,t){i.value?.setColumnWidth(e,t??``)}let S=A(()=>ye(a.value)),D=A(()=>{let e=S.value;return e.length===0?!1:e.every(e=>!l(e))}),k=A(()=>{let e=S.value;if(e.length===0)return!1;let t=e.filter(e=>l(e)).length;return t>0&&t<e.length});function j(e){for(let t of S.value)i.value?.toggleColumn(t.id,e)}function M(){i.value?.restoreColumnState?.(),r.value=!1}function N(){r.value=!1}function P(){i.value?.resetColumns()}let F=E(!1),R=E({x:0,y:0}),B=E(null);function ee(e,t){B.value=typeof t?.key==`string`&&t.key||typeof t?.dataIndex==`string`&&t.dataIndex||null,R.value={x:e.clientX,y:e.clientY},F.value=!0}function H(){F.value=!1,r.value=!0}function te(){B.value&&i.value?.toggleColumn(B.value,!1),F.value=!1}V(document,`click`,()=>{F.value&&=!1}),V(document,`keydown`,e=>{e.key===`Escape`&&(F.value=!1)});function U(){r.value=!0}return t({openContextMenu:ee,open:U}),(e,t)=>(L(),C(g,null,[(L(),b(w,{to:`body`},[F.value?(L(),C(`div`,{key:0,class:`atbl-context-menu`,style:o({left:`${R.value.x}px`,top:`${R.value.y}px`}),onClick:t[0]||=z(()=>{},[`stop`])},[v(`div`,{class:`atbl-context-menu__item`,onClick:H},`列设置`),v(`div`,{class:s([`atbl-context-menu__item`,{"is-disabled":!B.value}]),onClick:te},` 隐藏此列 `,2)],4)):T(``,!0)])),_(c(ne),{open:r.value,"onUpdate:open":t[2]||=e=>r.value=e,title:`列设置`,placement:`right`,width:360,class:`atbl-column-setting-drawer`},{footer:O(()=>[v(`div`,$e,[_(c(G),{onClick:M},{default:O(()=>[...t[7]||=[I(`取消`,-1)]]),_:1}),_(c(G),{danger:``,onClick:P},{default:O(()=>[...t[8]||=[I(`重置`,-1)]]),_:1}),_(c(G),{type:`primary`,onClick:N},{default:O(()=>[...t[9]||=[I(`确认`,-1)]]),_:1})])]),default:O(()=>[v(`div`,Ye,[v(`div`,Xe,[_(c(re),{checked:D.value,indeterminate:k.value,onChange:t[1]||=e=>j(e.target.checked)},{default:O(()=>[...t[3]||=[I(` 全部 `,-1)]]),_:1},8,[`checked`,`indeterminate`])]),t[6]||=v(`p`,{class:`atbl-column-setting__hint`},`勾选显示列，用上下按钮调整顺序`,-1),v(`div`,Ze,[(L(!0),C(g,null,d(a.value,(e,n)=>(L(),C(`div`,{key:e.id,class:`atbl-column-setting__group`},[v(`div`,Q,[_(c(re),{checked:!l(e),indeterminate:f(e),onChange:t=>p(e,t.target.checked)},{default:O(()=>[I(m(e.label),1)]),_:2},1032,[`checked`,`indeterminate`,`onChange`]),v(`span`,Qe,[!e.children?.length&&e.column.dataIndex?(L(),b(c(ce),{key:0,value:h(e),min:0,size:`small`,placeholder:`宽度`,class:`atbl-column-setting__width`,onChange:t=>x(e.id,t)},null,8,[`value`,`onChange`])):T(``,!0),_(c(G),{size:`small`,type:`text`,disabled:n===0,onClick:t=>i.value?.moveColumn(e.id,-1)},{default:O(()=>[...t[4]||=[I(` ↑ `,-1)]]),_:1},8,[`disabled`,`onClick`]),_(c(G),{size:`small`,type:`text`,disabled:n===a.value.length-1,onClick:t=>i.value?.moveColumn(e.id,1)},{default:O(()=>[...t[5]||=[I(` ↓ `,-1)]]),_:1},8,[`disabled`,`onClick`])])]),(L(!0),C(g,null,d(u(e),e=>(L(),C(`div`,{key:e.id,class:`atbl-column-setting__row atbl-column-setting__row--child`},[_(c(re),{checked:!l(e),onChange:t=>p(e,t.target.checked)},{default:O(()=>[I(m(e.label),1)]),_:2},1032,[`checked`,`onChange`]),e.column.dataIndex?(L(),b(c(ce),{key:0,value:h(e),min:0,size:`small`,placeholder:`宽度`,class:`atbl-column-setting__width`,onChange:t=>x(e.id,t)},null,8,[`value`,`onChange`])):T(``,!0)]))),128))]))),128))])])]),_:1},8,[`open`])],64))}}),tt={class:`atbl-pagination`},nt=P({name:`AntTablePagination`,__name:`ant-table-pagination`,props:{current:{default:1},pageSize:{default:10},total:{default:0},pageSizes:{},showTotal:{type:Boolean,default:!0}},emits:[`current-change`,`size-change`],setup(e,{emit:t}){let n=e,r=t,i=A(()=>(n.pageSizes??[10,20,50,100]).map(e=>String(e))),a=A(()=>n.showTotal?e=>`共 ${e} 条`:void 0);function o(e,t){if(t!==n.pageSize){r(`size-change`,t);return}r(`current-change`,e)}function s(e,t){r(`size-change`,t)}return(t,n)=>(L(),C(`div`,tt,[_(c(te),{current:e.current,"page-size":e.pageSize,total:e.total,"page-size-options":i.value,"show-size-changer":!0,"show-quick-jumper":!0,"show-total":a.value,size:`small`,onChange:o,onShowSizeChange:s},null,8,[`current`,`page-size`,`total`,`page-size-options`,`show-total`])]))}}),rt={key:0,class:`atbl-header`},it={class:`atbl-header__title`},at={class:`atbl-header__actions`},ot={key:1,class:`atbl-footer`},st={class:`atbl-footer__summary`},$=P({name:`AntTable`,inheritAttrs:!1,__name:`ant-table`,props:{dataSource:{default:()=>[]},columns:{default:()=>[]},rowKey:{},bordered:{type:Boolean,default:!0},size:{},cellActive:{type:Boolean,default:!0},rowActive:{type:Boolean,default:!0},editable:{type:[Boolean,String],default:!1},rules:{},validateTrigger:{default:`manual`},validateOnCellExit:{type:Boolean,default:!1},columnSetting:{type:Boolean,default:!0},columnSettingKey:{},resizable:{type:Boolean,default:!1},hotkeys:{},hotkeyEnabled:{type:Boolean,default:!0},current:{},pageSize:{},pageSizes:{},total:{},showPaginationTotal:{type:Boolean,default:!0},height:{},scrollX:{},adaptive:{type:[Boolean,Object],default:!1}},emits:[`update:dataSource`,`cell-edit-start`,`cell-edit-end`,`cell-value-change`,`update:current`,`update:pageSize`,`change`],setup(e,{expose:n,emit:r}){let a=e,o=r,s=p(),u=E(null),d=E(null),f=A(()=>!!s.title||!!s.toolbar||a.columnSetting),m=A(()=>a.total!=null||!!s.summary||!!s.pagination),g=A(()=>a.total!=null),y=A(()=>a.dataSource??[]);function x(e){o(`update:current`,e),o(`change`,{current:e,pageSize:a.pageSize??10})}function w(e){o(`update:pageSize`,e),o(`change`,{current:a.current??1,pageSize:e})}let k=Ue({initialColumns:A(()=>a.columns??[]),tableKey:a.columnSetting?a.columnSettingKey??`ant-table-default`:void 0,storage:a.columnSetting?`local`:!1}),j=k.visibleColumns,{scrollY:P}=Te({adaptive:M(()=>a.adaptive),wrapperEl:u}),F=A(()=>{let e=P.value??a.height,t={};return a.scrollX!=null&&(t.x=a.scrollX),e!=null&&(t.y=e),Object.keys(t).length?t:void 0}),{activeRowIndex:R,activeColIndex:z,navigableColumns:B,activeRow:ee,activeColumn:V,navigate:H,focusCell:te,handleCellClick:ne,isActiveCell:U}=Ae({data:y,visibleColumns:j,wrapperEl:u}),{insertRow:re,deleteRow:ie,moveRow:ae,duplicateRow:oe}=ze({data:y,onDataChange:e=>o(`update:dataSource`,e),activeRowIndex:R}),{dirtyCells:se,markDirty:W,clearDirty:ce,getModifiedRows:ue,isRowDirty:de,isCellDirty:fe,resetTracking:pe,getDirtyCells:me}=We({data:y}),{resolveDependencyState:K,onFieldChange:ge}=Oe({columns:j,data:y,markDirty:W}),{isEditing:Y,editingRowIndex:X,editingColIndex:_e,editMode:Z,autoTriggerEnabled:ve,isCellEditable:ye,startEdit:be,confirmEdit:Se,cancelEdit:Ce,getEditingValue:we,setEditingValue:Ee,updateEditingValue:De,isEditingCell:je}=Pe({data:y,navigableColumns:B,activeRowIndex:R,activeColIndex:z,editable:A(()=>a.editable??!1),isDepDisabled:(e,t)=>{let n=B.value.find(e=>q(e)===t);return n?K(e,n).disabled:!1},onEditStart:e=>o(`cell-edit-start`,e),onEditEnd:e=>o(`cell-edit-end`,e),onValueChange:e=>o(`cell-value-change`,e)}),{validate:Ne,validateField:Ie,validateFieldsAffectedByChange:Re,clearValidation:Be,scrollToFirstError:Ve,getErrorForCell:He}=Le({data:y,columns:B,tableRules:A(()=>a.rules),tableEl:u,trigger:A(()=>a.validateTrigger??`manual`),validateOnCellExit:A(()=>a.validateOnCellExit??!1),resolveDeps:K}),{canUndo:Ge,canRedo:Ke,pushChange:qe,undo:Ye,redo:Xe,clearHistory:Ze}=Fe({data:y}),{commitEdit:Q,undo:Qe,redo:$e}=ke({confirmEdit:Se,undo:Ye,redo:Xe,markDirty:W,pushChange:qe,onFieldChange:ge,validateOnCellExit:A(()=>a.validateOnCellExit??!1),validateFieldsAffectedByChange:Re}),tt=xe(u);function $(e,t){be(e,t),Y.value&&tt()}function ct(e,t,n){let r=!!n.target?.closest(`.atbl-cell-editor`),i=R.value,a=z.value;ne(e,t),Y.value&&i>=0&&(Z.value===`row`?R.value!==i&&Q():(R.value!==i||z.value!==a)&&Q()),r||u.value?.focus({preventScroll:!0})}function lt(e,t){ve.value&&(ne(e,t),R.value>=0&&z.value>=0&&$())}function ut(e,t){a.columnSetting&&(t.preventDefault(),d.value?.openContextMenu(t,{key:J(e)}))}function dt(e,t){let n=t?.key;typeof n!=`string`||typeof e!=`number`||k.setColumnWidth(n,e)}function ft(e){let t=B.value.findIndex(t=>q(t)===e);return t>=0?t:0}function pt(e,t){let n=ft(t);te(e,n),$(e,n)}function mt(e){return e.required?!0:(Array.isArray(e.rules)?e.rules:e.rules?[e.rules]:[]).some(e=>e.required)}function ht(e){return typeof e.resizable==`boolean`?e.resizable:a.resizable?typeof e.width==`number`:!1}function gt(e){let{customRender:t,component:n,componentProps:r,rules:i,required:a,dependencies:o,editable:s,hidden:c,children:u,customCell:d,customHeaderCell:f,...p}=e,m=J(e),h=()=>({class:mt(e)?`atbl-th--required`:void 0,onContextmenu:t=>ut(e,t)});if(u?.length)return{...p,key:m,children:u.map(gt),customHeaderCell:h};let g=q(e);return{...p,key:m,resizable:ht(e),customRender:t=>l(Je,{column:e,record:t.record,rowIndex:t.index,key:m}),customCell:(e,t)=>g?{onClick:e=>ct(t,g,e),onDblclick:()=>lt(t,g)}:{},customHeaderCell:h}}let _t=A(()=>j.value.map(gt));Me({wrapperEl:u,hotkeyEnabled:A(()=>a.hotkeyEnabled??!0),navigate:H,focusCell:te,activeRowIndex:R,activeColIndex:z,data:y,navigableColumns:B,customHotkeys:A(()=>a.hotkeys),editMode:Z,autoTriggerEnabled:ve,isEditing:Y,editingRowIndex:X,startEdit:$,confirmEdit:Q,cancelEdit:Ce,updateCellValue:De,isCellEditable:ye,undo:Qe,redo:$e,canUndo:Ge,canRedo:Ke}),t(he,{tableEl:u,rules:A(()=>a.rules),columns:A(()=>a.columns??[]),visibleColumns:j,navigableColumns:B,data:y,editable:A(()=>a.editable??!1),cellActive:A(()=>a.cellActive??!0),rowActive:A(()=>a.rowActive??!0),activeRowIndex:R,activeColIndex:z,navigate:H,handleCellClick:ne,isActiveCell:U,editMode:Z,isEditing:Y,editingRowIndex:X,editingColIndex:_e,isEditingCell:je,isCellEditable:ye,startEdit:$,confirmEdit:Q,cancelEdit:Ce,getEditingValue:we,setEditingValue:Ee,getErrorForCell:He,resolveDependencyState:K,onFieldChange:ge,markDirty:W,isCellDirty:fe,columnOptions:a.columnSetting?{toggleColumn:k.toggleColumn,moveColumn:k.moveColumn,setColumnOrderByIds:k.setColumnOrderByIds,setColumnWidth:k.setColumnWidth,resetColumns:k.resetColumns,snapshotColumnState:k.snapshotColumnState,restoreColumnState:k.restoreColumnState,getColumnSettingTree:k.getColumnSettingTree,isNodeHidden:k.isNodeHidden,columnWidths:k.columnWidths}:void 0});function vt(){d.value?.open()}return n({navigate:H,focusCell:te,getColIndexByField:ft,focusAndEditByField:pt,activeRowIndex:R,activeColIndex:z,activeRow:ee,activeColumn:V,editMode:Z,isEditing:Y,startEdit:$,confirmEdit:Q,cancelEdit:Ce,validate:Ne,validateField:Ie,clearValidation:Be,scrollToFirstError:Ve,insertRow:re,deleteRow:ie,moveRow:ae,duplicateRow:oe,getModifiedRows:ue,markDirty:W,clearDirty:ce,resetTracking:pe,getDirtyCells:me,isCellDirty:fe,isRowDirty:de,toggleColumn:k.toggleColumn,moveColumn:k.moveColumn,setColumnWidth:k.setColumnWidth,resetColumns:k.resetColumns,openColumnSetting:vt,undo:Qe,redo:$e,canUndo:Ge,canRedo:Ke,clearHistory:Ze}),(t,n)=>(L(),C(`div`,{ref_key:`wrapperEl`,ref:u,class:`atbl-wrapper`,tabindex:`0`},[f.value?(L(),C(`div`,rt,[v(`div`,it,[i(t.$slots,`title`)]),v(`div`,at,[i(t.$slots,`toolbar`),e.columnSetting?(L(),b(c(G),{key:0,size:`small`,onClick:vt},{default:O(()=>[...n[0]||=[I(` 列设置 `,-1)]]),_:1})):T(``,!0)])])):T(``,!0),_(c(le),S(t.$attrs,{columns:_t.value,"data-source":y.value,"row-key":e.rowKey,bordered:e.bordered,size:e.size,scroll:F.value,pagination:!1,onResizeColumn:dt}),h({_:2},[t.$slots.expandedRowRender?{name:`expandedRowRender`,fn:O(e=>[i(t.$slots,`expandedRowRender`,D(N(e)))]),key:`0`}:void 0,t.$slots.emptyText?{name:`emptyText`,fn:O(()=>[i(t.$slots,`emptyText`)]),key:`1`}:void 0]),1040,[`columns`,`data-source`,`row-key`,`bordered`,`size`,`scroll`]),m.value?(L(),C(`div`,ot,[v(`div`,st,[i(t.$slots,`summary`)]),i(t.$slots,`pagination`,{},()=>[g.value?(L(),b(nt,{key:0,current:e.current??1,"page-size":e.pageSize??10,total:e.total??0,"page-sizes":e.pageSizes,"show-total":e.showPaginationTotal,onCurrentChange:x,onSizeChange:w},null,8,[`current`,`page-size`,`total`,`page-sizes`,`show-total`])):T(``,!0)])])):T(``,!0),e.columnSetting?(L(),b(et,{key:2,ref_key:`columnSettingRef`,ref:d},null,512)):T(``,!0)],512))}}),ct=P({__name:`basic`,setup(e){let t=E([{id:1,name:`需求评审`,amount:1200},{id:2,name:`接口开发`,amount:3400},{id:3,name:`联调测试`,amount:800}]),n=[{title:`#`,key:`index`,width:60,align:`center`,customRender:({index:e})=>e+1},{title:`ID`,dataIndex:`id`,width:80},{title:`名称`,dataIndex:`name`,editable:!0,component:`input`},{title:`金额`,dataIndex:`amount`,align:`right`,editable:!0,component:`input-number`,componentProps:{min:0,step:100,style:{width:`100%`}},customRender:({value:e})=>`¥ ${(e??0).toLocaleString(`zh-CN`)}`}];return(e,r)=>(L(),b(c($),{dataSource:t.value,"onUpdate:dataSource":r[0]||=e=>t.value=e,columns:n,"row-key":`id`,bordered:``,editable:`cell`},null,8,[`dataSource`]))}}),lt=`<script setup lang="ts">
import { ref } from 'vue';

import { AntTable } from '@labs/ant-table';
import type { AntTableColumn } from '@labs/ant-table';

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

const columns: AntTableColumn<Row>[] = [
  {
    title: '#',
    key: 'index',
    width: 60,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '名称', dataIndex: 'name', editable: true, component: 'input' },
  {
    title: '金额',
    dataIndex: 'amount',
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, style: { width: '100%' } },
    customRender: ({ value }) => \`¥ \${(value ?? 0).toLocaleString('zh-CN')}\`,
  },
];
<\/script>

<template>
  <AntTable
    v-model:dataSource="data"
    :columns="columns"
    row-key="id"
    bordered
    editable="cell"
  />
</template>
`,ut={class:`atbl-demo`},dt={class:`atbl-demo__toolbar`},ft={class:`atbl-demo__status`},pt=k(P({__name:`playground`,setup(e){let t=[{label:`硬件`,value:`hardware`},{label:`软件`,value:`software`},{label:`服务`,value:`service`}],n={pending:{label:`待开始`,color:`default`},active:{label:`进行中`,color:`processing`},done:{label:`已完成`,color:`success`}},r=[`技术部`,`采购部`,`运维部`],i={技术部:[`张三`,`李四`],采购部:[`王五`,`赵六`],运维部:[`陈七`,`周八`]},a=7;function o(e){let t=[`hardware`,`software`,`service`],n=[`pending`,`active`,`done`],a=r[e%r.length],o=500+e%10*300,s=e%5+1;return{id:e+1,name:`物料 ${e+1}`,category:t[e%3],status:n[e%3],price:o,qty:s,total:o*s,department:a,owner:i[a][0],enabled:e%4!=0}}let s=E(Array.from({length:6},(e,t)=>o(t))),d=[{title:`#`,key:`index`,width:50,align:`center`,fixed:`left`,resizable:!1,customRender:({index:e})=>e+1},{title:`名称`,dataIndex:`name`,width:150,editable:!0,component:`input`,required:!0,rules:[{required:!0,message:`名称必填`},{min:2,message:`至少 2 个字`}]},{title:`类别`,dataIndex:`category`,width:110,editable:!0,component:`select`,required:!0,componentProps:{options:t,style:{width:`100%`}},customRender:({value:e})=>t.find(t=>t.value===e)?.label??e},{title:`状态`,dataIndex:`status`,width:110,editable:!0,component:`select`,componentProps:{style:{width:`100%`},options:Object.entries(n).map(([e,t])=>({value:e,label:t.label}))},customRender:({value:e})=>{let t=n[e]??n.pending;return l(de,{color:t.color},()=>t.label)}},{title:`单价`,dataIndex:`price`,width:110,align:`right`,minWidth:90,editable:!0,component:`input-number`,componentProps:{min:0,step:100,style:{width:`100%`}},rules:{type:`number`,min:0,message:`单价需 ≥ 0`}},{title:`数量`,dataIndex:`qty`,width:110,align:`right`,editable:!0,component:`input-number`,componentProps:{min:0,style:{width:`100%`}},dependencies:{triggerFields:[`category`],disabled:e=>e.category===`service`,trigger:(e,t)=>{e.category===`service`&&t.setFieldValue(`qty`,1)}}},{title:`小计`,dataIndex:`total`,width:120,align:`right`,dependencies:{triggerFields:[`price`,`qty`],trigger:(e,t)=>{t.setFieldValue(`total`,(e.price||0)*(e.qty||0))}},customRender:({value:e})=>`¥ ${(e??0).toLocaleString(`zh-CN`)}`},{title:`归属`,children:[{title:`部门`,dataIndex:`department`,width:110,editable:!0,component:`select`,componentProps:{style:{width:`100%`},options:r.map(e=>({label:e,value:e}))}},{title:`负责人`,dataIndex:`owner`,width:120,editable:!0,component:`select`,dependencies:{triggerFields:[`department`],required:()=>!0,componentProps:e=>({style:{width:`100%`},options:(i[e.department]??[]).map(e=>({label:e,value:e}))}),trigger:(e,t)=>{(i[e.department]??[]).includes(e.owner)||t.setFieldValue(`owner`,``)}}}]},{title:`启用`,dataIndex:`enabled`,width:80,align:`center`,editable:!0,component:`switch`,customRender:({value:e})=>e?`是`:`否`}],f=E(`cell`),p=A(()=>f.value===`all`?!0:f.value===`off`?!1:f.value),h=E(`change`),g=E(!0),y=E(!1),x=E(!0),S=E(`—`),w=[{key:`ctrl+g`,preventDefault:!0,handler:e=>{S.value=`Ctrl+G → 行 ${e.activeRowIndex+1} / 列 ${e.activeColIndex+1}`}}],D=E(null),k=E([]),j=A(()=>({selectedRowKeys:k.value,onChange:e=>k.value=e})),M=A(()=>D.value?.getDirtyCells()?.size??0);function N(){D.value?.insertRow(void 0,o(a++-1))}function P(){let e=new Set(k.value),t=s.value.map((t,n)=>e.has(t.id)?n:-1).filter(e=>e>=0);if(!t.length){U.info(`请先勾选行`);return}D.value?.deleteRow(t),k.value=[]}async function F(){(await D.value?.validate())?.valid?U.success(`校验通过`):(U.error(`存在校验错误`),D.value?.scrollToFirstError())}function R(){let e=D.value?.getModifiedRows()??[];U.info(`已修改 ${e.length} 行`)}return(e,t)=>{let n=u(`a-radio-button`),r=u(`a-radio-group`),i=u(`a-divider`),a=u(`a-button`),o=u(`a-checkbox`);return L(),C(`div`,ut,[v(`div`,dt,[_(r,{value:f.value,"onUpdate:value":t[0]||=e=>f.value=e,"button-style":`solid`,size:`small`},{default:O(()=>[_(n,{value:`cell`},{default:O(()=>[...t[9]||=[I(`单元格`,-1)]]),_:1}),_(n,{value:`row`},{default:O(()=>[...t[10]||=[I(`行编辑`,-1)]]),_:1}),_(n,{value:`all`},{default:O(()=>[...t[11]||=[I(`全量`,-1)]]),_:1}),_(n,{value:`manual`},{default:O(()=>[...t[12]||=[I(`手动`,-1)]]),_:1}),_(n,{value:`off`},{default:O(()=>[...t[13]||=[I(`只读`,-1)]]),_:1})]),_:1},8,[`value`]),_(i,{type:`vertical`}),t[27]||=v(`span`,{class:`atbl-demo__label`},`校验`,-1),_(r,{value:h.value,"onUpdate:value":t[1]||=e=>h.value=e,"button-style":`solid`,size:`small`},{default:O(()=>[_(n,{value:`manual`},{default:O(()=>[...t[14]||=[I(`手动`,-1)]]),_:1}),_(n,{value:`change`},{default:O(()=>[...t[15]||=[I(`change`,-1)]]),_:1}),_(n,{value:`blur`},{default:O(()=>[...t[16]||=[I(`blur`,-1)]]),_:1})]),_:1},8,[`value`]),_(i,{type:`vertical`}),_(a,{size:`small`,onClick:N},{default:O(()=>[...t[17]||=[I(`新增行`,-1)]]),_:1}),_(a,{size:`small`,danger:``,disabled:!k.value.length,onClick:P},{default:O(()=>[...t[18]||=[I(` 删除选中 `,-1)]]),_:1},8,[`disabled`]),f.value===`manual`?(L(),b(a,{key:0,size:`small`,onClick:t[2]||=e=>D.value?.startEdit()},{default:O(()=>[...t[19]||=[I(` 编辑当前格 `,-1)]]),_:1})):T(``,!0),_(i,{type:`vertical`}),_(a,{size:`small`,disabled:!D.value?.canUndo,onClick:t[3]||=e=>D.value?.undo()},{default:O(()=>[...t[20]||=[I(` 撤销 `,-1)]]),_:1},8,[`disabled`]),_(a,{size:`small`,disabled:!D.value?.canRedo,onClick:t[4]||=e=>D.value?.redo()},{default:O(()=>[...t[21]||=[I(` 重做 `,-1)]]),_:1},8,[`disabled`]),_(a,{size:`small`,type:`primary`,onClick:F},{default:O(()=>[...t[22]||=[I(`校验`,-1)]]),_:1}),_(a,{size:`small`,onClick:R},{default:O(()=>[...t[23]||=[I(`查看已改行`,-1)]]),_:1}),_(i,{type:`vertical`}),_(o,{checked:g.value,"onUpdate:checked":t[5]||=e=>g.value=e},{default:O(()=>[...t[24]||=[I(`热键`,-1)]]),_:1},8,[`checked`]),_(o,{checked:y.value,"onUpdate:checked":t[6]||=e=>y.value=e},{default:O(()=>[...t[25]||=[I(`自适应高度`,-1)]]),_:1},8,[`checked`]),_(o,{checked:x.value,"onUpdate:checked":t[7]||=e=>x.value=e},{default:O(()=>[...t[26]||=[I(`列宽拖拽`,-1)]]),_:1},8,[`checked`])]),v(`div`,ft,[v(`span`,null,` 激活：行 `+m((D.value?.activeRowIndex??-1)+1)+` / 列 `+m((D.value?.activeColIndex??-1)+1),1),t[28]||=v(`span`,{class:`atbl-demo__sep`},`|`,-1),v(`span`,null,`脏数据：`+m(M.value)+` 格`,1),t[29]||=v(`span`,{class:`atbl-demo__sep`},`|`,-1),v(`span`,null,`Ctrl+G：`+m(S.value),1)]),_(c($),{ref_key:`tableRef`,ref:D,dataSource:s.value,"onUpdate:dataSource":t[8]||=e=>s.value=e,columns:d,editable:p.value,"validate-trigger":h.value,"hotkey-enabled":g.value,hotkeys:w,adaptive:y.value,resizable:x.value,"scroll-x":1080,"row-selection":j.value,"row-key":`id`,"column-setting-key":`docs-ant-table-demo`,bordered:``,size:`middle`,"validate-on-cell-exit":``},{title:O(()=>[...t[30]||=[v(`span`,{class:`atbl-demo__title`},`采购清单`,-1)]]),_:1},8,[`dataSource`,`editable`,`validate-trigger`,`hotkey-enabled`,`adaptive`,`resizable`,`row-selection`]),t[31]||=v(`p`,{class:`atbl-demo__hint`},` 点击单元格聚焦后：方向键移动 · 双击 / F2 进入编辑 · Enter 确认并下移 · Tab 右移 · Delete 清空 · Ctrl+Z / Ctrl+Shift+Z 撤销重做 · Ctrl+G 自定义热键 · 右键表头可隐藏列或打开列设置 · 开启「列宽拖拽」后所有带宽度的列（含分组表头子列）表头右缘均可拖拽调整列宽（序号列已用列级 resizable: false 单独关闭）。 `,-1)])}}}),[[`__scopeId`,`data-v-5b079604`]]),mt=`<script setup lang="ts">
import { computed, h, ref } from 'vue';

import { Tag, message } from 'ant-design-vue';

import { AntTable } from '@labs/ant-table';
import type {
  AntTableColumn,
  DependencyApi,
  HotkeyContext,
} from '@labs/ant-table';

interface Row {
  id: number;
  name: string;
  category: 'hardware' | 'software' | 'service';
  status: 'pending' | 'active' | 'done';
  price: number;
  qty: number;
  total: number;
  owner: string;
  department: string;
  enabled: boolean;
  [key: string]: unknown;
}

const categoryOptions = [
  { label: '硬件', value: 'hardware' },
  { label: '软件', value: 'software' },
  { label: '服务', value: 'service' },
];

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: 'default' },
  active: { label: '进行中', color: 'processing' },
  done: { label: '已完成', color: 'success' },
};

const departments = ['技术部', '采购部', '运维部'];
const departmentOwners: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  采购部: ['王五', '赵六'],
  运维部: ['陈七', '周八'],
};

let nextId = 7;
function createRow(i: number): Row {
  const cats: Row['category'][] = ['hardware', 'software', 'service'];
  const states: Row['status'][] = ['pending', 'active', 'done'];
  const dept = departments[i % departments.length]!;
  const price = 500 + (i % 10) * 300;
  const qty = (i % 5) + 1;
  return {
    id: i + 1,
    name: \`物料 \${i + 1}\`,
    category: cats[i % 3]!,
    status: states[i % 3]!,
    price,
    qty,
    total: price * qty,
    department: dept,
    owner: departmentOwners[dept]![0]!,
    enabled: i % 4 !== 0,
  };
}

const data = ref<Row[]>(Array.from({ length: 6 }, (_, i) => createRow(i)));

const columns: AntTableColumn<Row>[] = [
  {
    title: '#',
    key: 'index',
    width: 50,
    align: 'center',
    fixed: 'left',
    // 列级 resizable 优先于表级：序号列单独关闭拖拽
    resizable: false,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 150,
    editable: true,
    component: 'input',
    required: true,
    rules: [
      { required: true, message: '名称必填' },
      { min: 2, message: '至少 2 个字' },
    ],
  },
  {
    title: '类别',
    dataIndex: 'category',
    width: 110,
    editable: true,
    component: 'select',
    required: true,
    componentProps: { options: categoryOptions, style: { width: '100%' } },
    customRender: ({ value }) =>
      categoryOptions.find((o) => o.value === value)?.label ?? value,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    editable: true,
    component: 'select',
    componentProps: {
      style: { width: '100%' },
      options: Object.entries(statusMap).map(([value, m]) => ({
        value,
        label: m.label,
      })),
    },
    customRender: ({ value }) => {
      const info = statusMap[value as string] ?? statusMap.pending!;
      return h(Tag, { color: info.color }, () => info.label);
    },
  },
  {
    title: '单价',
    dataIndex: 'price',
    width: 110,
    align: 'right',
    minWidth: 90,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, style: { width: '100%' } },
    rules: { type: 'number', min: 0, message: '单价需 ≥ 0' },
  },
  {
    title: '数量',
    dataIndex: 'qty',
    width: 110,
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, style: { width: '100%' } },
    // 联动：类别为「服务」时锁定数量为 1 且禁止编辑
    dependencies: {
      triggerFields: ['category'],
      disabled: (row) => row.category === 'service',
      trigger: (row, api) => {
        if (row.category === 'service') api.setFieldValue('qty', 1);
      },
    },
  },
  {
    title: '小计',
    dataIndex: 'total',
    width: 120,
    align: 'right',
    // 联动：单价 / 数量变化时自动计算小计
    dependencies: {
      triggerFields: ['price', 'qty'],
      trigger: (row, api) => {
        api.setFieldValue('total', (row.price || 0) * (row.qty || 0));
      },
    },
    customRender: ({ value }) => \`¥ \${(value ?? 0).toLocaleString('zh-CN')}\`,
  },
  {
    title: '归属',
    children: [
      {
        title: '部门',
        dataIndex: 'department',
        width: 110,
        editable: true,
        component: 'select',
        componentProps: {
          style: { width: '100%' },
          options: departments.map((d) => ({ label: d, value: d })),
        },
      },
      {
        title: '负责人',
        dataIndex: 'owner',
        width: 120,
        editable: true,
        component: 'select',
        // 联动：负责人选项随部门变化，切换部门时清空并必填
        dependencies: {
          triggerFields: ['department'],
          required: () => true,
          componentProps: (row) => ({
            style: { width: '100%' },
            options: (departmentOwners[row.department] ?? []).map((o) => ({
              label: o,
              value: o,
            })),
          }),
          trigger: (row, api: DependencyApi<Row>) => {
            const list = departmentOwners[row.department] ?? [];
            if (!list.includes(row.owner)) api.setFieldValue('owner', '');
          },
        },
      },
    ],
  },
  {
    title: '启用',
    dataIndex: 'enabled',
    width: 80,
    align: 'center',
    editable: true,
    component: 'switch',
    customRender: ({ value }) => (value ? '是' : '否'),
  },
];

// ──── 控制项 ────

type ModeKey = 'cell' | 'row' | 'all' | 'manual' | 'off';
const mode = ref<ModeKey>('cell');
const editableProp = computed<boolean | 'cell' | 'row' | 'manual'>(() => {
  if (mode.value === 'all') return true;
  if (mode.value === 'off') return false;
  return mode.value;
});

const validateTrigger = ref<'manual' | 'change' | 'blur'>('change');
const hotkeyEnabled = ref(true);
const adaptive = ref(false);
const resizable = ref(true);
const lastHotkey = ref('—');

const customHotkeys = [
  {
    key: 'ctrl+g',
    preventDefault: true,
    handler: (ctx: HotkeyContext) => {
      lastHotkey.value = \`Ctrl+G → 行 \${ctx.activeRowIndex + 1} / 列 \${ctx.activeColIndex + 1}\`;
    },
  },
];

// ──── 实例 & 行选择 ────

const tableRef = ref<InstanceType<typeof AntTable> | null>(null);
const selectedRowKeys = ref<number[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: number[]) => (selectedRowKeys.value = keys),
}));

const dirtyCount = computed(() => tableRef.value?.getDirtyCells()?.size ?? 0);

function addRow(): void {
  tableRef.value?.insertRow(undefined, createRow(nextId++ - 1));
}

function removeSelected(): void {
  const keys = new Set(selectedRowKeys.value);
  const indices = data.value
    .map((r, i) => (keys.has(r.id) ? i : -1))
    .filter((i) => i >= 0);
  if (!indices.length) {
    message.info('请先勾选行');
    return;
  }
  tableRef.value?.deleteRow(indices);
  selectedRowKeys.value = [];
}

async function validateAll(): Promise<void> {
  const res = await tableRef.value?.validate();
  if (res?.valid) {
    message.success('校验通过');
  } else {
    message.error('存在校验错误');
    tableRef.value?.scrollToFirstError();
  }
}

function showModified(): void {
  const rows = tableRef.value?.getModifiedRows() ?? [];
  message.info(\`已修改 \${rows.length} 行\`);
}
<\/script>

<template>
  <div class="atbl-demo">
    <div class="atbl-demo__toolbar">
      <a-radio-group v-model:value="mode" button-style="solid" size="small">
        <a-radio-button value="cell">单元格</a-radio-button>
        <a-radio-button value="row">行编辑</a-radio-button>
        <a-radio-button value="all">全量</a-radio-button>
        <a-radio-button value="manual">手动</a-radio-button>
        <a-radio-button value="off">只读</a-radio-button>
      </a-radio-group>

      <a-divider type="vertical" />
      <span class="atbl-demo__label">校验</span>
      <a-radio-group
        v-model:value="validateTrigger"
        button-style="solid"
        size="small"
      >
        <a-radio-button value="manual">手动</a-radio-button>
        <a-radio-button value="change">change</a-radio-button>
        <a-radio-button value="blur">blur</a-radio-button>
      </a-radio-group>

      <a-divider type="vertical" />
      <a-button size="small" @click="addRow">新增行</a-button>
      <a-button
        size="small"
        danger
        :disabled="!selectedRowKeys.length"
        @click="removeSelected"
      >
        删除选中
      </a-button>
      <a-button
        v-if="mode === 'manual'"
        size="small"
        @click="tableRef?.startEdit()"
      >
        编辑当前格
      </a-button>

      <a-divider type="vertical" />
      <a-button size="small" :disabled="!tableRef?.canUndo" @click="tableRef?.undo()">
        撤销
      </a-button>
      <a-button size="small" :disabled="!tableRef?.canRedo" @click="tableRef?.redo()">
        重做
      </a-button>
      <a-button size="small" type="primary" @click="validateAll">校验</a-button>
      <a-button size="small" @click="showModified">查看已改行</a-button>

      <a-divider type="vertical" />
      <a-checkbox v-model:checked="hotkeyEnabled">热键</a-checkbox>
      <a-checkbox v-model:checked="adaptive">自适应高度</a-checkbox>
      <a-checkbox v-model:checked="resizable">列宽拖拽</a-checkbox>
    </div>

    <div class="atbl-demo__status">
      <span>
        激活：行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
        {{ (tableRef?.activeColIndex ?? -1) + 1 }}
      </span>
      <span class="atbl-demo__sep">|</span>
      <span>脏数据：{{ dirtyCount }} 格</span>
      <span class="atbl-demo__sep">|</span>
      <span>Ctrl+G：{{ lastHotkey }}</span>
    </div>

    <AntTable
      ref="tableRef"
      v-model:dataSource="data"
      :columns="columns"
      :editable="editableProp"
      :validate-trigger="validateTrigger"
      :hotkey-enabled="hotkeyEnabled"
      :hotkeys="customHotkeys"
      :adaptive="adaptive"
      :resizable="resizable"
      :scroll-x="1080"
      :row-selection="rowSelection"
      row-key="id"
      column-setting-key="docs-ant-table-demo"
      bordered
      size="middle"
      validate-on-cell-exit
    >
      <template #title>
        <span class="atbl-demo__title">采购清单</span>
      </template>
    </AntTable>

    <p class="atbl-demo__hint">
      点击单元格聚焦后：方向键移动 · 双击 / F2 进入编辑 · Enter 确认并下移 · Tab
      右移 · Delete 清空 · Ctrl+Z / Ctrl+Shift+Z 撤销重做 · Ctrl+G 自定义热键 ·
      右键表头可隐藏列或打开列设置 · 开启「列宽拖拽」后所有带宽度的列（含分组表头子列）表头右缘均可拖拽调整列宽（序号列已用列级 resizable: false 单独关闭）。
    </p>
  </div>
</template>

<style scoped>
.atbl-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.atbl-demo__label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.atbl-demo__status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}
.atbl-demo__sep {
  color: var(--vp-c-divider);
}
.atbl-demo__title {
  font-weight: 600;
}
.atbl-demo__hint {
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
}
</style>
`;const ht=JSON.parse(`{"title":"AntTable","description":"基于 Ant Design Vue a-table 的增强表格","frontmatter":{"title":"AntTable","description":"基于 Ant Design Vue a-table 的增强表格"},"headers":[],"relativePath":"components/ant-table/index.md","filePath":"components/ant-table/index.md"}`);var gt=P({name:`components/ant-table/index.md`,setup(e){return(e,t)=>{let n=u(`ClientOnly`),r=u(`DemoBlock`);return L(),C(`div`,null,[t[0]||=j("",3),_(r,{title:`基础用法`,description:`配置式列 + cell 编辑模式，双击单元格即可编辑。`,source:c(lt)},{default:O(()=>[_(n,null,{default:O(()=>[_(ct)]),_:1})]),_:1},8,[`source`]),t[1]||=j("",4),_(r,{title:`交互示例`,description:`完整功能演示：双击编辑、键盘导航、热键、校验、联动与行操作。`,source:c(mt)},{default:O(()=>[_(n,null,{default:O(()=>[_(pt)]),_:1})]),_:1},8,[`source`]),t[2]||=j("",44)])}}});export{ht as __pageData,gt as default};