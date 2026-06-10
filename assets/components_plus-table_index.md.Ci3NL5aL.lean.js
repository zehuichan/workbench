import{A as e,B as t,D as n,H as r,Jt as i,Kt as a,St as o,T as s,U as c,V as l,X as u,Yt as d,_ as f,a as p,b as m,d as h,dt as g,et as _,f as v,gt as y,k as b,m as x,p as S,pt as C,rt as w,t as T,u as E,v as D,x as O,y as k,z as A}from"./chunks/plugin-vue_export-helper.lnNjcNWu.js";import{dt as j,s as M,wt as N}from"./chunks/weekYear.Bk__H43W.js";import{_ as P,a as F,c as I,d as L,f as R,g as z,h as B,i as V,l as ee,m as te,n as ne,o as re,p as ie,s as ae,u as H}from"./chunks/es.B3Hi6WiX.js";import{t as U}from"./chunks/cloneDeep.BbAcjr1c.js";const W=Symbol(`plus-table`),G={input:{component:z,trigger:`blur`},textarea:{component:z,componentProps:{type:`textarea`,autosize:!0},trigger:`blur`},number:{component:I,trigger:`blur`},select:{component:R,trigger:`change`},"date-picker":{component:ee,trigger:`change`},"time-picker":{component:te,trigger:`change`},switch:{component:re,trigger:`change`},checkbox:{component:H,trigger:`change`}};function oe(e){return typeof e==`function`?!0:typeof e==`object`&&!!e&&(`setup`in e||`render`in e||`template`in e)}function K(e){if(typeof e==`string`){let t=G[e]??G.input;return{component:t.component,props:{...t.componentProps},trigger:t.trigger,withOptions:t.component===R,modelProp:`modelValue`}}if(e&&oe(e))return{component:e,props:{},trigger:`blur`,withOptions:e===R,modelProp:`modelValue`};let t=e??{};if(t.component)return{component:t.component,props:{...t.props},trigger:`blur`,withOptions:t.component===R,modelProp:t.modelProp??`modelValue`,options:t.options};let n=G[t.type??`input`]??G.input;return{component:n.component,props:{...n.componentProps,...t.props},trigger:n.trigger,withOptions:n.component===R,modelProp:t.modelProp??`modelValue`,options:t.options}}function q(e,t){let n=K(e).component;if(n===z)return t;if(n===I)return/^[0-9]$/.test(t)?Number(t):void 0}var se=16,ce=200;function le(e){let{props:t,gridRef:n,paginationRef:r}=e,i=E(()=>{let e=typeof t.adaptive==`object`?t.adaptive:{};return{offsetBottom:e.offsetBottom??se,minHeight:e.minHeight??ce}}),{top:a}=j(n),{height:o}=j(r),{height:s}=N();return{tableHeight:E(()=>{if(!t.adaptive)return;let e=s.value-a.value-o.value-i.value.offsetBottom;return Math.max(e,i.value.minHeight)})}}var J=`__root`;function ue(e){let t=new Map,n=(e,r)=>e.map((e,i)=>{let a=e.field??e.title??`col-${r}${i}`,o=t.get(a)??0;return t.set(a,o+1),{id:o===0?a:`${a}#${o}`,column:e,children:e.children?.length?n(e.children,`${r}${i}-`):void 0}});return n(e,``)}function Y(e,t=[]){if(e.children?.length)for(let n of e.children)Y(n,t);else t.push(e.id);return t}function X(e,t=[]){for(let n of e)n.children?.length?X(n.children,t):t.push(n);return t}function Z(e){return e.fixed===`left`?0:e.fixed===`right`?2:1}function de(e){let t=E(()=>ue(e.columns??[])),n=e.settingsKey?`plus-table:settings:${e.settingsKey}`:null;function r(){let e=new Set,n=t=>{for(let r of t){if(r.column.visible===!1)for(let t of Y(r))e.add(t);r.children?.length&&n(r.children)}};return n(t.value),e}function i(){if(!n)return null;try{let e=localStorage.getItem(n);if(!e)return null;let t=JSON.parse(e);return{hidden:Array.isArray(t.hidden)?t.hidden:[],order:t.order&&typeof t.order==`object`?t.order:{},widths:t.widths&&typeof t.widths==`object`?t.widths:{}}}catch{return null}}let a=i(),o=C(a?new Set(a.hidden):r()),s=C(a?.order??{}),c=C(a?.widths??{});n&&_([o,s,c],()=>{try{let e={hidden:[...o.value],order:s.value,widths:c.value};localStorage.setItem(n,JSON.stringify(e))}catch{}});function l(e,t){let n=s.value[t],r=e;if(n?.length){let t=new Map(n.map((e,t)=>[e,t]));r=[...e].sort((e,r)=>(t.get(e.id)??n.length)-(t.get(r.id)??n.length))}return r.map(e=>e.children?.length?{...e,children:l(e.children,e.id)}:e)}function u(e){let t=[];for(let n of e)if(n.children?.length){let e=u(n.children);e.length&&t.push({...n,children:e})}else o.value.has(n.id)||t.push(n);return t}let d=E(()=>l(t.value,J)),f=E(()=>u(d.value)),p=E(()=>[...f.value].sort((e,t)=>Z(e.column)-Z(t.column))),m=E(()=>X(p.value)),h=E(()=>X(t.value)),g=E(()=>{let e=new Map;return m.value.forEach((t,n)=>e.set(t.id,n)),e});function v(e,t){for(let n of e){if(n.id===t)return n;if(n.children?.length){let e=v(n.children,t);if(e)return e}}return null}let y=E(()=>{let e=[],t=(n,r,i)=>{n.forEach(n=>{let a=Y(n),s=a.filter(e=>!o.value.has(e)).length;e.push({id:n.id,parentId:r,title:n.column.title??n.column.field??n.id,level:i,isGroup:!!n.children?.length,checked:s===a.length,indeterminate:s>0&&s<a.length,disabled:!!n.column.settingDisabled}),n.children?.length&&t(n.children,n.id,i+1)})};return t(d.value,J,0),e});function b(e,n){let r=v(t.value,e);if(!r)return;let i=new Set(o.value);for(let e of Y(r))n?i.delete(e):i.add(e);o.value=i}function x(e,t,n){if(e===t)return;let r=y.value.find(t=>t.id===e),i=y.value.find(e=>e.id===t);if(!r||!i||r.parentId!==i.parentId)return;let a=(r.parentId===J?d.value:v(d.value,r.parentId)?.children??[]).map(e=>e.id).filter(t=>t!==e),o=a.indexOf(t)+(n===`after`?1:0);a.splice(o,0,e),s.value={...s.value,[r.parentId]:a}}function S(e,t){c.value={...c.value,[e]:Math.round(t)}}function w(){if(o.value=r(),s.value={},c.value={},n)try{localStorage.removeItem(n)}catch{}}return{displayTree:p,leafNodes:m,allLeafNodes:h,leafIndexById:g,widthMap:c,settingItems:y,toggleVisible:b,reorderNode:x,setColumnWidth:S,resetSettings:w}}var fe={disabled:!1,required:!1,rules:null,componentProps:{}};function pe(e){let{allLeafNodes:t,getRowKeyStr:n,getWriteCell:r}=e;function i(e,t,n){return{row:e,rowIndex:t,field:n,setValue:(n,i)=>{r()(e,t,n,i)}}}function a(e,t,n){let r=n.dependencies;if(!r)return fe;let a=i(e,t,n.field??``);return{disabled:r.disabled?!!r.disabled(e,a):!1,required:r.required?!!r.required(e,a):!1,rules:r.rules?r.rules(e,a)??null:null,componentProps:r.componentProps?r.componentProps(e,a):{}}}let o=null;function s(e,r,a){let s=`${n(e)}:${a}`,c=o===null;if(c&&(o=new Set),!o.has(s)){o.add(s);try{for(let n of t.value){let t=n.column.dependencies;!t?.trigger||!t.triggerFields.includes(a)||t.trigger(e,i(e,r,n.column.field??``))}}finally{c&&(o=null)}}}return{getState:a,notifyFieldChange:s}}function me(e){return e instanceof HTMLTextAreaElement?!0:e instanceof HTMLInputElement?![`checkbox`,`radio`,`button`,`range`].includes(e.type):!1}function he(t){let{props:n,data:r,leafNodes:i,getRowKeyStr:a,isDependencyDisabled:o,writeCell:s,validateRow:c,clearRowValidate:l,selection:u}=t,d=E(()=>n.editMode??`cell`),f=y(null),p=C(),m=g(new Set),h=new Map;function _(e,t,n){let r=n.column;if(!r.field)return!1;let i=r.editable;return typeof i==`function`?i(e,t):!!i}function v(e,t){if(d.value===`none`)return!1;let n=i.value[t],a=r()[e];return!n||!a||!_(a,e,n)?!1:!o(a,e,n)}function b(e){return m.has(a(e))}function x(e,t){switch(d.value){case`table`:return v(e,t);case`row`:{let n=r()[e];return!!n&&b(n)&&v(e,t)}case`cell`:{let n=f.value;return n?.rowIndex===e&&n?.colIndex===t}default:return!1}}async function S(t,n,r){await e();let i=u.getCellEl(t,n);if(!i)return;let a=i.querySelector(`input, textarea`)??i.querySelector(`[tabindex]:not([tabindex="-1"])`);if(a&&(a.focus(),me(a)))try{if(r){let e=a.value.length;a.setSelectionRange(e,e)}else a.select()}catch{}}function w(e,t,n={}){if(d.value!==`cell`||!v(e,t))return!1;f.value&&D();let a=i.value[t],o=r()[e],s=`initialValue`in n;return p.value=s?n.initialValue:o[a.column.field],f.value={rowIndex:e,colIndex:t},u.setActiveCell(e,t),S(e,t,s),!0}function T(e){p.value=e}function D(){let e=f.value;if(!e)return;f.value=null;let t=i.value[e.colIndex],n=r()[e.rowIndex];!t?.column.field||!n||s(n,e.rowIndex,t.column.field,p.value)}function O(){f.value=null}function k(e){if(d.value!==`row`)return!1;let t=r()[e];if(!t)return!1;let n=a(t);return m.has(n)?!0:(h.set(n,U(t)),m.add(n),!0)}async function A(e){let t=r()[e];if(!t)return!1;let n=a(t);return m.has(n)?(await c(e)).length?!1:(m.delete(n),h.delete(n),!0):!0}function j(e){let t=r()[e];if(!t)return;let n=a(t);if(!m.has(n))return;let i=h.get(n);if(i){for(let e of Object.keys(t))e in i||delete t[e];Object.assign(t,U(i))}m.delete(n),h.delete(n),l(t)}return{mode:d,editingCell:f,draft:p,canEditCell:v,isCellEditing:x,isRowEditing:b,startEdit:w,updateDraft:T,commitEdit:D,cancelEdit:O,startRowEdit:k,commitRowEdit:A,cancelRowEdit:j}}function ge(e){return!!e.target?.closest(`input, textarea, select, [contenteditable="true"]`)}function _e(e){return e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey}function ve(e){let{props:t,selection:n,editing:r,clearCell:i,typedCharToDraft:a}=e;function o(e){switch(e.key){case`Escape`:r.cancelEdit(),n.focusGrid(),e.preventDefault(),e.stopPropagation();break;case`Enter`:if(e.isComposing||e.target instanceof HTMLTextAreaElement&&(e.shiftKey||e.altKey))return;r.commitEdit(),n.moveActive(1,0),n.focusGrid(),e.preventDefault();break;case`Tab`:r.commitEdit(),n.moveSequential(e.shiftKey?-1:1),n.focusGrid(),e.preventDefault();break;default:break}}function s(e){if(ge(e))return;let o=t.editMode??`cell`,s=e.ctrlKey||e.metaKey,c=n.activeCell.value,l=()=>e.preventDefault();switch(e.key){case`ArrowUp`:return n.moveActive(-1,0),l();case`ArrowDown`:return n.moveActive(1,0),l();case`ArrowLeft`:return n.moveActive(0,-1),l();case`ArrowRight`:return n.moveActive(0,1),l();case`Tab`:return n.moveSequential(e.shiftKey?-1:1),l();case`Home`:return s?n.moveToTableCorner(!1):n.moveToRowEdge(!1),l();case`End`:return s?n.moveToTableCorner(!0):n.moveToRowEdge(!0),l();case`Enter`:return e.isComposing||!c?void 0:(o===`cell`&&r.canEditCell(c.rowIndex,c.colIndex)?r.startEdit(c.rowIndex,c.colIndex):n.moveActive(1,0),l());case`F2`:return c?(o===`cell`&&r.startEdit(c.rowIndex,c.colIndex),l()):void 0;case`Delete`:case`Backspace`:return c?(r.canEditCell(c.rowIndex,c.colIndex)&&i(c.rowIndex,c.colIndex),l()):void 0;default:if(o===`cell`&&c&&_e(e)&&r.canEditCell(c.rowIndex,c.colIndex)){let t=a(c.colIndex,e.key);t===void 0?r.startEdit(c.rowIndex,c.colIndex):r.startEdit(c.rowIndex,c.colIndex,{initialValue:t}),l()}}}function c(e){r.editingCell.value?o(e):s(e)}return{onKeydown:c}}function ye(e){let{data:t,emit:n}=e;function r(e={},r){let i=[...t()],a=r===void 0?i.length:Math.min(Math.max(r,0),i.length);return i.splice(a,0,e),n(`update:data`,i),e}function i(e){let r=[...t()];if(e<0||e>=r.length)return;let[i]=r.splice(e,1);return n(`update:data`,r),i}function a(e,r){let i=[...t()];if(e<0||e>=i.length||r<0||r>=i.length||e===r)return!1;let[a]=i.splice(e,1);return i.splice(r,0,a),n(`update:data`,i),!0}function o(e,n){let i=t()[e];if(i)return r(Object.assign(U(i),n),e+1)}return{insertRow:r,removeRow:i,moveRow:a,duplicateRow:o}}function be(e){let{gridRef:t,rowCount:n,colCount:r}=e,i=y(null);function a(e,t){return Math.min(Math.max(e,0),Math.max(t-1,0))}function o(e,n){let r=t.value;return r?r.querySelectorAll(`.el-table__body-wrapper tbody tr.el-table__row`).item(e)?.cells.item(n)??null:null}function s(e,t){o(e,t)?.scrollIntoView({block:`nearest`,inline:`nearest`})}function c(e,t,o=!0){if(n()===0||r()===0){i.value=null;return}let c={rowIndex:a(e,n()),colIndex:a(t,r())},l=i.value;(l?.rowIndex!==c.rowIndex||l?.colIndex!==c.colIndex)&&(i.value=c),o&&s(c.rowIndex,c.colIndex)}function l(e,t){let n=i.value;return n?.rowIndex===e&&n?.colIndex===t}function u(e,t){let n=i.value;if(!n){c(0,0);return}c(n.rowIndex+e,n.colIndex+t)}function d(e){let t=r(),a=n()*t;if(a===0||t===0)return;let o=i.value;if(!o){c(0,0);return}let s=Math.min(Math.max(o.rowIndex*t+o.colIndex+e,0),a-1);c(Math.floor(s/t),s%t)}function f(e){let t=i.value;if(!t){c(0,0);return}c(t.rowIndex,e?r()-1:0)}function p(e){e?c(n()-1,r()-1):c(0,0)}function m(){t.value?.focus({preventScroll:!0})}return{activeCell:i,isActive:l,setActiveCell:c,moveActive:u,moveSequential:d,moveToRowEdge:f,moveToTableCorner:p,getCellEl:o,scrollCellIntoView:s,focusGrid:m}}function xe(e){let{data:t,leafNodes:n,getRowKeyStr:r,getDependencyState:i,scrollToCell:a}=e,o=g(new Map),s=(e,t)=>`${e}:${t}`;function c(e,t){return o.get(s(r(e),t))}function l(e,t,n){let r=n.column,a=i(e,t,r),o=[];return(r.required||a.required)&&o.push({required:!0,message:`${r.title??r.field}不能为空`}),r.rules?.length&&o.push(...r.rules),a.rules?.length&&o.push(...a.rules),o}async function u(e,t,n){let i=n.column.field;if(!i)return null;let a=r(e),c=s(a,i),u=l(e,t,n);if(!u.length)return o.delete(c),null;try{return await new M({[i]:u}).validate(e,{first:!0,suppressWarning:!0}),o.delete(c),null}catch(e){let n={rowKey:a,rowIndex:t,field:i,message:(e?.errors)?.[0]?.message??`校验失败`};return o.set(c,n),n}}async function d(e,t,r){let i=n.value.find(e=>e.column.field===r);return i?u(e,t,i):null}async function f(e){let r=t()[e];return r?(await Promise.all(n.value.map(t=>u(r,e,t)))).filter(e=>e!==null):[]}async function p(e=!0){let r=t(),i=[];for(let e=0;e<r.length;e++)i.push(...await f(e));if(e&&i.length){let e=i[0],t=n.value.findIndex(t=>t.column.field===e.field);t>=0&&a(e.rowIndex,t)}return{valid:i.length===0,errors:i}}function m(){o.clear()}function h(e){let t=`${r(e)}:`;for(let e of[...o.keys()])e.startsWith(t)&&o.delete(e)}return{errors:o,getCellError:c,validateCellByField:d,validateRow:f,validate:p,clearValidate:m,clearRowValidate:h}}function Se(e){let{props:t,emit:n,slots:r,gridRef:i,paginationRef:a}=e,o=()=>t.data??[];function s(e){let n=t.rowKey,r=typeof n==`function`?n(e):e[n];return String(r)}let c=de(t),l=be({gridRef:i,rowCount:()=>o().length,colCount:()=>c.leafNodes.value.length}),u=pe({allLeafNodes:c.allLeafNodes,getRowKeyStr:s,getWriteCell:()=>f}),d=xe({props:t,data:o,leafNodes:c.leafNodes,getRowKeyStr:s,getDependencyState:u.getState,scrollToCell:(e,t)=>l.setActiveCell(e,t)}),f=(e,r,i,a)=>{let o=e[i];Object.is(o,a)||(e[i]=a,n(`cell-change`,{row:e,rowIndex:r,field:i,value:a,oldValue:o}),u.notifyFieldChange(e,r,i),(t.validateOn??`change`)===`change`&&d.validateCellByField(e,r,i))},p=he({props:t,data:o,leafNodes:c.leafNodes,getRowKeyStr:s,isDependencyDisabled:(e,t,n)=>u.getState(e,t,n.column).disabled,writeCell:f,validateRow:d.validateRow,clearRowValidate:d.clearRowValidate,selection:l});function m(e,t){let n=c.leafNodes.value[t],r=o()[e];!n?.column.field||!r||f(r,e,n.column.field,null)}let h=ve({props:t,selection:l,editing:p,clearCell:m,typedCharToDraft:(e,t)=>{let n=c.leafNodes.value[e];return n?q(n.column.editor,t):void 0}}),g=ye({data:o,emit:n}),_=le({props:t,gridRef:i,paginationRef:a});function v(e,t){return{rowIndex:o().indexOf(e),colIndex:t.cellIndex??-1}}function y(e,n,r,i){if((t.editMode??`cell`)===`table`)return;let{rowIndex:a,colIndex:o}=v(e,r);a<0||o<0||(l.setActiveCell(a,o,!1),i.target?.closest(`input, textarea, .el-select, .el-switch, .el-checkbox, [contenteditable="true"]`)||l.focusGrid())}function b(e,n,r){let i=t.editMode??`cell`,{rowIndex:a,colIndex:o}=v(e,r);a<0||(i===`cell`&&o>=0?p.startEdit(a,o):i===`row`&&p.startRowEdit(a))}function x(e,n,r){(t.validateOn??`change`)===`blur`&&d.validateCellByField(e,n,r)}return{props:t,slots:r,data:o,getRowKeyStr:s,columns:c,selection:l,dependencies:u,validation:d,editing:p,keyboard:h,rows:g,adaptive:_,writeCell:f,clearCell:m,handleCellClick:y,handleCellDblclick:b,handleEditorBlur:x}}var Ce={class:`ptbl-column-settings`},we={class:`ptbl-column-settings__list`},Te=[`draggable`,`onDragstart`,`onDragover`,`onDrop`],Ee={class:`ptbl-column-settings__actions`},De=O({name:`PlusTableColumnSettings`,__name:`column-settings`,setup(e){let t=n(W);if(!t)throw Error(`[PlusTable] PlusTableColumnSettings 必须在 PlusTable 内部使用`);let r=E(()=>t.columns.settingItems.value);function s(e,n){t.columns.toggleVisible(e,!!n)}let c=C(null),u=C(null),f=C(`before`);function g(e){return!!c.value&&c.value.id!==e.id&&c.value.parentId===e.parentId}function _(e,t){if(t.disabled){e.preventDefault();return}c.value=t,e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,t.id))}function y(e,t){if(!g(t))return;e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`);let n=e.currentTarget.getBoundingClientRect();f.value=e.clientY<n.top+n.height/2?`before`:`after`,u.value=t.id}function b(e,n){g(n)&&(e.preventDefault(),t.columns.reorderNode(c.value.id,n.id,f.value),S())}function S(){c.value=null,u.value=null}return(e,n)=>(A(),v(o(ne),{trigger:`click`,placement:`bottom-end`,width:280},{reference:w(()=>[m(o(B),{size:`small`},{default:w(()=>[...n[1]||=[k(`列设置`,-1)]]),_:1})]),default:w(()=>[h(`div`,Ce,[h(`ul`,we,[(A(!0),x(p,null,l(r.value,e=>(A(),x(`li`,{key:e.id,class:a([`ptbl-column-settings__item`,{"is-dragging":c.value?.id===e.id,"is-drop-before":u.value===e.id&&f.value===`before`,"is-drop-after":u.value===e.id&&f.value===`after`}]),style:i({paddingLeft:`${e.level*16}px`}),draggable:!e.disabled,onDragstart:t=>_(t,e),onDragover:t=>y(t,e),onDrop:t=>b(t,e),onDragend:S},[h(`span`,{class:a([`ptbl-column-settings__handle`,{"is-disabled":e.disabled}]),"aria-hidden":`true`},` ⠿ `,2),m(o(H),{"model-value":e.checked,indeterminate:e.indeterminate,disabled:e.disabled,onChange:t=>s(e.id,t)},{default:w(()=>[k(d(e.title),1)]),_:2},1032,[`model-value`,`indeterminate`,`disabled`,`onChange`])],46,Te))),128))]),h(`div`,Ee,[m(o(B),{text:``,size:`small`,onClick:n[0]||=e=>o(t).columns.resetSettings()},{default:w(()=>[...n[2]||=[k(` 重置 `,-1)]]),_:1})])])]),_:1}))}}),Oe=O({name:`PlusTableCell`,props:{row:{type:Object,required:!0},rowIndex:{type:Number,required:!0},node:{type:Object,required:!0}},setup(e){let t=n(W);if(!t)throw Error(`[PlusTable] PlusTableCell 必须在 PlusTable 内部使用`);function r(n){let{row:r,rowIndex:i,node:a}=e,o=a.column,s=o.field?t.slots[`cell-${o.field}`]:void 0;return s?s({row:r,rowIndex:i,column:o,value:n}):o.render?o.render({row:r,rowIndex:i,column:o,value:n}):o.formatter?o.formatter(n,r,i):n==null?``:String(n)}function i(n){let{row:r,rowIndex:i,node:a}=e,o=a.column,c=o.field,l=(t.props.editMode??`cell`)===`cell`,u=l?t.editing.draft.value:r[c],d=[`ptbl-cell__editor`,o.align?`ptbl-cell__editor--${o.align}`:``],f=e=>{l?t.editing.updateDraft(e):t.writeCell(r,i,c,e)},p=t.slots[`editor-${c}`];if(p)return s(`div`,{class:d},[...p({row:r,rowIndex:i,column:o,value:u,setValue:f,commit:()=>t.editing.commitEdit(),cancel:()=>t.editing.cancelEdit()})]);let m=K(o.editor),{options:h,...g}=n,_=h??m.options,v=typeof _==`function`?_(r,i):_??[],y={...m.props,...g,[m.modelProp]:u,[`onUpdate:${m.modelProp}`]:e=>{f(e),l&&m.trigger===`change`&&t.editing.commitEdit()},onBlur:()=>{l?m.trigger===`blur`&&t.editing.commitEdit():t.handleEditorBlur(r,i,c)}},b;return m.withOptions?b={default:()=>v.map(e=>s(L,{key:String(e.value),label:e.label,value:e.value,disabled:e.disabled}))}:v.length&&y.options===void 0&&(y.options=v),s(`div`,{class:d},[s(m.component,y,b)])}return()=>{let{row:n,rowIndex:a,node:o}=e,c=o.column,l=c.field,u=l?n[l]:void 0,d=t.props.editMode??`cell`,f=t.columns.leafIndexById.value.get(o.id)??-1,p=f>=0,m=p&&t.editing.isCellEditing(a,f),h=p&&t.editing.canEditCell(a,f),g=p&&t.selection.isActive(a,f),_=l?t.validation.getCellError(n,l):void 0,v=c.dependencies?t.dependencies.getState(n,a,c):void 0,y=d!==`none`&&!!l&&(typeof c.editable==`function`?c.editable(n,a):!!c.editable)&&!!v?.disabled,b=m?i(v?.componentProps??{}):r(u),x=s(`div`,{class:[`ptbl-cell`,{"ptbl-cell--active":g&&!m,"ptbl-cell--editing":m,"ptbl-cell--editing-focus":m&&d===`cell`,"ptbl-cell--editing-quiet":m&&d===`row`,"ptbl-cell--editable":h&&!m&&d===`cell`,"ptbl-cell--disabled":y,"ptbl-cell--error":!!_}]},[b]);return _?s(P,{content:_.message,placement:`top`,effect:`dark`},{default:()=>x}):x}}}),ke=O({name:`PlusTableColumnNode`,props:{node:{type:Object,required:!0}},setup(e){let t=n(W);if(!t)throw Error(`[PlusTable] PlusTableColumnNode 必须在 PlusTable 内部使用`);function r(e,n){let i=e.column;if(e.children?.length)return s(F,{key:`${n}:${e.id}`,label:i.title,align:i.align,...i.columnProps},{default:()=>e.children.map((e,t)=>r(e,t))});let a=i.field?t.slots[`header-${i.field}`]:void 0;return s(F,{key:`${n}:${e.id}`,prop:i.field,label:i.title,minWidth:i.minWidth,fixed:i.fixed,align:i.align,columnKey:e.id,...i.columnProps,width:t.columns.widthMap.value[e.id]??i.width},{header:()=>s(`span`,{class:[`ptbl-header-cell`,{"ptbl-header-cell--required":i.required}]},a?a({column:i}):i.title??i.field??``),default:t=>t.$index>=0?s(Oe,{row:t.row,rowIndex:t.$index,node:e}):null})}return()=>r(e.node,0)}}),Ae={class:`plus-table`},je={key:0,class:`plus-table__toolbar`},Q=O({name:`PlusTable`,inheritAttrs:!1,__name:`plus-table`,props:{data:{},columns:{},rowKey:{},editMode:{default:`cell`},validateOn:{default:`change`},columnSetting:{type:Boolean,default:!1},settingsKey:{},adaptive:{type:[Boolean,Object],default:!1},total:{},page:{default:1},pageSize:{default:20},pageSizes:{default:()=>[10,20,50,100]}},emits:[`update:data`,`cell-change`,`update:page`,`update:pageSize`,`page-change`],setup(e,{expose:n,emit:i}){let a=e,s=i,c=u(),d=C(),g=C(),_=C(),y=Se({props:a,emit:s,slots:c,gridRef:d,paginationRef:g});t(W,y);let T=y.columns.displayTree,D=y.adaptive.tableHeight,O=y.keyboard.onKeydown,k=E(()=>a.rowKey),j=E(()=>a.total!==void 0);function M(e){s(`update:page`,e),s(`page-change`,{page:e,pageSize:a.pageSize})}function N(e){s(`update:pageSize`,e),s(`page-change`,{page:a.page,pageSize:e})}function P(e,t,n){n.columnKey&&y.columns.setColumnWidth(n.columnKey,e)}return n({validate:y.validation.validate,clearValidate:y.validation.clearValidate,insertRow:y.rows.insertRow,removeRow:y.rows.removeRow,moveRow:y.rows.moveRow,duplicateRow:y.rows.duplicateRow,startRowEdit:y.editing.startRowEdit,commitRowEdit:y.editing.commitRowEdit,cancelRowEdit:y.editing.cancelRowEdit,startEdit:y.editing.startEdit,cancelEdit:y.editing.cancelEdit,setActiveCell:y.selection.setActiveCell,resetColumnSettings:y.columns.resetSettings,setColumnWidth:y.columns.setColumnWidth,getElTable:()=>_.value}),(t,n)=>(A(),x(`div`,Ae,[e.columnSetting||t.$slots.toolbar?(A(),x(`div`,je,[r(t.$slots,`toolbar`),e.columnSetting?(A(),v(De,{key:0})):S(``,!0)])):S(``,!0),h(`div`,{ref_key:`gridRef`,ref:d,class:`plus-table__grid`,tabindex:`0`,onKeydown:n[0]||=(...e)=>o(O)&&o(O)(...e)},[m(o(V),b({ref_key:`tableRef`,ref:_,data:e.data,"row-key":k.value,height:o(D)},t.$attrs,{onCellClick:o(y).handleCellClick,onCellDblclick:o(y).handleCellDblclick,onHeaderDragend:P}),f({default:w(()=>[(A(!0),x(p,null,l(o(T),(e,t)=>(A(),v(o(ke),{key:`${t}:${e.id}`,node:e},null,8,[`node`]))),128))]),_:2},[t.$slots.empty?{name:`empty`,fn:w(()=>[r(t.$slots,`empty`)]),key:`0`}:void 0]),1040,[`data`,`row-key`,`height`,`onCellClick`,`onCellDblclick`])],544),j.value?(A(),x(`div`,{key:1,ref_key:`paginationRef`,ref:g,class:`plus-table__pagination`},[m(o(ae),{background:``,layout:`total, sizes, prev, pager, next, jumper`,total:e.total,"current-page":e.page,"page-size":e.pageSize,"page-sizes":e.pageSizes,"onUpdate:currentPage":M,"onUpdate:pageSize":N},null,8,[`total`,`current-page`,`page-size`,`page-sizes`])],512)):S(``,!0)]))}}),Me=O({__name:`basic`,setup(e){let t=C([{id:1,name:`需求评审`,amount:1200,status:`pending`},{id:2,name:`接口开发`,amount:3400,status:`active`},{id:3,name:`联调测试`,amount:800,status:`done`}]),n=[{field:`id`,title:`ID`,width:80},{field:`name`,title:`名称`,editable:!0,editor:`input`,required:!0},{field:`amount`,title:`金额`,align:`right`,width:140,editable:!0,editor:{type:`number`,props:{min:0,step:100,controls:!1}},formatter:e=>`¥ ${(Number(e)||0).toLocaleString(`zh-CN`)}`},{field:`status`,title:`状态`,width:140,editable:!0,editor:{type:`select`,options:[{label:`待开始`,value:`pending`},{label:`进行中`,value:`active`},{label:`已完成`,value:`done`}]},formatter:e=>({pending:`待开始`,active:`进行中`,done:`已完成`})[String(e)]??``}];return(e,r)=>(A(),v(o(Q),{data:t.value,"onUpdate:data":r[0]||=e=>t.value=e,columns:n,"row-key":`id`,border:``},null,8,[`data`]))}}),Ne=`<script setup lang="ts">
import { ref } from 'vue';

import { PlusTable } from '@labs/plus-table';
import type { PlusTableColumn } from '@labs/plus-table';

interface Row {
  id: number;
  name: string;
  amount: number;
  status: string;
}

const data = ref<Row[]>([
  { id: 1, name: '需求评审', amount: 1200, status: 'pending' },
  { id: 2, name: '接口开发', amount: 3400, status: 'active' },
  { id: 3, name: '联调测试', amount: 800, status: 'done' },
]);

const columns: PlusTableColumn[] = [
  { field: 'id', title: 'ID', width: 80 },
  {
    field: 'name',
    title: '名称',
    editable: true,
    editor: 'input',
    required: true,
  },
  {
    field: 'amount',
    title: '金额',
    align: 'right',
    width: 140,
    editable: true,
    editor: { type: 'number', props: { min: 0, step: 100, controls: false } },
    formatter: (value) => \`¥ \${(Number(value) || 0).toLocaleString('zh-CN')}\`,
  },
  {
    field: 'status',
    title: '状态',
    width: 140,
    editable: true,
    editor: {
      type: 'select',
      options: [
        { label: '待开始', value: 'pending' },
        { label: '进行中', value: 'active' },
        { label: '已完成', value: 'done' },
      ],
    },
    formatter: (value) =>
      ({ pending: '待开始', active: '进行中', done: '已完成' })[String(value)] ?? '',
  },
];
<\/script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>
`,Pe={class:`demo-toolbar`},Fe={class:`demo-statusbar`},Ie={class:`demo-statusbar__item`},Le={class:`demo-statusbar__item demo-statusbar__item--grow`},$={class:`demo-table-title`},Re=T(O({__name:`playground`,setup(e){let t=[`技术部`,`产品部`,`设计部`,`市场部`],n={技术部:[`张三`,`李四`],产品部:[`王五`,`赵六`],设计部:[`陈七`,`周八`],市场部:[`周八`,`陈七`]},r=[`前端组`,`后端组`,`UI组`,`运营组`],i=[{label:`待开始`,value:`pending`},{label:`进行中`,value:`active`},{label:`已完成`,value:`done`}],a=[{label:`高`,value:`high`},{label:`中`,value:`medium`},{label:`低`,value:`low`}],l={pending:{label:`待开始`,type:`info`},active:{label:`进行中`,type:`warning`},done:{label:`已完成`,type:`success`}},u=1;function f(e){let i=[`pending`,`active`,`done`],a=[`low`,`medium`,`high`],o=t[e%t.length],s=n[o];return{id:u++,name:`任务 ${e+1} — ${[`需求评审`,`接口开发`,`联调测试`,`UI 走查`,`性能优化`][e%5]}`,status:i[e%3],priority:a[e%3],amount:1e3+e%20*500,department:o,assignee:s[e%s.length],team:r[e%r.length],remark:`备注 ${e+1}`}}let p=C(Array.from({length:30},(e,t)=>f(t))),_=C(1),v=C(10),y=E(()=>p.value.length),b=E({get:()=>{let e=(_.value-1)*v.value;return p.value.slice(e,e+v.value)},set:e=>{let t=(_.value-1)*v.value,n=Math.min(v.value,Math.max(p.value.length-t,0)),r=[...p.value];r.splice(t,n,...e),p.value=r}}),S=C(),T=C(`cell`),D=C(`change`),O=C(`—`),j=C(`—`),M=g(new Set);function N(e){O.value=`行 ${e.rowIndex+1} / ${e.field}：${JSON.stringify(e.oldValue)} → ${JSON.stringify(e.value)}`}async function P(){let e=await S.value?.validate();j.value=e?.valid?`OK`:`${e?.errors.length} 个错误`}function F(){S.value?.clearValidate(),j.value=`—`}function I(){S.value?.insertRow(f(p.value.length))}async function L(e,t){await S.value?.commitRowEdit(t)&&M.delete(e.id)}function R(e,t){S.value?.startRowEdit(t),M.add(e.id)}function z(e,t){S.value?.cancelRowEdit(t),M.delete(e.id)}let V=[{field:`id`,title:`ID`,width:70,fixed:`left`,settingDisabled:!0},{field:`name`,title:`任务名称`,minWidth:200,editable:!0,editor:`input`,required:!0,rules:[{min:2,max:50,message:`长度 2–50`}]},{field:`status`,title:`状态`,width:110,editable:!0,editor:{type:`select`,options:i},render:({value:e})=>{let t=l[String(e)]??{label:`未知`,type:`info`};return s(ie,{type:t.type,size:`small`,disableTransitions:!0},()=>t.label)}},{field:`priority`,title:`优先级`,width:110,editable:!0,editor:{type:`select`,options:a},formatter:e=>({high:`高`,medium:`中`,low:`低`})[String(e)]??``,dependencies:{triggerFields:[`status`],disabled:e=>e.status===`done`}},{field:`amount`,title:`金额`,align:`right`,width:130,editable:!0,editor:{type:`number`,props:{min:0,step:100,controls:!1}},formatter:e=>`¥ ${(Number(e)||0).toLocaleString(`zh-CN`)}`,rules:[{type:`number`,min:0,message:`金额不能为负`}]},{title:`组织信息`,children:[{field:`department`,title:`部门`,width:120,editable:!0,editor:{type:`select`,options:t.map(e=>({label:e,value:e}))}},{field:`assignee`,title:`负责人`,width:130,editable:!0,editor:{type:`select`},dependencies:{triggerFields:[`department`],required:e=>e.status===`active`,componentProps:e=>({options:(n[e.department]??[]).map(e=>({label:e,value:e}))}),trigger:(e,t)=>{(n[e.department]??[]).includes(e.assignee)||t.setValue(`assignee`,void 0)}}},{field:`team`,title:`团队`,width:110}]},{field:`remark`,title:`备注`,minWidth:140,editable:!0},{title:`操作`,width:190,fixed:`right`,align:`center`,settingDisabled:!0,render:({row:e,rowIndex:t})=>{let n=e,r=[];return T.value===`row`&&(M.has(n.id)?r.push(s(B,{link:!0,type:`primary`,size:`small`,onClick:()=>L(n,t)},()=>`保存`),s(B,{link:!0,size:`small`,onClick:()=>z(n,t)},()=>`取消`)):r.push(s(B,{link:!0,type:`primary`,size:`small`,onClick:()=>R(n,t)},()=>`编辑`))),r.push(s(B,{link:!0,size:`small`,onClick:()=>S.value?.duplicateRow(t,{id:u++})},()=>`复制`),s(B,{link:!0,type:`danger`,size:`small`,onClick:()=>S.value?.removeRow(t)},()=>`删除`)),s(`span`,r)}}];return(e,t)=>{let n=c(`el-radio-button`),r=c(`el-radio-group`),i=c(`el-divider`),a=c(`el-input`);return A(),x(`div`,null,[h(`div`,Pe,[t[15]||=h(`span`,{class:`label`},`编辑模式`,-1),m(r,{modelValue:T.value,"onUpdate:modelValue":t[0]||=e=>T.value=e,size:`small`},{default:w(()=>[m(n,{value:`none`},{default:w(()=>[...t[5]||=[k(`none`,-1)]]),_:1}),m(n,{value:`cell`},{default:w(()=>[...t[6]||=[k(`cell`,-1)]]),_:1}),m(n,{value:`row`},{default:w(()=>[...t[7]||=[k(`row`,-1)]]),_:1}),m(n,{value:`table`},{default:w(()=>[...t[8]||=[k(`table`,-1)]]),_:1})]),_:1},8,[`modelValue`]),m(i,{direction:`vertical`}),t[16]||=h(`span`,{class:`label`},`校验时机`,-1),m(r,{modelValue:D.value,"onUpdate:modelValue":t[1]||=e=>D.value=e,size:`small`},{default:w(()=>[m(n,{value:`change`},{default:w(()=>[...t[9]||=[k(`change`,-1)]]),_:1}),m(n,{value:`blur`},{default:w(()=>[...t[10]||=[k(`blur`,-1)]]),_:1}),m(n,{value:`manual`},{default:w(()=>[...t[11]||=[k(`manual`,-1)]]),_:1})]),_:1},8,[`modelValue`]),m(i,{direction:`vertical`}),m(o(B),{size:`small`,type:`primary`,onClick:P},{default:w(()=>[...t[12]||=[k(`校验`,-1)]]),_:1}),m(o(B),{size:`small`,onClick:F},{default:w(()=>[...t[13]||=[k(`清除校验`,-1)]]),_:1}),m(o(B),{size:`small`,onClick:I},{default:w(()=>[...t[14]||=[k(`插入行`,-1)]]),_:1})]),h(`div`,Fe,[h(`span`,Ie,[t[17]||=h(`span`,{class:`demo-statusbar__k`},`校验`,-1),k(d(j.value),1)]),t[19]||=h(`span`,{class:`demo-statusbar__sep`},`|`,-1),h(`span`,Le,[t[18]||=h(`span`,{class:`demo-statusbar__k`},`cell-change`,-1),k(d(O.value),1)])]),m(o(Q),{ref_key:`tableRef`,ref:S,data:b.value,"onUpdate:data":t[2]||=e=>b.value=e,page:_.value,"onUpdate:page":t[3]||=e=>_.value=e,"page-size":v.value,"onUpdate:pageSize":t[4]||=e=>v.value=e,columns:V,total:y.value,"edit-mode":T.value,"validate-on":D.value,"row-key":`id`,"column-setting":``,"settings-key":`docs-playground`,border:``,onCellChange:N},{toolbar:w(()=>[h(`span`,$,`任务管理（`+d(y.value)+` 条）`,1)]),"header-name":w(()=>[...t[20]||=[h(`span`,{style:{color:`var(--el-color-primary)`}},`任务名称`,-1)]]),"editor-remark":w(({value:e,setValue:t})=>[m(a,{"model-value":e,placeholder:`自定义编辑器插槽…`,size:`small`,"onUpdate:modelValue":t},null,8,[`model-value`,`onUpdate:modelValue`])]),_:1},8,[`data`,`page`,`page-size`,`total`,`edit-mode`,`validate-on`])])}}}),[[`__scopeId`,`data-v-27463881`]]),ze=`<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { ElButton, ElTag } from 'element-plus';

import { PlusTable } from '@labs/plus-table';
import type {
  CellChangePayload,
  EditMode,
  PlusTableColumn,
  ValidateOn,
} from '@labs/plus-table';

// ──── 数据 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  amount: number;
  department: string;
  assignee: string;
  team: string;
  remark: string;
  [key: string]: unknown;
}

const departments = ['技术部', '产品部', '设计部', '市场部'];
const departmentAssignees: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  产品部: ['王五', '赵六'],
  设计部: ['陈七', '周八'],
  市场部: ['周八', '陈七'],
};
const teams = ['前端组', '后端组', 'UI组', '运营组'];

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

const statusMap: Record<string, { label: string; type: 'info' | 'warning' | 'success' }> = {
  pending: { label: '待开始', type: 'info' },
  active: { label: '进行中', type: 'warning' },
  done: { label: '已完成', type: 'success' },
};

let nextId = 1;

function createRow(seed: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  const dept = departments[seed % departments.length]!;
  const candidates = departmentAssignees[dept]!;
  return {
    id: nextId++,
    name: \`任务 \${seed + 1} — \${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][seed % 5]}\`,
    status: statuses[seed % 3]!,
    priority: priorities[seed % 3]!,
    amount: 1000 + (seed % 20) * 500,
    department: dept,
    assignee: candidates[seed % candidates.length]!,
    team: teams[seed % teams.length]!,
    remark: \`备注 \${seed + 1}\`,
  };
}

const allData = ref<TaskRow[]>(Array.from({ length: 30 }, (_, i) => createRow(i)));

// ──── 分页（服务端驱动模拟：父级切片，组件不切片）────

const page = ref(1);
const pageSize = ref(10);
const total = computed(() => allData.value.length);

const pagedData = computed<TaskRow[]>({
  get: () => {
    const start = (page.value - 1) * pageSize.value;
    return allData.value.slice(start, start + pageSize.value);
  },
  // 行结构变更（增删移复制）回传当前页数组，这里合并回全量数据
  set: (rows) => {
    const start = (page.value - 1) * pageSize.value;
    const currentLen = Math.min(
      pageSize.value,
      Math.max(allData.value.length - start, 0),
    );
    const next = [...allData.value];
    next.splice(start, currentLen, ...rows);
    allData.value = next;
  },
});

// ──── 控制状态 ────

const tableRef = ref<InstanceType<typeof PlusTable>>();
const editMode = ref<EditMode>('cell');
const validateOn = ref<ValidateOn>('change');
const changeLog = ref('—');
const validationResult = ref('—');
/** row 模式下处于编辑态的行 id（仅供操作列 UI 切换按钮） */
const editingIds = reactive(new Set<number>());

function onCellChange(payload: CellChangePayload) {
  changeLog.value = \`行 \${payload.rowIndex + 1} / \${payload.field}：\${JSON.stringify(payload.oldValue)} → \${JSON.stringify(payload.value)}\`;
}

async function handleValidate() {
  const result = await tableRef.value?.validate();
  validationResult.value = result?.valid ? 'OK' : \`\${result?.errors.length} 个错误\`;
}

function handleClearValidate() {
  tableRef.value?.clearValidate();
  validationResult.value = '—';
}

function handleInsertRow() {
  tableRef.value?.insertRow(createRow(allData.value.length));
}

// ──── row 模式行编辑 ────

async function saveRow(row: TaskRow, rowIndex: number) {
  const ok = await tableRef.value?.commitRowEdit(rowIndex);
  if (ok) editingIds.delete(row.id);
}

function editRow(row: TaskRow, rowIndex: number) {
  tableRef.value?.startRowEdit(rowIndex);
  editingIds.add(row.id);
}

function cancelRow(row: TaskRow, rowIndex: number) {
  tableRef.value?.cancelRowEdit(rowIndex);
  editingIds.delete(row.id);
}

// ──── 列配置 ────

const columns: PlusTableColumn[] = [
  { field: 'id', title: 'ID', width: 70, fixed: 'left', settingDisabled: true },
  {
    field: 'name',
    title: '任务名称',
    minWidth: 200,
    editable: true,
    editor: 'input',
    required: true,
    rules: [{ min: 2, max: 50, message: '长度 2–50' }],
  },
  {
    field: 'status',
    title: '状态',
    width: 110,
    editable: true,
    editor: { type: 'select', options: statusOptions },
    render: ({ value }) => {
      const info = statusMap[String(value)] ?? { label: '未知', type: 'info' as const };
      return h(ElTag, { type: info.type, size: 'small', disableTransitions: true }, () => info.label);
    },
  },
  {
    field: 'priority',
    title: '优先级',
    width: 110,
    editable: true,
    editor: { type: 'select', options: priorityOptions },
    formatter: (value) =>
      ({ high: '高', medium: '中', low: '低' })[String(value)] ?? '',
    dependencies: {
      triggerFields: ['status'],
      // 已完成的任务不允许再改优先级
      disabled: (row) => row.status === 'done',
    },
  },
  {
    field: 'amount',
    title: '金额',
    align: 'right',
    width: 130,
    editable: true,
    editor: { type: 'number', props: { min: 0, step: 100, controls: false } },
    formatter: (value) => \`¥ \${(Number(value) || 0).toLocaleString('zh-CN')}\`,
    rules: [{ type: 'number', min: 0, message: '金额不能为负' }],
  },
  {
    title: '组织信息',
    children: [
      {
        field: 'department',
        title: '部门',
        width: 120,
        editable: true,
        editor: {
          type: 'select',
          options: departments.map((d) => ({ label: d, value: d })),
        },
      },
      {
        field: 'assignee',
        title: '负责人',
        width: 130,
        editable: true,
        editor: { type: 'select' },
        dependencies: {
          triggerFields: ['department'],
          // 进行中的任务必须有负责人
          required: (row) => row.status === 'active',
          // 候选人随部门联动
          componentProps: (row) => ({
            options: (departmentAssignees[row.department as string] ?? []).map(
              (name) => ({ label: name, value: name }),
            ),
          }),
          // 换部门后清空负责人
          trigger: (row, api) => {
            const candidates = departmentAssignees[row.department as string] ?? [];
            if (!candidates.includes(row.assignee as string)) {
              api.setValue('assignee', undefined);
            }
          },
        },
      },
      { field: 'team', title: '团队', width: 110 },
    ],
  },
  {
    field: 'remark',
    title: '备注',
    minWidth: 140,
    editable: true,
  },
  {
    title: '操作',
    width: 190,
    fixed: 'right',
    align: 'center',
    settingDisabled: true,
    render: ({ row, rowIndex }) => {
      const task = row as TaskRow;
      const buttons = [];
      if (editMode.value === 'row') {
        if (editingIds.has(task.id)) {
          buttons.push(
            h(ElButton, { link: true, type: 'primary', size: 'small', onClick: () => saveRow(task, rowIndex) }, () => '保存'),
            h(ElButton, { link: true, size: 'small', onClick: () => cancelRow(task, rowIndex) }, () => '取消'),
          );
        } else {
          buttons.push(
            h(ElButton, { link: true, type: 'primary', size: 'small', onClick: () => editRow(task, rowIndex) }, () => '编辑'),
          );
        }
      }
      buttons.push(
        h(ElButton, { link: true, size: 'small', onClick: () => tableRef.value?.duplicateRow(rowIndex, { id: nextId++ }) }, () => '复制'),
        h(ElButton, { link: true, type: 'danger', size: 'small', onClick: () => tableRef.value?.removeRow(rowIndex) }, () => '删除'),
      );
      return h('span', buttons);
    },
  },
];
<\/script>

<template>
  <div>
    <div class="demo-toolbar">
      <span class="label">编辑模式</span>
      <el-radio-group v-model="editMode" size="small">
        <el-radio-button value="none">none</el-radio-button>
        <el-radio-button value="cell">cell</el-radio-button>
        <el-radio-button value="row">row</el-radio-button>
        <el-radio-button value="table">table</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <span class="label">校验时机</span>
      <el-radio-group v-model="validateOn" size="small">
        <el-radio-button value="change">change</el-radio-button>
        <el-radio-button value="blur">blur</el-radio-button>
        <el-radio-button value="manual">manual</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <el-button size="small" type="primary" @click="handleValidate">校验</el-button>
      <el-button size="small" @click="handleClearValidate">清除校验</el-button>
      <el-button size="small" @click="handleInsertRow">插入行</el-button>
    </div>

    <div class="demo-statusbar">
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">校验</span>{{ validationResult }}
      </span>
      <span class="demo-statusbar__sep">|</span>
      <span class="demo-statusbar__item demo-statusbar__item--grow">
        <span class="demo-statusbar__k">cell-change</span>{{ changeLog }}
      </span>
    </div>

    <PlusTable
      ref="tableRef"
      v-model:data="pagedData"
      v-model:page="page"
      v-model:page-size="pageSize"
      :columns="columns"
      :total="total"
      :edit-mode="editMode"
      :validate-on="validateOn"
      row-key="id"
      column-setting
      settings-key="docs-playground"
      border
      @cell-change="onCellChange"
    >
      <template #toolbar>
        <span class="demo-table-title">任务管理（{{ total }} 条）</span>
      </template>

      <template #header-name>
        <span style="color: var(--el-color-primary)">任务名称</span>
      </template>

      <template #editor-remark="{ value, setValue }">
        <el-input
          :model-value="(value as string)"
          placeholder="自定义编辑器插槽…"
          size="small"
          @update:model-value="setValue"
        />
      </template>
    </PlusTable>
  </div>
</template>

<style scoped lang="scss">
.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .label {
    font-size: 12px;
    font-weight: 500;
    color: var(--vp-c-text-2, #666);
  }
}

.demo-statusbar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  font-variant-numeric: tabular-nums;

  &__k {
    margin-right: 4px;
    font-weight: 600;
  }

  &__sep {
    margin: 0 8px;
    color: var(--el-border-color);
  }

  &__item--grow {
    flex: 1 1 200px;
    min-width: 0;
  }
}

.demo-table-title {
  margin-right: auto;
  font-size: 13px;
  font-weight: 600;
}
</style>
`;const Be=JSON.parse(`{"title":"PlusTable","description":"基于 Element Plus el-table 的增强表格","frontmatter":{"title":"PlusTable","description":"基于 Element Plus el-table 的增强表格"},"headers":[],"relativePath":"components/plus-table/index.md","filePath":"components/plus-table/index.md"}`);var Ve=O({name:`components/plus-table/index.md`,setup(e){return(e,t)=>{let n=c(`ClientOnly`),r=c(`DemoBlock`);return A(),x(`div`,null,[t[0]||=h(`h1`,{id:`plustable`,tabindex:`-1`},[k(`PlusTable `),h(`a`,{class:`header-anchor`,href:`#plustable`,"aria-label":`Permalink to “PlusTable”`},`​`)],-1),t[1]||=h(`p`,null,[k(`基于 Element Plus `),h(`code`,null,`el-table`),k(` 的增强表格：配置式列、三种编辑模式（单元格 / 整行 / 全表）、仿 Excel 热键、列设置持久化、行校验与联动（dependencies）、行操作、服务端分页与自适应高度。`)],-1),m(r,{title:`基础用法`,description:`配置式列 + cell 编辑模式：双击 / Enter / F2 进入编辑，直接打字覆盖输入。`,source:o(Ne)},{default:w(()=>[m(n,null,{default:w(()=>[m(Me)]),_:1})]),_:1},8,[`source`]),t[2]||=D("",4),m(r,{title:`交互示例`,description:`完整功能演示：编辑模式 / 热键 / 校验 / 联动 / 行操作 / 列设置 / 分页。`,source:o(ze)},{default:w(()=>[m(n,null,{default:w(()=>[m(Re)]),_:1})]),_:1},8,[`source`]),t[3]||=D("",34)])}}});export{Be as __pageData,Ve as default};