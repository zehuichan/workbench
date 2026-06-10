import{I as e,Kt as t,St as n,U as r,V as i,Yt as a,a as o,b as s,d as c,dt as l,f as u,gt as d,m as f,p,pt as m,rt as h,t as g,u as _,v,x as ee,y,z as b}from"./chunks/plugin-vue_export-helper.lnNjcNWu.js";import{Gt as te}from"./chunks/weekYear.Bk__H43W.js";import{r as x}from"./chunks/es.B3Hi6WiX.js";var ne=Symbol.for(`immer-nothing`),S=Symbol.for(`immer-draftable`),C=Symbol.for(`immer-state`);function w(e,...t){throw Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`)}var T=Object,E=T.getPrototypeOf,re=`constructor`,D=`prototype`,ie=`configurable`,O=`enumerable`,ae=`writable`,oe=`value`,k=e=>!!e&&!!e[C];function A(e){return e?le(e)||I(e)||!!e[S]||!!e[re]?.[S]||L(e)||R(e):!1}var se=T[D][re].toString(),ce=new WeakMap;function le(e){if(!e||!z(e))return!1;let t=E(e);if(t===null||t===T[D])return!0;let n=T.hasOwnProperty.call(t,re)&&t[re];if(n===Object)return!0;if(!B(n))return!1;let r=ce.get(n);return r===void 0&&(r=Function.toString.call(n),ce.set(n,r)),r===se}function ue(e){return k(e)||w(15,e),e[C].base_}function j(e,t,n=!0){M(e)===0?(n?Reflect.ownKeys(e):T.keys(e)).forEach(n=>{t(n,e[n],e)}):e.forEach((n,r)=>t(r,n,e))}function M(e){let t=e[C];return t?t.type_:I(e)?1:L(e)?2:R(e)?3:0}var N=(e,t,n=M(e))=>n===2?e.has(t):T[D].hasOwnProperty.call(e,t),P=(e,t,n=M(e))=>n===2?e.get(t):e[t],F=(e,t,n,r=M(e))=>{r===2?e.set(t,n):r===3?e.add(n):e[t]=n};function de(e,t){return e===t?e!==0||1/e==1/t:e!==e&&t!==t}var I=Array.isArray,L=e=>e instanceof Map,R=e=>e instanceof Set,z=e=>typeof e==`object`,B=e=>typeof e==`function`,fe=e=>typeof e==`boolean`;function pe(e){let t=+e;return Number.isInteger(t)&&String(t)===e}var me=e=>z(e)?e?.[C]:null,V=e=>e.copy_||e.base_,he=e=>{let t=me(e);return t?t.copy_??t.base_:e},ge=e=>e.modified_?e.copy_:e.base_;function _e(e,t){if(L(e))return new Map(e);if(R(e))return new Set(e);if(I(e))return Array[D].slice.call(e);let n=le(e);if(t===!0||t===`class_only`&&!n){let t=T.getOwnPropertyDescriptors(e);delete t[C];let n=Reflect.ownKeys(t);for(let r=0;r<n.length;r++){let i=n[r],a=t[i];a[ae]===!1&&(a[ae]=!0,a[ie]=!0),(a.get||a.set)&&(t[i]={[ie]:!0,[ae]:!0,[O]:a[O],[oe]:e[i]})}return T.create(E(e),t)}else{let t=E(e);if(t!==null&&n)return{...e};let r=T.create(t);return T.assign(r,e)}}function H(e,t=!1){return W(e)||k(e)||!A(e)?e:(M(e)>1&&T.defineProperties(e,{set:U,add:U,clear:U,delete:U}),T.freeze(e),t&&j(e,(e,t)=>{H(t,!0)},!1),e)}function ve(){w(2)}var U={[oe]:ve};function W(e){return e===null||!z(e)?!0:T.isFrozen(e)}var G=`MapSet`,K=`Patches`,ye=`ArrayMethods`,be={};function q(e){let t=be[e];return t||w(0,e),t}var xe=e=>!!be[e];function Se(e,t){be[e]||(be[e]=t)}var J,Ce=()=>J,Y=(e,t)=>({drafts_:[],parent_:e,immer_:t,canAutoFreeze_:!0,unfinalizedDrafts_:0,handledSet_:new Set,processedForPatches_:new Set,mapSetPlugin_:xe(G)?q(G):void 0,arrayMethodsPlugin_:xe(ye)?q(ye):void 0});function we(e,t){t&&(e.patchPlugin_=q(K),e.patches_=[],e.inversePatches_=[],e.patchListener_=t)}function Te(e){Ee(e),e.drafts_.forEach(Oe),e.drafts_=null}function Ee(e){e===J&&(J=e.parent_)}var De=e=>J=Y(J,e);function Oe(e){let t=e[C];t.type_===0||t.type_===1?t.revoke_():t.revoked_=!0}function ke(e,t){t.unfinalizedDrafts_=t.drafts_.length;let n=t.drafts_[0];if(e!==void 0&&e!==n){n[C].modified_&&(Te(t),w(4)),A(e)&&(e=X(t,e));let{patchPlugin_:r}=t;r&&r.generateReplacementPatches_(n[C].base_,e,t)}else e=X(t,n);return Ae(t,e,!0),Te(t),t.patches_&&t.patchListener_(t.patches_,t.inversePatches_),e===ne?void 0:e}function X(e,t){if(W(t))return t;let n=t[C];if(!n)return Re(t,e.handledSet_,e);if(!Me(n,e))return t;if(!n.modified_)return n.base_;if(!n.finalized_){let{callbacks_:t}=n;if(t)for(;t.length>0;)t.pop()(e);Ie(n,e)}return n.copy_}function Ae(e,t,n=!1){!e.parent_&&e.immer_.autoFreeze_&&e.canAutoFreeze_&&H(t,n)}function je(e){e.finalized_=!0,e.scope_.unfinalizedDrafts_--}var Me=(e,t)=>e.scope_===t,Ne=[];function Pe(e,t,n,r){let i=V(e),a=e.type_;if(r!==void 0&&P(i,r,a)===t){F(i,r,n,a);return}if(!e.draftLocations_){let t=e.draftLocations_=new Map;j(i,(e,n)=>{if(k(n)){let r=t.get(n)||[];r.push(e),t.set(n,r)}})}let o=e.draftLocations_.get(t)??Ne;for(let e of o)F(i,e,n,a)}function Fe(e,t,n){e.callbacks_.push(function(r){let i=t;if(!i||!Me(i,r))return;r.mapSetPlugin_?.fixSetContents(i);let a=ge(i);Pe(e,i.draft_??i,a,n),Ie(i,r)})}function Ie(e,t){if(e.modified_&&!e.finalized_&&(e.type_===3||e.type_===1&&e.allIndicesReassigned_||(e.assigned_?.size??0)>0)){let{patchPlugin_:n}=t;if(n){let r=n.getPath(e);r&&n.generatePatches_(e,r,t)}je(e)}}function Le(e,t,n){let{scope_:r}=e;if(k(n)){let i=n[C];Me(i,r)&&i.callbacks_.push(function(){Ge(e),Pe(e,n,ge(i),t)})}else A(n)&&e.callbacks_.push(function(){let i=V(e);e.type_===3?i.has(n)&&Re(n,r.handledSet_,r):P(i,t,e.type_)===n&&r.drafts_.length>1&&(e.assigned_.get(t)??!1)===!0&&e.copy_&&Re(P(e.copy_,t,e.type_),r.handledSet_,r)})}function Re(e,t,n){return!n.immer_.autoFreeze_&&n.unfinalizedDrafts_<1||k(e)||t.has(e)||!A(e)||W(e)?e:(t.add(e),j(e,(r,i)=>{if(k(i)){let t=i[C];Me(t,n)&&(F(e,r,ge(t),e.type_),je(t))}else A(i)&&Re(i,t,n)}),e)}function ze(e,t){let n=I(e),r={type_:n?1:0,scope_:t?t.scope_:Ce(),modified_:!1,finalized_:!1,assigned_:void 0,parent_:t,base_:e,draft_:null,copy_:null,revoke_:null,isManual_:!1,callbacks_:void 0},i=r,a=Be;n&&(i=[r],a=Ve);let{revoke:o,proxy:s}=Proxy.revocable(i,a);return r.draft_=s,r.revoke_=o,[s,r]}var Be={get(e,t){if(t===C)return e;let n=e.scope_.arrayMethodsPlugin_,r=e.type_===1&&typeof t==`string`;if(r&&n?.isArrayOperationMethod(t))return n.createMethodInterceptor(e,t);let i=V(e);if(!N(i,t,e.type_))return Ue(e,i,t);let a=i[t];if(e.finalized_||!A(a)||r&&e.operationMethod&&n?.isMutatingArrayMethod(e.operationMethod)&&pe(t))return a;if(a===He(e.base_,t)){Ge(e);let n=e.type_===1?+t:t,r=qe(e.scope_,a,e,n);return e.copy_[n]=r}return a},has(e,t){return t in V(e)},ownKeys(e){return Reflect.ownKeys(V(e))},set(e,t,n){let r=We(V(e),t);if(r?.set)return r.set.call(e.draft_,n),!0;if(!e.modified_){let r=He(V(e),t),i=r?.[C];if(i&&i.base_===n)return e.copy_[t]=n,e.assigned_.set(t,!1),!0;if(de(n,r)&&(n!==void 0||N(e.base_,t,e.type_)))return!0;Ge(e),Z(e)}return e.copy_[t]===n&&(n!==void 0||t in e.copy_)||Number.isNaN(n)&&Number.isNaN(e.copy_[t])?!0:(e.copy_[t]=n,e.assigned_.set(t,!0),Le(e,t,n),!0)},deleteProperty(e,t){return Ge(e),He(e.base_,t)!==void 0||t in e.base_?(e.assigned_.set(t,!1),Z(e)):e.assigned_.delete(t),e.copy_&&delete e.copy_[t],!0},getOwnPropertyDescriptor(e,t){let n=V(e),r=Reflect.getOwnPropertyDescriptor(n,t);return r&&{[ae]:!0,[ie]:e.type_!==1||t!==`length`,[O]:r[O],[oe]:n[t]}},defineProperty(){w(11)},getPrototypeOf(e){return E(e.base_)},setPrototypeOf(){w(12)}},Ve={};for(let e in Be){let t=Be[e];Ve[e]=function(){let e=arguments;return e[0]=e[0][0],t.apply(this,e)}}Ve.deleteProperty=function(e,t){return Ve.set.call(this,e,t,void 0)},Ve.set=function(e,t,n){return Be.set.call(this,e[0],t,n,e[0])};function He(e,t){let n=e[C];return(n?V(n):e)[t]}function Ue(e,t,n){let r=We(t,n);return r?oe in r?r[oe]:r.get?.call(e.draft_):void 0}function We(e,t){if(!(t in e))return;let n=E(e);for(;n;){let e=Object.getOwnPropertyDescriptor(n,t);if(e)return e;n=E(n)}}function Z(e){e.modified_||(e.modified_=!0,e.parent_&&Z(e.parent_))}function Ge(e){e.copy_||=(e.assigned_=new Map,_e(e.base_,e.scope_.immer_.useStrictShallowCopy_))}var Ke=class{constructor(e){this.autoFreeze_=!0,this.useStrictShallowCopy_=!1,this.useStrictIteration_=!1,this.produce=(e,t,n)=>{if(B(e)&&!B(t)){let n=t;t=e;let r=this;return function(e=n,...i){return r.produce(e,e=>t.call(this,e,...i))}}B(t)||w(6),n!==void 0&&!B(n)&&w(7);let r;if(A(e)){let i=De(this),a=qe(i,e,void 0),o=!0;try{r=t(a),o=!1}finally{o?Te(i):Ee(i)}return we(i,n),ke(r,i)}else if(!e||!z(e)){if(r=t(e),r===void 0&&(r=e),r===ne&&(r=void 0),this.autoFreeze_&&H(r,!0),n){let t=[],i=[];q(K).generateReplacementPatches_(e,r,{patches_:t,inversePatches_:i}),n(t,i)}return r}else w(1,e)},this.produceWithPatches=(e,t)=>{if(B(e))return(t,...n)=>this.produceWithPatches(t,t=>e(t,...n));let n,r;return[this.produce(e,t,(e,t)=>{n=e,r=t}),n,r]},fe(e?.autoFreeze)&&this.setAutoFreeze(e.autoFreeze),fe(e?.useStrictShallowCopy)&&this.setUseStrictShallowCopy(e.useStrictShallowCopy),fe(e?.useStrictIteration)&&this.setUseStrictIteration(e.useStrictIteration)}createDraft(e){A(e)||w(8),k(e)&&(e=Je(e));let t=De(this),n=qe(t,e,void 0);return n[C].isManual_=!0,Ee(t),n}finishDraft(e,t){let n=e&&e[C];(!n||!n.isManual_)&&w(9);let{scope_:r}=n;return we(r,t),ke(void 0,r)}setAutoFreeze(e){this.autoFreeze_=e}setUseStrictShallowCopy(e){this.useStrictShallowCopy_=e}setUseStrictIteration(e){this.useStrictIteration_=e}shouldUseStrictIteration(){return this.useStrictIteration_}applyPatches(e,t){let n;for(n=t.length-1;n>=0;n--){let r=t[n];if(r.path.length===0&&r.op===`replace`){e=r.value;break}}n>-1&&(t=t.slice(n+1));let r=q(K).applyPatches_;return k(e)?r(e,t):this.produce(e,e=>r(e,t))}};function qe(e,t,n,r){let[i,a]=L(t)?q(G).proxyMap_(t,n):R(t)?q(G).proxySet_(t,n):ze(t,n);return(n?.scope_??Ce()).drafts_.push(i),a.callbacks_=n?.callbacks_??[],a.key_=r,n&&r!==void 0?Fe(n,a,r):a.callbacks_.push(function(e){e.mapSetPlugin_?.fixSetContents(a);let{patchPlugin_:t}=e;a.modified_&&t&&t.generatePatches_(a,[],e)}),i}function Je(e){return k(e)||w(10,e),Ye(e)}function Ye(e){if(!A(e)||W(e))return e;let t=e[C],n,r=!0;if(t){if(!t.modified_)return t.base_;t.finalized_=!0,n=_e(e,t.scope_.immer_.useStrictShallowCopy_),r=t.scope_.immer_.shouldUseStrictIteration()}else n=_e(e,!0);return j(n,(e,t)=>{F(n,e,Ye(t))},r),t&&(t.finalized_=!1),n}function Xe(){function e(n,r=[]){if(n.key_!==void 0){let e=n.parent_.copy_??n.parent_.base_,t=me(P(e,n.key_)),i=P(e,n.key_);if(i===void 0||i!==n.draft_&&i!==n.base_&&i!==n.copy_||t!=null&&t.base_!==n.base_)return null;let a=n.parent_.type_===3,o;if(a){let e=n.parent_;o=Array.from(e.drafts_.keys()).indexOf(n.key_)}else o=n.key_;if(!(a&&e.size>o||N(e,o)))return null;r.push(o)}if(n.parent_)return e(n.parent_,r);r.reverse();try{t(n.copy_,r)}catch{return null}return r}function t(e,t){let n=e;for(let e=0;e<t.length-1;e++){let r=t[e];if(n=P(n,r),!z(n)||n===null)throw Error(`Cannot resolve path at '${t.join(`/`)}'`)}return n}let n=`replace`,r=`remove`;function i(e,t,n){if(e.scope_.processedForPatches_.has(e))return;e.scope_.processedForPatches_.add(e);let{patches_:r,inversePatches_:i}=n;switch(e.type_){case 0:case 2:return o(e,t,r,i);case 1:return a(e,t,r,i);case 3:return s(e,t,r,i)}}function a(e,t,i,a){let{base_:o,assigned_:s}=e,c=e.copy_;c.length<o.length&&([o,c]=[c,o],[i,a]=[a,i]);let l=e.allIndicesReassigned_===!0;for(let e=0;e<o.length;e++){let r=c[e],u=o[e];if((l||s?.get(e.toString()))&&r!==u){let o=r?.[C];if(o&&o.modified_)continue;let s=t.concat([e]);i.push({op:n,path:s,value:d(r)}),a.push({op:n,path:s,value:d(u)})}}for(let e=o.length;e<c.length;e++){let n=t.concat([e]);i.push({op:`add`,path:n,value:d(c[e])})}for(let e=c.length-1;o.length<=e;--e){let n=t.concat([e]);a.push({op:r,path:n})}}function o(e,t,i,a){let{base_:o,copy_:s,type_:c}=e;j(e.assigned_,(e,l)=>{let u=P(o,e,c),f=P(s,e,c),p=l?N(o,e)?n:`add`:r;if(u===f&&p===n)return;let m=t.concat(e);i.push(p===r?{op:p,path:m}:{op:p,path:m,value:d(f)}),a.push(p===`add`?{op:r,path:m}:p===r?{op:`add`,path:m,value:d(u)}:{op:n,path:m,value:d(u)})})}function s(e,t,n,i){let{base_:a,copy_:o}=e,s=0;a.forEach(e=>{if(!o.has(e)){let a=t.concat([s]);n.push({op:r,path:a,value:e}),i.unshift({op:`add`,path:a,value:e})}s++}),s=0,o.forEach(e=>{if(!a.has(e)){let a=t.concat([s]);n.push({op:`add`,path:a,value:e}),i.unshift({op:r,path:a,value:e})}s++})}function c(e,t,r){let{patches_:i,inversePatches_:a}=r;i.push({op:n,path:[],value:t===ne?void 0:t}),a.push({op:n,path:[],value:e})}function l(e,t){return t.forEach(t=>{let{path:i,op:a}=t,o=e;for(let e=0;e<i.length-1;e++){let t=M(o),n=i[e];typeof n!=`string`&&typeof n!=`number`&&(n=``+n),(t===0||t===1)&&(n===`__proto__`||n===re)&&w(19),B(o)&&n===D&&w(19),o=P(o,n),z(o)||w(18,i.join(`/`))}let s=M(o),c=u(t.value),l=i[i.length-1];switch(a){case n:switch(s){case 2:return o.set(l,c);case 3:w(16);default:return o[l]=c}case`add`:switch(s){case 1:return l===`-`?o.push(c):o.splice(l,0,c);case 2:return o.set(l,c);case 3:return o.add(c);default:return o[l]=c}case r:switch(s){case 1:return o.splice(l,1);case 2:return o.delete(l);case 3:return o.delete(t.value);default:return delete o[l]}default:w(17,a)}}),e}function u(e){if(!A(e))return e;if(I(e))return e.map(u);if(L(e))return new Map(Array.from(e.entries()).map(([e,t])=>[e,u(t)]));if(R(e))return new Set(Array.from(e).map(u));let t=Object.create(E(e));for(let n in e)t[n]=u(e[n]);return N(e,S)&&(t[S]=e[S]),t}function d(e){return k(e)?u(e):e}Se(K,{applyPatches_:l,generatePatches_:i,generateReplacementPatches_:c,getPath:e})}function Ze(){class e extends Map{constructor(e,t){super(),this[C]={type_:2,parent_:t,scope_:t?t.scope_:Ce(),modified_:!1,finalized_:!1,copy_:void 0,assigned_:void 0,base_:e,draft_:this,isManual_:!1,revoked_:!1,callbacks_:[]}}get size(){return V(this[C]).size}has(e){return V(this[C]).has(e)}set(e,t){let r=this[C];return o(r),(!V(r).has(e)||V(r).get(e)!==t)&&(n(r),Z(r),r.assigned_.set(e,!0),r.copy_.set(e,t),r.assigned_.set(e,!0),Le(r,e,t)),this}delete(e){if(!this.has(e))return!1;let t=this[C];return o(t),n(t),Z(t),t.base_.has(e)?t.assigned_.set(e,!1):t.assigned_.delete(e),t.copy_.delete(e),!0}clear(){let e=this[C];o(e),V(e).size&&(n(e),Z(e),e.assigned_=new Map,j(e.base_,t=>{e.assigned_.set(t,!1)}),e.copy_.clear())}forEach(e,t){let n=this[C];V(n).forEach((n,r,i)=>{e.call(t,this.get(r),r,this)})}get(e){let t=this[C];o(t);let r=V(t).get(e);if(t.finalized_||!A(r)||r!==t.base_.get(e))return r;let i=qe(t.scope_,r,t,e);return n(t),t.copy_.set(e,i),i}keys(){return V(this[C]).keys()}values(){let e=this.keys();return{[Symbol.iterator]:()=>this.values(),next:()=>{let t=e.next();return t.done?t:{done:!1,value:this.get(t.value)}}}}entries(){let e=this.keys();return{[Symbol.iterator]:()=>this.entries(),next:()=>{let t=e.next();if(t.done)return t;let n=this.get(t.value);return{done:!1,value:[t.value,n]}}}}[Symbol.iterator](){return this.entries()}}function t(t,n){let r=new e(t,n);return[r,r[C]]}function n(e){e.copy_||=(e.assigned_=new Map,new Map(e.base_))}class r extends Set{constructor(e,t){super(),this[C]={type_:3,parent_:t,scope_:t?t.scope_:Ce(),modified_:!1,finalized_:!1,copy_:void 0,base_:e,draft_:this,drafts_:new Map,revoked_:!1,isManual_:!1,assigned_:void 0,callbacks_:[]}}get size(){return V(this[C]).size}has(e){let t=this[C];return o(t),t.copy_?!!(t.copy_.has(e)||t.drafts_.has(e)&&t.copy_.has(t.drafts_.get(e))):t.base_.has(e)}add(e){let t=this[C];return o(t),this.has(e)||(a(t),Z(t),t.copy_.add(e),Le(t,e,e)),this}delete(e){if(!this.has(e))return!1;let t=this[C];return o(t),a(t),Z(t),t.copy_.delete(e)||(t.drafts_.has(e)?t.copy_.delete(t.drafts_.get(e)):!1)}clear(){let e=this[C];o(e),V(e).size&&(a(e),Z(e),e.copy_.clear())}values(){let e=this[C];return o(e),a(e),e.copy_.values()}entries(){let e=this[C];return o(e),a(e),e.copy_.entries()}keys(){return this.values()}[Symbol.iterator](){return this.values()}forEach(e,t){let n=this.values(),r=n.next();for(;!r.done;)e.call(t,r.value,r.value,this),r=n.next()}}function i(e,t){let n=new r(e,t);return[n,n[C]]}function a(e){e.copy_||(e.copy_=new Set,e.base_.forEach(t=>{if(A(t)){let n=qe(e.scope_,t,e,t);e.drafts_.set(t,n),e.copy_.add(n)}else e.copy_.add(t)}))}function o(e){e.revoked_&&w(3,JSON.stringify(V(e)))}function s(e){if(e.type_===3&&e.copy_){let t=new Set(e.copy_);e.copy_.clear(),t.forEach(t=>{e.copy_.add(he(t))})}}Se(G,{proxyMap_:t,proxySet_:i,fixSetContents:s})}var Q=new Ke,$=Q.produce,Qe=Q.produceWithPatches.bind(Q),$e=Q.applyPatches.bind(Q),et=Q.createDraft.bind(Q),tt=Q.finishDraft.bind(Q),nt={class:`demo-field-row`},rt={class:`demo-field-controls`},it={class:`todo-list`},at={class:`todo-item__meta`},ot={class:`demo-log-block`},st={key:0,class:`code-block`},ct={key:1,class:`muted`},lt={class:`demo-field-row`},ut={class:`demo-field-controls`},dt={class:`code-block code-block--state`},ft={class:`demo-log-block`},pt={key:0,class:`code-block`},mt={key:1,class:`muted`},ht={class:`demo-counter`},gt={class:`demo-counter__display`},_t={class:`demo-counter__value`},vt={class:`demo-field-controls`},yt={class:`muted`,style:{"margin-top":`14px`}},bt={class:`demo-history`},xt={class:`demo-field-stack`},St={class:`demo-field-row`},Ct={class:`demo-field-controls`},wt={class:`demo-field-row`},Tt={class:`demo-field-controls`},Et={class:`demo-field-row`},Dt={class:`demo-field-controls`},Ot={class:`demo-field-row`},kt={class:`demo-field-controls`},At={class:`demo-log`},jt={class:`code-block code-block--state`},Mt={class:`demo-log-block`},Nt={class:`code-block`},Pt={class:`demo-field-row`},Ft={class:`demo-field-controls`},It={class:`demo-pill-row`},Lt={key:0,class:`muted`},Rt={class:`demo-field-row`},zt={class:`demo-field-controls`},Bt={class:`demo-pill-row`},Vt={key:0,class:`muted`},Ht={class:`demo-field-row`},Ut={class:`demo-field-controls`},Wt={class:`code-block code-block--state`},Gt={class:`demo-field-stack demo-field-stack--follow`},Kt={class:`demo-field-row`},qt={class:`demo-field-controls`},Jt={key:0,class:`code-block`,style:{"margin-top":`12px`}},Yt={class:`demo-field-row`},Xt={class:`demo-field-controls`},Zt={class:`code-block code-block--state`},Qt=g(ee({__name:`playground`,setup(n){e(()=>{Ze(),Xe()});let g=d([H({id:1,title:`Learn TypeScript`,done:!0}),H({id:2,title:`Try Immer`,done:!1}),H({id:3,title:`Tweet about it`,done:!1})]),v=m([]),ee=m(``),ne=4;function C(e,t,n){v.value.unshift(`${e}  |  prev === next ? ${t===n}  |  prev[0] === next[0] ? ${t[0]===n[0]}`),v.value.length>6&&(v.value.length=6)}function w(){let e=ee.value.trim();if(!e){x.warning(`请输入标题`);return}let t=g.value;g.value=$(t,t=>{t.push({id:ne++,title:e,done:!1})}),C(`add`,t,g.value),ee.value=``}function T(e){let t=g.value;g.value=$(t,t=>{let n=t.find(t=>t.id===e);n&&(n.done=!n.done)}),C(`toggle #${e}`,t,g.value)}function E(e){let t=g.value;g.value=$(t,t=>{let n=t.findIndex(t=>t.id===e);n!==-1&&t.splice(n,1)}),C(`remove #${e}`,t,g.value)}function re(){try{g.value[0].title=`直接改我！`,x.warning(`意外没抛错（请检查 autoFreeze）`)}catch(e){x.success(`抛错（符合预期）：${e.message.split(`
`)[0]}`)}}let D=m(H({profile:{name:`Alice`,email:`alice@example.com`},preferences:{theme:`light`,notifications:{email:!0,push:!1}},tags:[`admin`,`beta`]},!0)),ie=d(D.value),O=m([]);function ae(){let e=D.value;D.value=$(e,e=>{e.profile.name=e.profile.name===`Alice`?`Bob`:`Alice`}),ce(`profile.name`,e)}function oe(){let e=D.value;D.value=$(e,e=>{e.preferences.theme=e.preferences.theme===`light`?`dark`:`light`}),ce(`preferences.theme`,e)}function A(){let e=D.value;D.value=$(e,e=>{e.preferences.notifications.push=!e.preferences.notifications.push}),ce(`preferences.notifications.push`,e)}function se(){let e=D.value;D.value=$(e,e=>{e.tags.push(`tag-${e.tags.length+1}`)}),ce(`tags[]`,e)}function ce(e,t){let n=D.value,r=[`${e}：`,`  profile === ?         ${t.profile===n.profile}`,`  preferences === ?     ${t.preferences===n.preferences}`,`  notifications === ?   ${t.preferences.notifications===n.preferences.notifications}`,`  tags === ?            ${t.tags===n.tags}`];O.value.unshift(r.join(`
`)),O.value.length>4&&(O.value.length=4),ie.value=n}let le=$((e,t)=>{switch(t.type){case`INC`:e.history.push(e.count),e.count+=1;break;case`DEC`:e.history.push(e.count),--e.count;break;case`ADD`:e.history.push(e.count),e.count+=t.payload;break;case`RESET`:e.count=0,e.history.length=0;break}}),j=m({count:0,history:[]}),M=m(5);function N(e){j.value=le(j.value,e)}let P=m({title:`我的文档`,body:`Hello Immer！`,tags:[`notes`]}),F=m(``),de=m(``),I=m(``),L=l({stack:[],cursor:-1});function R(e,t){let[n,r,i]=Qe(P.value,t);r.length&&(L.cursor<L.stack.length-1&&L.stack.splice(L.cursor+1),L.stack.push({label:e,patches:r,inverse:i}),L.cursor=L.stack.length-1,P.value=n)}function z(){let e=F.value.trim();e&&(R(`title="${e}"`,t=>{t.title=e}),F.value=``)}function B(){let e=de.value;e&&(R(`body=…`,t=>{t.body=e}),de.value=``)}function fe(){let e=I.value.trim();e&&(R(`+tag "${e}"`,t=>{t.tags.push(e)}),I.value=``)}function pe(e){R(`-tag[${e}]`,t=>{t.tags.splice(e,1)})}function me(){if(L.cursor<0)return;let e=L.stack[L.cursor];P.value=$e(P.value,e.inverse),L.cursor--}function V(){if(L.cursor>=L.stack.length-1)return;L.cursor++;let e=L.stack[L.cursor];P.value=$e(P.value,e.patches)}let he=_(()=>L.cursor>=0),ge=_(()=>L.cursor<L.stack.length-1),_e=_(()=>{if(L.cursor<0)return`— 暂无 patch —`;let e=L.stack[L.cursor];return[`# ${e.label}`,`patches:`,JSON.stringify(e.patches,null,2),`inversePatches:`,JSON.stringify(e.inverse,null,2)].join(`
`)}),ve=d(new Map([[`apple`,3],[`banana`,5]])),U=d(new Set([`admin`,`beta`])),W=m(``),G=m(1),K=m(``);function ye(){let e=W.value.trim();if(!e)return;let t=G.value;ve.value=$(ve.value,n=>{n.set(e,t)}),W.value=``}function be(e){ve.value=$(ve.value,t=>{t.delete(e)})}function q(){let e=K.value.trim();e&&(U.value=$(U.value,t=>{t.add(e)}),K.value=``)}function xe(e){U.value=$(U.value,t=>{t.delete(e)})}let Se=_(()=>[...ve.value.entries()]),J=_(()=>[...U.value]);class Ce{static[S]=!0;id;title;pinned;constructor(e,t,n=!1){this.id=e,this.title=t,this.pinned=n}togglePin(){this.pinned=!this.pinned}}let Y=m(new Ce(1,`欢迎使用 Immer`));function we(){Y.value=$(Y.value,e=>{e.togglePin()})}function Te(){Y.value=$(Y.value,e=>{e.title=`Note 更新于 ${new Date().toLocaleTimeString()}`})}let Ee=_(()=>Y.value instanceof Ce),De=m(JSON.stringify({user:{name:`Alice`},tags:[`a`,`b`]},null,2)),Oe=m(``);function ke(){try{let e=JSON.parse(De.value),t=[];$(e,n=>{t.push(`isDraft(draft):       ${k(n)}`),t.push(`isDraft(base):        ${k(e)}`),n.user&&(n.user.name=`Bob`),Array.isArray(n.tags)&&n.tags.push(`c`),t.push(`current(draft):       ${JSON.stringify(Je(n))}`),t.push(`original(draft):      ${JSON.stringify(ue(n))}`),t.push(`original === base:    ${ue(n)===e}`)}),Oe.value=t.join(`
`)}catch(e){Oe.value=`解析/执行失败：${e.message}`}}let X=m({loading:!1,user:null,error:null});async function Ae(){X.value=$(X.value,e=>{e.loading=!0,e.user=null,e.error=null});try{let e=et(X.value);await new Promise(e=>setTimeout(e,600)),e.user=`Alice (${new Date().toLocaleTimeString()})`,e.loading=!1,X.value=tt(e)}catch(e){X.value=$(X.value,t=>{t.loading=!1,t.error=e.message})}}return(e,n)=>{let l=r(`el-input`),d=r(`el-button`),m=r(`el-divider`),_=r(`el-checkbox`),x=r(`el-card`),ne=r(`el-input-number`),S=r(`el-tag`);return b(),f(`div`,null,[s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[13]||=[c(`span`,{class:`demo-section__title`},`基础：produce + Todo 列表`,-1)]]),default:h(()=>[n[19]||=c(`p`,{class:`demo-hint`},[y(` 每次点击都会调用 `),c(`code`,null,`produce`),y(` 产生新数组；未变动的子项保持引用相等。 `)],-1),c(`div`,nt,[n[16]||=c(`span`,{class:`demo-field-label`},`新建`,-1),c(`div`,rt,[s(l,{modelValue:ee.value,"onUpdate:modelValue":n[0]||=e=>ee.value=e,size:`small`,placeholder:`输入标题…`,class:`demo-input-fixed`,onKeyup:te(w,[`enter`])},null,8,[`modelValue`]),s(d,{size:`small`,type:`primary`,onClick:w},{default:h(()=>[...n[14]||=[y(`添加`,-1)]]),_:1}),s(m,{direction:`vertical`,class:`demo-field-divider`}),s(d,{size:`small`,onClick:re},{default:h(()=>[...n[15]||=[y(`尝试直接修改（应抛错）`,-1)]]),_:1})])]),c(`ul`,it,[(b(!0),f(o,null,i(g.value,e=>(b(),f(`li`,{key:e.id,class:`todo-item`},[s(_,{"model-value":e.done,size:`small`,onChange:t=>T(e.id)},null,8,[`model-value`,`onChange`]),c(`span`,{class:t([`todo-item__title`,{done:e.done}])},a(e.title),3),c(`span`,at,`#`+a(e.id),1),s(d,{size:`small`,link:``,onClick:t=>E(e.id)},{default:h(()=>[...n[17]||=[y(`删除`,-1)]]),_:1},8,[`onClick`])]))),128))]),s(m),c(`div`,ot,[n[18]||=c(`div`,{class:`demo-log-block__title`},`引用对比日志（最新 6 条）`,-1),v.value.length?(b(),f(`pre`,st,[c(`code`,null,a(v.value.join(`
`)),1)])):(b(),f(`p`,ct,`操作 todo 后会显示前后状态的引用比对。`))])]),_:1}),s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[20]||=[c(`span`,{class:`demo-section__title`},`嵌套对象 & 结构共享`,-1)]]),default:h(()=>[n[27]||=c(`p`,{class:`demo-hint`},` 修改深层字段时，未触及的兄弟节点保持原引用——这是 Immer 区别于深拷贝的关键。 `,-1),c(`div`,lt,[n[25]||=c(`span`,{class:`demo-field-label`},`操作`,-1),c(`div`,ut,[s(d,{size:`small`,type:`primary`,onClick:ae},{default:h(()=>[...n[21]||=[y(`切换 name`,-1)]]),_:1}),s(d,{size:`small`,onClick:oe},{default:h(()=>[...n[22]||=[y(`切换 theme`,-1)]]),_:1}),s(d,{size:`small`,onClick:A},{default:h(()=>[...n[23]||=[y(`切换 notifications.push`,-1)]]),_:1}),s(d,{size:`small`,onClick:se},{default:h(()=>[...n[24]||=[y(`追加 tag`,-1)]]),_:1})])]),c(`pre`,dt,[c(`code`,null,a(JSON.stringify(D.value,null,2)),1)]),c(`div`,ft,[n[26]||=c(`div`,{class:`demo-log-block__title`},`引用对比日志（最新 4 次）`,-1),O.value.length?(b(),f(`pre`,pt,[c(`code`,null,a(O.value.join(`

`)),1)])):(b(),f(`p`,mt,`操作后会显示哪些子树被替换、哪些保留了原引用。`))])]),_:1}),s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[28]||=[c(`span`,{class:`demo-section__title`},`柯里化 producer：(state, action) => nextState`,-1)]]),default:h(()=>[n[35]||=c(`p`,{class:`demo-hint`},[y(` 把 `),c(`code`,null,`produce`),y(` 当成 reducer 工厂——非常适合 Redux / Pinia 风格的 store。 `)],-1),c(`div`,ht,[c(`div`,gt,[n[29]||=c(`span`,{class:`demo-counter__label`},`count`,-1),c(`span`,_t,a(j.value.count),1)]),c(`div`,vt,[s(d,{size:`small`,onClick:n[1]||=e=>N({type:`DEC`})},{default:h(()=>[...n[30]||=[y(`−`,-1)]]),_:1}),s(d,{size:`small`,type:`primary`,onClick:n[2]||=e=>N({type:`INC`})},{default:h(()=>[...n[31]||=[y(`+`,-1)]]),_:1}),s(m,{direction:`vertical`,class:`demo-field-divider`}),s(ne,{modelValue:M.value,"onUpdate:modelValue":n[3]||=e=>M.value=e,size:`small`,controls:!1,class:`demo-input-fixed-sm`},null,8,[`modelValue`]),s(d,{size:`small`,onClick:n[4]||=e=>N({type:`ADD`,payload:M.value})},{default:h(()=>[...n[32]||=[y(` +N `,-1)]]),_:1}),s(m,{direction:`vertical`,class:`demo-field-divider`}),s(d,{size:`small`,onClick:n[5]||=e=>N({type:`RESET`})},{default:h(()=>[...n[33]||=[y(`重置`,-1)]]),_:1})])]),c(`p`,yt,[n[34]||=y(` history（自动随每次 dispatch 追加）： `,-1),c(`span`,bt,`[`+a(j.value.history.join(`, `))+`]`,1)])]),_:1}),s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[36]||=[c(`span`,{class:`demo-section__title`},`JSON Patches：撤销 / 重做`,-1)]]),default:h(()=>[n[47]||=c(`p`,{class:`demo-hint`},[y(` 每次修改通过 `),c(`code`,null,`produceWithPatches`),y(` 同时生成正向和逆向 patch；保存到栈即可时光穿梭。 `)],-1),c(`div`,xt,[c(`div`,St,[n[38]||=c(`span`,{class:`demo-field-label`},`title`,-1),c(`div`,Ct,[s(l,{modelValue:F.value,"onUpdate:modelValue":n[6]||=e=>F.value=e,size:`small`,placeholder:P.value.title,class:`demo-input-fixed`,onKeyup:te(z,[`enter`])},null,8,[`modelValue`,`placeholder`]),s(d,{size:`small`,type:`primary`,onClick:z},{default:h(()=>[...n[37]||=[y(`应用`,-1)]]),_:1})])]),c(`div`,wt,[n[40]||=c(`span`,{class:`demo-field-label`},`body`,-1),c(`div`,Tt,[s(l,{modelValue:de.value,"onUpdate:modelValue":n[7]||=e=>de.value=e,size:`small`,placeholder:P.value.body,class:`demo-input-fixed`,onKeyup:te(B,[`enter`])},null,8,[`modelValue`,`placeholder`]),s(d,{size:`small`,type:`primary`,onClick:B},{default:h(()=>[...n[39]||=[y(`应用`,-1)]]),_:1})])]),c(`div`,Et,[n[42]||=c(`span`,{class:`demo-field-label`},`tags`,-1),c(`div`,Dt,[(b(!0),f(o,null,i(P.value.tags,(e,t)=>(b(),u(S,{key:`${e}-${t}`,size:`small`,"disable-transitions":!0,closable:``,onClose:e=>pe(t)},{default:h(()=>[y(a(e),1)]),_:2},1032,[`onClose`]))),128)),s(l,{modelValue:I.value,"onUpdate:modelValue":n[8]||=e=>I.value=e,size:`small`,placeholder:`新 tag`,class:`demo-input-fixed-sm`,onKeyup:te(fe,[`enter`])},null,8,[`modelValue`]),s(d,{size:`small`,onClick:fe},{default:h(()=>[...n[41]||=[y(`添加`,-1)]]),_:1})])]),c(`div`,Ot,[n[45]||=c(`span`,{class:`demo-field-label`},`历史`,-1),c(`div`,kt,[s(d,{size:`small`,disabled:!he.value,onClick:me},{default:h(()=>[...n[43]||=[y(`← 撤销`,-1)]]),_:1},8,[`disabled`]),s(d,{size:`small`,disabled:!ge.value,onClick:V},{default:h(()=>[...n[44]||=[y(`重做 →`,-1)]]),_:1},8,[`disabled`]),c(`span`,At,` cursor `+a(L.cursor+1)+` / `+a(L.stack.length),1)])])]),c(`pre`,jt,[c(`code`,null,a(JSON.stringify(P.value,null,2)),1)]),c(`div`,Mt,[n[46]||=c(`div`,{class:`demo-log-block__title`},`最近一次 patches`,-1),c(`pre`,Nt,[c(`code`,null,a(_e.value),1)])])]),_:1}),s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[48]||=[c(`span`,{class:`demo-section__title`},`Map / Set（需 enableMapSet）`,-1)]]),default:h(()=>[n[55]||=c(`p`,{class:`demo-hint`},[y(` 在 `),c(`code`,null,`recipe`),y(` 内 `),c(`code`,null,`set/get/delete/add`),y(` 都能正常工作。 `)],-1),c(`div`,Pt,[n[50]||=c(`span`,{class:`demo-field-label`},`Map`,-1),c(`div`,Ft,[s(l,{modelValue:W.value,"onUpdate:modelValue":n[9]||=e=>W.value=e,size:`small`,placeholder:`key`,class:`demo-input-fixed-sm`},null,8,[`modelValue`]),s(ne,{modelValue:G.value,"onUpdate:modelValue":n[10]||=e=>G.value=e,size:`small`,controls:!1,class:`demo-input-fixed-sm`},null,8,[`modelValue`]),s(d,{size:`small`,type:`primary`,onClick:ye},{default:h(()=>[...n[49]||=[y(`set`,-1)]]),_:1})])]),c(`div`,It,[(b(!0),f(o,null,i(Se.value,([e,t])=>(b(),f(`span`,{key:e,class:`demo-pill`},[y(a(e)+` = `+a(t)+` `,1),s(d,{size:`small`,link:``,onClick:t=>be(e)},{default:h(()=>[...n[51]||=[y(`×`,-1)]]),_:1},8,[`onClick`])]))),128)),Se.value.length?p(``,!0):(b(),f(`span`,Lt,`空 Map`))]),s(m),c(`div`,Rt,[n[53]||=c(`span`,{class:`demo-field-label`},`Set`,-1),c(`div`,zt,[s(l,{modelValue:K.value,"onUpdate:modelValue":n[11]||=e=>K.value=e,size:`small`,placeholder:`item`,class:`demo-input-fixed`,onKeyup:te(q,[`enter`])},null,8,[`modelValue`]),s(d,{size:`small`,type:`primary`,onClick:q},{default:h(()=>[...n[52]||=[y(`add`,-1)]]),_:1})])]),c(`div`,Bt,[(b(!0),f(o,null,i(J.value,e=>(b(),f(`span`,{key:e,class:`demo-pill`},[y(a(e)+` `,1),s(d,{size:`small`,link:``,onClick:t=>xe(e)},{default:h(()=>[...n[54]||=[y(`×`,-1)]]),_:1},8,[`onClick`])]))),128)),J.value.length?p(``,!0):(b(),f(`span`,Vt,`空 Set`))])]),_:1}),s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[56]||=[c(`span`,{class:`demo-section__title`},`Class & immerable`,-1)]]),default:h(()=>[n[60]||=c(`p`,{class:`demo-hint`},[y(` 在类上设 `),c(`code`,null,`static [immerable] = true`),y(` 后，`),c(`code`,null,`produce`),y(` 会 保留 prototype，调用方法/赋值字段都会被记录。 `)],-1),c(`div`,Ht,[n[59]||=c(`span`,{class:`demo-field-label`},`操作`,-1),c(`div`,Ut,[s(d,{size:`small`,type:`primary`,onClick:we},{default:h(()=>[...n[57]||=[y(` togglePin `,-1)]]),_:1}),s(d,{size:`small`,onClick:Te},{default:h(()=>[...n[58]||=[y(`rename`,-1)]]),_:1})])]),c(`pre`,Wt,[c(`code`,null,`id:       `+a(Y.value.id)+`
title:    `+a(Y.value.title)+`
pinned:   `+a(Y.value.pinned)+`
是否仍是 Note 实例： `+a(Ee.value),1)])]),_:1}),s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[61]||=[c(`span`,{class:`demo-section__title`},`original / current / isDraft`,-1)]]),default:h(()=>[n[64]||=c(`p`,{class:`demo-hint`},[y(` 在 `),c(`code`,null,`recipe`),y(` 内可调用 `),c(`code`,null,`current(draft)`),y(` 取快照、 `),c(`code`,null,`original(draft)`),y(` 取原值、`),c(`code`,null,`isDraft`),y(` 判断身份。 `)],-1),s(l,{modelValue:De.value,"onUpdate:modelValue":n[12]||=e=>De.value=e,type:`textarea`,autosize:{minRows:4,maxRows:8},placeholder:`JSON 形式的 base state`},null,8,[`modelValue`]),c(`div`,Gt,[c(`div`,Kt,[n[63]||=c(`span`,{class:`demo-field-label`},`操作`,-1),c(`div`,qt,[s(d,{size:`small`,type:`primary`,onClick:ke},{default:h(()=>[...n[62]||=[y(`运行`,-1)]]),_:1})])])]),Oe.value?(b(),f(`pre`,Jt,[c(`code`,null,a(Oe.value),1)])):p(``,!0)]),_:1}),s(x,{class:`demo-section`,shadow:`never`},{header:h(()=>[...n[65]||=[c(`span`,{class:`demo-section__title`},`异步 recipe`,-1)]]),default:h(()=>[n[68]||=c(`p`,{class:`demo-hint`},[y(` recipe 可以是 async 函数；下例先把 `),c(`code`,null,`loading`),y(` 置 true，等待 600ms 后写入 user。 `)],-1),c(`div`,Yt,[n[67]||=c(`span`,{class:`demo-field-label`},`操作`,-1),c(`div`,Xt,[s(d,{size:`small`,type:`primary`,loading:X.value.loading,onClick:Ae},{default:h(()=>[...n[66]||=[y(` 模拟拉取 user `,-1)]]),_:1},8,[`loading`])])]),c(`pre`,Zt,[c(`code`,null,a(JSON.stringify(X.value,null,2)),1)])]),_:1})])}}}),[[`__scopeId`,`data-v-641dd74f`]]),$t=`<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import {
  applyPatches,
  createDraft,
  current,
  enableMapSet,
  enablePatches,
  finishDraft,
  freeze,
  immerable,
  isDraft,
  original,
  produce,
  produceWithPatches,
  type Patch,
} from 'immer';

onMounted(() => {
  enableMapSet();
  enablePatches();
});

// ── 基础 Todo 列表 ──

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const todos = shallowRef<readonly Todo[]>([
  freeze({ id: 1, title: 'Learn TypeScript', done: true }),
  freeze({ id: 2, title: 'Try Immer', done: false }),
  freeze({ id: 3, title: 'Tweet about it', done: false }),
] as const);

const todoLogs = ref<string[]>([]);
const newTodoTitle = ref('');
let nextTodoId = 4;

function logTodos(label: string, prev: readonly Todo[], next: readonly Todo[]) {
  todoLogs.value.unshift(
    \`\${label}  |  prev === next ? \${prev === next}  |  prev[0] === next[0] ? \${prev[0] === next[0]}\`,
  );
  if (todoLogs.value.length > 6) todoLogs.value.length = 6;
}

function addTodo() {
  const title = newTodoTitle.value.trim();
  if (!title) {
    ElMessage.warning('请输入标题');
    return;
  }
  const prev = todos.value;
  todos.value = produce(prev, (draft) => {
    draft.push({ id: nextTodoId++, title, done: false });
  });
  logTodos('add', prev, todos.value);
  newTodoTitle.value = '';
}

function toggleTodo(id: number) {
  const prev = todos.value;
  todos.value = produce(prev, (draft) => {
    const t = draft.find((x) => x.id === id);
    if (t) t.done = !t.done;
  });
  logTodos(\`toggle #\${id}\`, prev, todos.value);
}

function removeTodo(id: number) {
  const prev = todos.value;
  todos.value = produce(prev, (draft) => {
    const idx = draft.findIndex((x) => x.id === id);
    if (idx !== -1) draft.splice(idx, 1);
  });
  logTodos(\`remove #\${id}\`, prev, todos.value);
}

function tryDirectMutate() {
  try {
    (todos.value[0] as Todo).title = '直接改我！';
    ElMessage.warning('意外没抛错（请检查 autoFreeze）');
  } catch (e) {
    ElMessage.success(\`抛错（符合预期）：\${(e as Error).message.split('\\n')[0]}\`);
  }
}

// ── 嵌套对象更新 ──

interface UserSettings {
  profile: { name: string; email: string };
  preferences: { theme: 'light' | 'dark'; notifications: { email: boolean; push: boolean } };
  tags: string[];
}

const userSettings = ref<UserSettings>(
  freeze<UserSettings>({
    profile: { name: 'Alice', email: 'alice@example.com' },
    preferences: { theme: 'light', notifications: { email: true, push: false } },
    tags: ['admin', 'beta'],
  }, true),
);

const userSettingsBefore = shallowRef(userSettings.value);
const userPatchesLog = ref<string[]>([]);

function deepUpdateName() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.profile.name = draft.profile.name === 'Alice' ? 'Bob' : 'Alice';
  });
  recordSettingsChange('profile.name', prev);
}

function toggleTheme() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.preferences.theme = draft.preferences.theme === 'light' ? 'dark' : 'light';
  });
  recordSettingsChange('preferences.theme', prev);
}

function togglePush() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.preferences.notifications.push = !draft.preferences.notifications.push;
  });
  recordSettingsChange('preferences.notifications.push', prev);
}

function addTag() {
  const prev = userSettings.value;
  userSettings.value = produce(prev, (draft) => {
    draft.tags.push(\`tag-\${draft.tags.length + 1}\`);
  });
  recordSettingsChange('tags[]', prev);
}

function recordSettingsChange(field: string, prev: UserSettings) {
  const next = userSettings.value;
  const lines = [
    \`\${field}：\`,
    \`  profile === ?         \${prev.profile === next.profile}\`,
    \`  preferences === ?     \${prev.preferences === next.preferences}\`,
    \`  notifications === ?   \${prev.preferences.notifications === next.preferences.notifications}\`,
    \`  tags === ?            \${prev.tags === next.tags}\`,
  ];
  userPatchesLog.value.unshift(lines.join('\\n'));
  if (userPatchesLog.value.length > 4) userPatchesLog.value.length = 4;
  userSettingsBefore.value = next;
}

// ── 柯里化 reducer ──

interface CounterState {
  count: number;
  history: number[];
}

type CounterAction =
  | { type: 'INC' }
  | { type: 'DEC' }
  | { type: 'ADD'; payload: number }
  | { type: 'RESET' };

const counterReducer = produce<CounterState, [CounterAction]>(
  (draft, action) => {
    switch (action.type) {
      case 'INC':
        draft.history.push(draft.count);
        draft.count += 1;
        break;
      case 'DEC':
        draft.history.push(draft.count);
        draft.count -= 1;
        break;
      case 'ADD':
        draft.history.push(draft.count);
        draft.count += action.payload;
        break;
      case 'RESET':
        draft.count = 0;
        draft.history.length = 0;
        break;
    }
  },
);

const counterState = ref<CounterState>({ count: 0, history: [] });
const counterAdd = ref(5);

function dispatch(action: CounterAction) {
  counterState.value = counterReducer(counterState.value, action);
}

// ── JSON Patches & 撤销/重做 ──

interface DocState {
  title: string;
  body: string;
  tags: string[];
}

const docState = ref<DocState>({
  title: '我的文档',
  body: 'Hello Immer！',
  tags: ['notes'],
});
const docTitleInput = ref('');
const docBodyInput = ref('');
const docTagInput = ref('');

interface HistoryEntry {
  label: string;
  patches: Patch[];
  inverse: Patch[];
}

const docHistory = reactive<{ stack: HistoryEntry[]; cursor: number }>({
  stack: [],
  cursor: -1,
});

function applyDocChange(label: string, recipe: (d: DocState) => void) {
  const [next, patches, inverse] = produceWithPatches(docState.value, recipe);
  if (!patches.length) return;
  if (docHistory.cursor < docHistory.stack.length - 1) {
    docHistory.stack.splice(docHistory.cursor + 1);
  }
  docHistory.stack.push({ label, patches, inverse });
  docHistory.cursor = docHistory.stack.length - 1;
  docState.value = next;
}

function setDocTitle() {
  const t = docTitleInput.value.trim();
  if (!t) return;
  applyDocChange(\`title="\${t}"\`, (d) => { d.title = t; });
  docTitleInput.value = '';
}

function setDocBody() {
  const b = docBodyInput.value;
  if (!b) return;
  applyDocChange('body=…', (d) => { d.body = b; });
  docBodyInput.value = '';
}

function addDocTag() {
  const t = docTagInput.value.trim();
  if (!t) return;
  applyDocChange(\`+tag "\${t}"\`, (d) => { d.tags.push(t); });
  docTagInput.value = '';
}

function removeDocTag(idx: number) {
  applyDocChange(\`-tag[\${idx}]\`, (d) => { d.tags.splice(idx, 1); });
}

function undoDoc() {
  if (docHistory.cursor < 0) return;
  const entry = docHistory.stack[docHistory.cursor];
  docState.value = applyPatches(docState.value, entry.inverse);
  docHistory.cursor--;
}

function redoDoc() {
  if (docHistory.cursor >= docHistory.stack.length - 1) return;
  docHistory.cursor++;
  const entry = docHistory.stack[docHistory.cursor];
  docState.value = applyPatches(docState.value, entry.patches);
}

const canUndo = computed(() => docHistory.cursor >= 0);
const canRedo = computed(() => docHistory.cursor < docHistory.stack.length - 1);

const lastPatchView = computed(() => {
  if (docHistory.cursor < 0) return '— 暂无 patch —';
  const e = docHistory.stack[docHistory.cursor];
  return [
    \`# \${e.label}\`,
    'patches:',
    JSON.stringify(e.patches, null, 2),
    'inversePatches:',
    JSON.stringify(e.inverse, null, 2),
  ].join('\\n');
});

// ── Map / Set ──

const mapState = shallowRef<ReadonlyMap<string, number>>(
  new Map([
    ['apple', 3],
    ['banana', 5],
  ]),
);
const setState = shallowRef<ReadonlySet<string>>(new Set(['admin', 'beta']));

const mapKeyInput = ref('');
const mapValInput = ref(1);
const setItemInput = ref('');

function mapSet() {
  const key = mapKeyInput.value.trim();
  if (!key) return;
  const val = mapValInput.value;
  mapState.value = produce(mapState.value, (draft) => {
    draft.set(key, val);
  });
  mapKeyInput.value = '';
}

function mapDelete(key: string) {
  mapState.value = produce(mapState.value, (draft) => {
    draft.delete(key);
  });
}

function setAdd() {
  const item = setItemInput.value.trim();
  if (!item) return;
  setState.value = produce(setState.value, (draft) => {
    draft.add(item);
  });
  setItemInput.value = '';
}

function setDelete(item: string) {
  setState.value = produce(setState.value, (draft) => {
    draft.delete(item);
  });
}

const mapEntries = computed(() => [...mapState.value.entries()]);
const setItems = computed(() => [...setState.value]);

// ── Class & immerable ──

class Note {
  static [immerable] = true;

  id: number;
  title: string;
  pinned: boolean;

  constructor(id: number, title: string, pinned = false) {
    this.id = id;
    this.title = title;
    this.pinned = pinned;
  }

  togglePin() {
    this.pinned = !this.pinned;
  }
}

const noteState = ref<Note>(new Note(1, '欢迎使用 Immer'));

function togglePinViaProduce() {
  noteState.value = produce(noteState.value, (draft) => {
    draft.togglePin();
  });
}

function renameNote() {
  noteState.value = produce(noteState.value, (draft) => {
    draft.title = \`Note 更新于 \${new Date().toLocaleTimeString()}\`;
  });
}

const noteIsInstance = computed(() => noteState.value instanceof Note);

// ── original / current / isDraft ──

const inspectInput = ref(JSON.stringify({ user: { name: 'Alice' }, tags: ['a', 'b'] }, null, 2));
const inspectOutput = ref('');

type InspectShape = { user?: { name?: string }; tags?: unknown[]; [key: string]: unknown };

function runInspect() {
  try {
    const base = JSON.parse(inspectInput.value) as InspectShape;
    const lines: string[] = [];
    produce(base, (draft) => {
      lines.push(\`isDraft(draft):       \${isDraft(draft)}\`);
      lines.push(\`isDraft(base):        \${isDraft(base)}\`);
      if (draft.user) draft.user.name = 'Bob';
      if (Array.isArray(draft.tags)) draft.tags.push('c');
      lines.push(\`current(draft):       \${JSON.stringify(current(draft))}\`);
      lines.push(\`original(draft):      \${JSON.stringify(original(draft))}\`);
      lines.push(\`original === base:    \${original(draft) === base}\`);
    });
    inspectOutput.value = lines.join('\\n');
  } catch (e) {
    inspectOutput.value = \`解析/执行失败：\${(e as Error).message}\`;
  }
}

// ── 异步 recipe ──

const asyncState = ref<{ loading: boolean; user: string | null; error: string | null }>({
  loading: false,
  user: null,
  error: null,
});

async function runAsyncDemo() {
  asyncState.value = produce(asyncState.value, (d) => {
    d.loading = true;
    d.user = null;
    d.error = null;
  });

  try {
    const draft = createDraft(asyncState.value);
    await new Promise((r) => setTimeout(r, 600));
    draft.user = \`Alice (\${new Date().toLocaleTimeString()})\`;
    draft.loading = false;
    asyncState.value = finishDraft(draft);
  } catch (e) {
    asyncState.value = produce(asyncState.value, (d) => {
      d.loading = false;
      d.error = (e as Error).message;
    });
  }
}
<\/script>

<template>
  <div>
    <!-- ── 基础 Todo ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">基础：produce + Todo 列表</span>
      </template>
      <p class="demo-hint">
        每次点击都会调用 <code>produce</code> 产生新数组；未变动的子项保持引用相等。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">新建</span>
        <div class="demo-field-controls">
          <el-input
            v-model="newTodoTitle"
            size="small"
            placeholder="输入标题…"
            class="demo-input-fixed"
            @keyup.enter="addTodo"
          />
          <el-button size="small" type="primary" @click="addTodo">添加</el-button>
          <el-divider direction="vertical" class="demo-field-divider" />
          <el-button size="small" @click="tryDirectMutate">尝试直接修改（应抛错）</el-button>
        </div>
      </div>

      <ul class="todo-list">
        <li v-for="t in todos" :key="t.id" class="todo-item">
          <el-checkbox :model-value="t.done" size="small" @change="toggleTodo(t.id)" />
          <span class="todo-item__title" :class="{ done: t.done }">{{ t.title }}</span>
          <span class="todo-item__meta">#{{ t.id }}</span>
          <el-button size="small" link @click="removeTodo(t.id)">删除</el-button>
        </li>
      </ul>

      <el-divider />
      <div class="demo-log-block">
        <div class="demo-log-block__title">引用对比日志（最新 6 条）</div>
        <pre v-if="todoLogs.length" class="code-block"><code>{{ todoLogs.join('\\n') }}</code></pre>
        <p v-else class="muted">操作 todo 后会显示前后状态的引用比对。</p>
      </div>
    </el-card>

    <!-- ── 嵌套对象更新 ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">嵌套对象 & 结构共享</span>
      </template>
      <p class="demo-hint">
        修改深层字段时，未触及的兄弟节点保持原引用——这是 Immer 区别于深拷贝的关键。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">操作</span>
        <div class="demo-field-controls">
          <el-button size="small" type="primary" @click="deepUpdateName">切换 name</el-button>
          <el-button size="small" @click="toggleTheme">切换 theme</el-button>
          <el-button size="small" @click="togglePush">切换 notifications.push</el-button>
          <el-button size="small" @click="addTag">追加 tag</el-button>
        </div>
      </div>

      <pre class="code-block code-block--state"><code>{{ JSON.stringify(userSettings, null, 2) }}</code></pre>

      <div class="demo-log-block">
        <div class="demo-log-block__title">引用对比日志（最新 4 次）</div>
        <pre v-if="userPatchesLog.length" class="code-block"><code>{{ userPatchesLog.join('\\n\\n') }}</code></pre>
        <p v-else class="muted">操作后会显示哪些子树被替换、哪些保留了原引用。</p>
      </div>
    </el-card>

    <!-- ── 柯里化 reducer ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">柯里化 producer：(state, action) =&gt; nextState</span>
      </template>
      <p class="demo-hint">
        把 <code>produce</code> 当成 reducer 工厂——非常适合 Redux / Pinia 风格的 store。
      </p>
      <div class="demo-counter">
        <div class="demo-counter__display">
          <span class="demo-counter__label">count</span>
          <span class="demo-counter__value">{{ counterState.count }}</span>
        </div>
        <div class="demo-field-controls">
          <el-button size="small" @click="dispatch({ type: 'DEC' })">−</el-button>
          <el-button size="small" type="primary" @click="dispatch({ type: 'INC' })">+</el-button>
          <el-divider direction="vertical" class="demo-field-divider" />
          <el-input-number
            v-model="counterAdd"
            size="small"
            :controls="false"
            class="demo-input-fixed-sm"
          />
          <el-button size="small" @click="dispatch({ type: 'ADD', payload: counterAdd })">
            +N
          </el-button>
          <el-divider direction="vertical" class="demo-field-divider" />
          <el-button size="small" @click="dispatch({ type: 'RESET' })">重置</el-button>
        </div>
      </div>
      <p class="muted" style="margin-top: 14px">
        history（自动随每次 dispatch 追加）：
        <span class="demo-history">[{{ counterState.history.join(', ') }}]</span>
      </p>
    </el-card>

    <!-- ── Patches & Undo / Redo ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">JSON Patches：撤销 / 重做</span>
      </template>
      <p class="demo-hint">
        每次修改通过 <code>produceWithPatches</code> 同时生成正向和逆向 patch；保存到栈即可时光穿梭。
      </p>

      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">title</span>
          <div class="demo-field-controls">
            <el-input
              v-model="docTitleInput"
              size="small"
              :placeholder="docState.title"
              class="demo-input-fixed"
              @keyup.enter="setDocTitle"
            />
            <el-button size="small" type="primary" @click="setDocTitle">应用</el-button>
          </div>
        </div>

        <div class="demo-field-row">
          <span class="demo-field-label">body</span>
          <div class="demo-field-controls">
            <el-input
              v-model="docBodyInput"
              size="small"
              :placeholder="docState.body"
              class="demo-input-fixed"
              @keyup.enter="setDocBody"
            />
            <el-button size="small" type="primary" @click="setDocBody">应用</el-button>
          </div>
        </div>

        <div class="demo-field-row">
          <span class="demo-field-label">tags</span>
          <div class="demo-field-controls">
            <el-tag
              v-for="(tag, i) in docState.tags"
              :key="\`\${tag}-\${i}\`"
              size="small"
              :disable-transitions="true"
              closable
              @close="removeDocTag(i)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model="docTagInput"
              size="small"
              placeholder="新 tag"
              class="demo-input-fixed-sm"
              @keyup.enter="addDocTag"
            />
            <el-button size="small" @click="addDocTag">添加</el-button>
          </div>
        </div>

        <div class="demo-field-row">
          <span class="demo-field-label">历史</span>
          <div class="demo-field-controls">
            <el-button size="small" :disabled="!canUndo" @click="undoDoc">← 撤销</el-button>
            <el-button size="small" :disabled="!canRedo" @click="redoDoc">重做 →</el-button>
            <span class="demo-log">
              cursor {{ docHistory.cursor + 1 }} / {{ docHistory.stack.length }}
            </span>
          </div>
        </div>
      </div>

      <pre class="code-block code-block--state"><code>{{ JSON.stringify(docState, null, 2) }}</code></pre>

      <div class="demo-log-block">
        <div class="demo-log-block__title">最近一次 patches</div>
        <pre class="code-block"><code>{{ lastPatchView }}</code></pre>
      </div>
    </el-card>

    <!-- ── Map / Set ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Map / Set（需 enableMapSet）</span>
      </template>
      <p class="demo-hint">
        在 <code>recipe</code> 内 <code>set/get/delete/add</code> 都能正常工作。
      </p>

      <div class="demo-field-row">
        <span class="demo-field-label">Map</span>
        <div class="demo-field-controls">
          <el-input
            v-model="mapKeyInput"
            size="small"
            placeholder="key"
            class="demo-input-fixed-sm"
          />
          <el-input-number
            v-model="mapValInput"
            size="small"
            :controls="false"
            class="demo-input-fixed-sm"
          />
          <el-button size="small" type="primary" @click="mapSet">set</el-button>
        </div>
      </div>

      <div class="demo-pill-row">
        <span v-for="[k, v] in mapEntries" :key="k" class="demo-pill">
          {{ k }} = {{ v }}
          <el-button size="small" link @click="mapDelete(k)">×</el-button>
        </span>
        <span v-if="!mapEntries.length" class="muted">空 Map</span>
      </div>

      <el-divider />

      <div class="demo-field-row">
        <span class="demo-field-label">Set</span>
        <div class="demo-field-controls">
          <el-input
            v-model="setItemInput"
            size="small"
            placeholder="item"
            class="demo-input-fixed"
            @keyup.enter="setAdd"
          />
          <el-button size="small" type="primary" @click="setAdd">add</el-button>
        </div>
      </div>

      <div class="demo-pill-row">
        <span v-for="item in setItems" :key="item" class="demo-pill">
          {{ item }}
          <el-button size="small" link @click="setDelete(item)">×</el-button>
        </span>
        <span v-if="!setItems.length" class="muted">空 Set</span>
      </div>
    </el-card>

    <!-- ── Class & immerable ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Class & immerable</span>
      </template>
      <p class="demo-hint">
        在类上设 <code>static [immerable] = true</code> 后，<code>produce</code> 会
        保留 prototype，调用方法/赋值字段都会被记录。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">操作</span>
        <div class="demo-field-controls">
          <el-button size="small" type="primary" @click="togglePinViaProduce">
            togglePin
          </el-button>
          <el-button size="small" @click="renameNote">rename</el-button>
        </div>
      </div>
      <pre class="code-block code-block--state"><code>id:       {{ noteState.id }}
title:    {{ noteState.title }}
pinned:   {{ noteState.pinned }}
是否仍是 Note 实例： {{ noteIsInstance }}</code></pre>
    </el-card>

    <!-- ── original / current / isDraft ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">original / current / isDraft</span>
      </template>
      <p class="demo-hint">
        在 <code>recipe</code> 内可调用 <code>current(draft)</code> 取快照、
        <code>original(draft)</code> 取原值、<code>isDraft</code> 判断身份。
      </p>
      <el-input
        v-model="inspectInput"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 8 }"
        placeholder="JSON 形式的 base state"
      />
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runInspect">运行</el-button>
          </div>
        </div>
      </div>
      <pre v-if="inspectOutput" class="code-block" style="margin-top: 12px"><code>{{ inspectOutput }}</code></pre>
    </el-card>

    <!-- ── 异步 producer ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">异步 recipe</span>
      </template>
      <p class="demo-hint">
        recipe 可以是 async 函数；下例先把 <code>loading</code> 置 true，等待 600ms 后写入 user。
      </p>
      <div class="demo-field-row">
        <span class="demo-field-label">操作</span>
        <div class="demo-field-controls">
          <el-button
            size="small"
            type="primary"
            :loading="asyncState.loading"
            @click="runAsyncDemo"
          >
            模拟拉取 user
          </el-button>
        </div>
      </div>
      <pre class="code-block code-block--state"><code>{{ JSON.stringify(asyncState, null, 2) }}</code></pre>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.demo-section {
  margin-bottom: 24px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);

  :deep(.el-card__header) {
    padding: 16px 24px;
    background: var(--muted);
    border-bottom: 1px solid var(--border);
  }

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.demo-section__title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--foreground);
}

.demo-field-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.demo-field-stack--follow {
  margin-top: 14px;
}

.demo-field-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  column-gap: 16px;
}

.demo-field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-foreground);
  line-height: 1.35;
  text-align: right;
}

.demo-field-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 30px;
}

.demo-field-divider {
  flex-shrink: 0;
  align-self: center;
  height: 26px;
  margin: 0 4px;
}

.demo-input-fixed {
  width: 240px;
}

.demo-input-fixed-sm {
  width: 120px;
}

.demo-hint {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted-foreground);

  code {
    padding: 2px 6px;
    font-size: 12px;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 0;
    color: var(--foreground);
  }
}

.demo-log {
  font-size: 12px;
  color: var(--muted-foreground);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.muted {
  margin: 0;
  font-size: 12px;
  color: var(--muted-foreground);
}

.todo-list {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--border);
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;

  &:last-child {
    border-bottom: 0;
  }

  &__title {
    flex: 1;
    color: var(--foreground);

    &.done {
      color: var(--muted-foreground);
      text-decoration: line-through;
    }
  }

  &__meta {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    color: var(--muted-foreground);
  }
}

.demo-log-block {
  margin-top: 16px;

  &__title {
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted-foreground);
    font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
}

.code-block {
  margin: 0;
  padding: 16px 20px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  color: var(--foreground);
  background: var(--muted);
  border-radius: 0;
  border: 1px solid var(--border);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    white-space: pre;
  }
}

.code-block--state {
  margin-top: 16px;
  max-height: 320px;
}

.demo-counter {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.demo-counter__display {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--muted);
}

.demo-counter__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted-foreground);
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-counter__value {
  font-size: 24px;
  font-weight: 600;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-history {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--foreground);
}

.demo-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.demo-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0;
}
</style>
`;const en=JSON.parse(`{"title":"immer","description":"以「原地修改 draft」处理不可变状态","frontmatter":{"title":"immer","description":"以「原地修改 draft」处理不可变状态"},"headers":[],"relativePath":"libraries/immer/index.md","filePath":"libraries/immer/index.md"}`);var tn=ee({name:`libraries/immer/index.md`,setup(e){return(e,t)=>{let i=r(`ClientOnly`),a=r(`DemoBlock`);return b(),f(`div`,null,[t[0]||=v(`<h1 id="immer" tabindex="-1">immer <a class="header-anchor" href="#immer" aria-label="Permalink to “immer”">​</a></h1><p>以「原地修改 draft」的写法处理不可变数据。无需手写 <code>...spread</code>，无需引入新的数据结构，仅用普通 JS 对象/数组/Map/Set 即可获得结构共享、引用相等与自动冻结。</p><blockquote><p>安装：<code>npm install immer</code>　|　仓库：<a href="https://github.com/immerjs/immer" target="_blank" rel="noreferrer">github.com/immerjs/immer</a>　|　体积：~3 KB gzipped，零依赖</p></blockquote><h2 id="交互示例" tabindex="-1">交互示例 <a class="header-anchor" href="#交互示例" aria-label="Permalink to “交互示例”">​</a></h2><p>体验 Immer 的核心能力：原地修改 draft、结构共享、撤销/重做、Map/Set 与 Class 支持。</p>`,5),s(a,{title:`immer 综合示例`,description:`Todo 列表、嵌套对象结构共享、柯里化 reducer、JSON Patches 撤销重做、Map/Set、Class 与异步 recipe。`,source:n($t)},{default:h(()=>[s(i,null,{default:h(()=>[s(Qt)]),_:1})]),_:1},8,[`source`]),t[1]||=v(`<h2 id="简介" tabindex="-1">简介 <a class="header-anchor" href="#简介" aria-label="Permalink to “简介”">​</a></h2><p>Immer 的核心思想是把「对当前状态打个补丁，得到下一态」这一过程拆成两步：你在 <code>recipe</code> 函数里面对一个临时的 <code>draft</code> 自由「修改」——增删字段、push、splice、sort 都行——Immer 会用代理记录这些修改，最终基于 base state 产出一份既保留共享部分、又独立于原状态的不可变结果。</p><ul><li>普通 JS 对象、数组、<code>Map</code>、<code>Set</code> 直接可用。</li><li>结构共享：未变动的子树继续共享引用，<code>===</code> 仍然成立。</li><li>自动冻结：返回值默认 deep frozen，意外修改会抛错。</li><li>支持 JSON Patch / 逆 Patch，天然适合 undo / redo / 协同。</li><li>体积极小（~3 KB gzipped），TypeScript 支持完整。</li></ul><h2 id="安装" tabindex="-1">安装 <a class="header-anchor" href="#安装" aria-label="Permalink to “安装”">​</a></h2><div class="language-bash line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> immer</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> immer</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> immer</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>从 v6 起，Map/Set 与 Patch 支持采用按需启用，需要时分别调用 <code>enableMapSet()</code> / <code>enablePatches()</code>。</p><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to “快速开始”">​</a></h2><p>基础示例：把第二项标记为已完成，并追加一项新 todo。</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> baseState</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Learn TypeScript&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Try Immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nextState</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(baseState, (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">].done </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Tweet about it&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(baseState[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">].done);   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// false  —— 原状态不变</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(nextState[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">].done);   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(baseState </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nextState); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// false</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>与「手写 spread」对比，差异主要在心智负担：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不使用 Immer：每一层都要手动 spread，极易出错</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> next</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> state.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">slice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Tweet about it&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用 Immer：直接「原地修改」draft，原 state 不动</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> next2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(state, (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">].done </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Tweet about it&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><h2 id="核心-api" tabindex="-1">核心 API <a class="header-anchor" href="#核心-api" aria-label="Permalink to “核心 API”">​</a></h2><table tabindex="0"><thead><tr><th>API</th><th>返回值</th><th>说明</th></tr></thead><tbody><tr><td><code>produce(base, recipe, listener?)</code></td><td><code>NextState</code></td><td>核心函数。在 recipe 内对 draft 自由「修改」，返回不可变的下一态</td></tr><tr><td><code>produce(recipe, initialState?)</code></td><td><code>CurriedProducer</code></td><td>柯里化形式，先传 recipe 得到一个 <code>(state, ...args) =&gt; nextState</code> 的 reducer</td></tr><tr><td><code>produceWithPatches(base, recipe)</code></td><td><code>[next, patches, inversePatches]</code></td><td>同时返回 JSON Patch 与逆 patch，可用于撤销/重做、协同</td></tr><tr><td><code>applyPatches(base, patches)</code></td><td><code>NextState</code></td><td>把若干 JSON Patch 应用到一个状态上，得到新状态</td></tr><tr><td><code>createDraft(base)</code></td><td><code>Draft</code></td><td>手动创建 draft，可在多次同步操作之间共享</td></tr><tr><td><code>finishDraft(draft, listener?)</code></td><td><code>NextState</code></td><td>结束手动 draft，得到最终不可变状态</td></tr><tr><td><code>current(draft)</code></td><td><code>Snapshot</code></td><td>取出 draft 当前快照（不再继续追踪），用于 log/比对</td></tr><tr><td><code>original(draft)</code></td><td><code>BaseState</code></td><td>取出 draft 对应的原始（base）值</td></tr><tr><td><code>isDraft(value)</code></td><td><code>boolean</code></td><td>判断一个值是否为 Immer draft</td></tr><tr><td><code>isDraftable(value)</code></td><td><code>boolean</code></td><td>判断 Immer 是否能为该值创建 draft</td></tr><tr><td><code>castDraft / castImmutable</code></td><td><code>T</code></td><td>TypeScript 辅助：在不变值与 draft 间做「零成本」类型转换</td></tr></tbody></table><h2 id="柯里化-producer" tabindex="-1">柯里化 producer <a class="header-anchor" href="#柯里化-producer" aria-label="Permalink to “柯里化 producer”">​</a></h2><p>只传 <code>recipe</code>，<code>produce</code> 会返回一个新的函数，把 base state 留到调用时再传——天然适配 Redux/Vuex 风格的 reducer：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> todoReducer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (action.type) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;ADD&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ title: action.title, done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;TOGGLE&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      draft[action.index].done </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">draft[action.index].done;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    case</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;REMOVE&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">splice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(action.index, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> next</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> todoReducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(state, { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ADD&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Read docs&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 也可以预设默认初值：state 为 undefined 时 fallback</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> reducer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">d</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> /* draft */</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* ... */</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }, []);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><h2 id="常见更新模式" tabindex="-1">常见更新模式 <a class="header-anchor" href="#常见更新模式" aria-label="Permalink to “常见更新模式”">​</a></h2><p>在 <code>recipe</code> 里你「想怎么写就怎么写」：</p><table tabindex="0"><thead><tr><th>场景</th><th>写法</th></tr></thead><tbody><tr><td>更新对象字段</td><td><code>draft.user.name = &quot;Alice&quot;</code></td></tr><tr><td>新增 / 删除字段</td><td><code>draft.flag = true; delete draft.tmp</code></td></tr><tr><td>末尾追加元素</td><td><code>draft.list.push(item)</code></td></tr><tr><td>按索引修改</td><td><code>draft.list[0].done = true</code></td></tr><tr><td>删除元素</td><td><code>draft.list.splice(idx, 1)</code> / <code>draft.list = draft.list.filter(...)</code></td></tr><tr><td>插入到指定位置</td><td><code>draft.list.splice(idx, 0, item)</code></td></tr><tr><td>排序</td><td><code>draft.list.sort((a, b) =&gt; a.id - b.id)</code></td></tr><tr><td>清空</td><td><code>draft.list.length = 0</code> / <code>draft.list = []</code></td></tr><tr><td>替换根状态</td><td><code>return newState</code>（仅根 draft，直接 return 整体替换）</td></tr><tr><td>产生「无变化」</td><td>不写任何修改 / <code>return undefined</code> → 原对象引用被复用</td></tr><tr><td>取消变更</td><td><code>return nothing</code>（表示「下一态是 undefined」）</td></tr></tbody></table><h2 id="json-patches-撤销-重做、协同" tabindex="-1">JSON Patches（撤销/重做、协同） <a class="header-anchor" href="#json-patches-撤销-重做、协同" aria-label="Permalink to “JSON Patches（撤销/重做、协同）”">​</a></h2><p>调用 <code>enablePatches()</code> 后，可使用 <code>produceWithPatches</code> 同时拿到正向 &amp; 逆向 patch；后续 <code>applyPatches</code> 即可在两个状态间任意穿梭：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produceWithPatches, applyPatches, enablePatches } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">enablePatches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> base</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { count: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, todos: [] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] };</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">next</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">patches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">inversePatches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produceWithPatches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base, (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.count </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.todos.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Hello&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// patches:        [{ op: &#39;replace&#39;, path: [&#39;count&#39;], value: 1 },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//                  { op: &#39;add&#39;,     path: [&#39;todos&#39;, 0], value: &#39;Hello&#39; }]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// inversePatches: [{ op: &#39;replace&#39;, path: [&#39;count&#39;], value: 0 },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//                  { op: &#39;remove&#39;,  path: [&#39;todos&#39;, 0] }]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undone</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> applyPatches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(next, inversePatches); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// === base</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> redone</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> applyPatches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(undone, patches);      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// === next</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>patches 遵循 <a href="https://datatracker.ietf.org/doc/html/rfc6902" target="_blank" rel="noreferrer">RFC 6902 JSON Patch</a> 格式（<code>op</code>/<code>path</code>/<code>value</code>），便于通过网络传输或写入历史日志。</p><h2 id="异步-producer" tabindex="-1">异步 producer <a class="header-anchor" href="#异步-producer" aria-label="Permalink to “异步 producer”">​</a></h2><p><code>recipe</code> 可以是 <code>async</code> 函数；多步异步流程也可以用 <code>createDraft</code> / <code>finishDraft</code> 手动控制：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce, createDraft, finishDraft } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// recipe 可以是 async 函数，produce 返回 Promise</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> next</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(state, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/api/user&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">then</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">r</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> r.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> data;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 或用 createDraft / finishDraft 在多次异步步骤间共享同一个 draft</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> draft</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createDraft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(state);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">draft.loading </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">draft.user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> api.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">draft.loading </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> final</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> finishDraft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(draft);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><h2 id="map-set" tabindex="-1">Map / Set <a class="header-anchor" href="#map-set" aria-label="Permalink to “Map / Set”">​</a></h2><p>原生 <code>Map</code> / <code>Set</code> 默认不会被 draft，需要先调用 <code>enableMapSet()</code> 显式开启：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce, enableMapSet } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">enableMapSet</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 全局开启一次即可</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> base</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;([[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;a&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> next</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base, (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;b&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">delete</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;a&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">([</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">entries</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()]); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// [[&#39;b&#39;, 2]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> next);       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// false，base 仍为 { a: 1 }</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h2 id="class-与-immerable" tabindex="-1">Class 与 immerable <a class="header-anchor" href="#class-与-immerable" aria-label="Permalink to “Class 与 immerable”">​</a></h2><p>自定义类需要在原型/实例上设置 <code>[immerable] = true</code>，Immer 才会为其创建 draft、保留 prototype 链：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce, immerable } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Todo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [immerable] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  constructor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> done</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  toggle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.done </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.done;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> base</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Todo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Try Immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> next</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base, (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toggle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.title </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Try Immer (updated)&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">instanceof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Todo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">base.done;            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next.done;            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// true</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><h2 id="配置-工具函数" tabindex="-1">配置 &amp; 工具函数 <a class="header-anchor" href="#配置-工具函数" aria-label="Permalink to “配置 &amp; 工具函数”">​</a></h2><table tabindex="0"><thead><tr><th>API</th><th>说明</th></tr></thead><tbody><tr><td><code>setAutoFreeze(enabled)</code></td><td>开启/关闭自动冻结。默认开启，保证返回值不可变；批量场景可关闭以提升性能</td></tr><tr><td><code>enableMapSet()</code></td><td>启用对原生 Map / Set 的 draft 支持（按需开启，避免捆绑额外代码）</td></tr><tr><td><code>enablePatches()</code></td><td>启用 JSON Patch 输出。<code>produceWithPatches</code> 与 listener 参数均依赖此开关</td></tr><tr><td><code>freeze(value, deep?)</code></td><td>主动深/浅冻结对象（绕过 produce 直接得到不可变值）</td></tr><tr><td><code>immerable</code></td><td>Symbol 标记：在自定义类上设 <code>[immerable] = true</code>，让 Immer 接管该类实例的 draft</td></tr><tr><td><code>Immer 类</code></td><td>可 new 一个独立配置的 Immer 实例：<code>new Immer({ autoFreeze: false })</code></td></tr></tbody></table><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce, setAutoFreeze, enableMapSet, enablePatches, freeze, Immer } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1) 全局配置（一般在应用启动时调用一次）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">enableMapSet</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">enablePatches</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setAutoFreeze</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2) 主动冻结</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> safe</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> freeze</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ a: { b: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } }, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* deep */</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3) 创建独立配置的实例（不影响全局）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> noFreezeImmer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Immer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ autoFreeze: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> next</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> noFreezeImmer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(state, (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">d</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { d.x </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h2 id="常见陷阱" tabindex="-1">常见陷阱 <a class="header-anchor" href="#常见陷阱" aria-label="Permalink to “常见陷阱”">​</a></h2><table tabindex="0"><thead><tr><th>坑</th><th>说明</th></tr></thead><tbody><tr><td>不要解构后再赋值</td><td><code>const { user } = draft; user.name = &quot;x&quot;</code> 仍可生效；但 <code>const u = { ...draft.user }</code> 后修改 u 不会被记录</td></tr><tr><td>根 draft 不能整体替换</td><td>在 recipe 内写 <code>draft = newState</code> 无效；要么 <code>return newState</code>，要么逐字段赋值</td></tr><tr><td>同时 mutate + return</td><td>产生异常。要么改 draft，要么返回新值，二者只能选一</td></tr><tr><td>修改了被冻结的对象</td><td>Immer 的输出默认 frozen；后续若需修改请再次走 produce</td></tr><tr><td>Map/Set 默认未启用</td><td>需先 <code>enableMapSet()</code>，否则把 Map/Set 当作普通对象处理</td></tr><tr><td>Patch 默认未启用</td><td><code>produceWithPatches</code>、listener 需先 <code>enablePatches()</code></td></tr><tr><td>Class 实例需要 [immerable]</td><td>否则 Immer 不会为其创建 draft（保留引用，按「不可 draft」处理）</td></tr></tbody></table><h2 id="与-react-vue-集成" tabindex="-1">与 React / Vue 集成 <a class="header-anchor" href="#与-react-vue-集成" aria-label="Permalink to “与 React / Vue 集成”">​</a></h2><p>React：直接配合 <code>useState</code>，或使用社区 hook：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { useState } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;react&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">todos</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">setTodos</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Todo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;([]);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setTodos</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Hello&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, done: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}));</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 或使用社区 hook：use-immer</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { useImmer } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;use-immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">state</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useImmer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ count: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  draft.count </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>Vue 3：Immer 与 <code>ref</code> 搭配处理「纯数据快照」——把 <code>produce</code> 的返回值赋给 <code>.value</code> 即可获得引用相等 + 历史可追溯的好处：</p><div class="language-ts line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ref } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { produce } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;immer&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> settings</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  theme: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;light&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  filters: [{ tag: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;work&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, enabled: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> toggleFilter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">idx</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  settings.value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> produce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(settings.value, (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">draft</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    draft.filters[idx].enabled </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">draft.filters[idx].enabled;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h2 id="典型使用场景" tabindex="-1">典型使用场景 <a class="header-anchor" href="#典型使用场景" aria-label="Permalink to “典型使用场景”">​</a></h2><table tabindex="0"><thead><tr><th>场景</th><th>说明</th></tr></thead><tbody><tr><td>Redux / Pinia / Vuex reducer</td><td>把 switch case 内的「手写不可变更新」全部替换为 <code>produce(state, draft =&gt; {...})</code></td></tr><tr><td>React useState</td><td><code>setState(produce(s =&gt; { s.x = 1 }))</code> 或配合 use-immer 提供的 useImmer hook</td></tr><tr><td>Vue 3 reactive 之外的纯数据</td><td>需要「快照 + 引用相等」语义时（如缓存键、props 比对），用 Immer 替代深拷贝</td></tr><tr><td>撤销 / 重做</td><td><code>produceWithPatches</code> 收集 patches &amp; inversePatches，<code>applyPatches</code> 即可时光穿梭</td></tr><tr><td>协同 / 增量同步</td><td>把 JSON Patch 通过网络发送给协作方，<code>applyPatches</code> 完成合并</td></tr><tr><td>大量层级的配置树</td><td>深层修改不再写一连串 <code>...spread</code>；同时保持结构共享，节省内存与渲染</td></tr></tbody></table><h2 id="性能与体积" tabindex="-1">性能与体积 <a class="header-anchor" href="#性能与体积" aria-label="Permalink to “性能与体积”">​</a></h2><ul><li>体积约 <strong>3 KB gzipped</strong>，无运行时依赖；ES 模块支持 tree shaking。</li><li>结构共享：未修改的子树共享旧引用，配合 <code>React.memo</code> / <code>shallowRef</code> 可显著减少渲染。</li><li>性能「够用就好」：单次 produce 比手写 spread 慢一点点，但远低于深拷贝；多数场景可忽略。</li><li>性能敏感批处理：可临时 <code>setAutoFreeze(false)</code>，或使用 <code>new Immer({ autoFreeze: false })</code> 实例。</li><li>生产环境建议配合 ESLint / TS 严格模式，避免在 produce 外修改 draft。</li></ul>`,46)])}}});export{en as __pageData,tn as default};