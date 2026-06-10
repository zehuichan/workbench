import{A as e,B as t,D as n,G as r,H as i,I as a,Jt as o,Kt as s,St as c,T as l,U as u,V as d,Vt as f,X as p,Yt as m,_ as h,a as g,b as _,d as v,et as y,f as b,gt as x,k as S,m as C,o as w,p as T,pt as E,qt as D,rt as O,t as k,u as A,v as j,vt as ee,w as te,x as M,xt as N,y as P,z as F}from"./chunks/plugin-vue_export-helper.lnNjcNWu.js";import{Gt as I,Kt as L,Nt as R,Pt as ne,pt as z,s as B}from"./chunks/weekYear.Bk__H43W.js";import{a as re,c as ie,d as V,f as H,h as ae,i as oe,l as se,m as ce,n as U,o as le,p as W,r as ue,s as de,u as fe}from"./chunks/es.LxIuVRVG.js";import{C as pe,D as me,E as he,O as G,S as ge,T as K,_ as _e,a as ve,b as ye,c as be,d as xe,f as Se,g as Ce,h as we,i as Te,k as Ee,l as De,m as Oe,n as ke,o as Ae,p as je,r as Me,s as Ne,t as Pe,u as Fe,v as Ie,w as Le,x as Re,y as ze}from"./chunks/cloneDeep.BbAcjr1c.js";const Be=Symbol(`AntTable`);function Ve(e){if(!e||typeof e!=`object`)return!1;let t=Object.getPrototypeOf(e);return t===null||t===Object.prototype||Object.getPrototypeOf(t)===null?Object.prototype.toString.call(e)===`[object Object]`:!1}function q(e,t){return e===t||Number.isNaN(e)&&Number.isNaN(t)}function He(e,t,n){return J(e,t,void 0,void 0,void 0,void 0,n)}function J(e,t,n,r,i,a,o){let s=o(e,t,n,r,i,a);if(s!==void 0)return s;if(typeof e==typeof t)switch(typeof e){case`bigint`:case`string`:case`boolean`:case`symbol`:case`undefined`:return e===t;case`number`:return e===t||Object.is(e,t);case`function`:return e===t;case`object`:return Y(e,t,a,o)}return Y(e,t,a,o)}function Y(e,t,n,r){if(Object.is(e,t))return!0;let i=me(e),a=me(t);if(i===`[object Arguments]`&&(i=Ie),a===`[object Arguments]`&&(a=Ie),i!==a)return!1;switch(i){case Re:return e.toString()===t.toString();case _e:return q(e.valueOf(),t.valueOf());case Ae:case be:case ge:return Object.is(e.valueOf(),t.valueOf());case ze:return e.source===t.source&&e.flags===t.flags;case Se:return e===t}n??=new Map;let o=n.get(e),s=n.get(t);if(o!=null&&s!=null)return o===t;n.set(e,t),n.set(t,e);try{switch(i){case Ce:if(e.size!==t.size)return!1;for(let[i,a]of e.entries())if(!t.has(i)||!J(a,t.get(i),i,e,t,n,r))return!1;return!0;case ye:{if(e.size!==t.size)return!1;let i=Array.from(e.values()),a=Array.from(t.values());for(let o=0;o<i.length;o++){let s=i[o],c=a.findIndex(i=>J(s,i,void 0,e,t,n,r));if(c===-1)return!1;a.splice(c,1)}return!0}case Me:case K:case he:case pe:case Le:case ve:case we:case je:case Oe:case Te:case Fe:case xe:if(Ee(e)!==Ee(t)||e.length!==t.length)return!1;for(let i=0;i<e.length;i++)if(!J(e[i],t[i],i,e,t,n,r))return!1;return!0;case ke:return e.byteLength===t.byteLength?Y(new Uint8Array(e),new Uint8Array(t),n,r):!1;case Ne:return e.byteLength!==t.byteLength||e.byteOffset!==t.byteOffset?!1:Y(new Uint8Array(e),new Uint8Array(t),n,r);case De:return e.name===t.name&&e.message===t.message;case Ie:{if(!(Y(e.constructor,t.constructor,n,r)||Ve(e)&&Ve(t)))return!1;let i=[...Object.keys(e),...G(e)],a=[...Object.keys(t),...G(t)];if(i.length!==a.length)return!1;for(let a=0;a<i.length;a++){let o=i[a],s=e[o];if(!Object.hasOwn(t,o))return!1;let c=t[o];if(!J(s,c,o,e,t,n,r))return!1}return!0}default:return!1}}finally{n.delete(e),n.delete(t)}}function X(){}function Ue(e,t){return He(e,t,X)}function Z(e){if(typeof e.dataIndex==`string`)return e.dataIndex}function Q(e){if(typeof e.dataIndex==`string`)return e.dataIndex;if(Array.isArray(e.dataIndex))return e.dataIndex.join(`.`);if(typeof e.key==`string`)return e.key;let t=typeof e.title==`string`?e.title:e.key??`unknown`;return e.children?.length?`_group:${t}`:`_col:${String(t)}`}function We(e){return typeof e.title==`string`&&e.title?e.title:typeof e.dataIndex==`string`?e.dataIndex:Array.isArray(e.dataIndex)?e.dataIndex.join(`.`):typeof e.key==`string`?e.key:e.children?.length?`分组`:`列`}function Ge(e){let t=[];for(let n of e)n.children?.length?t.push(...Ge(n.children)):t.push(n);return t}function $(e){return e.children?.length?e.children.flatMap($):[Q(e)]}function Ke(e,t,n=0){let r=n===0,i=[];for(let a of e){let e=Q(a),o=We(a);a.children?.length?i.push({column:a,id:e,label:o,depth:n,children:Ke(a.children,t,n+1),isTopLevel:r}):i.push({column:a,id:e,label:o,depth:n,isTopLevel:r})}if(r&&t.length>0){let e=new Map(t.map((e,t)=>[e,t])),n=t=>e.get(t.id)??9999;i.sort((e,t)=>n(e)-n(t))}return i}function qe(e){return e.map(e=>Q(e))}function Je(e,t){if(t.length===0)return e;let n=new Map(t.map((e,t)=>[e,t])),r=e=>n.get(Q(e))??9999;return[...e].sort((e,t)=>r(e)-r(t))}function Ye(e){let t=[];for(let n of e)n.children?.length?t.push(...Ye(n.children)):t.push(n);return t}var Xe=`input, textarea, [contenteditable="true"], .ant-select-selector`;function Ze(t){return()=>{e(()=>{e(()=>{let e=t.value;if(!e)return;let n=e.querySelector(`.atbl-cell--active`)?.querySelector(Xe)??e.querySelector(Xe);n&&document.activeElement!==n&&n.focus()})})}}function Qe(e,t){let n=t.toLowerCase().split(`+`).map(e=>e.trim()),r=n.find(e=>![`ctrl`,`shift`,`alt`,`meta`].includes(e));return r?e.ctrlKey===n.includes(`ctrl`)&&e.shiftKey===n.includes(`shift`)&&e.altKey===n.includes(`alt`)&&e.metaKey===n.includes(`meta`)&&e.key.toLowerCase()===r:!1}function $e(e){return e.ctrlKey||e.altKey||e.metaKey?!1:e.key.length===1}function et(e){let t=e.getBoundingClientRect(),n=getComputedStyle(e),r=parseFloat(n.marginTop)||0,i=parseFloat(n.marginBottom)||0;return t.height+r+i}function tt(t){let{adaptive:n,wrapperEl:r}=t,i=E(void 0),o=A(()=>!!n.value),s=A(()=>{let e=n.value;return!e||e===!0?{}:e}),c=e=>{let t=0,n=getComputedStyle(e);t+=parseFloat(n.marginBottom)||0;let r=e.parentElement;if(r){let e=getComputedStyle(r);t+=parseFloat(e.paddingBottom)||0,t+=parseFloat(e.borderBottomWidth)||0}let i=new Set,a=e.nextElementSibling;for(;a;){i.add(a);let e=a.getBoundingClientRect(),n=getComputedStyle(a);t+=e.height,t+=parseFloat(n.marginTop)||0,t+=parseFloat(n.marginBottom)||0,a=a.nextElementSibling}if(s.value.excludeSelectors?.length&&r)for(let n of s.value.excludeSelectors){let a=r.querySelector(n);a&&a!==e&&!i.has(a)&&(t+=a.getBoundingClientRect().height)}return t},l=()=>{if(!o.value){i.value=void 0;return}let e=r.value;if(!e)return;let t=e.getBoundingClientRect(),n=window.innerHeight,a=s.value.offsetTop??0,l=s.value.offsetBottom??0,u=c(e),d=0,f=e.querySelector(`.atbl-header`),p=e.querySelector(`.atbl-footer`);f&&(d+=et(f)),p&&(d+=et(p));let m=e.querySelector(`.ant-table-thead`),h=m?m.getBoundingClientRect().height:55,g=n-t.top-a-l-u-d-h;i.value=Math.max(g,100)},u=ne(l,100);return z(window,`resize`,()=>{o.value&&u()}),y(r,t=>{t&&o.value&&e(l)}),y([o,s],()=>{o.value&&r.value?e(l):o.value||l()}),a(()=>{o.value&&e(l)}),{scrollY:i,recalculate:l}}var nt={disabled:!1};function rt(e){let t=new Map,n=Ge(e);for(let e of n){let n=e.dependencies;if(n?.triggerFields?.length)for(let r of n.triggerFields)t.has(r)||t.set(r,[]),t.get(r).push({column:e,dep:n})}return t}function it(e){let{columns:t,data:n,markDirty:r}=e,i=A(()=>rt(t.value)),a=!1;function o(e,t,n,i){return{rowIndex:e,row:t,column:n,getFieldValue:e=>t[e],setFieldValue:(n,a)=>{t[n]=a,r?.(e,n),i?.(e,n)}}}function s(e,t){let r=t.dependencies;if(!r)return nt;let i=n.value[e];if(!i)return nt;let a=o(e,i,t);return{disabled:r.disabled?r.disabled(i,a):!1,required:r.required?r.required(i,a):void 0,rules:r.rules?r.rules(i,a):void 0,componentProps:r.componentProps?r.componentProps(i,a):void 0}}function c(e,t){if(a)return;let s=n.value[e];if(!s)return;let c=i.value.get(t);if(c?.length){a=!0;try{for(let{column:t,dep:n}of c)if(n.trigger){let i=o(e,s,t,r??void 0);n.trigger.call(null,s,i)}}finally{a=!1}}}return{resolveDependencyState:s,onFieldChange:c,triggerMap:i}}function at(e){let{confirmEdit:t,undo:n,redo:r,markDirty:i,pushChange:a,onFieldChange:o,validateOnCellExit:s,validateFieldsAffectedByChange:c}=e;function l(){let e=t();if(!e)return null;a(e);for(let t of e)i(t.rowIndex,t.field),o(t.rowIndex,t.field),s.value&&c(t.rowIndex,t.field).catch(e=>{});return e}function u(){let e=n();e&&e.forEach(e=>i(e.rowIndex,e.field))}function d(){let e=r();e&&e.forEach(e=>i(e.rowIndex,e.field))}return{commitEdit:l,undo:u,redo:d}}function ot(t){let{data:n,visibleColumns:r,wrapperEl:i}=t,a=E(-1),o=E(-1),s=A(()=>Ge(r.value).filter(e=>!e.hidden&&!!Z(e))),c=A(()=>o.value>=0?s.value[o.value]??null:null),l=A(()=>a.value>=0?n.value[a.value]??null:null);function u(){e(()=>{(i.value?.querySelector(`.atbl-cell--active`))?.scrollIntoView({block:`nearest`,inline:`nearest`})})}function d(e,t){let r=n.value.length,i=s.value.length;r===0||i===0||(a.value=Math.max(0,Math.min(e,r-1)),o.value=Math.max(0,Math.min(t,i-1)),u())}function f(e,t){let r=n.value.length,i=s.value.length;if(r===0||i===0)return;let c=a.value<0?0:a.value+e,l=o.value<0?0:o.value+t;l<0?(--c,l=i-1):l>=i&&(c+=1,l=0),c=Math.max(0,Math.min(c,r-1)),a.value=c,o.value=l,u()}function p(e,t){if(e<0||!t)return;let n=s.value.findIndex(e=>Z(e)===t);n<0||(a.value=e,o.value=n)}function m(e,t){return!t||a.value!==e?!1:Z(c.value??{})===t}return{activeRowIndex:a,activeColIndex:o,navigableColumns:s,activeRow:l,activeColumn:c,navigate:f,focusCell:d,scrollToActiveCell:u,handleCellClick:p,isActiveCell:m}}var st=`.ant-select-dropdown, .ant-picker-dropdown, .ant-dropdown, .ant-popover`;function ct(e){let{wrapperEl:t,hotkeyEnabled:n,navigate:r,focusCell:i,activeRowIndex:a,activeColIndex:o,data:s,navigableColumns:c,customHotkeys:l,editMode:u,autoTriggerEnabled:d,isEditing:f,editingRowIndex:p,startEdit:m,confirmEdit:h,cancelEdit:g,updateCellValue:_,isCellEditable:v,undo:y,redo:b,canUndo:x,canRedo:S}=e,C=E(!1),w=A(()=>l?.value?.filter(e=>e.override)??[]),T=A(()=>l?.value?.filter(e=>!e.override)??[]);z(t,`focusin`,()=>{C.value=!0}),z(t,`focusout`,e=>{let n=e.relatedTarget;t.value?.contains(n)||n?.closest(st)||(C.value=!1)});let D=Ze(t);function O(e){return{event:e,activeRowIndex:a.value,activeColIndex:o.value,row:a.value>=0?s.value[a.value]??null:null,column:o.value>=0?c.value[o.value]??null:null,tableData:s.value,columns:c.value,navigate:r,startEdit:m,cancelEdit:g,updateCellValue:_}}function k(){return a.value<0||o.value<0?(i(0,0),!0):!1}function j(e){return!!e.target?.closest(`.atbl-cell-editor`)}function ee(e){if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`z`)return x.value?(e.preventDefault(),y(),!0):!1;if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()===`z`)return S.value?(e.preventDefault(),b(),!0):!1;switch(e.key){case`Escape`:return e.preventDefault(),t.value?.focus({preventScroll:!0}),!0;case`Enter`:return e.preventDefault(),r(e.shiftKey?-1:1,0),D(),!0;case`Tab`:return e.preventDefault(),r(0,e.shiftKey?-1:1),D(),!0;default:return!1}}function te(e){switch(e.key){case`Escape`:return e.preventDefault(),g(),t.value?.focus({preventScroll:!0}),!0;case`Enter`:return e.preventDefault(),h(),r(e.shiftKey?-1:1,0),t.value?.focus({preventScroll:!0}),!0;case`Tab`:if(e.preventDefault(),u.value===`row`){let t=c.value.length,n=p.value,r=o.value+(e.shiftKey?-1:1);return r<0&&(r=t-1),r>=t&&(r=0),i(n,r),m(n,r),D(),!0}return h(),r(0,e.shiftKey?-1:1),t.value?.focus({preventScroll:!0}),!0;default:return!1}}function M(e){let t=s.value.length,n=c.value.length;if(t===0||n===0)return!1;if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`z`)return x.value?(e.preventDefault(),y(),!0):!1;if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()===`z`||e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()===`y`)return S.value?(e.preventDefault(),b(),!0):!1;if(e.key===`F2`&&d.value)return e.preventDefault(),a.value>=0&&o.value>=0&&v(a.value,o.value)&&(m(),D()),!0;if((e.key===`Delete`||e.key===`Backspace`)&&d.value)return a.value>=0&&o.value>=0&&v(a.value,o.value)?(e.preventDefault(),m(),_(``),D(),!0):!1;let l=u.value===`all`;switch(e.key){case`ArrowUp`:return e.preventDefault(),k()||r(-1,0),l&&D(),!0;case`ArrowDown`:return e.preventDefault(),k()||r(1,0),l&&D(),!0;case`ArrowLeft`:return e.preventDefault(),k()||r(0,-1),l&&D(),!0;case`ArrowRight`:return e.preventDefault(),k()||r(0,1),l&&D(),!0;case`Tab`:return e.preventDefault(),k()||r(0,e.shiftKey?-1:1),l&&D(),!0;case`Enter`:return e.preventDefault(),k()?(l&&D(),!0):(d.value&&v(a.value,o.value)?(m(),D()):(r(e.shiftKey?-1:1,0),l&&D()),!0);case`Home`:return e.preventDefault(),e.ctrlKey?i(0,0):i(Math.max(0,a.value),0),l&&D(),!0;case`End`:return e.preventDefault(),e.ctrlKey?i(t-1,n-1):i(Math.max(0,a.value),n-1),l&&D(),!0;default:return!1}}function N(e){if(!n.value||!C.value)return;if(f.value){let t=O(e);for(let n of w.value)if(Qe(e,n.key)&&!(n.when&&!n.when(t))&&(n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t)!==!1))return;te(e);return}if(u.value===`all`&&j(e))return ee(e),void 0;let t=O(e);for(let n of w.value)if(Qe(e,n.key)&&!(n.when&&!n.when(t))&&(n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t)!==!1))return;if(!M(e)){for(let n of T.value)if(Qe(e,n.key)&&!(n.when&&!n.when(t))){n.preventDefault!==!1&&e.preventDefault(),n.stopPropagation&&e.stopPropagation(),n.handler(t);return}d.value&&$e(e)&&a.value>=0&&o.value>=0&&v(a.value,o.value)&&(e.preventDefault(),e.stopPropagation(),m(),_(e.key),D())}}return z(t,`keydown`,N),{hasFocus:C}}function lt(e){return e===!1?`none`:e===!0?`all`:e}function ut(e){let{data:t,navigableColumns:n,activeRowIndex:r,activeColIndex:i,editable:a,isDepDisabled:o,onEditStart:s,onEditEnd:c,onValueChange:l}=e,u=E(!1),d=E(-1),f=E(-1),p=E({}),m=E({}),h=A(()=>lt(a.value)),g=A(()=>h.value===`cell`||h.value===`row`),_=A(()=>f.value>=0?n.value[f.value]??null:null);function v(e,r){if(h.value===`none`)return!1;let i=n.value[r];if(!i)return!1;let a=t.value[e];return!(!a||i.editable===!1||typeof i.editable==`function`&&!i.editable(a)||o?.(e,Z(i)??``))}function y(e,a){let o=e??r.value,c=a??i.value;if(o<0||c<0||h.value===`none`||!v(o,c))return;if(u.value&&d.value===o){if(h.value===`row`){f.value=c;return}if(f.value===c)return}u.value&&b();let l=t.value[o];if(!l)return;if(d.value=o,f.value=c,h.value===`row`){let e={},t={};for(let r=0;r<n.value.length;r++){let i=n.value[r],a=Z(i);a&&v(o,r)&&(e[a]=l[a],t[a]=l[a])}if(Object.keys(e).length===0)return;p.value=e,m.value=t}else{let e=n.value[c],t=Z(e);if(!t)return;let r=l[t];p.value={[t]:r},m.value={[t]:r}}u.value=!0;let g=n.value[c];if(g){let e=Z(g),t=e?l[e]:void 0;s?.({row:l,column:g,value:t,rowIndex:o,colIndex:c})}}function b(){if(!u.value)return null;let e=d.value,r=t.value[e];if(!r)return S(),null;let i=[];for(let[t,a]of Object.entries(p.value)){let o=m.value[t];if(o!==a){r[t]=a,i.push({rowIndex:e,field:t,oldValue:o,newValue:a});let s=n.value.findIndex(e=>Z(e)===t);s>=0&&l?.({row:r,column:n.value[s],oldValue:o,newValue:a,value:a,rowIndex:e,colIndex:s})}}let a=f.value,o=n.value[a];return o&&c?.({row:r,column:o,value:p.value[Z(o)??``],rowIndex:e,colIndex:a}),S(),i.length>0?i:null}function x(){if(!u.value)return;let e=d.value,r=f.value,i=n.value[r],a=t.value[e];i&&a&&c?.({row:a,column:i,value:m.value[Z(i)??``],rowIndex:e,colIndex:r}),S()}function S(){u.value=!1,d.value=-1,f.value=-1,p.value={},m.value={}}function C(e){return p.value[e]}function w(e,t){p.value[e]=t}function T(e){let t=Z(_.value??{});t&&(p.value[t]=e)}function D(e,t){if(!t)return!1;if(h.value===`all`){let r=n.value.findIndex(e=>Z(e)===t);return r>=0&&v(e,r)}return!u.value||d.value!==e?!1:h.value===`row`?t in p.value:Z(_.value??{})===t}return{isEditing:u,editingRowIndex:d,editingColIndex:f,editingValues:p,editingColumn:_,editMode:h,autoTriggerEnabled:g,isCellEditable:v,startEdit:y,confirmEdit:b,cancelEdit:x,getEditingValue:C,setEditingValue:w,updateEditingValue:T,isEditingCell:D}}function dt(e){let{data:t,maxHistory:n=50}=e,r=E([]),i=E([]),a=A(()=>r.value.length>0),o=A(()=>i.value.length>0);function s(e){let t=Array.isArray(e)?e:[e];t.length!==0&&(r.value.push(t),r.value.length>n&&r.value.shift(),i.value=[])}function c(){let e=r.value.pop();if(e){for(let n of e){let e=t.value[n.rowIndex];e&&(e[n.field]=n.oldValue)}return i.value.push(e),e}}function l(){let e=i.value.pop();if(e){for(let n of e){let e=t.value[n.rowIndex];e&&(e[n.field]=n.newValue)}return r.value.push(e),e}}function u(){r.value=[],i.value=[]}return{canUndo:a,canRedo:o,pushChange:s,undo:c,redo:l,clearHistory:u}}function ft(e){let t=new Map;for(let n of e){let e=Z(n);if(!e)continue;let r=Array.isArray(n.rules)?n.rules:n.rules?[n.rules]:[];for(let n of r){let r=n.dependencies;if(r?.length)for(let n of r)t.has(n)||t.set(n,new Set),t.get(n).add(e)}}return t}function pt(t){let{data:n,columns:r,tableRules:i,tableEl:a,trigger:o=E(`manual`),validateOnCellExit:s=E(!1),resolveDeps:c}=t,l=E(new Map),u=A(()=>ft(r.value));function d(e,t,n){let r=i.value?.[e],a=t.rules,o=[];if(r&&o.push(...Array.isArray(r)?r:[r]),a&&o.push(...Array.isArray(a)?a:[a]),t.required&&o.push({required:!0}),n!=null&&c&&t.dependencies){let r=c(n,t);if(r.rules&&o.push(...Array.isArray(r.rules)?r.rules:[r.rules]),r.required){let n=typeof t.title==`string`?t.title:e;o.push({required:!0,message:`${n} 必填`})}}return o}async function f(e){let t=n.value[e];if(!t)return{};let i={},a={};for(let t of r.value){let n=Z(t);if(!n)continue;let r=d(n,t,e);r.length>0&&(a[n]=r)}if(Object.keys(a).length===0)return{};let o=new B(a);try{await o.validate(t,{firstFields:!0})}catch(e){let t=e?.errors;if(t)for(let e of t)i[e.field]=e.message}return i}function p(e){return e===!0?n.value.map((e,t)=>t):e===!1?[]:typeof e==`number`?[e]:e}async function m(e=!0){let t=p(e),n={},i=new Map(l.value);for(let e of t)for(let t of r.value){let n=Z(t);n&&i.delete(`${e}:${n}`)}for(let e of t){let t=await f(e);if(Object.keys(t).length>0){n[e]=t;for(let[n,r]of Object.entries(t))i.set(`${e}:${n}`,r)}}return l.value=i,{valid:Object.keys(n).length===0,errors:n}}async function h(e,t){let i=n.value[e];if(!i)return!0;let a=r.value.find(e=>Z(e)===t);if(!a)return!0;let o=d(t,a,e);if(o.length===0)return!0;let s=new B({[t]:o}),c=`${e}:${t}`,u=new Map(l.value);try{return await s.validate(i,{firstFields:!0}),u.delete(c),l.value=u,!0}catch(e){let t=e?.errors?.[0]?.message??`Invalid`;return u.set(c,t),l.value=u,!1}}async function g(e,t){let n=new Set([t]),r=u.value.get(t);if(r)for(let e of r)n.add(e);for(let t of n)await h(e,t)}function _(e,t){if(e===void 0){l.value=new Map;return}let n=new Map(l.value);if(t)n.delete(`${e}:${t}`);else for(let t of[...n.keys()])t.startsWith(`${e}:`)&&n.delete(t);l.value=n}function v(){let t=a.value;if(!t||l.value.size===0)return;let n=1/0;for(let e of l.value.keys()){let[t]=e.split(`:`),r=Number(t);!Number.isNaN(r)&&r<n&&(n=r)}n!==1/0&&e(()=>{t.querySelectorAll(`.ant-table-tbody tr.ant-table-row`)[n]?.scrollIntoView({block:`center`,inline:`nearest`})})}function y(e,t){return l.value.get(`${e}:${t}`)}return{errors:l,validate:m,validateField:h,validateFieldsAffectedByChange:g,clearValidation:_,scrollToFirstError:v,getErrorForCell:y}}function mt(e){return arguments.length===0?[]:Array.isArray(e)?e:[e]}function ht(e){if(e==null)return``;if(typeof e==`string`)return e;if(Array.isArray(e))return e.map(ht).join(`,`);let t=String(e);return t===`0`&&Object.is(Number(e),-0)?`-0`:t}function gt(e){return typeof e==`string`||typeof e==`symbol`?e:Object.is(e?.valueOf?.(),-0)?`-0`:String(e)}function _t(e){if(Array.isArray(e))return e.map(gt);if(typeof e==`symbol`)return[e];e=ht(e);let t=[],n=e.length;if(n===0)return t;let r=0,i=``,a=``,o=!1;for(e.charCodeAt(0)===46&&(t.push(``),r++);r<n;){let s=e[r];a?s===`\\`&&r+1<n?(r++,i+=e[r]):s===a?a=``:i+=s:o?s===`"`||s===`'`?a=s:s===`]`?(o=!1,t.push(i),i=``):i+=s:s===`[`?(o=!0,i&&=(t.push(i),``)):s===`.`?i&&=(t.push(i),``):i+=s,r++}return i&&t.push(i),t}function vt(e){return e===`__proto__`}function yt(e){switch(typeof e){case`number`:case`symbol`:return!1;case`string`:return e.includes(`.`)||e.includes(`[`)||e.includes(`]`)}}function bt(e,t,n){if(e==null)return n;switch(typeof t){case`string`:{if(vt(t))return n;let r=e[t];return r===void 0?yt(t)?bt(e,_t(t),n):n:r}case`number`:case`symbol`:{typeof t==`number`&&(t=gt(t));let r=e[t];return r===void 0?n:r}default:{if(Array.isArray(t))return xt(e,t,n);if(t=Object.is(t?.valueOf(),-0)?`-0`:String(t),vt(t))return n;let r=e[t];return r===void 0?n:r}}}function xt(e,t,n){if(t.length===0)return n;let r=e;for(let e=0;e<t.length;e++){if(r==null||vt(t[e]))return n;r=r[t[e]]}return r===void 0?n:r}function St(e,t,n){if(e===t)return n;let r=e>t?e-1:e;return r>=n?r+1:r}function Ct(e){let{data:t,onDataChange:n,activeRowIndex:r}=e;function i(e,r={},i=1){if(i<1)return;let a=[...t.value],o=e??a.length,s=Math.max(0,Math.min(o,a.length)),c=Array.from({length:i},()=>({...r}));a.splice(s,0,...c),n(a)}function a(e){let r=(e==null?[]:mt(e)).filter(e=>e>=0&&e<t.value.length);if(!r.length)return;let i=new Set(r);n(t.value.filter((e,t)=>!i.has(t)))}function o(e,i){let a=[...t.value],o=a.length;if(e<0||e>=o||i<0||i>=o||e===i)return;let[s]=a.splice(e,1);s&&(a.splice(i,0,s),n(a),r!=null&&r.value>=0&&(r.value=St(r.value,e,i)))}function s(e){let r=e==null?[]:mt(e),i=[...new Set(r)].filter(e=>e>=0&&e<(t.value.length??0)).sort((e,t)=>e-t);if(!i.length)return;let a=[...t.value],o=0;for(let e of i)a.splice(e+1+o,0,structuredClone(t.value[e])),o++;n(a)}return{insertRow:i,deleteRow:a,moveRow:o,duplicateRow:s}}function wt(e,t){return t.length>0?t:qe(e)}function Tt(e){return`ant-table:${e}:columns`}function Et(e){try{return e===`local`?localStorage:sessionStorage}catch{return null}}function Dt(e){let{initialColumns:t,tableKey:n,storage:r=!1}=e,i=E([]),a=E(new Set),o=E({}),s=null;function c(){s={order:[...i.value],hidden:new Set(a.value),widths:{...o.value}}}function l(){s&&(i.value=s.order,a.value=new Set(s.hidden),o.value={...s.widths},s=null,d())}function u(){if(!r||!n)return;let e=Et(r);if(e)try{let r=e.getItem(Tt(n));if(!r)return;let s=JSON.parse(r),c=[],l=new Set,u={},d=t.value,f=new Map(d.map(e=>[Q(e),e]));for(let e of s.sort((e,t)=>e.order-t.order)){if(f.has(e.id)&&(c.push(e.id),e.hidden)){let t=f.get(e.id);t?.children?.length?$(t).forEach(e=>l.add(e)):l.add(e.id)}e.width!=null&&e.width>0&&(u[e.id]=e.width)}i.value=c,a.value=l,o.value=u}catch{}}let d=R(f,100);function f(){if(!r||!n)return;let e=Et(r);if(!e)return;let s=t.value,c=wt(s,i.value),l=o.value,u=[];c.forEach((e,t)=>{let n=s.find(t=>Q(t)===e),r={id:e,hidden:n?.children?.length?$(n).every(e=>a.value.has(e)):a.value.has(e),order:t};l[e]!=null&&l[e]>0&&(r.width=l[e]),u.push(r)});let d=new Set(c);for(let[e,t]of Object.entries(l))t>0&&!d.has(e)&&u.push({id:e,hidden:!1,order:u.length,width:t});try{e.setItem(Tt(n),JSON.stringify(u))}catch{}}let p=e=>a.value.has(Q(e))?!0:e.hidden===!0;function m(e,t){let n=[];for(let r of e)if(r.children?.length){let e=m(r.children,t);if(e.length===0)continue;n.push({...r,children:e})}else t(r)||n.push(r);return n}function h(e,t){return e.map(e=>{if(e.children?.length)return{...e,children:h(e.children,t)};let n=Q(e);return t[n]==null?e:{...e,width:t[n]}})}let g=A(()=>{let e=t.value;return h(m(Je(e,wt(e,i.value)),p),o.value)});function _(e,n){let r=new Set(a.value),i=t.value.find(t=>Q(t)===e),o=i?.children?.length?$(i):[e];for(let e of o)n?r.delete(e):r.add(e);a.value=r,d()}function v(e){i.value=[...e],d()}function b(){let e=t.value;return Ke(e,wt(e,i.value))}function x(e,n){let r=t.value,a=[...wt(r,i.value)],o=a.indexOf(e);if(o<0)return;let s=o+n;if(s<0||s>=a.length)return;let[c]=a.splice(o,1);a.splice(s,0,c),i.value=a,d()}function S(e){if(e==null||e===``)return;let t=typeof e==`number`?e:Number(e);return Number.isFinite(t)&&t>0?t:void 0}function C(e,t){if(!e)return;let n=S(t),r={...o.value};n==null?delete r[e]:r[e]=n,o.value=r,d()}function w(){i.value=[],a.value=new Set,o.value={},r&&n&&Et(r)?.removeItem(Tt(n))}return u(),y(()=>t.value.map(e=>Q(e)).join(`,`),u),{visibleColumns:g,hiddenColumns:a,columnWidths:o,columnOrder:i,toggleColumn:_,moveColumn:x,setColumnOrderByIds:v,setColumnWidth:C,resetColumns:w,snapshotColumnState:c,restoreColumnState:l,getColumnSettingTree:b,isColumnHidden:e=>a.value.has(e),isNodeHidden:e=>e.column.children?.length?$(e.column).every(e=>a.value.has(e)):a.value.has(e.id)}}function Ot(e){let{data:t}=e,n=x(new Map),r=e.cachedData??x([]);e.cachedData||y(()=>t.value,e=>{e?.length&&!r.value.length&&(r.value=Pe(e))},{immediate:!0});function i(e,i){let a=r.value[e]?.[i],o=t.value[e]?.[i],s=n.value;if(Ue(a,o)){let t=s.get(e);t&&(t.delete(i),t.size===0&&s.delete(e),N(n))}else{let t=s.get(e);t||(t=new Set,s.set(e,t)),t.add(i),N(n)}}function a(e,t){return n.value.get(e)?.has(t)??!1}function o(e){return(n.value.get(e)?.size??0)>0}function s(e,t){if(e===void 0){n.value=new Map;return}let r=n.value;if(t!==void 0){let n=r.get(e);if(!n)return;n.delete(t),n.size===0&&r.delete(e)}else if(!r.delete(e))return;N(n)}function c(){let e=t.value,r=new Set(n.value.keys());return e.filter((e,t)=>r.has(t))}function l(){r.value=Pe(t.value),n.value=new Map}function u(){let e=new Set;for(let[t,r]of n.value)for(let n of r)e.add(`${t}:${n}`);return e}return{dirtyCells:n,markDirty:i,resetTracking:l,getDirtyCells:u,isCellDirty:a,isRowDirty:o,clearDirty:s,getModifiedRows:c}}function kt(){let e=n(Be);if(!e)throw Error(`[AntTable] useAntTableContext() must be used inside <AntTable>`);return e}const At={input:{component:de,valueProp:`value`},"input-number":{component:le,valueProp:`value`},select:{component:ae,valueProp:`value`},"date-picker":{component:se,valueProp:`value`},"time-picker":{component:U,valueProp:`value`},switch:{component:oe,valueProp:`checked`},checkbox:{component:H,valueProp:`checked`}};var jt={class:`atbl-cell-content atbl-cell-content--error`},Mt=M({name:`AntTableCell`,inheritAttrs:!1,__name:`ant-table-cell`,props:{column:{},record:{},rowIndex:{}},setup(t){let n=t,i=kt(),a=A(()=>Z(n.column)),o=A(()=>{let e=n.column.dataIndex;if(typeof e==`string`||Array.isArray(e))return e}),l=A(()=>{let e=o.value;if(e!=null)return bt(n.record,e)}),u=A(()=>l.value??``),d=A(()=>{let e=n.column.customRender;return e?()=>e({text:l.value,value:l.value,record:n.record,index:n.rowIndex,column:n.column}):null}),p=A(()=>i.editMode.value===`all`),h=A(()=>i.isEditingCell(n.rowIndex,a.value)),_=A(()=>i.cellActive.value&&i.isActiveCell(n.rowIndex,a.value)),y=A(()=>!!a.value&&i.isCellDirty(n.rowIndex,a.value)),x=A(()=>a.value?i.getErrorForCell(n.rowIndex,a.value):void 0),w=A(()=>i.resolveDependencyState(n.rowIndex,n.column)),T=A(()=>{if(a.value)return p.value?n.record[a.value]:i.getEditingValue(a.value)});function E(e){let t=a.value;if(t){if(p.value){let r=n.record[t];n.record[t]=e,r!==e&&(i.markDirty(n.rowIndex,t),i.onFieldChange(n.rowIndex,t));return}i.setEditingValue(t,e)}}let D=A(()=>{let e=n.column.component;return e?f(e)?At[e]||(console.warn(`[AntTable] 编辑器 "${e}" 未注册`),At.input):{component:e,valueProp:`value`}:At.input}),k=A(()=>D.value.component),j=A(()=>{let e=n.column.componentProps;return e?typeof e==`function`?e(n.record,n.column):e:{}}),ee=A(()=>{let{valueProp:e}=D.value;return{[e]:T.value,[`onUpdate:${e}`]:E,...j.value,...w.value.componentProps??{},disabled:w.value.disabled,size:`small`,class:`atbl-cell-editor`}});function te(){i.cancelEdit(),e(()=>{i.tableEl.value?.focus({preventScroll:!0})})}return(e,n)=>(F(),C(`div`,{class:s([`atbl-cell`,{"atbl-cell--active":_.value,"atbl-cell--dirty":y.value,"atbl-cell--error":!!x.value,"atbl-cell--editing":h.value}])},[h.value?(F(),b(r(k.value),S({key:0},ee.value,{onKeydownCapture:I(L(te,[`stop`]),[`esc`])}),null,16,[`onKeydownCapture`])):x.value?(F(),b(c(ce),{key:1,title:x.value},{default:O(()=>[v(`span`,jt,[t.column.customRender?(F(),b(r(d.value),{key:0})):(F(),C(g,{key:1},[P(m(u.value),1)],64))])]),_:1},8,[`title`])):(F(),C(g,{key:2},[t.column.customRender?(F(),b(r(d.value),{key:0})):(F(),C(g,{key:1},[P(m(u.value),1)],64))],64))],2))}}),Nt={class:`atbl-column-setting`},Pt={class:`atbl-column-setting__header`},Ft={class:`atbl-column-setting__list`},It={class:`atbl-column-setting__row`},Lt={class:`atbl-column-setting__row-actions`},Rt={class:`atbl-column-setting__footer`},zt=M({name:`AntTableColumnSetting`,__name:`ant-table-column-setting`,setup(e,{expose:t}){let n=kt(),r=E(!1),i=A(()=>n.columnOptions??null);y(r,e=>{e&&i.value?.snapshotColumnState?.()});let a=A(()=>i.value?.getColumnSettingTree()??[]),l=e=>i.value?.isNodeHidden(e)??!1;function u(e){return e.children?.length?Ye(e.children):[]}function f(e){let t=u(e);if(t.length===0)return!1;let n=t.filter(e=>l(e)).length;return n>0&&n<t.length}function p(e,t){i.value?.toggleColumn(e.id,t)}function h(e){let t=i.value?.columnWidths?.value??{};if(e.id in t)return t[e.id];let n=e.column.width;return typeof n==`number`?n:void 0}function x(e,t){i.value?.setColumnWidth(e,t??``)}let S=A(()=>Ye(a.value)),D=A(()=>{let e=S.value;return e.length===0?!1:e.every(e=>!l(e))}),k=A(()=>{let e=S.value;if(e.length===0)return!1;let t=e.filter(e=>l(e)).length;return t>0&&t<e.length});function j(e){for(let t of S.value)i.value?.toggleColumn(t.id,e)}function ee(){i.value?.restoreColumnState?.(),r.value=!1}function te(){r.value=!1}function M(){i.value?.resetColumns()}let N=E(!1),I=E({x:0,y:0}),R=E(null);function ne(e,t){R.value=typeof t?.key==`string`&&t.key||typeof t?.dataIndex==`string`&&t.dataIndex||null,I.value={x:e.clientX,y:e.clientY},N.value=!0}function B(){N.value=!1,r.value=!0}function re(){R.value&&i.value?.toggleColumn(R.value,!1),N.value=!1}z(document,`click`,()=>{N.value&&=!1}),z(document,`keydown`,e=>{e.key===`Escape`&&(N.value=!1)});function V(){r.value=!0}return t({openContextMenu:ne,open:V}),(e,t)=>(F(),C(g,null,[(F(),b(w,{to:`body`},[N.value?(F(),C(`div`,{key:0,class:`atbl-context-menu`,style:o({left:`${I.value.x}px`,top:`${I.value.y}px`}),onClick:t[0]||=L(()=>{},[`stop`])},[v(`div`,{class:`atbl-context-menu__item`,onClick:B},`列设置`),v(`div`,{class:s([`atbl-context-menu__item`,{"is-disabled":!R.value}]),onClick:re},` 隐藏此列 `,2)],4)):T(``,!0)])),_(c(ie),{open:r.value,"onUpdate:open":t[2]||=e=>r.value=e,title:`列设置`,placement:`right`,width:360,class:`atbl-column-setting-drawer`},{footer:O(()=>[v(`div`,Rt,[_(c(W),{onClick:ee},{default:O(()=>[...t[7]||=[P(`取消`,-1)]]),_:1}),_(c(W),{danger:``,onClick:M},{default:O(()=>[...t[8]||=[P(`重置`,-1)]]),_:1}),_(c(W),{type:`primary`,onClick:te},{default:O(()=>[...t[9]||=[P(`确认`,-1)]]),_:1})])]),default:O(()=>[v(`div`,Nt,[v(`div`,Pt,[_(c(H),{checked:D.value,indeterminate:k.value,onChange:t[1]||=e=>j(e.target.checked)},{default:O(()=>[...t[3]||=[P(` 全部 `,-1)]]),_:1},8,[`checked`,`indeterminate`])]),t[6]||=v(`p`,{class:`atbl-column-setting__hint`},`勾选显示列，用上下按钮调整顺序`,-1),v(`div`,Ft,[(F(!0),C(g,null,d(a.value,(e,n)=>(F(),C(`div`,{key:e.id,class:`atbl-column-setting__group`},[v(`div`,It,[_(c(H),{checked:!l(e),indeterminate:f(e),onChange:t=>p(e,t.target.checked)},{default:O(()=>[P(m(e.label),1)]),_:2},1032,[`checked`,`indeterminate`,`onChange`]),v(`span`,Lt,[!e.children?.length&&e.column.dataIndex?(F(),b(c(le),{key:0,value:h(e),min:0,size:`small`,placeholder:`宽度`,class:`atbl-column-setting__width`,onChange:t=>x(e.id,t)},null,8,[`value`,`onChange`])):T(``,!0),_(c(W),{size:`small`,type:`text`,disabled:n===0,onClick:t=>i.value?.moveColumn(e.id,-1)},{default:O(()=>[...t[4]||=[P(` ↑ `,-1)]]),_:1},8,[`disabled`,`onClick`]),_(c(W),{size:`small`,type:`text`,disabled:n===a.value.length-1,onClick:t=>i.value?.moveColumn(e.id,1)},{default:O(()=>[...t[5]||=[P(` ↓ `,-1)]]),_:1},8,[`disabled`,`onClick`])])]),(F(!0),C(g,null,d(u(e),e=>(F(),C(`div`,{key:e.id,class:`atbl-column-setting__row atbl-column-setting__row--child`},[_(c(H),{checked:!l(e),onChange:t=>p(e,t.target.checked)},{default:O(()=>[P(m(e.label),1)]),_:2},1032,[`checked`,`onChange`]),e.column.dataIndex?(F(),b(c(le),{key:0,value:h(e),min:0,size:`small`,placeholder:`宽度`,class:`atbl-column-setting__width`,onChange:t=>x(e.id,t)},null,8,[`value`,`onChange`])):T(``,!0)]))),128))]))),128))])])]),_:1},8,[`open`])],64))}}),Bt={class:`atbl-pagination`},Vt=M({name:`AntTablePagination`,__name:`ant-table-pagination`,props:{current:{default:1},pageSize:{default:10},total:{default:0},pageSizes:{},showTotal:{type:Boolean,default:!0}},emits:[`current-change`,`size-change`],setup(e,{emit:t}){let n=e,r=t,i=A(()=>(n.pageSizes??[10,20,50,100]).map(e=>String(e))),a=A(()=>n.showTotal?e=>`共 ${e} 条`:void 0);function o(e,t){if(t!==n.pageSize){r(`size-change`,t);return}r(`current-change`,e)}function s(e,t){r(`size-change`,t)}return(t,n)=>(F(),C(`div`,Bt,[_(c(re),{current:e.current,"page-size":e.pageSize,total:e.total,"page-size-options":i.value,"show-size-changer":!0,"show-quick-jumper":!0,"show-total":a.value,size:`small`,onChange:o,onShowSizeChange:s},null,8,[`current`,`page-size`,`total`,`page-size-options`,`show-total`])]))}}),Ht={key:0,class:`atbl-header`},Ut={class:`atbl-header__title`},Wt={class:`atbl-header__actions`},Gt={key:1,class:`atbl-footer`},Kt={class:`atbl-footer__summary`},qt=M({name:`AntTable`,inheritAttrs:!1,__name:`ant-table`,props:{dataSource:{default:()=>[]},columns:{default:()=>[]},rowKey:{},bordered:{type:Boolean,default:!0},size:{},cellActive:{type:Boolean,default:!0},rowActive:{type:Boolean,default:!0},editable:{type:[Boolean,String],default:!1},rules:{},validateTrigger:{default:`manual`},validateOnCellExit:{type:Boolean,default:!1},columnSetting:{type:Boolean,default:!0},columnSettingKey:{},resizable:{type:Boolean,default:!1},hotkeys:{},hotkeyEnabled:{type:Boolean,default:!0},current:{},pageSize:{},pageSizes:{},total:{},showPaginationTotal:{type:Boolean,default:!0},height:{},scrollX:{},adaptive:{type:[Boolean,Object],default:!1}},emits:[`update:dataSource`,`cell-edit-start`,`cell-edit-end`,`cell-value-change`,`update:current`,`update:pageSize`,`change`],setup(e,{expose:n,emit:r}){let a=e,o=r,s=p(),u=E(null),d=E(null),f=A(()=>!!s.title||!!s.toolbar||a.columnSetting),m=A(()=>a.total!=null||!!s.summary||!!s.pagination),g=A(()=>a.total!=null),y=A(()=>a.dataSource??[]);function x(e){o(`update:current`,e),o(`change`,{current:e,pageSize:a.pageSize??10})}function w(e){o(`update:pageSize`,e),o(`change`,{current:a.current??1,pageSize:e})}let k=Dt({initialColumns:A(()=>a.columns??[]),tableKey:a.columnSetting?a.columnSettingKey??`ant-table-default`:void 0,storage:a.columnSetting?`local`:!1}),j=k.visibleColumns,{scrollY:M}=tt({adaptive:ee(()=>a.adaptive),wrapperEl:u}),N=A(()=>{let e=M.value??a.height,t={};return a.scrollX!=null&&(t.x=a.scrollX),e!=null&&(t.y=e),Object.keys(t).length?t:void 0}),{activeRowIndex:I,activeColIndex:L,navigableColumns:R,activeRow:ne,activeColumn:z,navigate:B,focusCell:re,handleCellClick:ie,isActiveCell:V}=ot({data:y,visibleColumns:j,wrapperEl:u}),{insertRow:H,deleteRow:ae,moveRow:oe,duplicateRow:se}=Ct({data:y,onDataChange:e=>o(`update:dataSource`,e),activeRowIndex:I}),{dirtyCells:ce,markDirty:U,clearDirty:le,getModifiedRows:de,isRowDirty:fe,isCellDirty:pe,resetTracking:me,getDirtyCells:he}=Ot({data:y}),{resolveDependencyState:G,onFieldChange:ge}=it({columns:j,data:y,markDirty:U}),{isEditing:K,editingRowIndex:_e,editingColIndex:ve,editMode:ye,autoTriggerEnabled:be,isCellEditable:xe,startEdit:Se,confirmEdit:Ce,cancelEdit:we,getEditingValue:Te,setEditingValue:Ee,updateEditingValue:De,isEditingCell:Oe}=ut({data:y,navigableColumns:R,activeRowIndex:I,activeColIndex:L,editable:A(()=>a.editable??!1),isDepDisabled:(e,t)=>{let n=R.value.find(e=>Z(e)===t);return n?G(e,n).disabled:!1},onEditStart:e=>o(`cell-edit-start`,e),onEditEnd:e=>o(`cell-edit-end`,e),onValueChange:e=>o(`cell-value-change`,e)}),{validate:ke,validateField:Ae,validateFieldsAffectedByChange:je,clearValidation:Me,scrollToFirstError:Ne,getErrorForCell:Pe}=pt({data:y,columns:R,tableRules:A(()=>a.rules),tableEl:u,trigger:A(()=>a.validateTrigger??`manual`),validateOnCellExit:A(()=>a.validateOnCellExit??!1),resolveDeps:G}),{canUndo:Fe,canRedo:Ie,pushChange:Le,undo:Re,redo:ze,clearHistory:Ve}=dt({data:y}),{commitEdit:q,undo:He,redo:J}=at({confirmEdit:Ce,undo:Re,redo:ze,markDirty:U,pushChange:Le,onFieldChange:ge,validateOnCellExit:A(()=>a.validateOnCellExit??!1),validateFieldsAffectedByChange:je}),Y=Ze(u);function X(e,t){Se(e,t),K.value&&Y()}function Ue(e,t,n){let r=!!n.target?.closest(`.atbl-cell-editor`),i=I.value,a=L.value;ie(e,t),K.value&&i>=0&&(ye.value===`row`?I.value!==i&&q():(I.value!==i||L.value!==a)&&q()),r||u.value?.focus({preventScroll:!0})}function We(e,t){be.value&&(ie(e,t),I.value>=0&&L.value>=0&&X())}function Ge(e,t){a.columnSetting&&(t.preventDefault(),d.value?.openContextMenu(t,{key:Q(e)}))}function $(e,t){let n=t?.key;typeof n!=`string`||typeof e!=`number`||k.setColumnWidth(n,e)}function Ke(e){let t=R.value.findIndex(t=>Z(t)===e);return t>=0?t:0}function qe(e,t){let n=Ke(t);re(e,n),X(e,n)}function Je(e){return e.required?!0:(Array.isArray(e.rules)?e.rules:e.rules?[e.rules]:[]).some(e=>e.required)}function Ye(e){return typeof e.resizable==`boolean`?e.resizable:a.resizable?typeof e.width==`number`:!1}function Xe(e){let{customRender:t,component:n,componentProps:r,rules:i,required:a,dependencies:o,editable:s,hidden:c,children:u,customCell:d,customHeaderCell:f,...p}=e,m=Q(e),h=()=>({class:Je(e)?`atbl-th--required`:void 0,onContextmenu:t=>Ge(e,t)});if(u?.length)return{...p,key:m,children:u.map(Xe),customHeaderCell:h};let g=Z(e);return{...p,key:m,resizable:Ye(e),customRender:t=>l(Mt,{column:e,record:t.record,rowIndex:t.index,key:m}),customCell:(e,t)=>g?{onClick:e=>Ue(t,g,e),onDblclick:()=>We(t,g)}:{},customHeaderCell:h}}let Qe=A(()=>j.value.map(Xe));ct({wrapperEl:u,hotkeyEnabled:A(()=>a.hotkeyEnabled??!0),navigate:B,focusCell:re,activeRowIndex:I,activeColIndex:L,data:y,navigableColumns:R,customHotkeys:A(()=>a.hotkeys),editMode:ye,autoTriggerEnabled:be,isEditing:K,editingRowIndex:_e,startEdit:X,confirmEdit:q,cancelEdit:we,updateCellValue:De,isCellEditable:xe,undo:He,redo:J,canUndo:Fe,canRedo:Ie}),t(Be,{tableEl:u,rules:A(()=>a.rules),columns:A(()=>a.columns??[]),visibleColumns:j,navigableColumns:R,data:y,editable:A(()=>a.editable??!1),cellActive:A(()=>a.cellActive??!0),rowActive:A(()=>a.rowActive??!0),activeRowIndex:I,activeColIndex:L,navigate:B,handleCellClick:ie,isActiveCell:V,editMode:ye,isEditing:K,editingRowIndex:_e,editingColIndex:ve,isEditingCell:Oe,isCellEditable:xe,startEdit:X,confirmEdit:q,cancelEdit:we,getEditingValue:Te,setEditingValue:Ee,getErrorForCell:Pe,resolveDependencyState:G,onFieldChange:ge,markDirty:U,isCellDirty:pe,columnOptions:a.columnSetting?{toggleColumn:k.toggleColumn,moveColumn:k.moveColumn,setColumnOrderByIds:k.setColumnOrderByIds,setColumnWidth:k.setColumnWidth,resetColumns:k.resetColumns,snapshotColumnState:k.snapshotColumnState,restoreColumnState:k.restoreColumnState,getColumnSettingTree:k.getColumnSettingTree,isNodeHidden:k.isNodeHidden,columnWidths:k.columnWidths}:void 0});function $e(){d.value?.open()}return n({navigate:B,focusCell:re,getColIndexByField:Ke,focusAndEditByField:qe,activeRowIndex:I,activeColIndex:L,activeRow:ne,activeColumn:z,editMode:ye,isEditing:K,startEdit:X,confirmEdit:q,cancelEdit:we,validate:ke,validateField:Ae,clearValidation:Me,scrollToFirstError:Ne,insertRow:H,deleteRow:ae,moveRow:oe,duplicateRow:se,getModifiedRows:de,markDirty:U,clearDirty:le,resetTracking:me,getDirtyCells:he,isCellDirty:pe,isRowDirty:fe,toggleColumn:k.toggleColumn,moveColumn:k.moveColumn,setColumnWidth:k.setColumnWidth,resetColumns:k.resetColumns,openColumnSetting:$e,undo:He,redo:J,canUndo:Fe,canRedo:Ie,clearHistory:Ve}),(t,n)=>(F(),C(`div`,{ref_key:`wrapperEl`,ref:u,class:`atbl-wrapper`,tabindex:`0`},[f.value?(F(),C(`div`,Ht,[v(`div`,Ut,[i(t.$slots,`title`)]),v(`div`,Wt,[i(t.$slots,`toolbar`),e.columnSetting?(F(),b(c(W),{key:0,size:`small`,onClick:$e},{default:O(()=>[...n[0]||=[P(` 列设置 `,-1)]]),_:1})):T(``,!0)])])):T(``,!0),_(c(ue),S(t.$attrs,{columns:Qe.value,"data-source":y.value,"row-key":e.rowKey,bordered:e.bordered,size:e.size,scroll:N.value,pagination:!1,onResizeColumn:$}),h({_:2},[t.$slots.expandedRowRender?{name:`expandedRowRender`,fn:O(e=>[i(t.$slots,`expandedRowRender`,D(te(e)))]),key:`0`}:void 0,t.$slots.emptyText?{name:`emptyText`,fn:O(()=>[i(t.$slots,`emptyText`)]),key:`1`}:void 0]),1040,[`columns`,`data-source`,`row-key`,`bordered`,`size`,`scroll`]),m.value?(F(),C(`div`,Gt,[v(`div`,Kt,[i(t.$slots,`summary`)]),i(t.$slots,`pagination`,{},()=>[g.value?(F(),b(Vt,{key:0,current:e.current??1,"page-size":e.pageSize??10,total:e.total??0,"page-sizes":e.pageSizes,"show-total":e.showPaginationTotal,onCurrentChange:x,onSizeChange:w},null,8,[`current`,`page-size`,`total`,`page-sizes`,`show-total`])):T(``,!0)])])):T(``,!0),e.columnSetting?(F(),b(zt,{key:2,ref_key:`columnSettingRef`,ref:d},null,512)):T(``,!0)],512))}}),Jt=M({__name:`basic`,setup(e){let t=E([{id:1,name:`需求评审`,amount:1200},{id:2,name:`接口开发`,amount:3400},{id:3,name:`联调测试`,amount:800}]),n=[{title:`#`,key:`index`,width:60,align:`center`,customRender:({index:e})=>e+1},{title:`ID`,dataIndex:`id`,width:80},{title:`名称`,dataIndex:`name`,editable:!0,component:`input`},{title:`金额`,dataIndex:`amount`,align:`right`,editable:!0,component:`input-number`,componentProps:{min:0,step:100,style:{width:`100%`}},customRender:({value:e})=>`¥ ${(e??0).toLocaleString(`zh-CN`)}`}];return(e,r)=>(F(),b(c(qt),{dataSource:t.value,"onUpdate:dataSource":r[0]||=e=>t.value=e,columns:n,"row-key":`id`,bordered:``,editable:`cell`},null,8,[`dataSource`]))}}),Yt=`<script setup lang="ts">
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
`,Xt={class:`atbl-demo`},Zt={class:`atbl-demo__toolbar`},Qt={class:`atbl-demo__status`},$t=k(M({__name:`playground`,setup(e){let t=[{label:`硬件`,value:`hardware`},{label:`软件`,value:`software`},{label:`服务`,value:`service`}],n={pending:{label:`待开始`,color:`default`},active:{label:`进行中`,color:`processing`},done:{label:`已完成`,color:`success`}},r=[`技术部`,`采购部`,`运维部`],i={技术部:[`张三`,`李四`],采购部:[`王五`,`赵六`],运维部:[`陈七`,`周八`]},a=7;function o(e){let t=[`hardware`,`software`,`service`],n=[`pending`,`active`,`done`],a=r[e%r.length],o=500+e%10*300,s=e%5+1;return{id:e+1,name:`物料 ${e+1}`,category:t[e%3],status:n[e%3],price:o,qty:s,total:o*s,department:a,owner:i[a][0],enabled:e%4!=0}}let s=E(Array.from({length:6},(e,t)=>o(t))),d=[{title:`#`,key:`index`,width:50,align:`center`,fixed:`left`,resizable:!1,customRender:({index:e})=>e+1},{title:`名称`,dataIndex:`name`,width:150,editable:!0,component:`input`,required:!0,rules:[{required:!0,message:`名称必填`},{min:2,message:`至少 2 个字`}]},{title:`类别`,dataIndex:`category`,width:110,editable:!0,component:`select`,required:!0,componentProps:{options:t,style:{width:`100%`}},customRender:({value:e})=>t.find(t=>t.value===e)?.label??e},{title:`状态`,dataIndex:`status`,width:110,editable:!0,component:`select`,componentProps:{style:{width:`100%`},options:Object.entries(n).map(([e,t])=>({value:e,label:t.label}))},customRender:({value:e})=>{let t=n[e]??n.pending;return l(fe,{color:t.color},()=>t.label)}},{title:`单价`,dataIndex:`price`,width:110,align:`right`,minWidth:90,editable:!0,component:`input-number`,componentProps:{min:0,step:100,style:{width:`100%`}},rules:{type:`number`,min:0,message:`单价需 ≥ 0`}},{title:`数量`,dataIndex:`qty`,width:110,align:`right`,editable:!0,component:`input-number`,componentProps:{min:0,style:{width:`100%`}},dependencies:{triggerFields:[`category`],disabled:e=>e.category===`service`,trigger:(e,t)=>{e.category===`service`&&t.setFieldValue(`qty`,1)}}},{title:`小计`,dataIndex:`total`,width:120,align:`right`,dependencies:{triggerFields:[`price`,`qty`],trigger:(e,t)=>{t.setFieldValue(`total`,(e.price||0)*(e.qty||0))}},customRender:({value:e})=>`¥ ${(e??0).toLocaleString(`zh-CN`)}`},{title:`归属`,children:[{title:`部门`,dataIndex:`department`,width:110,editable:!0,component:`select`,componentProps:{style:{width:`100%`},options:r.map(e=>({label:e,value:e}))}},{title:`负责人`,dataIndex:`owner`,width:120,editable:!0,component:`select`,dependencies:{triggerFields:[`department`],required:()=>!0,componentProps:e=>({style:{width:`100%`},options:(i[e.department]??[]).map(e=>({label:e,value:e}))}),trigger:(e,t)=>{(i[e.department]??[]).includes(e.owner)||t.setFieldValue(`owner`,``)}}}]},{title:`启用`,dataIndex:`enabled`,width:80,align:`center`,editable:!0,component:`switch`,customRender:({value:e})=>e?`是`:`否`}],f=E(`cell`),p=A(()=>f.value===`all`?!0:f.value===`off`?!1:f.value),h=E(`change`),g=E(!0),y=E(!1),x=E(!0),S=E(`—`),w=[{key:`ctrl+g`,preventDefault:!0,handler:e=>{S.value=`Ctrl+G → 行 ${e.activeRowIndex+1} / 列 ${e.activeColIndex+1}`}}],D=E(null),k=E([]),j=A(()=>({selectedRowKeys:k.value,onChange:e=>k.value=e})),ee=A(()=>D.value?.getDirtyCells()?.size??0);function te(){D.value?.insertRow(void 0,o(a++-1))}function M(){let e=new Set(k.value),t=s.value.map((t,n)=>e.has(t.id)?n:-1).filter(e=>e>=0);if(!t.length){V.info(`请先勾选行`);return}D.value?.deleteRow(t),k.value=[]}async function N(){(await D.value?.validate())?.valid?V.success(`校验通过`):(V.error(`存在校验错误`),D.value?.scrollToFirstError())}function I(){let e=D.value?.getModifiedRows()??[];V.info(`已修改 ${e.length} 行`)}return(e,t)=>{let n=u(`a-radio-button`),r=u(`a-radio-group`),i=u(`a-divider`),a=u(`a-button`),o=u(`a-checkbox`);return F(),C(`div`,Xt,[v(`div`,Zt,[_(r,{value:f.value,"onUpdate:value":t[0]||=e=>f.value=e,"button-style":`solid`,size:`small`},{default:O(()=>[_(n,{value:`cell`},{default:O(()=>[...t[9]||=[P(`单元格`,-1)]]),_:1}),_(n,{value:`row`},{default:O(()=>[...t[10]||=[P(`行编辑`,-1)]]),_:1}),_(n,{value:`all`},{default:O(()=>[...t[11]||=[P(`全量`,-1)]]),_:1}),_(n,{value:`manual`},{default:O(()=>[...t[12]||=[P(`手动`,-1)]]),_:1}),_(n,{value:`off`},{default:O(()=>[...t[13]||=[P(`只读`,-1)]]),_:1})]),_:1},8,[`value`]),_(i,{type:`vertical`}),t[27]||=v(`span`,{class:`atbl-demo__label`},`校验`,-1),_(r,{value:h.value,"onUpdate:value":t[1]||=e=>h.value=e,"button-style":`solid`,size:`small`},{default:O(()=>[_(n,{value:`manual`},{default:O(()=>[...t[14]||=[P(`手动`,-1)]]),_:1}),_(n,{value:`change`},{default:O(()=>[...t[15]||=[P(`change`,-1)]]),_:1}),_(n,{value:`blur`},{default:O(()=>[...t[16]||=[P(`blur`,-1)]]),_:1})]),_:1},8,[`value`]),_(i,{type:`vertical`}),_(a,{size:`small`,onClick:te},{default:O(()=>[...t[17]||=[P(`新增行`,-1)]]),_:1}),_(a,{size:`small`,danger:``,disabled:!k.value.length,onClick:M},{default:O(()=>[...t[18]||=[P(` 删除选中 `,-1)]]),_:1},8,[`disabled`]),f.value===`manual`?(F(),b(a,{key:0,size:`small`,onClick:t[2]||=e=>D.value?.startEdit()},{default:O(()=>[...t[19]||=[P(` 编辑当前格 `,-1)]]),_:1})):T(``,!0),_(i,{type:`vertical`}),_(a,{size:`small`,disabled:!D.value?.canUndo,onClick:t[3]||=e=>D.value?.undo()},{default:O(()=>[...t[20]||=[P(` 撤销 `,-1)]]),_:1},8,[`disabled`]),_(a,{size:`small`,disabled:!D.value?.canRedo,onClick:t[4]||=e=>D.value?.redo()},{default:O(()=>[...t[21]||=[P(` 重做 `,-1)]]),_:1},8,[`disabled`]),_(a,{size:`small`,type:`primary`,onClick:N},{default:O(()=>[...t[22]||=[P(`校验`,-1)]]),_:1}),_(a,{size:`small`,onClick:I},{default:O(()=>[...t[23]||=[P(`查看已改行`,-1)]]),_:1}),_(i,{type:`vertical`}),_(o,{checked:g.value,"onUpdate:checked":t[5]||=e=>g.value=e},{default:O(()=>[...t[24]||=[P(`热键`,-1)]]),_:1},8,[`checked`]),_(o,{checked:y.value,"onUpdate:checked":t[6]||=e=>y.value=e},{default:O(()=>[...t[25]||=[P(`自适应高度`,-1)]]),_:1},8,[`checked`]),_(o,{checked:x.value,"onUpdate:checked":t[7]||=e=>x.value=e},{default:O(()=>[...t[26]||=[P(`列宽拖拽`,-1)]]),_:1},8,[`checked`])]),v(`div`,Qt,[v(`span`,null,` 激活：行 `+m((D.value?.activeRowIndex??-1)+1)+` / 列 `+m((D.value?.activeColIndex??-1)+1),1),t[28]||=v(`span`,{class:`atbl-demo__sep`},`|`,-1),v(`span`,null,`脏数据：`+m(ee.value)+` 格`,1),t[29]||=v(`span`,{class:`atbl-demo__sep`},`|`,-1),v(`span`,null,`Ctrl+G：`+m(S.value),1)]),_(c(qt),{ref_key:`tableRef`,ref:D,dataSource:s.value,"onUpdate:dataSource":t[8]||=e=>s.value=e,columns:d,editable:p.value,"validate-trigger":h.value,"hotkey-enabled":g.value,hotkeys:w,adaptive:y.value,resizable:x.value,"scroll-x":1080,"row-selection":j.value,"row-key":`id`,"column-setting-key":`docs-ant-table-demo`,bordered:``,size:`middle`,"validate-on-cell-exit":``},{title:O(()=>[...t[30]||=[v(`span`,{class:`atbl-demo__title`},`采购清单`,-1)]]),_:1},8,[`dataSource`,`editable`,`validate-trigger`,`hotkey-enabled`,`adaptive`,`resizable`,`row-selection`]),t[31]||=v(`p`,{class:`atbl-demo__hint`},` 点击单元格聚焦后：方向键移动 · 双击 / F2 进入编辑 · Enter 确认并下移 · Tab 右移 · Delete 清空 · Ctrl+Z / Ctrl+Shift+Z 撤销重做 · Ctrl+G 自定义热键 · 右键表头可隐藏列或打开列设置 · 开启「列宽拖拽」后所有带宽度的列（含分组表头子列）表头右缘均可拖拽调整列宽（序号列已用列级 resizable: false 单独关闭）。 `,-1)])}}}),[[`__scopeId`,`data-v-5b079604`]]),en=`<script setup lang="ts">
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
`;const tn=JSON.parse(`{"title":"AntTable","description":"基于 Ant Design Vue a-table 的增强表格","frontmatter":{"title":"AntTable","description":"基于 Ant Design Vue a-table 的增强表格"},"headers":[],"relativePath":"components/ant-table/index.md","filePath":"components/ant-table/index.md"}`);var nn=M({name:`components/ant-table/index.md`,setup(e){return(e,t)=>{let n=u(`ClientOnly`),r=u(`DemoBlock`);return F(),C(`div`,null,[t[0]||=j("",3),_(r,{title:`基础用法`,description:`配置式列 + cell 编辑模式，双击单元格即可编辑。`,source:c(Yt)},{default:O(()=>[_(n,null,{default:O(()=>[_(Jt)]),_:1})]),_:1},8,[`source`]),t[1]||=j("",4),_(r,{title:`交互示例`,description:`完整功能演示：双击编辑、键盘导航、热键、校验、联动与行操作。`,source:c(en)},{default:O(()=>[_(n,null,{default:O(()=>[_($t)]),_:1})]),_:1},8,[`source`]),t[2]||=j("",44)])}}});export{tn as __pageData,nn as default};