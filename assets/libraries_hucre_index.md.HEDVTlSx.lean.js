import{St as e,U as t,V as n,Yt as r,a as i,b as a,d as o,f as s,gt as c,m as l,p as u,pt as d,rt as f,t as p,u as m,v as h,x as g,y as _,z as v}from"./chunks/plugin-vue_export-helper.D3aRiBwX.js";import{n as y}from"./chunks/es.CM1k1LpW.js";function b(e){if(e.length===0)return e;let t=e.charCodeAt(0);return t===65279||t===65534?e.slice(1):e}function x(e){let t=[`,`,`;`,`	`,`|`],n=te(e,10);if(n.length===0)return`,`;let r=`,`,i=-1;for(let e of t){let t=n.map(t=>O(t,e)).filter(e=>e>0);if(t.length===0)continue;let a=t[0],o=t.filter(e=>e===a).length*1e3+a;o>i&&(i=o,r=e)}return r}function S(e,t){let n=ee(t);n.skipBom&&(e=b(e));let r=t?.skipLines;if(r&&r>0){let t=0,n=0;for(;t<r&&n<e.length;){let r=e[n];r===`\r`?(t++,n+1<e.length&&e[n+1]===`
`?n+=2:n++):(r===`
`&&t++,n++)}e=e.slice(n)}if(e.length===0)return[];let i=n.delimiter??x(e),a=n.quote,o=n.escape,s=t?.fastMode?C(e,i):w(e,i,a,o),c=n.comment,l=c?s.filter(e=>{if(e.length===0)return!0;let t=e[0];return!(typeof t==`string`&&t.startsWith(c))}):s;if(n.skipEmptyRows&&(l=l.filter(e=>e.length>0&&!e.every(e=>e===null||e===``))),n.maxRows!==void 0&&n.maxRows>=0&&l.length>n.maxRows&&(l=l.slice(0,n.maxRows)),n.typeInference){let e=n.preserveLeadingZeros;l=l.map(t=>t.map(t=>E(t,e)))}let u=t?.transformValue;if(u){let e=t?.header&&l.length>0?l[0]:null;l=l.map((t,n)=>t.map((t,r)=>u(t,String(e?e[r]??r:r),n,r)))}let d=t?.onRow;if(d)for(let e=0;e<l.length;e++)d(l[e],e);return l}function C(e,t){let n=[],r=e.split(/\r\n|\r|\n/);r.length>0&&r[r.length-1]===``&&r.pop();for(let e of r)n.push(e.split(t));return n}function w(e,t,n,r){let i=[],a=[],o=``,s=!1,c=0,l=e.length;for(;c<l;){let u=e[c];if(s){if(u===r&&c+1<l&&e[c+1]===n){o+=n,c+=2;continue}if(u===n){s=!1,c++;continue}o+=u,c++;continue}if(ne(e,t,c)){a.push(o),o=``,c+=t.length;continue}if(u===`\r`){a.push(o),o=``,i.push(a),a=[],c+1<l&&e[c+1]===`
`?c+=2:c++;continue}if(u===`
`){a.push(o),o=``,i.push(a),a=[],c++;continue}if(u===n&&o===``){s=!0,c++;continue}o+=u,c++}return(o!==``||a.length>0)&&(a.push(o),i.push(a)),i}var T=/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;function E(e,t){if(e===null)return null;if(typeof e!=`string`)return e;let n=e.trim();if(n===``)return e;let r=n.toLowerCase();if(r===`true`||r===`yes`)return!0;if(r===`false`||r===`no`)return!1;if(T.test(n)){let e=new Date(n);if(!Number.isNaN(e.getTime()))return e}if(t&&n.length>1&&n[0]===`0`&&n[1]!==`.`)return e;let i=D(n);return i===null?e:i}function D(e){let t=e.replace(/,(\d{3})/g,`$1`);if(t===``||t===`-`||t===`+`||!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(t))return null;let n=Number(t);return Number.isNaN(n)||!Number.isFinite(n)?null:n}function ee(e){return{skipBom:e?.skipBom!==!1,delimiter:e?.delimiter,quote:e?.quote??`"`,escape:e?.escape??`"`,typeInference:e?.typeInference??!1,preserveLeadingZeros:e?.preserveLeadingZeros!==!1,skipEmptyRows:e?.skipEmptyRows??!1,comment:e?.comment,header:e?.header??!1,maxRows:e?.maxRows}}function te(e,t){let n=[],r=``,i=!1;for(let a=0;a<e.length&&n.length<t;a++){let t=e[a];if(i){if(t===`"`&&a+1<e.length&&e[a+1]===`"`){r+=t,a++;continue}if(t===`"`){i=!1,r+=t;continue}r+=t;continue}if(t===`"`){i=!0,r+=t;continue}if(t===`
`||t===`\r`){r.length>0&&(n.push(r),r=``),t===`\r`&&a+1<e.length&&e[a+1]===`
`&&a++;continue}r+=t}return r.length>0&&n.length<t&&n.push(r),n}function O(e,t){let n=0,r=!1;for(let i=0;i<e.length;i++){let a=e[i];if(r){if(a===`"`&&i+1<e.length&&e[i+1]===`"`){i++;continue}if(a===`"`){r=!1;continue}continue}if(a===`"`){r=!0;continue}ne(e,t,i)&&(n++,i+=t.length-1)}return n}function ne(e,t,n){if(n+t.length>e.length)return!1;for(let r=0;r<t.length;r++)if(e[n+r]!==t[r])return!1;return!0}function k(e,t){let n=A(t),r=[];n.bom&&r.push(`﻿`),n.headers&&Array.isArray(n.headers)&&(r.push(n.headers.map(e=>M(e,n.delimiter,n.quote,n.quoteStyle)).join(n.delimiter)),e.length>0&&r.push(n.lineSeparator));for(let t=0;t<e.length;t++){let i=e[t].map(e=>ae(e,n)).join(n.delimiter);r.push(i),t<e.length-1&&r.push(n.lineSeparator)}return r.join(``)}function A(e){return{delimiter:e?.delimiter??`,`,lineSeparator:e?.lineSeparator??`\r
`,quote:e?.quote??`"`,quoteStyle:e?.quoteStyle??`required`,headers:e?.headers,bom:e?.bom??!1,dateFormat:e?.dateFormat,nullValue:e?.nullValue??``,escapeFormulae:e?.escapeFormulae??!1}}var re=[`=`,`+`,`-`,`@`,`	`,`\r`,`
`,`\0`,`|`],j=[/^=cmd\b/i,/^=HYPERLINK\s*\(/i,/^=IMPORTXML\s*\(/i,/^=IMPORTDATA\s*\(/i,/^=IMPORTFEED\s*\(/i,/^=IMPORTHTML\s*\(/i,/^=IMPORTRANGE\s*\(/i,/^=IMAGE\s*\(/i];function ie(e){if(e.length===0)return e;if(re.includes(e[0]))return`'`+e;for(let t of j)if(t.test(e))return`'`+e;return e}function ae(e,t){if(e==null){let e=t.nullValue;return t.quoteStyle===`all`?t.quote+e+t.quote:e}if(typeof e==`boolean`)return M(e?`true`:`false`,t.delimiter,t.quote,t.quoteStyle);if(typeof e==`number`)return M(oe(e),t.delimiter,t.quote,t.quoteStyle);if(e instanceof Date)return M(N(e,t.dateFormat),t.delimiter,t.quote,t.quoteStyle);let n=String(e);return t.escapeFormulae&&(n=ie(n)),M(n,t.delimiter,t.quote,t.quoteStyle)}function M(e,t,n,r){return r===`none`||!(r===`all`||e.includes(t)||e.includes(n)||e.includes(`
`)||e.includes(`\r`))?e:n+e.replaceAll(n,n+n)+n}function oe(e){return Number.isInteger(e)&&Math.abs(e)>=0x38d7ea4c68000?e.toFixed(0):Math.abs(e)>0&&Math.abs(e)<1e-6?e.toFixed(20).replace(/0+$/,``).replace(/\.$/,`.0`):String(e)}function N(e,t){if(!t)return e.toISOString();let n=e.getFullYear(),r=e.getMonth()+1,i=e.getDate(),a=e.getHours(),o=e.getMinutes(),s=e.getSeconds();return t.replace(`YYYY`,String(n)).replace(`MM`,String(r).padStart(2,`0`)).replace(`DD`,String(i).padStart(2,`0`)).replace(`HH`,String(a).padStart(2,`0`)).replace(`mm`,String(o).padStart(2,`0`)).replace(`ss`,String(s).padStart(2,`0`))}var se=class extends Error{name=`DefterError`;constructor(e,t){super(e,t)}},P=class extends se{name=`ParseError`;constructor(e,t,n){super(e,n),this.details=t}},F=class extends se{name=`ZipError`},ce=class extends se{name=`XmlError`},I=class extends se{name=`ValidationError`;constructor(e,t){super(e),this.errors=t}},le=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t++){let n=t;for(let e=0;e<8;e++)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n}return e})();function L(e){let t=4294967295;for(let n=0;n<e.length;n++)t=le[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0}var ue=class{pos=0;bitBuf=0;bitCount=0;constructor(e){this.data=e}readBits(e){for(;this.bitCount<e;){if(this.pos>=this.data.length)throw Error(`Unexpected end of DEFLATE data`);this.bitBuf|=this.data[this.pos++]<<this.bitCount,this.bitCount+=8}let t=this.bitBuf&(1<<e)-1;return this.bitBuf>>>=e,this.bitCount-=e,t}alignToByte(){this.bitBuf=0,this.bitCount=0}readByte(){if(this.pos>=this.data.length)throw Error(`Unexpected end of DEFLATE data`);return this.data[this.pos++]}readUint16LE(){return this.readByte()|this.readByte()<<8}get offset(){return this.pos}get available(){return this.pos<this.data.length||this.bitCount>0}};function de(e,t){let n=new Uint16Array(16);for(let r=0;r<t;r++)e[r]&&n[e[r]]++;let r=new Uint16Array(16);for(let e=1;e<15;e++)r[e+1]=r[e]+n[e];let i=r[15]+n[15],a=new Uint16Array(i);for(let n=0;n<t;n++)e[n]&&(a[r[e[n]]++]=n);return{counts:n,symbols:a}}function R(e,t){let n=0,r=0,i=0;for(let a=1;a<=15;a++){n|=e.readBits(1);let o=t.counts[a];if(n<r+o)return t.symbols[i+(n-r)];i+=o,r=r+o<<1,n<<=1}throw Error(`Invalid Huffman code`)}var fe=(()=>{let e=new Uint8Array(288);for(let t=0;t<=143;t++)e[t]=8;for(let t=144;t<=255;t++)e[t]=9;for(let t=256;t<=279;t++)e[t]=7;for(let t=280;t<=287;t++)e[t]=8;return de(e,288)})(),pe=(()=>{let e=new Uint8Array(32);for(let t=0;t<32;t++)e[t]=5;return de(e,32)})(),z=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],me=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],B=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],he=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],ge=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];function _e(e){let t=new ue(e),n=new Uint8Array(e.length*3||1024),r=0;function i(e){if(r+e>n.length){let t=n.length*2;for(;r+e>t;)t*=2;let i=new Uint8Array(t);i.set(n),n=i}}function a(e){i(1),n[r++]=e}function o(e,t){i(t);let a=r-e;for(let e=0;e<t;e++)n[r++]=n[a++]}function s(e,n){for(;;){let r=R(t,e);if(r<256)a(r);else if(r===256)return;else{let e=r-257,i=z[e]+t.readBits(me[e]),a=R(t,n);o(B[a]+t.readBits(he[a]),i)}}}let c=0;do{c=t.readBits(1);let e=t.readBits(2);if(e===0){t.alignToByte();let e=t.readUint16LE();t.readUint16LE(),i(e);for(let i=0;i<e;i++)n[r++]=t.readByte()}else if(e===1)s(fe,pe);else if(e===2){let e=t.readBits(5)+257,n=t.readBits(5)+1,r=t.readBits(4)+4,i=new Uint8Array(19);for(let e=0;e<r;e++)i[ge[e]]=t.readBits(3);let a=de(i,19),o=e+n,c=new Uint8Array(o),l=0;for(;l<o;){let e=R(t,a);if(e<16)c[l++]=e;else if(e===16){let e=t.readBits(2)+3,n=l>0?c[l-1]:0;for(let t=0;t<e;t++)c[l++]=n}else if(e===17){let e=t.readBits(3)+3;for(let t=0;t<e;t++)c[l++]=0}else if(e===18){let e=t.readBits(7)+11;for(let t=0;t<e;t++)c[l++]=0}}let u=c.subarray(0,e),d=c.subarray(e,e+n);s(de(u,e),de(d,n))}else throw Error(`Invalid DEFLATE block type: ${e}`)}while(c===0);return n.subarray(0,r)}function ve(e){return e.length===0?new Uint8Array([3,0]):e.length<=64?ye(e):be(e)}function ye(e){let t=[],n=0;for(;n<e.length;){let r=e.length-n,i=Math.min(r,65535),a=n+i>=e.length,o=new Uint8Array(5+i);o[0]=a?1:0,o[1]=i&255,o[2]=i>>8&255,o[3]=~i&255,o[4]=~i>>8&255,o.set(e.subarray(n,n+i),5),t.push(o),n+=i}let r=t.reduce((e,t)=>e+t.length,0),i=new Uint8Array(r),a=0;for(let e of t)i.set(e,a),a+=e.length;return i}function be(e){let t=new Uint8Array(e.length+512),n=0,r=0,i=0;function a(e){if(n+e>t.length){let r=t.length*2;for(;n+e>r;)r*=2;let i=new Uint8Array(r);i.set(t),t=i}}function o(e,o){for(r|=e<<i,i+=o;i>=8;)a(1),t[n++]=r&255,r>>>=8,i-=8}function s(){i>0&&(a(1),t[n++]=r&255,r=0,i=0)}function c(e){e<=143?o(V(48+e,8),8):e<=255?o(V(400+(e-144),9),9):e<=279?o(V(e-256,7),7):o(V(192+(e-280),8),8)}function l(e){o(V(e,5),5)}o(1,1),o(1,2);let u=32768,d=32768;d-1;let f=new Int32Array(d).fill(-1),p=new Int32Array(u);function m(t){return t+2>=e.length?0:(e[t]<<10^e[t+1]<<5^e[t+2])&32767}let h=0;for(;h<e.length;){if(h+3>e.length){c(e[h]),h++;continue}let t=m(h),n=2,r=0,i=f[t],a=0,s=Math.max(0,h-u);for(;i>=s&&a<128;){let t=h-i;if(t>0&&t<=u){let a=0,o=Math.min(258,e.length-h);for(;a<o&&e[i+a]===e[h+a];)a++;if(a>n&&(n=a,r=t,a===258))break}i=p[i&u-1],a++}if(p[h&u-1]=f[t],f[t]=h,n>=3){let t=xe(n);c(t+257),o(n-z[t],me[t]);let i=Se(r);l(i),o(r-B[i],he[i]);for(let t=1;t<n;t++){let n=h+t;if(n+3<=e.length){let e=m(n);p[n&u-1]=f[e],f[e]=n}}h+=n}else c(e[h]),h++}return c(256),s(),t.subarray(0,n)}function V(e,t){let n=0;for(let r=0;r<t;r++)n=n<<1|e&1,e>>=1;return n}function xe(e){for(let t=z.length-1;t>=0;t--)if(e>=z[t])return t;return 0}function Se(e){for(let t=B.length-1;t>=0;t--)if(e>=B[t])return t;return 0}var Ce=67324752,we;function H(){if(we===void 0)try{we=typeof DecompressionStream<`u`&&typeof ReadableStream<`u`&&typeof Response<`u`}catch{we=!1}return we}async function Te(e){if(H())try{let t=new DecompressionStream(`deflate-raw`),n=t.writable.getWriter(),r=t.readable.getReader();n.write(e),n.close();let i=[],a=0;for(;;){let{done:e,value:t}=await r.read();if(e)break;i.push(t),a+=t.length}let o=new Uint8Array(a),s=0;for(let e of i)o.set(e,s),s+=e.length;return o}catch{}return _e(e)}var Ee=class{view;centralDir=[];entryMap=new Map;constructor(e){if(this.data=e,e.length<22)throw new F(`Data too small to be a valid ZIP archive`);this.view=new DataView(e.buffer,e.byteOffset,e.byteLength),this.readEndOfCentralDir()}entries(){return this.centralDir.map(e=>e.fileName)}has(e){return this.entryMap.has(e)}async extract(e){let t=this.entryMap.get(e);if(!t)throw new F(`Entry not found: ${e}`);return this.extractEntry(t)}extractStream(e){let t=this.entryMap.get(e);if(!t)throw new F(`Entry not found: ${e}`);return this.extractEntryStream(t)}async extractAll(){let e=new Map;for(let t of this.centralDir){if(t.fileName.endsWith(`/`))continue;let n=await this.extractEntry(t);e.set(t.fileName,n)}return e}readEndOfCentralDir(){let e=Math.max(0,this.data.length-65557),t=-1;for(let n=this.data.length-22;n>=e;n--)if(this.view.getUint32(n,!0)===101010256){t=n;break}if(t===-1)throw new F(`End of Central Directory not found — not a valid ZIP file`);let n=this.view.getUint32(t+12,!0),r=this.view.getUint32(t+16,!0),i=this.view.getUint16(t+10,!0);this.readCentralDirectory(r,n,i)}readCentralDirectory(e,t,n){let r=e;for(let e=0;e<n;e++){if(r+46>this.data.length)throw new F(`Central Directory entry extends beyond file`);let e=this.view.getUint32(r,!0);if(e!==33639248)throw new F(`Invalid Central Directory signature at offset ${r}: 0x${e.toString(16)}`);let t=this.view.getUint16(r+8,!0),n=this.view.getUint16(r+10,!0),i=this.view.getUint32(r+16,!0),a=this.view.getUint32(r+20,!0),o=this.view.getUint32(r+24,!0),s=this.view.getUint16(r+28,!0),c=this.view.getUint16(r+30,!0),l=this.view.getUint16(r+32,!0),u=this.view.getUint32(r+42,!0),d=this.data.subarray(r+46,r+46+s),f=new TextDecoder().decode(d),p={fileName:f,compressionMethod:n,compressedSize:a,uncompressedSize:o,crc32:i,localHeaderOffset:u,hasDataDescriptor:(t&8)!=0};this.centralDir.push(p),this.entryMap.set(f,p),r+=46+s+c+l}}async extractEntry(e){let t=e.localHeaderOffset;if(t+30>this.data.length)throw new F(`Local file header extends beyond file`);if(this.view.getUint32(t,!0)!==Ce)throw new F(`Invalid local file header signature at offset ${t}`);let n=this.view.getUint16(t+26,!0),r=this.view.getUint16(t+28,!0),i=t+30+n+r,{compressedSize:a,uncompressedSize:o,crc32:s}=e;if(e.hasDataDescriptor&&a===0){let e=this.view.getUint32(t+18,!0);e>0&&(a=e);let n=this.view.getUint32(t+22,!0);if(n>0&&(o=n),a===0){let e=this.findDataDescriptor(i);e&&(s=e.crc,a=e.compressedSize,o=e.uncompressedSize)}}if(i+a>this.data.length)throw new F(`Compressed data extends beyond file for entry: ${e.fileName}`);let c=this.data.subarray(i,i+a),l;if(e.compressionMethod===0)l=c;else if(e.compressionMethod===8)l=a===0&&o===0?new Uint8Array:await Te(c);else throw new F(`Unsupported compression method ${e.compressionMethod} for entry: ${e.fileName}`);if(s!==0&&l.length>0){let t=L(l);if(t!==s)throw new F(`CRC-32 mismatch for ${e.fileName}: expected 0x${s.toString(16)}, got 0x${t.toString(16)}`)}return l}extractEntryStream(e){let t=e.localHeaderOffset;if(t+30>this.data.length)throw new F(`Local file header extends beyond file`);if(this.view.getUint32(t,!0)!==Ce)throw new F(`Invalid local file header signature at offset ${t}`);let n=this.view.getUint16(t+26,!0),r=this.view.getUint16(t+28,!0),i=t+30+n+r,{compressedSize:a}=e;if(e.hasDataDescriptor&&a===0){let e=this.view.getUint32(t+18,!0);if(e>0&&(a=e),a===0){let e=this.findDataDescriptor(i);e&&(a=e.compressedSize)}}if(i+a>this.data.length)throw new F(`Compressed data extends beyond file for entry: ${e.fileName}`);let o=this.data.subarray(i,i+a);if(e.compressionMethod===0)return new ReadableStream({start(e){e.enqueue(o),e.close()}});if(e.compressionMethod===8){if(a===0&&e.uncompressedSize===0)return new ReadableStream({start(e){e.close()}});if(H())return new ReadableStream({start(e){e.enqueue(o),e.close()}}).pipeThrough(new DecompressionStream(`deflate-raw`));let t=_e(o);return new ReadableStream({start(e){e.enqueue(t),e.close()}})}throw new F(`Unsupported compression method ${e.compressionMethod} for entry: ${e.fileName}`)}findDataDescriptor(e){for(let t=e;t<this.data.length-16;t++)if(this.view.getUint32(t,!0)===134695760)return{crc:this.view.getUint32(t+4,!0),compressedSize:this.view.getUint32(t+8,!0),uncompressedSize:this.view.getUint32(t+12,!0)};return null}},De={amp:`&`,lt:`<`,gt:`>`,quot:`"`,apos:`'`};function U(e){return e.indexOf(`&`)===-1?e:e.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g,(e,t)=>{if(t.charCodeAt(0)===35){let n=t.charCodeAt(1)===120||t.charCodeAt(1)===88?parseInt(t.slice(2),16):parseInt(t.slice(1),10);return Number.isNaN(n)?e:String.fromCodePoint(n)}return De[t]??e})}function Oe(e){return e.indexOf(`_x`)===-1?e:e.replace(/_x([0-9A-Fa-f]{4})_/g,(e,t)=>String.fromCharCode(parseInt(t,16)))}function ke(e){let t={},n=0,r=e.length;for(;n<r;){for(;n<r&&je(e.charCodeAt(n));)n++;if(n>=r)break;let i=n;for(;n<r&&e.charCodeAt(n)!==61&&!je(e.charCodeAt(n));)n++;let a=e.slice(i,n);if(!a)break;for(;n<r&&je(e.charCodeAt(n));)n++;if(n>=r||e.charCodeAt(n)!==61){t[a]=``;continue}for(n++;n<r&&je(e.charCodeAt(n));)n++;if(n>=r)break;let o=e.charCodeAt(n);if(o===34||o===39){n++;let i=n;for(;n<r&&e.charCodeAt(n)!==o;)n++;t[a]=U(e.slice(i,n)),n++}else{let i=n;for(;n<r&&!je(e.charCodeAt(n));)n++;t[a]=U(e.slice(i,n))}}return t}function Ae(e){let t=e.indexOf(`:`);return t===-1?{local:e,prefix:``}:{prefix:e.slice(0,t),local:e.slice(t+1)}}function je(e){return e===32||e===9||e===10||e===13}function Me(e,t){let n=e.charCodeAt(0)===65279?e.slice(1):e,r=n.length,i=0;function a(e){let t=1,a=1;for(let e=0;e<i&&e<r;e++)n.charCodeAt(e)===10?(t++,a=1):a++;throw new ce(`${e} at line ${t}, column ${a}`)}for(;i<r;){if(n.charCodeAt(i)===60){let e=i+1<r?n.charCodeAt(i+1):0;if(e===33){if(n.slice(i,i+4)===`<!--`){let e=n.indexOf(`-->`,i+4);e===-1&&a(`Unterminated comment`),i=e+3;continue}if(n.slice(i,i+9)===`<![CDATA[`){let e=n.indexOf(`]]>`,i+9);e===-1&&a(`Unterminated CDATA section`);let r=n.slice(i+9,e);t.onCData?.(r),t.onText?.(r),i=e+3;continue}let e=n.indexOf(`>`,i+2);e===-1&&a(`Unterminated declaration`),i=e+1;continue}if(e===63){let e=n.indexOf(`?>`,i+2);e===-1&&a(`Unterminated processing instruction`),i=e+2;continue}if(e===47){let e=n.indexOf(`>`,i+2);e===-1&&a(`Unterminated closing tag`);let r=n.slice(i+2,e).trim();t.onCloseTag?.(r),i=e+1;continue}let o=i+1,s=0;for(;o<r;){let e=n.charCodeAt(o);if(s)e===s&&(s=0);else if(e===34||e===39)s=e;else if(e===62)break;o++}o>=r&&a(`Unterminated opening tag`);let c=n.charCodeAt(o-1)===47,l=n.slice(i+1,c?o-1:o),u=0,d=l.length;for(;u<d&&!je(l.charCodeAt(u));)u++;let f=l.slice(0,u),p=u<d?l.slice(u+1):``,m=p?ke(p):{};t.onOpenTag?.(f,m),c&&t.onCloseTag?.(f),i=o+1;continue}let e=i;for(;i<r&&n.charCodeAt(i)!==60;)i++;let o=n.slice(e,i);if(o){let e=U(o);t.onText?.(e)}}}function W(e){let t={tag:``,local:``,prefix:``,attrs:{},children:[]},n=[t];if(Me(e,{onOpenTag(e,t){let{local:r,prefix:i}=Ae(e),a={tag:e,local:r,prefix:i,attrs:t,children:[]};n[n.length-1].children.push(a),n.push(a)},onCloseTag(e){if(n.length<=1)throw new ce(`Unexpected closing tag: no matching open tag`);let t=n.pop();if(t.children.length>0){let e=[];for(let n of t.children)typeof n==`string`&&e.push(n);e.length>0&&(t.text=e.join(``))}},onText(e){n[n.length-1].children.push(e)}}),t.children.length===0)throw new ce(`Empty document: no root element found`);for(let e of t.children)if(typeof e!=`string`)return e;throw new ce(`No root element found in document`)}var Ne;function Pe(){if(Ne===void 0)try{Ne=typeof CompressionStream<`u`&&typeof ReadableStream<`u`&&typeof Response<`u`}catch{Ne=!1}return Ne}async function Fe(e){if(Pe())try{let t=new CompressionStream(`deflate-raw`),n=t.writable.getWriter(),r=t.readable.getReader();n.write(e),n.close();let i=[],a=0;for(;;){let{done:e,value:t}=await r.read();if(e)break;i.push(t),a+=t.length}let o=new Uint8Array(a),s=0;for(let e of i)o.set(e,s),s+=e.length;return o}catch{}return ve(e)}var Ie=class{entries=[];add(e,t,n){let r=n?.compress??!0;this.entries.push({path:e,data:t,compress:r})}async build(){let e=[];for(let t of this.entries){let n=t.data.length>0?L(t.data):0,r,i;t.compress&&t.data.length>0?(r=await Fe(t.data),i=8,r.length>=t.data.length&&(r=t.data,i=0)):(r=t.data,i=0),e.push({path:t.path,data:t.data,compressedData:r,method:i,entryCrc32:n})}let t=new TextEncoder,n=e.map(e=>t.encode(e.path)),r=0;for(let t=0;t<e.length;t++)r+=30+n[t].length+e[t].compressedData.length;let i=0;for(let t=0;t<e.length;t++)i+=46+n[t].length;let a=r+i+22,o=new Uint8Array(a),s=new DataView(o.buffer),c=0,l=[];for(let t=0;t<e.length;t++){let r=e[t],i=n[t];l.push(c),s.setUint32(c,67324752,!0),s.setUint16(c+4,20,!0),s.setUint16(c+6,0,!0),s.setUint16(c+8,r.method,!0),s.setUint16(c+10,0,!0),s.setUint16(c+12,33,!0),s.setUint32(c+14,r.entryCrc32,!0),s.setUint32(c+18,r.compressedData.length,!0),s.setUint32(c+22,r.data.length,!0),s.setUint16(c+26,i.length,!0),s.setUint16(c+28,0,!0),o.set(i,c+30),c+=30+i.length,o.set(r.compressedData,c),c+=r.compressedData.length}let u=c;for(let t=0;t<e.length;t++){let r=e[t],i=n[t];s.setUint32(c,33639248,!0),s.setUint16(c+4,20,!0),s.setUint16(c+6,20,!0),s.setUint16(c+8,0,!0),s.setUint16(c+10,r.method,!0),s.setUint16(c+12,0,!0),s.setUint16(c+14,33,!0),s.setUint32(c+16,r.entryCrc32,!0),s.setUint32(c+20,r.compressedData.length,!0),s.setUint32(c+24,r.data.length,!0),s.setUint16(c+28,i.length,!0),s.setUint16(c+30,0,!0),s.setUint16(c+32,0,!0),s.setUint16(c+34,0,!0),s.setUint16(c+36,0,!0),s.setUint32(c+38,0,!0),s.setUint32(c+42,l[t],!0),o.set(i,c+46),c+=46+i.length}let d=c-u;return s.setUint32(c,101010256,!0),s.setUint16(c+4,0,!0),s.setUint16(c+6,0,!0),s.setUint16(c+8,e.length,!0),s.setUint16(c+10,e.length,!0),s.setUint32(c+12,d,!0),s.setUint32(c+16,u,!0),s.setUint16(c+20,0,!0),o}};function G(e){let t=``,n=0;for(let r=0;r<e.length;r++){let i;switch(e.charCodeAt(r)){case 38:i=`&amp;`;break;case 60:i=`&lt;`;break;case 62:i=`&gt;`;break}i&&(t+=e.slice(n,r)+i,n=r+1)}return n===0?e:t+e.slice(n)}function Le(e){let t=``,n=0;for(let r=0;r<e.length;r++){let i;switch(e.charCodeAt(r)){case 38:i=`&amp;`;break;case 60:i=`&lt;`;break;case 62:i=`&gt;`;break;case 34:i=`&quot;`;break;case 39:i=`&apos;`;break;case 9:i=`&#9;`;break;case 10:i=`&#10;`;break;case 13:i=`&#13;`;break}i&&(t+=e.slice(n,r)+i,n=r+1)}return n===0?e:t+e.slice(n)}function Re(e){if(!e)return``;let t=``,n=Object.keys(e);for(let r=0;r<n.length;r++){let i=n[r],a=e[i];a!=null&&(typeof a==`boolean`?t+=` ${i}="${a?`true`:`false`}"`:t+=` ${i}="${Le(String(a))}"`)}return t}function K(e,t){return`<${e}${Re(t)}/>`}function q(e,t,n){let r=Re(t);if(n==null)return`<${e}${r}/>`;let i=Array.isArray(n)?n.join(``):n;return i?`<${e}${r}>${i}</${e}>`:`<${e}${r}/>`}function ze(e){return`<?xml version="1.0" encoding="UTF-8" standalone="${e?.standalone??`yes`}"?>`}function J(e,t,n,r){let i=[];return r?.declaration!==!1&&i.push(ze(r)),n==null?i.push(K(e,t)):i.push(q(e,t,n)),i.join(``)}function Be(e){let t=W(e),n=new Map,r=new Map;for(let e of t.children){if(typeof e==`string`)continue;let t=e.local||e.tag;if(t===`Default`){let t=e.attrs.Extension,r=e.attrs.ContentType;t&&r&&n.set(t,r)}else if(t===`Override`){let t=e.attrs.PartName,n=e.attrs.ContentType;t&&n&&r.set(t,n)}}return{defaults:n,overrides:r}}function Ve(e){let t=W(e),n=[];for(let e of t.children)if(typeof e!=`string`&&(e.local||e.tag)===`Relationship`){let t=e.attrs.Id??``,r=e.attrs.Type??``,i=e.attrs.Target??``,a=e.attrs.TargetMode;if(t&&r&&i){let e={id:t,type:r,target:i};a&&(e.targetMode=a),n.push(e)}}return n}function He(e){let t=W(e),n=[];for(let e of t.children)typeof e!=`string`&&(e.local||e.tag)===`si`&&n.push(Ue(e));return n}function Ue(e){let t=[],n=null;for(let r of e.children){if(typeof r==`string`)continue;let e=r.local||r.tag;e===`t`?n=We(r):e===`r`&&t.push(r)}if(t.length===0)return{text:Oe(n??``)};let r=[],i=[];for(let e of t){let t=``,n;for(let r of e.children){if(typeof r==`string`)continue;let e=r.local||r.tag;e===`t`?t=We(r):e===`rPr`&&(n=Ge(r))}let a=Oe(t);i.push(a),r.push(n?{text:a,font:n}:{text:a})}return{text:i.join(``),richText:r}}function We(e){return e.text??``}function Ge(e){let t={};for(let n of e.children)if(typeof n!=`string`)switch(n.local||n.tag){case`b`:t.bold=n.attrs.val!==`0`&&n.attrs.val!==`false`;break;case`i`:t.italic=n.attrs.val!==`0`&&n.attrs.val!==`false`;break;case`u`:{let e=n.attrs.val;e===`double`?t.underline=`double`:e===`singleAccounting`?t.underline=`singleAccounting`:e===`doubleAccounting`?t.underline=`doubleAccounting`:t.underline=!0;break}case`strike`:t.strikethrough=n.attrs.val!==`0`&&n.attrs.val!==`false`;break;case`sz`:n.attrs.val&&(t.size=Number(n.attrs.val));break;case`rFont`:n.attrs.val&&(t.name=n.attrs.val);break;case`color`:t.color={},n.attrs.rgb&&(t.color.rgb=n.attrs.rgb.replace(/^FF/,``)),n.attrs.theme&&(t.color.theme=Number(n.attrs.theme)),n.attrs.tint&&(t.color.tint=Number(n.attrs.tint)),n.attrs.indexed&&(t.color.indexed=Number(n.attrs.indexed));break;case`vertAlign`:(n.attrs.val===`superscript`||n.attrs.val===`subscript`)&&(t.vertAlign=n.attrs.val);break;case`family`:n.attrs.val&&(t.family=Number(n.attrs.val));break;case`charset`:n.attrs.val&&(t.charset=Number(n.attrs.val));break;case`scheme`:(n.attrs.val===`major`||n.attrs.val===`minor`||n.attrs.val===`none`)&&(t.scheme=n.attrs.val);break}return t}var Ke=Date.UTC(1899,11,31),qe=Date.UTC(1904,0,1),Je=864e5;function Ye(e,t){if(t){let t=qe+Math.round(e*Je);return new Date(t)}if(e===60)return new Date(Date.UTC(1900,1,28));let n=e;e>60&&(n=e-1);let r=Ke+Math.round(n*Je);return new Date(r)}function Xe(e,t){let n=e.getTime();if(t)return(n-qe)/Je;let r=(n-Ke)/Je;return r>=60&&(r+=1),Math.round(r*1e10)/1e10}var Ze=new Set([14,15,16,17,18,19,20,21,22,27,28,29,30,31,32,33,34,35,36,45,46,47,50,51,52,53,54,55,56,57,58]);function Qe(e){if(!e)return!1;let t=Number(e);if(!Number.isNaN(t)&&Number.isInteger(t)&&Ze.has(t))return!0;let n=e.replace(/\[[$\-\w]*\]/g,``);if(n=n.replace(/\\./g,``),n=n.replace(/"[^"]*"/g,``),n=n.replace(/[*_]./g,``),/^(General|@)$/i.test(n.trim()))return!1;let r=n.toLowerCase();return!!(/[hs]/.test(r)&&(/\bh{1,2}\b|(?:^|[^a-z])h{1,2}(?:[^a-z]|$)/i.test(r)||/\bs{1,2}\b|(?:^|[^a-z])s{1,2}(?:[^a-z]|$)/i.test(r))||/am\/pm|a\/p/i.test(r)||/\[h+\]|\[m+\]|\[s+\]/i.test(e)||/y{1,4}/.test(r)||/d{1,4}/.test(r)||/m{3,}/.test(r))}var $e=[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`],et=[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`],Y=[`Sunday`,`Monday`,`Tuesday`,`Wednesday`,`Thursday`,`Friday`,`Saturday`],tt=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`];function nt(e,t){let n=e.getUTCFullYear(),r=e.getUTCMonth(),i=e.getUTCDate(),a=e.getUTCDay(),o=e.getUTCHours(),s=e.getUTCMinutes(),c=e.getUTCSeconds(),l=e.getUTCMilliseconds(),u=/am\/pm|a\/p/i.test(t),d=``,f=o;u&&(d=o>=12?`PM`:`AM`,f=o%12,f===0&&(f=12));let p=rt(t),m=``,h=!1;for(let e of p){let t=e.toLowerCase();switch(t){case`yyyy`:m+=String(n),h=!1;break;case`yy`:m+=String(n%100).padStart(2,`0`),h=!1;break;case`mmmm`:m+=$e[r],h=!1;break;case`mmm`:m+=et[r],h=!1;break;case`mm`:h?m+=String(s).padStart(2,`0`):m+=String(r+1).padStart(2,`0`),h=!1;break;case`m`:h?m+=String(s):m+=String(r+1),h=!1;break;case`dddd`:m+=Y[a],h=!1;break;case`ddd`:m+=tt[a],h=!1;break;case`dd`:m+=String(i).padStart(2,`0`),h=!1;break;case`d`:m+=String(i),h=!1;break;case`hh`:m+=String(f).padStart(2,`0`),h=!0;break;case`h`:m+=String(f),h=!0;break;case`ss`:m+=String(c).padStart(2,`0`),h=!1;break;case`s`:m+=String(c),h=!1;break;case`.0`:case`.00`:case`.000`:{let e=t.length-1,n=String(l).padStart(3,`0`).slice(0,e);m+=`.`+n,h=!1}break;case`am/pm`:m+=d,h=!1;break;case`a/p`:m+=d.charAt(0),h=!1;break;default:m+=e;break}}return m}function rt(e){let t=[],n=0;for(;n<e.length;){if(e[n]===`[`&&e[n+1]===`$`){let t=e.indexOf(`]`,n);if(t!==-1){n=t+1;continue}}if(e[n]===`[`){let t=e.indexOf(`]`,n);if(t!==-1){n=t+1;continue}}if(e[n]===`"`){let r=``;for(n++;n<e.length&&e[n]!==`"`;)r+=e[n],n++;n++,t.push(r);continue}if(e[n]===`\\`){n++,n<e.length&&(t.push(e[n]),n++);continue}if(/^am\/pm/i.test(e.slice(n))){t.push(e.slice(n,n+5)),n+=5;continue}if(/^a\/p/i.test(e.slice(n))){t.push(e.slice(n,n+3)),n+=3;continue}if(e[n]===`.`&&n+1<e.length&&e[n+1]===`0`){let r=`.`,i=n+1;for(;i<e.length&&e[i]===`0`;)r+=`0`,i++;t.push(r),n=i;continue}let r=e[n].toLowerCase();if(`ymdhsn`.includes(r)){let i=``,a=r;for(;n<e.length&&e[n].toLowerCase()===a;)i+=e[n],n++;t.push(i);continue}t.push(e[n]),n++}return t}function it(e){if(!e||!e.trim())return null;let t=e.trim(),n=t.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?([Zz]|[+-]\d{2}:?\d{2})?)?$/);if(n){let e=Number(n[1]),t=Number(n[2])-1,r=Number(n[3]),i=Number(n[4]||0),a=Number(n[5]||0),o=Number(n[6]||0),s=0;n[7]&&(s=Number(n[7].padEnd(3,`0`).slice(0,3)));let c=n[8];if(c&&c.toUpperCase()!==`Z`){let n=c.match(/^([+-])(\d{2}):?(\d{2})$/);if(n){let c=n[1]===`+`?1:-1,l=Number(n[2]),u=Number(n[3]),d=c*(l*60+u)*6e4,f=Date.UTC(e,t,r,i,a,o,s)-d;return new Date(f)}}return new Date(Date.UTC(e,t,r,i,a,o,s))}let r=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(r){let e=Number(r[1])-1,t=Number(r[2]),n=Number(r[3]);if(e>=0&&e<=11&&t>=1&&t<=31)return new Date(Date.UTC(n,e,t))}let i=t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);if(i){let e=Number(i[1]),t=Number(i[2])-1,n=Number(i[3]);if(t>=0&&t<=11&&e>=1&&e<=31)return new Date(Date.UTC(n,t,e))}let a=t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);if(a){let e=Number(a[1]),t=Number(a[2])-1,n=Number(a[3]);if(t>=0&&t<=11&&e>=1&&e<=31)return new Date(Date.UTC(n,t,e))}return null}function at(e){let t=Math.abs(e)%1,n=Math.round(t*Je);return{hours:Math.floor(n/36e5),minutes:Math.floor(n%36e5/6e4),seconds:Math.floor(n%6e4/1e3),milliseconds:n%1e3}}function ot(e,t,n=0,r=0){return(e*36e5+t*6e4+n*1e3+r)/Je}var st={0:`General`,1:`0`,2:`0.00`,3:`#,##0`,4:`#,##0.00`,5:`$#,##0_);\\($#,##0\\)`,6:`$#,##0_);[Red]\\($#,##0\\)`,7:`$#,##0.00_);\\($#,##0.00\\)`,8:`$#,##0.00_);[Red]\\($#,##0.00\\)`,9:`0%`,10:`0.00%`,11:`0.00E+00`,12:`# ?/?`,13:`# ??/??`,14:`m/d/yyyy`,15:`d-mmm-yy`,16:`d-mmm`,17:`mmm-yy`,18:`h:mm AM/PM`,19:`h:mm:ss AM/PM`,20:`h:mm`,21:`h:mm:ss`,22:`m/d/yyyy h:mm`,37:`#,##0 ;(#,##0)`,38:`#,##0 ;[Red](#,##0)`,39:`#,##0.00;(#,##0.00)`,40:`#,##0.00;[Red](#,##0.00)`,45:`mm:ss`,46:`[h]:mm:ss`,47:`mmss.0`,48:`##0.0E+0`,49:`@`},ct=new Set([14,15,16,17,18,19,20,21,22,27,28,29,30,31,32,33,34,35,36,45,46,47,50,51,52,53,54,55,56,57,58]);function lt(e){let t=W(e),n=new Map,r=[],i=[],a=[],o=[];for(let e of t.children)if(typeof e!=`string`)switch(e.local||e.tag){case`numFmts`:ut(e,n);break;case`fonts`:dt(e,r);break;case`fills`:mt(e,i);break;case`borders`:vt(e,a);break;case`cellXfs`:xt(e,o);break}return{numFmts:n,fonts:r,fills:i,borders:a,cellXfs:o}}function ut(e,t){for(let n of e.children)if(typeof n!=`string`&&(n.local||n.tag)===`numFmt`){let e=Number(n.attrs.numFmtId),r=n.attrs.formatCode??``;Number.isNaN(e)||t.set(e,r)}}function dt(e,t){for(let n of e.children)typeof n!=`string`&&(n.local||n.tag)===`font`&&t.push(ft(n))}function ft(e){let t={};for(let n of e.children)if(typeof n!=`string`)switch(n.local||n.tag){case`b`:t.bold=n.attrs.val!==`0`&&n.attrs.val!==`false`;break;case`i`:t.italic=n.attrs.val!==`0`&&n.attrs.val!==`false`;break;case`u`:{let e=n.attrs.val;e===`double`?t.underline=`double`:e===`singleAccounting`?t.underline=`singleAccounting`:e===`doubleAccounting`?t.underline=`doubleAccounting`:t.underline=!0;break}case`strike`:t.strikethrough=n.attrs.val!==`0`&&n.attrs.val!==`false`;break;case`sz`:n.attrs.val&&(t.size=Number(n.attrs.val));break;case`name`:n.attrs.val&&(t.name=n.attrs.val);break;case`color`:t.color=pt(n);break;case`vertAlign`:(n.attrs.val===`superscript`||n.attrs.val===`subscript`)&&(t.vertAlign=n.attrs.val);break;case`family`:n.attrs.val&&(t.family=Number(n.attrs.val));break;case`charset`:n.attrs.val&&(t.charset=Number(n.attrs.val));break;case`scheme`:(n.attrs.val===`major`||n.attrs.val===`minor`||n.attrs.val===`none`)&&(t.scheme=n.attrs.val);break}return t}function pt(e){let t={};if(e.attrs.rgb){let n=e.attrs.rgb;t.rgb=n.length===8?n.slice(2):n}return e.attrs.theme&&(t.theme=Number(e.attrs.theme)),e.attrs.tint&&(t.tint=Number(e.attrs.tint)),e.attrs.indexed&&(t.indexed=Number(e.attrs.indexed)),t}function mt(e,t){for(let n of e.children)typeof n!=`string`&&(n.local||n.tag)===`fill`&&t.push(ht(n))}function ht(e){for(let t of e.children){if(typeof t==`string`)continue;let e=t.local||t.tag;if(e===`patternFill`)return gt(t);if(e===`gradientFill`)return _t(t)}return{type:`pattern`,pattern:`none`}}function gt(e){let t={type:`pattern`,pattern:e.attrs.patternType??`none`};for(let n of e.children){if(typeof n==`string`)continue;let e=n.local||n.tag;e===`fgColor`?t.fgColor=pt(n):e===`bgColor`&&(t.bgColor=pt(n))}return t}function _t(e){let t=e.attrs.degree?Number(e.attrs.degree):void 0,n=[];for(let t of e.children)if(typeof t!=`string`&&(t.local||t.tag)===`stop`){let e=Number(t.attrs.position??`0`);for(let r of t.children)typeof r!=`string`&&(r.local||r.tag)===`color`&&n.push({position:e,color:pt(r)})}return{type:`gradient`,degree:t,stops:n}}function vt(e,t){for(let n of e.children)typeof n!=`string`&&(n.local||n.tag)===`border`&&t.push(yt(n))}function yt(e){let t={},n=e.attrs.diagonalUp,r=e.attrs.diagonalDown;(n===`1`||n===`true`)&&(t.diagonalUp=!0),(r===`1`||r===`true`)&&(t.diagonalDown=!0);for(let n of e.children){if(typeof n==`string`)continue;let e=n.local||n.tag,r=bt(n);if(r)switch(e){case`left`:t.left=r;break;case`right`:t.right=r;break;case`top`:t.top=r;break;case`bottom`:t.bottom=r;break;case`diagonal`:t.diagonal=r;break}}return t}function bt(e){let t=e.attrs.style;if(!t)return;let n={style:t};for(let t of e.children)typeof t!=`string`&&(t.local||t.tag)===`color`&&(n.color=pt(t));return n}function xt(e,t){for(let n of e.children)typeof n!=`string`&&(n.local||n.tag)===`xf`&&t.push(St(n))}function St(e){let t={numFmtId:Number(e.attrs.numFmtId??`0`),fontId:Number(e.attrs.fontId??`0`),fillId:Number(e.attrs.fillId??`0`),borderId:Number(e.attrs.borderId??`0`)};(e.attrs.applyNumberFormat===`1`||e.attrs.applyNumberFormat===`true`)&&(t.applyNumberFormat=!0),(e.attrs.applyFont===`1`||e.attrs.applyFont===`true`)&&(t.applyFont=!0),(e.attrs.applyFill===`1`||e.attrs.applyFill===`true`)&&(t.applyFill=!0),(e.attrs.applyBorder===`1`||e.attrs.applyBorder===`true`)&&(t.applyBorder=!0),(e.attrs.applyAlignment===`1`||e.attrs.applyAlignment===`true`)&&(t.applyAlignment=!0),(e.attrs.applyProtection===`1`||e.attrs.applyProtection===`true`)&&(t.applyProtection=!0);for(let n of e.children){if(typeof n==`string`)continue;let e=n.local||n.tag;e===`alignment`?t.alignment=wt(n):e===`protection`&&(t.protection=Ct(n))}return t}function Ct(e){let t={},n=e.attrs.locked;n!==void 0&&(t.locked=n===`1`||n===`true`);let r=e.attrs.hidden;return r!==void 0&&(t.hidden=r===`1`||r===`true`),t}function wt(e){let t={};if(e.attrs.horizontal&&(t.horizontal=e.attrs.horizontal),e.attrs.vertical&&(t.vertical=e.attrs.vertical),(e.attrs.wrapText===`1`||e.attrs.wrapText===`true`)&&(t.wrapText=!0),(e.attrs.shrinkToFit===`1`||e.attrs.shrinkToFit===`true`)&&(t.shrinkToFit=!0),e.attrs.textRotation&&(t.textRotation=Number(e.attrs.textRotation)),e.attrs.indent&&(t.indent=Number(e.attrs.indent)),e.attrs.readingOrder){let n=Number(e.attrs.readingOrder);n===1?t.readingOrder=`ltr`:n===2?t.readingOrder=`rtl`:t.readingOrder=`context`}return t}function Tt(e,t){let n=e.cellXfs[t];if(!n)return{};let r={};if(n.numFmtId!==0){let t=e.numFmts.get(n.numFmtId)??st[n.numFmtId];t&&(r.numFmt=t)}return n.fontId<e.fonts.length&&n.fontId!==0&&(r.font=e.fonts[n.fontId]),n.fillId<e.fills.length&&n.fillId>1&&(r.fill=e.fills[n.fillId]),n.borderId<e.borders.length&&n.borderId!==0&&(r.border=e.borders[n.borderId]),n.alignment&&(r.alignment=n.alignment),n.protection&&(r.protection=n.protection),r}function Et(e,t){let n=e.cellXfs[t];if(!n)return!1;let r=n.numFmtId;if(ct.has(r))return!0;let i=e.numFmts.get(r);if(i)return Qe(i);let a=st[r];return a?Qe(a):!1}function X(e){let t=0,n=0;for(;t<e.length;){let r=e.charCodeAt(t);if(r>=65&&r<=90)n=n*26+(r-64),t++;else if(r>=97&&r<=122)n=n*26+(r-96),t++;else break}return n--,{row:Number(e.slice(t))-1,col:n}}function Dt(e){let t=e.split(`:`),n=X(t[0]),r=t.length>1?X(t[1]):n;return{startRow:n.row,startCol:n.col,endRow:r.row,endCol:r.col}}function Ot(e,t,n){let r=[],i=new Map,a=[],o=-1,s=-1,c=!1,l;n.range&&(l=Dt(n.range));let u=[],d=[],f=[],p,m=!1,h=-1,g=[],_,v,y=!1,b,x,S,C,w,T=[],E=[],D=!1,ee=!1,te=[],O=!1,ne=!1,k=!1,A=!1,re=!1,j=``,ie=``,ae=!1,M=``,oe=``,N=!1,se=!1,P=!1,F=!1,ce=!1,I=!1,le=!1,L=``,ue=n.maxRows??0,de=0,R=new Map,fe=[],pe=!1,z=!1,me=!1,B=!1,he=!1,ge=!1,_e=!1,ve=!1,ye=!1,be=!1,V=!1,xe=!1,Se=!1,Ce=!1,we=``,H=``,Te={},Ee=!1,De=``,U=!1,ke={},Ae=!1,je=``,W=[],Ne=!1,Pe=[],Fe=[],Ie=!1,G=[],Le=``,Re=!1,K={},q=[],ze=!1,J=!1,Be=!1,Ve=``,He=``,Ue=-1,We=``,Ge=``,Ke=``,qe=-1,Je=``,Ye=!1,Xe=``,Ze=[],Qe=``,$e;if(Me(e,{onOpenTag(e,t){let n=e.includes(`:`)?e.slice(e.indexOf(`:`)+1):e;switch(n){case`cols`:pe=!0;break;case`col`:if(pe){let e=Number(t.min||`0`),n=Number(t.max||`0`),r=t.width?Number(t.width):void 0,i=t.hidden===`1`||t.hidden===`true`,a=t.outlineLevel?Number(t.outlineLevel):void 0,o=t.collapsed===`1`||t.collapsed===`true`;for(let t=e;t<=n;t++){let e=t-1;for(;fe.length<=e;)fe.push({});let n={};r!==void 0&&!Number.isNaN(r)&&(n.width=r),i&&(n.hidden=!0),a!==void 0&&!Number.isNaN(a)&&a>0&&(n.outlineLevel=a),o&&(n.collapsed=!0),Object.keys(n).length>0&&(fe[e]=n)}}break;case`sheetData`:z=!0;break;case`row`:if(z){if(ue>0&&de>=ue)break;if(me=!0,t.ht&&(t.customHeight===`1`||t.customHeight===`true`)){let e=Number(t.r)-1,n=Number(t.ht);if(!Number.isNaN(e)&&!Number.isNaN(n)){let t=R.get(e)??{};t.height=n,R.set(e,t)}}if(t.hidden===`1`||t.hidden===`true`){let e=Number(t.r)-1;if(!Number.isNaN(e)){let t=R.get(e)??{};t.hidden=!0,R.set(e,t)}}if(t.outlineLevel){let e=Number(t.r)-1,n=Number(t.outlineLevel);if(!Number.isNaN(e)&&!Number.isNaN(n)&&n>0){let t=R.get(e)??{};t.outlineLevel=n,R.set(e,t)}}if(t.collapsed===`1`||t.collapsed===`true`){let e=Number(t.r)-1;if(!Number.isNaN(e)){let t=R.get(e)??{};t.collapsed=!0,R.set(e,t)}}}break;case`c`:me&&(B=!0,Ve=t.r??``,He=t.t??``,Ue=t.s?Number(t.s):-1,We=``,Ge=``,Ke=``,qe=-1,Je=``,Ye=!1,Xe=``,Ze=[]);break;case`v`:B&&(he=!0);break;case`f`:k?(A=!0,M=``):B&&(ge=!0,Ke=t.t??``,t.si!==void 0&&(qe=Number(t.si)),t.ref&&(Je=t.ref),t.cm===`1`&&(Ye=!0));break;case`is`:B&&(_e=!0);break;case`t`:_e&&!ze?ve=!0:ze&&(Be=!0);break;case`r`:_e&&(ze=!0,Qe=``,$e=void 0);break;case`rPr`:ze&&(J=!0,$e={});break;case`sheetPr`:y=!0;break;case`tabColor`:y&&(v||={},v.tabColor=Bt(t));break;case`sheetView`:if(!z){if(v||={},(t.showGridLines===`0`||t.showGridLines===`false`)&&(v.showGridLines=!1),(t.showRowColHeaders===`0`||t.showRowColHeaders===`false`)&&(v.showRowColHeaders=!1),t.zoomScale){let e=Number(t.zoomScale);Number.isNaN(e)||(v.zoomScale=e)}(t.rightToLeft===`1`||t.rightToLeft===`true`)&&(v.rightToLeft=!0)}break;case`pane`:if(!z){let e=t.state;if(e===`frozen`||e===`frozenSplit`){let e=Number(t.xSplit||`0`),n=Number(t.ySplit||`0`);(e>0||n>0)&&(b={},e>0&&(b.columns=e),n>0&&(b.rows=n))}else if(e===`split`){let e=Number(t.xSplit||`0`),n=Number(t.ySplit||`0`);(e>0||n>0)&&(x={},e>0&&(x.xSplit=e),n>0&&(x.ySplit=n))}}break;case`sheetProtection`:_=kt(t);break;case`autoFilter`:t.ref&&(p={range:t.ref},m=!0);break;case`filterColumn`:m&&t.colId!==void 0&&(h=Number(t.colId),g=[]);break;case`filter`:m&&h>=0&&t.val!==void 0&&g.push(t.val);break;case`mergeCells`:ye=!0;break;case`mergeCell`:ye&&t.ref&&a.push(Dt(t.ref));break;case`hyperlinks`:be=!0;break;case`hyperlink`:if(be&&t.ref){let e={ref:t.ref},n=t[`r:id`]??t[`R:id`];n&&(e.rId=n),t.location&&(e.location=t.location),t.tooltip&&(e.tooltip=t.tooltip),t.display&&(e.display=t.display),u.push(e)}break;case`conditionalFormatting`:Ee=!0,De=t.sqref??``;break;case`cfRule`:Ee&&(U=!0,ke={...t},W=[],Pe=[],Fe=[],G=[],Le=``,q=[],K={});break;case`colorScale`:U&&(Ne=!0,Pe=[],Fe=[]);break;case`cfvo`:Ne?Pe.push({type:t.type??`min`,value:t.val}):Ie?G.push({type:t.type??`min`,value:t.val}):Re&&q.push({type:t.type??`min`,value:t.val});break;case`dataBar`:U&&(Ie=!0,G=[],Le=``);break;case`iconSet`:U&&(Re=!0,K={...t},q=[]);break;case`dataValidations`:V=!0;break;case`dataValidation`:V&&(xe=!0,Te={...t},we=``,H=``);break;case`formula1`:xe&&(Se=!0);break;case`formula2`:xe&&(Ce=!0);break;case`pageMargins`:C=Lt(t);break;case`pageSetup`:S=zt(t);break;case`headerFooter`:N=!0,w={},(t.differentOddEven===`1`||t.differentOddEven===`true`)&&(w.differentOddEven=!0),(t.differentFirst===`1`||t.differentFirst===`true`)&&(w.differentFirst=!0);break;case`oddHeader`:N&&(se=!0,L=``);break;case`oddFooter`:N&&(P=!0,L=``);break;case`evenHeader`:N&&(F=!0,L=``);break;case`evenFooter`:N&&(ce=!0,L=``);break;case`firstHeader`:N&&(I=!0,L=``);break;case`firstFooter`:N&&(le=!0,L=``);break;case`rowBreaks`:D=!0;break;case`colBreaks`:ee=!0;break;case`brk`:if(D||ee){let e=t.id;if(e){let t=Number(e)-1;D?T.push(t):E.push(t)}}break;case`color`:Ne?Fe.push(t.rgb??``):Ie?Le=t.rgb??``:J&&$e&&It($e,n,t);break;case`formula`:U&&!xe&&(Ae=!0,je=``);break;case`sparklineGroups`:O=!0;break;case`sparklineGroup`:O&&(ne=!0,j=t.type??`line`,ie=``,ae=t.markers===`1`||t.markers===`true`);break;case`colorSeries`:if(ne){let e=t.rgb??``;ie=e.length===8?e.slice(2):e}break;case`sparkline`:ne&&(k=!0,M=``,oe=``);break;default:if(k&&n===`sqref`){re=!0,oe=``;break}J&&$e&&It($e,n,t);break}},onText(e){he?We+=e:ge?Ge+=e:Ae?je+=e:ve?Xe+=e:Be?Qe+=e:Se?we+=e:Ce?H+=e:se||P||F||ce||I||le?L+=e:A?M+=e:re&&(oe+=e)},onCloseTag(e){let t=e.includes(`:`)?e.slice(e.indexOf(`:`)+1):e;switch(t){case`cols`:pe=!1;break;case`sheetData`:z=!1;break;case`row`:me&&de++,me=!1;break;case`c`:if(B){let e=!1;if(l&&Ve){let t=X(Ve);(t.row<l.startRow||t.row>l.endRow||t.col<l.startCol||t.col>l.endCol)&&(e=!0)}if(!e&&(Ft(Ve,He,Ue,We,Ge,Xe,Ze.length>0?Ze:void 0,n,r,i,Ke,qe,Je,Ye),Ve)){let e=X(Ve);e.col>o&&(o=e.col),e.row>s&&(s=e.row),c=!0}B=!1}break;case`v`:he=!1;break;case`f`:A?A=!1:ge=!1;break;case`is`:_e=!1;break;case`t`:Be?Be=!1:ve&&=!1;break;case`r`:if(ze){let e=Oe(Qe);Ze.push($e?{text:e,font:$e}:{text:e}),ze=!1}break;case`rPr`:J=!1;break;case`sheetPr`:y=!1;break;case`mergeCells`:ye=!1;break;case`autoFilter`:m=!1;break;case`filterColumn`:m&&p&&h>=0&&g.length>0&&(p.columns||=[],p.columns.push({colIndex:h,filters:g})),h=-1,g=[];break;case`hyperlinks`:be=!1;break;case`conditionalFormatting`:Ee=!1;break;case`cfRule`:if(U){let e=Pt(ke,De,W,Pe,Fe,G,Le,q,K);e&&f.push(e),U=!1}break;case`colorScale`:Ne=!1;break;case`dataBar`:U&&(Ie=!1);break;case`iconSet`:Re=!1;break;case`formula`:Ae&&=(W.push(je),!1);break;case`dataValidations`:V=!1;break;case`dataValidation`:if(xe){let e=Mt(Te,we,H);e&&d.push(e),xe=!1}break;case`formula1`:Se=!1;break;case`formula2`:Ce=!1;break;case`headerFooter`:N=!1;break;case`oddHeader`:se&&w&&(w.oddHeader=L,se=!1);break;case`oddFooter`:P&&w&&(w.oddFooter=L,P=!1);break;case`evenHeader`:F&&w&&(w.evenHeader=L,F=!1);break;case`evenFooter`:ce&&w&&(w.evenFooter=L,ce=!1);break;case`firstHeader`:I&&w&&(w.firstHeader=L,I=!1);break;case`firstFooter`:le&&w&&(w.firstFooter=L,le=!1);break;case`rowBreaks`:D=!1;break;case`colBreaks`:ee=!1;break;case`sparklineGroups`:O=!1;break;case`sparklineGroup`:ne=!1;break;case`sparkline`:if(k&&oe){let e={location:oe,dataRange:M};j&&j!==`line`&&(e.type=j),ie&&(e.color=ie),ae&&(e.markers=!0),te.push(e)}k=!1;break;default:if(k&&t===`sqref`){re=!1;break}break}}}),c){let e=o+1;for(let t=0;t<=s;t++)if(!r[t])r[t]=Array.from({length:e},()=>null);else for(;r[t].length<e;)r[t].push(null)}let et=new Map;if(n.worksheetRels)for(let e of n.worksheetRels)et.set(e.id,e.target);for(let e of u){let t=X(e.ref),n=`${t.row},${t.col}`,a=i.get(n);a||(a={value:(r[t.row]&&r[t.row][t.col])??null,type:`string`},i.set(n,a));let o={target:``};if(e.location)o.location=e.location,o.target=e.location;else if(e.rId){let t=et.get(e.rId);t&&(o.target=t)}e.tooltip&&(o.tooltip=e.tooltip),e.display&&(o.display=e.display),a.hyperlink=o}let Y={name:t,rows:r};if(i.size>0&&(Y.cells=i),fe.length>0&&fe.some(e=>Object.keys(e).length>0)&&(Y.columns=fe),a.length>0&&(Y.merges=a),d.length>0&&(Y.dataValidations=d),f.length>0&&(Y.conditionalRules=f),p&&(Y.autoFilter=p),b&&(Y.freezePane=b),x&&(Y.splitPane=x),_&&(Y.protection=_),v&&Object.keys(v).length>0&&(Y.view=v),S||C){let e=S??{};C&&(e.margins=C),Y.pageSetup=e}return w&&Object.keys(w).length>0&&(Y.headerFooter=w),T.length>0&&(Y.rowBreaks=T.sort((e,t)=>e-t)),E.length>0&&(Y.colBreaks=E.sort((e,t)=>e-t)),R.size>0&&(Y.rowDefs=R),te.length>0&&(Y.sparklines=te),Y}function kt(e){let t={};(e.sheet===`1`||e.sheet===`true`)&&(t.sheet=!0),(e.objects===`1`||e.objects===`true`)&&(t.objects=!0),(e.scenarios===`1`||e.scenarios===`true`)&&(t.scenarios=!0);for(let[n,r]of[[`selectLockedCells`,`selectLockedCells`],[`selectUnlockedCells`,`selectUnlockedCells`],[`formatCells`,`formatCells`],[`formatColumns`,`formatColumns`],[`formatRows`,`formatRows`],[`insertColumns`,`insertColumns`],[`insertRows`,`insertRows`],[`insertHyperlinks`,`insertHyperlinks`],[`deleteColumns`,`deleteColumns`],[`deleteRows`,`deleteRows`],[`sort`,`sort`],[`autoFilter`,`autoFilter`],[`pivotTables`,`pivotTables`]]){let i=e[n];i!==void 0&&(t[r]=!(i===`1`||i===`true`))}return t}var At=new Set([`list`,`whole`,`decimal`,`date`,`time`,`textLength`,`custom`]),jt=new Set([`between`,`notBetween`,`equal`,`notEqual`,`greaterThan`,`lessThan`,`greaterThanOrEqual`,`lessThanOrEqual`]);function Mt(e,t,n){let r=e.type;if(!r||!At.has(r))return null;let i=e.sqref;if(!i)return null;let a={type:r,range:i},o=e.operator;o&&jt.has(o)&&(a.operator=o),(e.allowBlank===`1`||e.allowBlank===`true`)&&(a.allowBlank=!0),(e.showInputMessage===`1`||e.showInputMessage===`true`)&&(a.showInputMessage=!0),(e.showErrorMessage===`1`||e.showErrorMessage===`true`)&&(a.showErrorMessage=!0);let s=e.errorStyle;if((s===`stop`||s===`warning`||s===`information`)&&(a.errorStyle=s),e.promptTitle&&(a.inputTitle=e.promptTitle),e.prompt&&(a.inputMessage=e.prompt),e.errorTitle&&(a.errorTitle=e.errorTitle),e.error&&(a.errorMessage=e.error),t)if(r===`list`){let e=t.trim();e.startsWith(`"`)&&e.endsWith(`"`)?a.values=e.slice(1,-1).split(`,`):a.formula1=t}else a.formula1=t;return n&&(a.formula2=n),a}var Nt=new Set([`cellIs`,`expression`,`colorScale`,`dataBar`,`iconSet`,`top10`,`aboveAverage`,`duplicateValues`,`uniqueValues`,`containsText`,`notContainsText`,`beginsWith`,`endsWith`,`containsBlanks`,`notContainsBlanks`]);function Pt(e,t,n,r,i,a,o,s,c){let l=e.type;if(!l||!Nt.has(l)||!t)return null;let u={type:l,priority:Number(e.priority??`1`),range:t},d=e.operator;return d&&jt.has(d)&&(u.operator=d),(e.stopIfTrue===`1`||e.stopIfTrue===`true`)&&(u.stopIfTrue=!0),e.text!==void 0&&(u.text=e.text),n.length===1?u.formula=n[0]:n.length>1&&(u.formula=n),l===`colorScale`&&r.length>0&&(u.colorScale={cfvo:r.map(e=>({type:e.type,value:e.value})),colors:i}),l===`dataBar`&&a.length>0&&(u.dataBar={cfvo:a.map(e=>({type:e.type,value:e.value})),color:o}),l===`iconSet`&&s.length>0&&(u.iconSet={iconSet:c.iconSet??`3TrafficLights1`,cfvo:s.map(e=>({type:e.type,value:e.value}))},(c.reverse===`1`||c.reverse===`true`)&&(u.iconSet.reverse=!0),(c.showValue===`0`||c.showValue===`false`)&&(u.iconSet.showValue=!1)),u}function Ft(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(!e)return;let{row:m,col:h}=X(e);for(;c.length<=m;)c.push([]);for(;c[m].length<=h;)c[m].push(null);let g=null,_=`empty`,v,y,b;switch(i?v=i:u===`shared`&&d!==void 0&&d>=0&&(v=``),t){case`s`:{let e=Number(r);if(!Number.isNaN(e)&&e>=0&&e<s.sharedStrings.length){let t=s.sharedStrings[e];g=t.text,t.richText&&t.richText.length>0?(b=t.richText,_=`richText`):_=`string`}else g=r,_=`string`;break}case`str`:g=Oe(r),_=v?`formula`:`string`;break;case`inlineStr`:o&&o.length>0?(g=o.map(e=>e.text).join(``),b=o,_=`richText`):(g=Oe(a),_=`string`);break;case`b`:g=r===`1`||r.toLowerCase()===`true`,_=`boolean`;break;case`e`:g=r,_=`error`;break;default:{if(r===``&&!v){g=null,_=`empty`;break}let e=Number(r);!Number.isNaN(e)&&r!==``?s.styles&&n>=0&&Et(s.styles,n)?(g=Ye(e,s.dateSystem===`1904`),_=`date`):(g=e,_=`number`):r!==``&&(g=r,_=`string`),v&&(y=g,_=`formula`);break}}if(c[m][h]=g,v!==void 0||b!==void 0||s.readStyles&&s.styles&&n>=0||_===`error`||_===`formula`||_===`richText`){let e={value:g,type:_};if(v!==void 0&&(e.formula=v,y!==void 0&&(e.formulaResult=y),u===`shared`?(e.formulaType=`shared`,d!==void 0&&d>=0&&(e.formulaSharedIndex=d),f&&(e.formulaRef=f)):u===`array`&&(e.formulaType=`array`,f&&(e.formulaRef=f),p&&(e.formulaDynamic=!0))),b&&(e.richText=b),s.readStyles&&s.styles&&n>=0){let t=Tt(s.styles,n);Object.keys(t).length>0&&(e.style=t)}l.set(`${m},${h}`,e)}}function It(e,t,n){switch(t){case`b`:e.bold=n.val!==`0`&&n.val!==`false`;break;case`i`:e.italic=n.val!==`0`&&n.val!==`false`;break;case`u`:n.val===`double`?e.underline=`double`:e.underline=!0;break;case`strike`:e.strikethrough=n.val!==`0`&&n.val!==`false`;break;case`sz`:n.val&&(e.size=Number(n.val));break;case`rFont`:n.val&&(e.name=n.val);break;case`color`:if(e.color={},n.rgb){let t=n.rgb;e.color.rgb=t.length===8?t.slice(2):t}n.theme&&(e.color.theme=Number(n.theme)),n.tint&&(e.color.tint=Number(n.tint)),n.indexed&&(e.color.indexed=Number(n.indexed));break;case`vertAlign`:(n.val===`superscript`||n.val===`subscript`)&&(e.vertAlign=n.val);break;case`family`:n.val&&(e.family=Number(n.val));break;case`charset`:n.val&&(e.charset=Number(n.val));break;case`scheme`:(n.val===`major`||n.val===`minor`||n.val===`none`)&&(e.scheme=n.val);break}}function Lt(e){let t={};return e.left&&(t.left=Number(e.left)),e.right&&(t.right=Number(e.right)),e.top&&(t.top=Number(e.top)),e.bottom&&(t.bottom=Number(e.bottom)),e.header&&(t.header=Number(e.header)),e.footer&&(t.footer=Number(e.footer)),t}var Rt={1:`letter`,3:`tabloid`,5:`legal`,7:`executive`,8:`a3`,9:`a4`,11:`a5`,12:`b4`,13:`b5`};function zt(e){let t={};if(e.paperSize){let n=Rt[Number(e.paperSize)];n&&(t.paperSize=n)}return(e.orientation===`landscape`||e.orientation===`portrait`)&&(t.orientation=e.orientation),e.scale&&(t.scale=Number(e.scale)),(e.fitToWidth!==void 0||e.fitToHeight!==void 0)&&(t.fitToPage=!0,e.fitToWidth&&(t.fitToWidth=Number(e.fitToWidth)),e.fitToHeight&&(t.fitToHeight=Number(e.fitToHeight))),(e.horizontalCentered===`1`||e.horizontalCentered===`true`)&&(t.horizontalCentered=!0),(e.verticalCentered===`1`||e.verticalCentered===`true`)&&(t.verticalCentered=!0),t}function Bt(e){let t={};if(e.rgb){let n=e.rgb;t.rgb=n.length===8?n.slice(2):n}return e.theme&&(t.theme=Number(e.theme)),e.tint&&(t.tint=Number(e.tint)),e.indexed&&(t.indexed=Number(e.indexed)),t}function Vt(e){let t=new Map,n=[],r=!1,i=!1,a=!1,o=!1,s=!1,c=!1,l=``,u=``,d=-1,f=``;return Me(e,{onOpenTag(e,t){switch(e.includes(`:`)?e.slice(e.indexOf(`:`)+1):e){case`authors`:r=!0;break;case`author`:r&&(i=!0,l=``);break;case`commentList`:a=!0;break;case`comment`:a&&(o=!0,u=t.ref??``,d=t.authorId?Number(t.authorId):-1,f=``);break;case`text`:o&&(s=!0);break;case`r`:break;case`t`:s&&(c=!0);break}},onText(e){i?l+=e:c&&(f+=e)},onCloseTag(e){switch(e.includes(`:`)?e.slice(e.indexOf(`:`)+1):e){case`authors`:r=!1;break;case`author`:i&&=(n.push(l),!1);break;case`commentList`:a=!1;break;case`comment`:if(o&&u){let e={text:f};if(d>=0&&d<n.length){let t=n[d];t&&(e.author=t)}t.set(u,e),o=!1}break;case`text`:s=!1;break;case`r`:break;case`t`:c=!1;break}}}),t}function Ht(e,t){for(let n of e.children)if(typeof n!=`string`&&(n.local||n.tag)===t)return n.children.filter(e=>typeof e==`string`).join(``)||void 0}function Ut(e){if(!e)return;let t=new Date(e);if(!Number.isNaN(t.getTime()))return t}function Wt(e){let t=W(e),n={};for(let e of t.children){if(typeof e==`string`)continue;let t=e.local||e.tag,r=e.children.filter(e=>typeof e==`string`).join(``);switch(t){case`title`:r&&(n.title=r);break;case`subject`:r&&(n.subject=r);break;case`creator`:r&&(n.creator=r);break;case`keywords`:r&&(n.keywords=r);break;case`description`:r&&(n.description=r);break;case`lastModifiedBy`:r&&(n.lastModifiedBy=r);break;case`category`:r&&(n.category=r);break;case`created`:if(r){let e=Ut(r);e&&(n.created=e)}break;case`modified`:if(r){let e=Ut(r);e&&(n.modified=e)}break}}return n}function Gt(e){let t=W(e),n={};for(let e of t.children){if(typeof e==`string`||(e.local||e.tag)!==`property`)continue;let t=e.attrs.name;if(t)for(let r of e.children){if(typeof r==`string`)continue;let e=r.local||r.tag,i=r.children.filter(e=>typeof e==`string`).join(``);switch(e){case`lpwstr`:n[t]=i;break;case`i4`:case`i8`:case`int`:i&&(n[t]=parseInt(i,10));break;case`r8`:case`decimal`:i&&(n[t]=parseFloat(i));break;case`bool`:n[t]=i===`true`||i===`1`;break;case`filetime`:case`date`:if(i){let e=new Date(i);Number.isNaN(e.getTime())||(n[t]=e)}break}break}}return n}function Kt(e){let t=W(e),n={},r=Ht(t,`Company`);r&&(n.company=r);let i=Ht(t,`Manager`);return i&&(n.manager=i),n}var qt=[`dk1`,`lt1`,`dk2`,`lt2`,`accent1`,`accent2`,`accent3`,`accent4`,`accent5`,`accent6`,`hlink`,`folHlink`];function Jt(e){let t=new Map,n=!1,r=``;return Me(e,{onOpenTag(e,i){if(e===`clrScheme`||e===`a:clrScheme`){n=!0;return}if(!n)return;let a=e.includes(`:`)?e.split(`:`).pop():e;if(qt.includes(a)){r=a;return}r&&(a===`srgbClr`&&i.val?t.set(r,i.val.toUpperCase()):a===`sysClr`&&i.lastClr&&t.set(r,i.lastClr.toUpperCase()))},onCloseTag(e){let t=e.includes(`:`)?e.split(`:`).pop():e;t===`clrScheme`&&(n=!1),r&&qt.includes(t)&&(r=``)}}),qt.map(e=>t.get(e)??`000000`)}function Yt(e,t){return e===`http://schemas.openxmlformats.org/officeDocument/2006/relationships/${t}`||e===`http://purl.oclc.org/ooxml/officeDocument/relationships/${t}`||e.endsWith(`/`+t)}function Xt(e){if(e instanceof Uint8Array)return e;if(e instanceof ArrayBuffer)return new Uint8Array(e);throw new P(`Unsupported input type. Expected Uint8Array or ArrayBuffer.`)}function Z(e){return new TextDecoder(`utf-8`).decode(e)}function Zt(e,t){if(t.startsWith(`/`))return t.slice(1);let n=e.split(`/`).filter(Boolean),r=t.split(`/`).filter(Boolean);for(let e of r)e===`..`?n.pop():e!==`.`&&n.push(e);return n.join(`/`)}function Qt(e){let t=e.lastIndexOf(`/`);return t===-1?``:e.slice(0,t)}async function $t(e,t){let n=Xt(e),r;try{r=new Ee(n)}catch(e){throw e instanceof F?e:new P(`Failed to open XLSX file: not a valid ZIP archive`,void 0,{cause:e})}if(!r.has(`[Content_Types].xml`))throw new P(`Invalid XLSX: missing [Content_Types].xml`);if(Be(Z(await r.extract(`[Content_Types].xml`))),!r.has(`_rels/.rels`))throw new P(`Invalid XLSX: missing _rels/.rels`);let i=Ve(Z(await r.extract(`_rels/.rels`))).find(e=>Yt(e.type,`officeDocument`));if(!i)throw new P(`Invalid XLSX: cannot find workbook relationship in _rels/.rels`);let a=i.target.startsWith(`/`)?i.target.slice(1):i.target,o=Qt(a),s=o?`${o}/_rels/${a.slice(o.length+1)}.rels`:`_rels/${a}.rels`,c=[];if(r.has(s)&&(c=Ve(Z(await r.extract(s)))),!r.has(a))throw new P(`Invalid XLSX: missing workbook at ${a}`);let{sheets:l,dateSystem:u,namedRanges:d,workbookProtection:f}=dn(Z(await r.extract(a)),t),p=[],m=c.find(e=>Yt(e.type,`sharedStrings`));if(m){let e=Zt(o,m.target);r.has(e)&&(p=He(Z(await r.extract(e))))}let h=null,g=c.find(e=>Yt(e.type,`styles`));if(g){let e=Zt(o,g.target);r.has(e)&&(h=lt(Z(await r.extract(e))))}let _,v=o?`${o}/theme/theme1.xml`:`theme/theme1.xml`;r.has(v)&&(_=Jt(Z(await r.extract(v))));let y=new Map;for(let e of c)Yt(e.type,`worksheet`)&&y.set(e.id,Zt(o,e.target));let b=pn(l,t?.sheets),x=t?.readStyles??!1,S=[];for(let e of b){let n=y.get(e.rId);if(!n||!r.has(n))throw new P(`Invalid XLSX: missing worksheet file for sheet "${e.name}"`);let i=Qt(n),a=n.slice(i.length+1),o=i?`${i}/_rels/${a}.rels`:`_rels/${a}.rels`,s;r.has(o)&&(s=Ve(Z(await r.extract(o))));let c={sharedStrings:p,styles:h,readStyles:x,dateSystem:u,worksheetRels:s,maxRows:t?.maxRows,range:t?.range},l=Ot(Z(await r.extract(n)),e.name,c);if(e.state===`hidden`&&(l.hidden=!0),e.state===`veryHidden`&&(l.veryHidden=!0),s){let e=s.find(e=>Yt(e.type,`drawing`));if(e){let t=Zt(i,e.target),n=await tn(r,t);n.images.length>0&&(l.images=n.images),n.textBoxes.length>0&&(l.textBoxes=n.textBoxes)}}if(s){let e=s.find(e=>Yt(e.type,`comments`));if(e){let t=Zt(i,e.target);if(r.has(t)){let e=Vt(Z(await r.extract(t)));if(e.size>0){l.cells||=new Map;for(let[t,n]of e){let e=X(t),r=`${e.row},${e.col}`,i=l.cells.get(r);i||(i={value:(l.rows[e.row]&&l.rows[e.row][e.col])??null,type:`string`},l.cells.set(r,i)),i.comment=n}}}}}if(s){let e=s.filter(e=>Yt(e.type,`table`));if(e.length>0){let t=[];for(let n of e){let e=Zt(i,n.target);if(r.has(e)){let n=mn(Z(await r.extract(e)));n&&t.push(n)}}t.length>0&&(l.tables=t)}}if(s){let e=s.find(e=>Yt(e.type,`image`));if(e){let t=Zt(i,e.target);r.has(t)&&(l.backgroundImage=await r.extract(t))}}S.push(l)}let C;if(r.has(`docProps/core.xml`)){let e=Wt(Z(await r.extract(`docProps/core.xml`)));Object.keys(e).length>0&&(C={...e})}if(r.has(`docProps/app.xml`)){let e=Kt(Z(await r.extract(`docProps/app.xml`)));Object.keys(e).length>0&&(C={...C,...e})}if(r.has(`docProps/custom.xml`)){let e=Gt(Z(await r.extract(`docProps/custom.xml`)));Object.keys(e).length>0&&(C||={},C.custom=e)}let w={sheets:S,dateSystem:u};return d.length>0&&(w.namedRanges=d),C&&(w.properties=C),_&&(w.themeColors=_),f&&(w.workbookProtection=f),w}var en={png:`png`,jpg:`jpeg`,jpeg:`jpeg`,gif:`gif`,svg:`svg`,webp:`webp`};async function tn(e,t){if(!e.has(t))return{images:[],textBoxes:[]};let n=Z(await e.extract(t)),r=Qt(t),i=t.slice(r.length+1),a=r?`${r}/_rels/${i}.rels`:`_rels/${i}.rels`,o=new Map;if(e.has(a)){let t=Ve(Z(await e.extract(a)));for(let e of t)Yt(e.type,`image`)&&o.set(e.id,Zt(r,e.target))}let s=W(n),c=[],l=[];for(let t of s.children){if(typeof t==`string`)continue;let n=t.local||t.tag;if(n===`twoCellAnchor`){let n=rn(t);if(n){l.push(n);continue}let r=nn(t,o);if(r){let t=r.mediaPath;if(e.has(t)){let n=await e.extract(t);c.push({data:n,type:r.type,anchor:r.anchor})}}}else if(n===`oneCellAnchor`){let n=sn(t,o);if(n){let t=n.mediaPath;if(e.has(t)){let r={data:await e.extract(t),type:n.type,anchor:n.anchor};n.width!==void 0&&(r.width=n.width),n.height!==void 0&&(r.height=n.height),c.push(r)}}}}return{images:c,textBoxes:l}}function nn(e,t){let n=0,r=0,i=0,a=0,o;for(let t of e.children){if(typeof t==`string`)continue;let e=t,s=e.local||e.tag;if(s===`from`){let t=cn(e);n=t.row,r=t.col}else if(s===`to`){let t=cn(e);i=t.row,a=t.col}else s===`pic`&&(o=ln(e))}if(!o)return null;let s=t.get(o);return s?{mediaPath:s,type:en[s.split(`.`).pop()?.toLowerCase()??``]??`png`,anchor:{from:{row:n,col:r},to:{row:i,col:a}}}:null}function rn(e){let t=0,n=0,r=0,i=0,a=null;for(let o of e.children){if(typeof o==`string`)continue;let e=o,s=e.local||e.tag;if(s===`from`){let r=cn(e);t=r.row,n=r.col}else if(s===`to`){let t=cn(e);r=t.row,i=t.col}else if(s===`sp`){let t=Q(e,`nvSpPr`);if(t){let n=Q(t,`cNvSpPr`);n&&(n.attrs.txBox===`1`||n.attrs.txBox===`true`)&&(a=e)}}}if(!a)return null;let o=Q(a,`txBody`),s=``,c,l,u;if(o){let e=[];for(let t of o.children)if(typeof t!=`string`&&(t.local||t.tag)===`p`){let n=an(t);e.push(n.text),n.fontSize!==void 0&&c===void 0&&(c=n.fontSize),n.bold!==void 0&&l===void 0&&(l=n.bold),n.color!==void 0&&u===void 0&&(u=n.color)}s=e.join(`
`)}if(!s)return null;let d,f,p=Q(a,`spPr`);if(p){let e=Q(p,`solidFill`);if(e){let t=Q(e,`srgbClr`);t&&t.attrs.val&&(d=t.attrs.val)}let t=Q(p,`ln`);if(t){let e=Q(t,`solidFill`);if(e){let t=Q(e,`srgbClr`);t&&t.attrs.val&&(f=t.attrs.val)}}}let m={text:s,anchor:{from:{row:t,col:n},to:{row:r,col:i}}},h={},g=!1;return c!==void 0&&(h.fontSize=c,g=!0),l!==void 0&&(h.bold=l,g=!0),u!==void 0&&(h.color=u,g=!0),d!==void 0&&(h.fillColor=d,g=!0),f!==void 0&&(h.borderColor=f,g=!0),g&&(m.style=h),m}function Q(e,t){for(let n of e.children){if(typeof n==`string`)continue;let e=n;if((e.local||e.tag)===t)return e}return null}function an(e){let t=``,n,r,i;for(let a of e.children){if(typeof a==`string`)continue;let e=a;if((e.local||e.tag)===`r`){let a=Q(e,`rPr`);if(a){a.attrs.sz&&(n=Number(a.attrs.sz)/100),(a.attrs.b===`1`||a.attrs.b===`true`)&&(r=!0);let e=Q(a,`solidFill`);if(e){let t=Q(e,`srgbClr`);t&&t.attrs.val&&(i=t.attrs.val)}}let o=Q(e,`t`);o&&(t+=o.children.filter(e=>typeof e==`string`).join(``))}}return{text:t,fontSize:n,bold:r,color:i}}var on=9525;function sn(e,t){let n=0,r=0,i=0,a=0,o;for(let t of e.children){if(typeof t==`string`)continue;let e=t,s=e.local||e.tag;if(s===`from`){let t=cn(e);n=t.row,r=t.col}else s===`ext`?(i=Number(e.attrs.cx)||0,a=Number(e.attrs.cy)||0):s===`pic`&&(o=ln(e))}if(!o)return null;let s=t.get(o);if(!s)return null;let c={mediaPath:s,type:en[s.split(`.`).pop()?.toLowerCase()??``]??`png`,anchor:{from:{row:n,col:r}}};return i>0&&(c.width=Math.round(i/on)),a>0&&(c.height=Math.round(a/on)),c}function cn(e){let t=0,n=0;for(let r of e.children){if(typeof r==`string`)continue;let e=r,i=e.local||e.tag,a=e.children.filter(e=>typeof e==`string`).join(``);i===`row`?t=Number(a)||0:i===`col`&&(n=Number(a)||0)}return{row:t,col:n}}function ln(e){for(let t of e.children){if(typeof t==`string`)continue;let e=t;if((e.local||e.tag)===`blipFill`)for(let t of e.children){if(typeof t==`string`)continue;let e=t;if((e.local||e.tag)===`blip`)return e.attrs[`r:embed`]??e.attrs[`R:embed`]??un(e.attrs)}}}function un(e){for(let t of Object.keys(e))if(t.endsWith(`:embed`)&&e[t].startsWith(`rId`))return e[t]}function dn(e,t){let n=W(e),r=[],i=[],a=`1900`;t?.dateSystem===`1904`?a=`1904`:t?.dateSystem===`1900`&&(a=`1900`);let o;for(let e of n.children){if(typeof e==`string`)continue;let n=e.local||e.tag;if(n===`workbookPr`&&(e.attrs.date1904===`1`||e.attrs.date1904===`true`)&&(!t?.dateSystem||t.dateSystem===`auto`)&&(a=`1904`),n===`workbookProtection`){let t=e.attrs.lockStructure===`1`||e.attrs.lockStructure===`true`,n=e.attrs.lockWindows===`1`||e.attrs.lockWindows===`true`;(t||n)&&(o={},t&&(o.lockStructure=!0),n&&(o.lockWindows=!0))}if(n===`sheets`){for(let t of e.children)if(typeof t!=`string`&&(t.local||t.tag)===`sheet`){let e=t.attrs.name??``,n=Number(t.attrs.sheetId??`0`),i=t.attrs[`r:id`]??t.attrs[`R:id`]??fn(t.attrs)??``,a=t.attrs.state,o=`visible`;a===`hidden`?o=`hidden`:a===`veryHidden`&&(o=`veryHidden`),e&&i&&r.push({name:e,sheetId:n,rId:i,state:o})}}}for(let e of n.children)if(typeof e!=`string`&&(e.local||e.tag)===`definedNames`){for(let t of e.children)if(typeof t!=`string`&&(t.local||t.tag)===`definedName`){let e=t.attrs.name??``,n=t.children.filter(e=>typeof e==`string`).join(``);if(e&&n){let a={name:e,range:n},o=t.attrs.localSheetId;if(o!==void 0){let e=Number(o);e>=0&&e<r.length&&(a.scope=r[e].name)}t.attrs.comment&&(a.comment=t.attrs.comment),i.push(a)}}}return{sheets:r,dateSystem:a,namedRanges:i,workbookProtection:o}}function fn(e){for(let t of Object.keys(e))if(t.endsWith(`:id`)&&e[t].startsWith(`rId`))return e[t]}function pn(e,t){if(!t||t.length===0)return e;let n=[];for(let r of t)if(typeof r==`number`)r>=0&&r<e.length&&n.push(e[r]);else{let t=e.find(e=>e.name===r);t&&n.push(t)}return n}function mn(e){let t=W(e),n=t.attrs.name??``,r=t.attrs.displayName??n,i=t.attrs.ref??``;if(!n)return null;let a=t.attrs.totalsRowCount,o=a!==void 0&&a!==`0`,s=[],c,l,u,d=!0;for(let e of t.children){if(typeof e==`string`)continue;let t=e.local||e.tag;if(t===`autoFilter`)d=!0;else if(t===`tableColumns`){for(let t of e.children)if(typeof t!=`string`&&(t.local||t.tag)===`tableColumn`){let e={name:t.attrs.name??``};t.attrs.totalsRowFunction&&(e.totalFunction=t.attrs.totalsRowFunction),t.attrs.totalsRowLabel&&(e.totalLabel=t.attrs.totalsRowLabel);for(let n of t.children)if(typeof n!=`string`&&(n.local||n.tag)===`totalsRowFormula`){let t=n.children.filter(e=>typeof e==`string`).join(``);t&&(e.totalFormula=t)}s.push(e)}}else t===`tableStyleInfo`&&(c=e.attrs.name,l=e.attrs.showRowStripes===`1`,u=e.attrs.showColumnStripes===`1`)}let f={name:n,columns:s};return r&&r!==n&&(f.displayName=r),i&&(f.range=i),c&&(f.style=c),l!==void 0&&(f.showRowStripes=l),u!==void 0&&(f.showColumnStripes=u),d!==void 0&&(f.showAutoFilter=d),o&&(f.showTotalRow=!0),f}var hn={png:`image/png`,jpeg:`image/jpeg`,gif:`image/gif`,svg:`image/svg+xml`,webp:`image/webp`};function gn(e,t){let n;n=typeof e==`number`?{sheetCount:e,hasSharedStrings:t??!1}:e;let r=[];if(r.push(K(`Default`,{Extension:`rels`,ContentType:`application/vnd.openxmlformats-package.relationships+xml`})),r.push(K(`Default`,{Extension:`xml`,ContentType:`application/xml`})),n.hasMacros&&r.push(K(`Default`,{Extension:`bin`,ContentType:`application/vnd.ms-office.vbaProject`})),n.imageExtensions)for(let e of n.imageExtensions){let t=hn[e];t&&r.push(K(`Default`,{Extension:e,ContentType:t}))}r.push(K(`Override`,{PartName:`/xl/workbook.xml`,ContentType:n.hasMacros?`application/vnd.ms-excel.sheet.macroEnabled.main+xml`:`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml`}));for(let e=1;e<=n.sheetCount;e++)r.push(K(`Override`,{PartName:`/xl/worksheets/sheet${e}.xml`,ContentType:`application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml`}));if(r.push(K(`Override`,{PartName:`/xl/styles.xml`,ContentType:`application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml`})),r.push(K(`Override`,{PartName:`/xl/theme/theme1.xml`,ContentType:`application/vnd.openxmlformats-officedocument.theme+xml`})),n.hasSharedStrings&&r.push(K(`Override`,{PartName:`/xl/sharedStrings.xml`,ContentType:`application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml`})),n.drawingIndices)for(let e of n.drawingIndices)r.push(K(`Override`,{PartName:`/xl/drawings/drawing${e}.xml`,ContentType:`application/vnd.openxmlformats-officedocument.drawing+xml`}));if(n.commentIndices&&n.commentIndices.length>0&&r.push(K(`Default`,{Extension:`vml`,ContentType:`application/vnd.openxmlformats-officedocument.vmlDrawing`})),n.commentIndices)for(let e of n.commentIndices)r.push(K(`Override`,{PartName:`/xl/comments${e}.xml`,ContentType:`application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml`}));if(n.tableIndices)for(let e of n.tableIndices)r.push(K(`Override`,{PartName:`/xl/tables/table${e}.xml`,ContentType:`application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml`}));return n.hasCoreProps&&r.push(K(`Override`,{PartName:`/docProps/core.xml`,ContentType:`application/vnd.openxmlformats-package.core-properties+xml`})),n.hasAppProps&&r.push(K(`Override`,{PartName:`/docProps/app.xml`,ContentType:`application/vnd.openxmlformats-officedocument.extended-properties+xml`})),n.hasCustomProps&&r.push(K(`Override`,{PartName:`/docProps/custom.xml`,ContentType:`application/vnd.openxmlformats-officedocument.custom-properties+xml`})),J(`Types`,{xmlns:`http://schemas.openxmlformats.org/package/2006/content-types`},r)}function _n(e){let t=0;for(let n=e.length-1;n>=0;n--){let r=e.charCodeAt(n);t=t>>14&1|t<<1&32767,t^=r}return t=t>>14&1|t<<1&32767,t^=e.length,t^=52811,t.toString(16).toUpperCase().padStart(4,`0`)}var vn=`http://schemas.openxmlformats.org/package/2006/relationships`;function yn(e,t,n,r,i){let a=[];for(let t=0;t<e.length;t++){let n=e[t],r={name:n.name,sheetId:t+1,"r:id":`rId${t+1}`};n.hidden?r.state=`hidden`:n.veryHidden&&(r.state=`veryHidden`),a.push(K(`sheet`,r))}let o=[];n===`1904`&&o.push(K(`workbookPr`,{date1904:1}));let s=r??0;if(o.push(q(`bookViews`,void 0,[K(`workbookView`,{xWindow:0,yWindow:0,windowWidth:16384,windowHeight:8192,activeTab:s})])),i){let e={};i.lockStructure&&(e.lockStructure=1),i.lockWindows&&(e.lockWindows=1),i.password&&(e.workbookPassword=_n(i.password)),o.push(K(`workbookProtection`,e))}if(o.push(q(`sheets`,void 0,a)),t&&t.length>0){let n=new Map;for(let t=0;t<e.length;t++)n.set(e[t].name,t);let r=[];for(let e of t){let t={name:e.name};if(e.scope!==void 0){let r=n.get(e.scope);r!==void 0&&(t.localSheetId=r)}e.comment&&(t.comment=e.comment),r.push(q(`definedName`,t,G(e.range)))}o.push(q(`definedNames`,void 0,r))}return o.push(K(`calcPr`,{calcId:0,fullCalcOnLoad:1})),J(`workbook`,{xmlns:`http://schemas.openxmlformats.org/spreadsheetml/2006/main`,"xmlns:r":`http://schemas.openxmlformats.org/officeDocument/2006/relationships`},o)}function bn(e,t,n){let r=[];for(let t=1;t<=e;t++)r.push(K(`Relationship`,{Id:`rId${t}`,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet`,Target:`worksheets/sheet${t}.xml`}));let i=e+1;return r.push(K(`Relationship`,{Id:`rId${i}`,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles`,Target:`styles.xml`})),i++,t&&(r.push(K(`Relationship`,{Id:`rId${i}`,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings`,Target:`sharedStrings.xml`})),i++),r.push(K(`Relationship`,{Id:`rId${i}`,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme`,Target:`theme/theme1.xml`})),i++,n&&r.push(K(`Relationship`,{Id:`rId${i}`,Type:`http://schemas.microsoft.com/office/2006/relationships/vbaProject`,Target:`vbaProject.bin`})),J(`Relationships`,{xmlns:vn},r)}function xn(e){let t=[];t.push(K(`Relationship`,{Id:`rId1`,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument`,Target:`xl/workbook.xml`}));let n=2;return e?.hasCoreProps&&t.push(K(`Relationship`,{Id:`rId${n++}`,Type:`http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties`,Target:`docProps/core.xml`})),e?.hasAppProps&&t.push(K(`Relationship`,{Id:`rId${n++}`,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties`,Target:`docProps/app.xml`})),e?.hasCustomProps&&t.push(K(`Relationship`,{Id:`rId${n++}`,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties`,Target:`docProps/custom.xml`})),J(`Relationships`,{xmlns:vn},t)}function Sn(e,t){let n={};return t.rgb!==void 0&&(n.rgb=t.rgb.length===6?`FF${t.rgb}`:t.rgb),t.theme!==void 0&&(n.theme=t.theme),t.tint!==void 0&&(n.tint=t.tint),t.indexed!==void 0&&(n.indexed=t.indexed),K(e,n)}function Cn(e){let t=[];return e.bold&&t.push(K(`b`)),e.italic&&t.push(K(`i`)),e.underline!==void 0&&e.underline!==!1&&(e.underline===!0||e.underline===`single`?t.push(K(`u`)):t.push(K(`u`,{val:e.underline}))),e.strikethrough&&t.push(K(`strike`)),e.charset!==void 0&&t.push(K(`charset`,{val:e.charset})),e.family!==void 0&&t.push(K(`family`,{val:e.family})),e.scheme&&t.push(K(`scheme`,{val:e.scheme})),e.color&&t.push(Sn(`color`,e.color)),e.size!==void 0&&t.push(K(`sz`,{val:e.size})),e.name&&t.push(K(`name`,{val:e.name})),e.vertAlign&&t.push(K(`vertAlign`,{val:e.vertAlign})),q(`font`,void 0,t)}function wn(e){if(e.type===`pattern`){let t=[];return e.fgColor&&t.push(Sn(`fgColor`,e.fgColor)),e.bgColor&&t.push(Sn(`bgColor`,e.bgColor)),q(`fill`,void 0,[q(`patternFill`,{patternType:e.pattern},t.length>0?t:void 0)])}let t=[];for(let n of e.stops)t.push(q(`stop`,{position:n.position},[Sn(`color`,n.color)]));let n={};return e.degree!==void 0&&(n.degree=e.degree),q(`fill`,void 0,[q(`gradientFill`,n,t)])}function Tn(e,t){return t?t.color?q(``+e,{style:t.style},[Sn(`color`,t.color)]):K(e,{style:t.style}):K(e)}function En(e){let t={};e.diagonalUp&&(t.diagonalUp=!0),e.diagonalDown&&(t.diagonalDown=!0);let n=[Tn(`left`,e.left),Tn(`right`,e.right),Tn(`top`,e.top),Tn(`bottom`,e.bottom),Tn(`diagonal`,e.diagonal)];return q(`border`,Object.keys(t).length>0?t:void 0,n)}function Dn(e){if(!e)return``;let t=[];return e.rgb!==void 0&&t.push(`rgb:${e.rgb}`),e.theme!==void 0&&t.push(`th:${e.theme}`),e.tint!==void 0&&t.push(`tint:${e.tint}`),e.indexed!==void 0&&t.push(`idx:${e.indexed}`),t.join(`|`)}function On(e){let t=[];return e.name&&t.push(`n:${e.name}`),e.size!==void 0&&t.push(`s:${e.size}`),e.bold&&t.push(`b`),e.italic&&t.push(`i`),e.underline!==void 0&&e.underline!==!1&&t.push(`u:${e.underline}`),e.strikethrough&&t.push(`st`),e.color&&t.push(`c:${Dn(e.color)}`),e.vertAlign&&t.push(`va:${e.vertAlign}`),e.family!==void 0&&t.push(`fam:${e.family}`),e.charset!==void 0&&t.push(`cs:${e.charset}`),e.scheme&&t.push(`sch:${e.scheme}`),t.join(`,`)}function kn(e){return e.type===`pattern`?`p:${e.pattern}|fg:${Dn(e.fgColor)}|bg:${Dn(e.bgColor)}`:`g:${e.degree??``}|${e.stops.map(e=>`${e.position}:${Dn(e.color)}`).join(`;`)}`}function An(e){return e?`${e.style}:${Dn(e.color)}`:``}function jn(e){return[`l:${An(e.left)}`,`r:${An(e.right)}`,`t:${An(e.top)}`,`b:${An(e.bottom)}`,`d:${An(e.diagonal)}`,e.diagonalUp?`du`:``,e.diagonalDown?`dd`:``].join(`|`)}function Mn(e){let t={name:e?.name??`Calibri`,size:e?.size??11,...e},n=[{key:On(t),font:t}],r=new Map([[n[0].key,0]]),i=[{key:`p:none|fg:|bg:`,fill:{type:`pattern`,pattern:`none`}},{key:`p:gray125|fg:|bg:`,fill:{type:`pattern`,pattern:`gray125`}}],a=new Map([[i[0].key,0],[i[1].key,1]]),o={},s=[{key:jn(o),border:o}],c=new Map([[s[0].key,0]]),l=[],u=new Map,d=164,f=`nf:0|f:0|fl:0|b:0|a:|p:`,p=[{key:f,numFmtId:0,fontId:0,fillId:0,borderId:0}],m=new Map([[f,0]]);function h(e){let t=On(e),i=r.get(t);if(i!==void 0)return i;let a=n.length;return n.push({key:t,font:e}),r.set(t,a),a}function g(e){let t=kn(e),n=a.get(t);if(n!==void 0)return n;let r=i.length;return i.push({key:t,fill:e}),a.set(t,r),r}function _(e){let t=jn(e),n=c.get(t);if(n!==void 0)return n;let r=s.length;return s.push({key:t,border:e}),c.set(t,r),r}function v(e){let t=u.get(e);if(t!==void 0)return t;let n=d++;return l.push({id:n,formatCode:e}),u.set(e,n),n}function y(e){if(!e)return``;let t=[];return e.horizontal&&t.push(`h:${e.horizontal}`),e.vertical&&t.push(`v:${e.vertical}`),e.wrapText&&t.push(`w`),e.shrinkToFit&&t.push(`sf`),e.textRotation!==void 0&&t.push(`r:${e.textRotation}`),e.indent!==void 0&&t.push(`i:${e.indent}`),e.readingOrder&&t.push(`ro:${e.readingOrder}`),t.join(`,`)}function b(e){if(!e)return``;let t=[];return e.locked!==void 0&&t.push(`l:${e.locked}`),e.hidden!==void 0&&t.push(`h:${e.hidden}`),t.join(`,`)}let x=[],S=new Map;function C(e){let t=[];return e.font&&t.push(`f:${On(e.font)}`),e.fill&&t.push(`fl:${kn(e.fill)}`),e.border&&t.push(`b:${jn(e.border)}`),e.numFmt&&t.push(`nf:${e.numFmt}`),e.alignment&&t.push(`a:${y(e.alignment)}`),t.join(`|`)}function w(e){let t=C(e),n=S.get(t);if(n!==void 0)return n;let r=x.length;return x.push(e),S.set(t,r),r}function T(e){let t=e.font?h(e.font):0,n=e.fill?g(e.fill):0,r=e.border?_(e.border):0,i=e.numFmt?v(e.numFmt):0,a=[`nf:${i}`,`f:${t}`,`fl:${n}`,`b:${r}`,`a:${y(e.alignment)}`,`p:${b(e.protection)}`].join(`|`),o=m.get(a);if(o!==void 0)return o;let s=p.length;return p.push({key:a,numFmtId:i,fontId:t,fillId:n,borderId:r,alignment:e.alignment,protection:e.protection}),m.set(a,s),s}function E(e){let t={};return e.horizontal&&(t.horizontal=e.horizontal),e.vertical&&(t.vertical=e.vertical),e.wrapText&&(t.wrapText=!0),e.shrinkToFit&&(t.shrinkToFit=!0),e.textRotation!==void 0&&(t.textRotation=e.textRotation),e.indent!==void 0&&(t.indent=e.indent),e.readingOrder&&(t.readingOrder={ltr:1,rtl:2,context:0}[e.readingOrder]),K(`alignment`,t)}function D(e){let t={};return e.locked!==void 0&&(t.locked=e.locked?1:0),e.hidden!==void 0&&(t.hidden=e.hidden?1:0),K(`protection`,t)}function ee(){let e=[];if(l.length>0){let t=l.map(e=>K(`numFmt`,{numFmtId:e.id,formatCode:e.formatCode}));e.push(q(`numFmts`,{count:l.length},t))}let t=n.map(e=>Cn(e.font));e.push(q(`fonts`,{count:n.length},t));let r=i.map(e=>wn(e.fill));e.push(q(`fills`,{count:i.length},r));let a=s.map(e=>En(e.border));e.push(q(`borders`,{count:s.length},a)),e.push(q(`cellStyleXfs`,{count:1},[K(`xf`,{numFmtId:0,fontId:0,fillId:0,borderId:0})]));let o=p.map(e=>{let t={numFmtId:e.numFmtId,fontId:e.fontId,fillId:e.fillId,borderId:e.borderId,xfId:0};e.numFmtId!==0&&(t.applyNumberFormat=!0),e.fontId!==0&&(t.applyFont=!0),e.fillId!==0&&(t.applyFill=!0),e.borderId!==0&&(t.applyBorder=!0);let n=e.alignment!==void 0,r=e.protection!==void 0;if(n&&(t.applyAlignment=!0),r&&(t.applyProtection=!0),n||r){let i=[];return n&&i.push(E(e.alignment)),r&&i.push(D(e.protection)),q(`xf`,t,i)}return K(`xf`,t)});if(e.push(q(`cellXfs`,{count:p.length},o)),e.push(q(`cellStyles`,{count:1},[K(`cellStyle`,{name:`Normal`,xfId:0,builtinId:0})])),x.length>0){let t=x.map(e=>{let t=[];if(e.font&&t.push(Cn(e.font)),e.numFmt){let n=v(e.numFmt);t.push(K(`numFmt`,{numFmtId:n,formatCode:e.numFmt}))}return e.fill&&t.push(wn(e.fill)),e.border&&t.push(En(e.border)),e.alignment&&t.push(E(e.alignment)),q(`dxf`,void 0,t)});e.push(q(`dxfs`,{count:x.length},t))}else e.push(K(`dxfs`,{count:0}));return e.push(K(`tableStyles`,{count:0,defaultTableStyle:`TableStyleMedium2`,defaultPivotStyle:`PivotStyleLight16`})),J(`styleSheet`,{xmlns:`http://schemas.openxmlformats.org/spreadsheetml/2006/main`},e)}return{addStyle:T,addNumFmt:v,addDxf:w,toXml:ee}}function Nn(e){return e>=19968&&e<=40959||e>=13312&&e<=19903||e>=131072&&e<=173791||e>=63744&&e<=64255||e>=44032&&e<=55215||e>=12448&&e<=12543||e>=12352&&e<=12447||e>=12288&&e<=12351||e>=65280&&e<=65376||e>=65504&&e<=65510}function Pn(e,t){let n=t.trim().split(`;`),r;if(e>0?r=n[0]:e<0&&n.length>1?(r=n[1],e=Math.abs(e)):r=e===0&&n.length>2?n[2]:n[0],r=r.replace(/\[[^\]]*\]/g,``),r=r.replace(/\\./g,e=>e[1]),r=r.replace(/"([^"]*)"/g,`$1`),r.includes(`%`)){let t=Fn(r.replace(/%/g,``));return In((e*100).toFixed(t),r)+`%`}let i=Fn(r);return In(e.toFixed(i),r)}function Fn(e){let t=e.indexOf(`.`);if(t===-1)return 0;let n=0;for(let r=t+1;r<e.length&&(e[r]===`0`||e[r]===`#`);r++)n++;return n}function In(e,t){if(!t.includes(`,`))return e;let n=e.split(`.`),r=n[0],i=r.startsWith(`-`);i&&(r=r.slice(1));let a=``;for(let e=0;e<r.length;e++)e>0&&(r.length-e)%3==0&&(a+=`,`),a+=r[e];return i&&(a=`-`+a),n[1]!==void 0&&(a+=`.`+n[1]),a}function Ln(e){let t=0,n=e.split(`;`)[0].replace(/\[[^\]]*\]/g,``);for(let e=0;e<n.length;e++){let r=n[e];if(r===`"`)for(e++;e<n.length&&n[e]!==`"`;)t++,e++;else r===`\\`?(t++,e++):(r===`$`||r===`€`||r===`£`||r===`¥`)&&t++}return t}function Rn(e){let t=0;for(let n of e){let e=n.codePointAt(0);e!==void 0&&Nn(e)?t+=2:t+=1}return t}function zn(e,t){if(e==null)return 0;if(typeof e==`boolean`)return e?5:6;if(typeof e==`string`){if(e.length===0)return 0;if(e.includes(`
`)){let t=e.split(`
`),n=0;for(let e of t){let t=Rn(e);t>n&&(n=t)}return n}return Rn(e)}if(typeof e==`number`){if(t){let n=Pn(e,t),r=Ln(t);return Rn(n)+r}return Rn(String(e))}return e instanceof Date?Rn(t?nt(e,t):`${e.getUTCFullYear()}-${String(e.getUTCMonth()+1).padStart(2,`0`)}-${String(e.getUTCDate()).padStart(2,`0`)}`):0}function Bn(e,t){let n=t?.minWidth??8,r=t?.maxWidth??255,i=t?.padding??2,a=t?.font?.bold===!0,o=0;for(let n of e){let e=zn(n,t?.numFmt);e>o&&(o=e)}let s=o*1.1;return a&&(s*=1.05),s+=i,s=Math.ceil(s*2)/2,s<n&&(s=n),s>r&&(s=r),s}var Vn=`http://schemas.openxmlformats.org/spreadsheetml/2006/main`;function Hn(e){let t=``,n=e;do t=String.fromCharCode(65+n%26)+t,n=Math.floor(n/26)-1;while(n>=0);return t}function Un(e,t){return Hn(t)+(e+1)}function Wn(e,t,n,r){return`${Un(e,t)}:${Un(n,r)}`}function Gn(){let e=[],t=new Map;function n(n){let r=t.get(n);if(r!==void 0)return r;let i=e.length;return e.push(n),t.set(n,i),i}function r(){return e}function i(){return e.length}return{add:n,getAll:r,count:i}}function Kn(e){let t=e.getAll(),n=t.length;if(n===0)return J(`sst`,{xmlns:Vn,count:0,uniqueCount:0},``);let r=[];for(let e of t){let t=G(e),n=e.length>0&&(e[0]===` `||e[e.length-1]===` `||e.includes(`
`)||e.includes(`	`))?`<t xml:space="preserve">${t}</t>`:q(`t`,void 0,t);r.push(q(`si`,void 0,[n]))}return J(`sst`,{xmlns:Vn,count:n,uniqueCount:n},r)}var qn=new Set([`#VALUE!`,`#REF!`,`#N/A`,`#NAME?`,`#NULL!`,`#DIV/0!`,`#NUM!`,`#GETTING_DATA`]);function Jn(e,t,n,r,i,a){let o=r===`1904`,s=Yn(e),c=s.length,l=0;for(let e of s)e.length>l&&(l=e.length);e.columns&&e.columns.length>l&&(l=e.columns.length);let u=[];{let t=[];if(e.view?.tabColor&&t.push(K(`tabColor`,or(e.view.tabColor))),e.outlineProperties){let n={};e.outlineProperties.summaryBelow!==void 0&&(n.summaryBelow=e.outlineProperties.summaryBelow?1:0),e.outlineProperties.summaryRight!==void 0&&(n.summaryRight=e.outlineProperties.summaryRight?1:0),t.push(K(`outlinePr`,n))}t.length>0&&u.push(q(`sheetPr`,void 0,t))}if(c>0||l>0){let e=c>0?c-1:0,t=l>0?l-1:0;u.push(K(`dimension`,{ref:Wn(0,0,e,t)}))}let d=[];if(e.freezePane){let t=e.freezePane,n=Un(t.rows??0,t.columns??0),r={};t.columns&&t.columns>0&&(r.xSplit=t.columns),t.rows&&t.rows>0&&(r.ySplit=t.rows),r.topLeftCell=n,r.state=`frozen`;let i=t.columns&&t.columns>0,a=t.rows&&t.rows>0;i&&a?r.activePane=`bottomRight`:i?r.activePane=`topRight`:r.activePane=`bottomLeft`,d.push(K(`pane`,r))}else if(e.splitPane){let t=e.splitPane,n={},r=t.xSplit!==void 0&&t.xSplit>0,i=t.ySplit!==void 0&&t.ySplit>0;r&&(n.xSplit=t.xSplit),i&&(n.ySplit=t.ySplit),n.topLeftCell=`A1`,n.state=`split`,r&&i?n.activePane=`bottomRight`:r?n.activePane=`topRight`:n.activePane=`bottomLeft`,d.push(K(`pane`,n))}let f={workbookViewId:0};if(e.view&&(e.view.showGridLines===!1&&(f.showGridLines=0),e.view.showRowColHeaders===!1&&(f.showRowColHeaders=0),e.view.zoomScale!==void 0&&(f.zoomScale=e.view.zoomScale),e.view.rightToLeft&&(f.rightToLeft=1)),u.push(q(`sheetViews`,void 0,[d.length>0?q(`sheetView`,f,d):K(`sheetView`,f)])),u.push(K(`sheetFormatPr`,{defaultRowHeight:15})),e.columns&&e.columns.length>0){let t=[];for(let n=0;n<e.columns.length;n++){let r=e.columns[n],i=r.width;if(r.autoWidth&&i===void 0){let e=[];for(let t of s)t&&n<t.length&&t[n]&&e.push(t[n].value);i=Bn(e,{font:r.style?.font,numFmt:r.numFmt??r.style?.numFmt})}if(i!==void 0||r.hidden||r.outlineLevel||r.collapsed){let e={min:n+1,max:n+1};i!==void 0&&(e.width=i,e.customWidth=!0),r.hidden&&(e.hidden=!0),r.outlineLevel&&(e.outlineLevel=r.outlineLevel),r.collapsed&&(e.collapsed=!0),t.push(K(`col`,e))}}t.length>0&&u.push(q(`cols`,void 0,t))}let p=[];for(let r=0;r<c;r++){let i=s[r],c=e.rowDefs?.get(r),l=c&&(c.height!==void 0||c.hidden||c.outlineLevel||c.collapsed);if((!i||i.length===0)&&!l)continue;let u=[],d=!1;if(i)for(let e=0;e<i.length;e++){let s=i[e];if(!s)continue;let c=Xn(r,e,s,t,n,o,a);c&&(u.push(c),d=!0)}if(d||l){let e={r:r+1};c?.height!==void 0&&(e.ht=c.height,e.customHeight=1),c?.hidden&&(e.hidden=1),c?.outlineLevel&&(e.outlineLevel=c.outlineLevel),c?.collapsed&&(e.collapsed=1),d?p.push(q(`row`,e,u)):p.push(K(`row`,e))}}if(u.push(q(`sheetData`,void 0,p.length>0?p:``)),e.protection&&u.push(Zn(e.protection)),e.autoFilter)if(e.autoFilter.columns&&e.autoFilter.columns.length>0){let t=[];for(let n of e.autoFilter.columns)if(n.filters&&n.filters.length>0){let e=n.filters.map(e=>K(`filter`,{val:e}));t.push(q(`filterColumn`,{colId:n.colIndex},[q(`filters`,void 0,e)]))}u.push(q(`autoFilter`,{ref:e.autoFilter.range},t))}else u.push(K(`autoFilter`,{ref:e.autoFilter.range}));if(e.merges&&e.merges.length>0){let t=e.merges.map(e=>K(`mergeCell`,{ref:Wn(e.startRow,e.startCol,e.endRow,e.endCol)}));u.push(q(`mergeCells`,{count:e.merges.length},t))}e.conditionalRules&&e.conditionalRules.length>0&&u.push(...lr(e.conditionalRules,t)),e.dataValidations&&e.dataValidations.length>0&&u.push(Qn(e.dataValidations));let{xml:m,relationships:h}=$n(e);if(m&&u.push(m),e.pageSetup&&u.push(K(`printOptions`,{headings:0,gridLines:0})),u.push(rr(e.pageSetup?.margins)),e.pageSetup&&u.push(ir(e.pageSetup)),e.headerFooter&&u.push(ar(e.headerFooter)),e.rowBreaks&&e.rowBreaks.length>0){let t=[...e.rowBreaks].sort((e,t)=>e-t),n=t.map(e=>K(`brk`,{id:e+1,max:16383,man:1}));u.push(q(`rowBreaks`,{count:t.length,manualBreakCount:t.length},n))}if(e.colBreaks&&e.colBreaks.length>0){let t=[...e.colBreaks].sort((e,t)=>e-t),n=t.map(e=>K(`brk`,{id:e+1,max:1048575,man:1}));u.push(q(`colBreaks`,{count:t.length,manualBreakCount:t.length},n))}let g=null,_=h.length+1,v=e.images&&e.images.length>0,y=e.textBoxes&&e.textBoxes.length>0;(v||y)&&(g=`rId${_}`,_++,u.push(K(`drawing`,{"r:id":g})));let b=null,x=null,S=!1;if(e.cells){for(let[,t]of e.cells)if(t.comment){S=!0;break}}S&&(b=`rId${_}`,_++,x=`rId${_}`,_++,u.push(K(`legacyDrawing`,{"r:id":b})));let C=[];if(e.tables&&e.tables.length>0&&i!==void 0){let t=[];for(let n=0;n<e.tables.length;n++){let e=`rId${_}`;_++;let r=i+n;C.push({rId:e,globalTableIndex:r}),t.push(K(`tablePart`,{"r:id":e}))}u.push(q(`tableParts`,{count:e.tables.length},t))}e.sparklines&&e.sparklines.length>0&&u.push(dr(e.sparklines));let w=null;return e.backgroundImage&&(w=`rId${_}`,_++,u.push(K(`picture`,{"r:id":w}))),{xml:J(`worksheet`,{xmlns:Vn,"xmlns:r":`http://schemas.openxmlformats.org/officeDocument/2006/relationships`},u),hyperlinkRelationships:h,drawingRId:g,legacyDrawingRId:b,commentsRId:x,hasComments:S,tables:C,pictureRId:w}}function Yn(e){let t=[];if(e.data&&e.columns){let n=e.columns.map(e=>e.key);if(e.columns.some(e=>e.header)){let n=[];for(let t=0;t<e.columns.length;t++){let r=e.columns[t];n.push({value:r.header??r.key??null,style:r.style})}t.push(n)}for(let r of e.data){let i=[];for(let t=0;t<n.length;t++){let a=n[t],o=a===void 0?null:r[a]??null,s=e.columns[t];i.push({value:o,style:s.style,...s.numFmt&&!s.style?.numFmt?{style:{...s.style,numFmt:s.numFmt}}:{}})}t.push(i)}}else if(e.rows)for(let n of e.rows){let e=[];for(let t=0;t<n.length;t++){let r=n[t];e.push({value:r})}t.push(e)}if(e.cells)for(let[n,r]of e.cells){let[e,i]=n.split(`,`),a=parseInt(e,10),o=parseInt(i,10);for(;t.length<=a;)t.push([]);let s=t[a];for(;s.length<=o;)s.push(null);let c=s[o];s[o]={value:r.value??c?.value??null,style:r.style??c?.style,formula:r.formula??c?.formula,formulaResult:r.formulaResult??c?.formulaResult,formulaType:r.formulaType??c?.formulaType,formulaSharedIndex:r.formulaSharedIndex??c?.formulaSharedIndex,formulaRef:r.formulaRef??c?.formulaRef,formulaDynamic:r.formulaDynamic??c?.formulaDynamic,richText:r.richText??c?.richText}}return t}function Xn(e,t,n,r,i,a,o){let{value:s,style:c,formula:l,formulaResult:u,formulaType:d,formulaSharedIndex:f,formulaRef:p,formulaDynamic:m,richText:h}=n,g=0,_=c;s instanceof Date&&(!_||!_.numFmt)&&(_={..._,numFmt:`yyyy-mm-dd`}),_&&(g=r.addStyle(_));let v=Un(e,t);if(h&&h.length>0){let e={r:v,t:`inlineStr`};return g!==0&&(e.s=g),q(`c`,e,[q(`is`,void 0,sr(h))])}if(l!=null){let e={r:v};g!==0&&(e.s=g);let t;if(d===`shared`){let e={t:`shared`};f!==void 0&&(e.si=f),p&&(e.ref=p),t=l===``?K(`f`,e):q(`f`,e,G(l))}else if(d===`array`){let e={t:`array`};p&&(e.ref=p),m&&(e.cm=1),t=q(`f`,e,G(l))}else t=q(`f`,void 0,G(l));let n=[t];return u!=null&&(typeof u==`string`?(e.t=`str`,n.push(q(`v`,void 0,G(u)))):typeof u==`boolean`?(e.t=`b`,n.push(q(`v`,void 0,u?`1`:`0`))):typeof u==`number`&&n.push(q(`v`,void 0,String(u)))),q(`c`,e,n)}if(s==null)return g===0?null:K(`c`,{r:v,s:g});if(typeof s==`string`&&qn.has(s)){let e={r:v,t:`e`};return g!==0&&(e.s=g),q(`c`,e,[q(`v`,void 0,s)])}if(typeof s==`string`){if(o){let e={r:v,t:`inlineStr`};return g!==0&&(e.s=g),q(`c`,e,[q(`is`,void 0,[q(`t`,void 0,G(s))])])}let e=i.add(s),t={r:v,t:`s`};return g!==0&&(t.s=g),q(`c`,t,[q(`v`,void 0,String(e))])}if(typeof s==`number`){if(!Number.isFinite(s))return g===0?null:K(`c`,{r:v,s:g});let e={r:v};return g!==0&&(e.s=g),q(`c`,e,[q(`v`,void 0,String(s))])}if(typeof s==`boolean`){let e={r:v,t:`b`};return g!==0&&(e.s=g),q(`c`,e,[q(`v`,void 0,s?`1`:`0`)])}if(s instanceof Date){let e=Xe(s,a),t={r:v};return g!==0&&(t.s=g),q(`c`,t,[q(`v`,void 0,String(e))])}return null}function Zn(e){let t={};e.password&&(t.password=_n(e.password)),e.sheet!==!1&&(t.sheet=1),e.objects&&(t.objects=1),e.scenarios&&(t.scenarios=1);for(let[n,r]of[[`selectLockedCells`,`selectLockedCells`],[`selectUnlockedCells`,`selectUnlockedCells`],[`formatCells`,`formatCells`],[`formatColumns`,`formatColumns`],[`formatRows`,`formatRows`],[`insertColumns`,`insertColumns`],[`insertRows`,`insertRows`],[`insertHyperlinks`,`insertHyperlinks`],[`deleteColumns`,`deleteColumns`],[`deleteRows`,`deleteRows`],[`sort`,`sort`],[`autoFilter`,`autoFilter`],[`pivotTables`,`pivotTables`]]){let i=e[n];i!==void 0&&typeof i==`boolean`&&(t[r]=i?0:1)}return K(`sheetProtection`,t)}function Qn(e){let t=[];for(let n of e){let e={type:n.type,sqref:n.range};n.operator&&(e.operator=n.operator),n.allowBlank&&(e.allowBlank=1),n.showInputMessage&&(e.showInputMessage=1),n.showErrorMessage&&(e.showErrorMessage=1),n.errorStyle&&(e.errorStyle=n.errorStyle),n.inputTitle&&(e.promptTitle=n.inputTitle),n.inputMessage&&(e.prompt=n.inputMessage),n.errorTitle&&(e.errorTitle=n.errorTitle),n.errorMessage&&(e.error=n.errorMessage);let r=[];if(n.type===`list`&&n.values&&n.values.length>0){let e=`"${n.values.join(`,`)}"`;r.push(q(`formula1`,void 0,G(e)))}else n.formula1!==void 0&&r.push(q(`formula1`,void 0,G(n.formula1)));n.formula2!==void 0&&r.push(q(`formula2`,void 0,G(n.formula2))),r.length>0?t.push(q(`dataValidation`,e,r)):t.push(K(`dataValidation`,e))}return q(`dataValidations`,{count:e.length},t)}function $n(e){if(!e.cells)return{xml:``,relationships:[]};let t=[],n=[],r=1;for(let[i,a]of e.cells){if(!a.hyperlink)continue;let[e,o]=i.split(`,`),s=Un(parseInt(e,10),parseInt(o,10)),c=a.hyperlink,l={ref:s};if(c.location)l.location=c.location;else if(c.target){let e=`rId${r++}`;l[`r:id`]=e,n.push({id:e,target:c.target})}c.tooltip&&(l.tooltip=c.tooltip),c.display&&(l.display=c.display),t.push(K(`hyperlink`,l))}return t.length===0?{xml:``,relationships:[]}:{xml:q(`hyperlinks`,void 0,t),relationships:n}}var er={letter:1,legal:5,a3:8,a4:9,a5:11,b4:12,b5:13,executive:7,tabloid:3},tr={};for(let[e,t]of Object.entries(er))tr[t]=e;var nr={left:.7,right:.7,top:.75,bottom:.75,header:.3,footer:.3};function rr(e){let t=e??{};return K(`pageMargins`,{left:t.left??nr.left,right:t.right??nr.right,top:t.top??nr.top,bottom:t.bottom??nr.bottom,header:t.header??nr.header,footer:t.footer??nr.footer})}function ir(e){let t={};if(e.paperSize){let n=er[e.paperSize];n!==void 0&&(t.paperSize=n)}return e.orientation&&(t.orientation=e.orientation),e.scale!==void 0&&(t.scale=e.scale),e.fitToPage&&(e.fitToWidth!==void 0&&(t.fitToWidth=e.fitToWidth),e.fitToHeight!==void 0&&(t.fitToHeight=e.fitToHeight)),e.horizontalCentered&&(t.horizontalCentered=1),e.verticalCentered&&(t.verticalCentered=1),Object.keys(t).length===0?``:K(`pageSetup`,t)}function ar(e){let t={};e.differentOddEven&&(t.differentOddEven=1),e.differentFirst&&(t.differentFirst=1);let n=[];return e.oddHeader&&n.push(q(`oddHeader`,void 0,G(e.oddHeader))),e.oddFooter&&n.push(q(`oddFooter`,void 0,G(e.oddFooter))),e.evenHeader&&n.push(q(`evenHeader`,void 0,G(e.evenHeader))),e.evenFooter&&n.push(q(`evenFooter`,void 0,G(e.evenFooter))),e.firstHeader&&n.push(q(`firstHeader`,void 0,G(e.firstHeader))),e.firstFooter&&n.push(q(`firstFooter`,void 0,G(e.firstFooter))),n.length===0?``:q(`headerFooter`,Object.keys(t).length>0?t:void 0,n)}function or(e){let t={};if(e.rgb!==void 0){let n=e.rgb;t.rgb=n.length===6?`FF${n}`:n}return e.theme!==void 0&&(t.theme=e.theme),e.tint!==void 0&&(t.tint=e.tint),e.indexed!==void 0&&(t.indexed=e.indexed),t}function sr(e){let t=[];for(let n of e){let e=[];if(n.font){let t=cr(n.font);t.length>0&&e.push(q(`rPr`,void 0,t))}let r=G(n.text);n.text.length>0&&(n.text[0]===` `||n.text[n.text.length-1]===` `||n.text.includes(`
`)||n.text.includes(`	`))?e.push(`<t xml:space="preserve">${r}</t>`):e.push(q(`t`,void 0,r)),t.push(q(`r`,void 0,e))}return t}function cr(e){let t=[];return e.bold&&t.push(K(`b`)),e.italic&&t.push(K(`i`)),e.underline&&(e.underline===!0||e.underline===`single`?t.push(K(`u`)):t.push(K(`u`,{val:e.underline}))),e.strikethrough&&t.push(K(`strike`)),e.vertAlign&&t.push(K(`vertAlign`,{val:e.vertAlign})),e.size!==void 0&&t.push(K(`sz`,{val:e.size})),e.color&&t.push(K(`color`,or(e.color))),e.name&&t.push(K(`rFont`,{val:e.name})),e.family!==void 0&&t.push(K(`family`,{val:e.family})),e.charset!==void 0&&t.push(K(`charset`,{val:e.charset})),e.scheme&&t.push(K(`scheme`,{val:e.scheme})),t}function lr(e,t){let n=new Map;for(let t of e){let e=n.get(t.range);e?e.push(t):n.set(t.range,[t])}let r=[];for(let[e,i]of n){let n=[];for(let e of i)n.push(ur(e,t));r.push(q(`conditionalFormatting`,{sqref:e},n))}return r}function ur(e,t){let n={type:e.type,priority:e.priority};e.style&&(n.dxfId=t.addDxf(e.style)),e.operator&&(n.operator=e.operator),e.stopIfTrue&&(n.stopIfTrue=!0),e.text!==void 0&&(n.text=e.text);let r=[];if(e.formula!==void 0){let t=Array.isArray(e.formula)?e.formula:[e.formula];for(let e of t)r.push(q(`formula`,void 0,G(e)))}if(e.type===`colorScale`&&e.colorScale){let t=[];for(let n of e.colorScale.cfvo){let e={type:n.type};n.value!==void 0&&(e.val=n.value),t.push(K(`cfvo`,e))}for(let n of e.colorScale.colors)t.push(K(`color`,{rgb:n}));r.push(q(`colorScale`,void 0,t))}if(e.type===`dataBar`&&e.dataBar){let t=[];for(let n of e.dataBar.cfvo){let e={type:n.type};n.value!==void 0&&(e.val=n.value),t.push(K(`cfvo`,e))}t.push(K(`color`,{rgb:e.dataBar.color})),r.push(q(`dataBar`,void 0,t))}if(e.type===`iconSet`&&e.iconSet){let t={iconSet:e.iconSet.iconSet};e.iconSet.reverse&&(t.reverse=!0),e.iconSet.showValue===!1&&(t.showValue=!1);let n=[];for(let t of e.iconSet.cfvo){let e={type:t.type};t.value!==void 0&&(e.val=t.value),n.push(K(`cfvo`,e))}r.push(q(`iconSet`,t,n))}return r.length>0?q(`cfRule`,n,r):K(`cfRule`,n)}function dr(e){let t=[],n=1;for(let r of e){let e={},i=r.type??`line`;i!==`line`&&(e.type=i),e.displayEmptyCellsAs=`gap`,e[`xr2:uid`]=`{00000000-0000-0000-0000-${String(n++).padStart(12,`0`)}}`,r.markers&&(e.markers=`1`);let a=[],o=r.color??`376092`,s=o.length===6?`FF${o}`:o;a.push(K(`x14:colorSeries`,{rgb:s}));let c=q(`x14:sparkline`,void 0,[q(`xm:f`,void 0,r.dataRange),q(`xm:sqref`,void 0,r.location)]);a.push(q(`x14:sparklines`,void 0,[c])),t.push(q(`x14:sparklineGroup`,e,a))}let r=q(`x14:sparklineGroups`,{"xmlns:xm":`http://schemas.microsoft.com/office/excel/2006/main`},t);return q(`extLst`,void 0,[q(`ext`,{uri:`{05C60535-1F16-4fd2-B633-F4F36F0B64E0}`,"xmlns:x14":`http://schemas.microsoft.com/office/spreadsheetml/2009/9/main`,"xmlns:xr2":`http://schemas.microsoft.com/office/spreadsheetml/2015/revision2`},[r])])}var fr=9525,pr={png:`png`,jpeg:`jpeg`,gif:`gif`,svg:`svg`,webp:`webp`},mr={png:`image/png`,jpeg:`image/jpeg`,gif:`image/gif`,svg:`image/svg+xml`,webp:`image/webp`};function hr(e,t,n){let r=[],i=[],a=[];for(let n=0;n<e.length;n++){let o=e[n],s=t+n,c=`rId${n+1}`,l=pr[o.type]??`png`,u=mr[o.type]??`image/png`,d=`xl/media/image${s}.${l}`,f=`../media/image${s}.${l}`;r.push({path:d,data:o.data,contentType:u}),i.push(K(`Relationship`,{Id:c,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/image`,Target:f}));let p=o.width?o.width*fr:3e6,m=o.height?o.height*fr:2e6,h=o.anchor.from.col,g=o.anchor.from.row,_=o.anchor.to?.col??h+3,v=o.anchor.to?.row??g+5,y=q(`xdr:twoCellAnchor`,void 0,[q(`xdr:from`,void 0,[q(`xdr:col`,void 0,String(h)),q(`xdr:colOff`,void 0,`0`),q(`xdr:row`,void 0,String(g)),q(`xdr:rowOff`,void 0,`0`)]),q(`xdr:to`,void 0,[q(`xdr:col`,void 0,String(_)),q(`xdr:colOff`,void 0,`0`),q(`xdr:row`,void 0,String(v)),q(`xdr:rowOff`,void 0,`0`)]),q(`xdr:pic`,void 0,[q(`xdr:nvPicPr`,void 0,[K(`xdr:cNvPr`,{id:n+2,name:`Picture ${n+1}`}),q(`xdr:cNvPicPr`,void 0,[K(`a:picLocks`,{noChangeAspect:1})])]),q(`xdr:blipFill`,void 0,[K(`a:blip`,{"r:embed":c}),q(`a:stretch`,void 0,[K(`a:fillRect`)])]),q(`xdr:spPr`,void 0,[q(`a:xfrm`,void 0,[K(`a:off`,{x:0,y:0}),K(`a:ext`,{cx:p,cy:m})]),q(`a:prstGeom`,{prst:`rect`},[K(`a:avLst`)])])]),K(`xdr:clientData`)]);a.push(y)}if(n&&n.length>0){let t=e.length+2;for(let e=0;e<n.length;e++){let r=n[e],i=r.anchor.from.col,o=r.anchor.from.row,s=r.anchor.to?.col??i+3,c=r.anchor.to?.row??o+3,l=r.width?r.width*fr:2e6,u=r.height?r.height*fr:5e5,d=q(`xdr:from`,void 0,[q(`xdr:col`,void 0,String(i)),q(`xdr:colOff`,void 0,`0`),q(`xdr:row`,void 0,String(o)),q(`xdr:rowOff`,void 0,`0`)]),f=q(`xdr:to`,void 0,[q(`xdr:col`,void 0,String(s)),q(`xdr:colOff`,void 0,`0`),q(`xdr:row`,void 0,String(c)),q(`xdr:rowOff`,void 0,`0`)]),p=q(`xdr:nvSpPr`,void 0,[K(`xdr:cNvPr`,{id:t++,name:`TextBox ${e+1}`}),q(`xdr:cNvSpPr`,{txBox:1},[])]),m=[q(`a:xfrm`,void 0,[K(`a:off`,{x:0,y:0}),K(`a:ext`,{cx:l,cy:u})]),q(`a:prstGeom`,{prst:`rect`},[K(`a:avLst`)])],h=r.style?.fillColor??`FFFFFF`;m.push(q(`a:solidFill`,void 0,[K(`a:srgbClr`,{val:h})]));let g=r.style?.borderColor??`000000`;m.push(q(`a:ln`,void 0,[q(`a:solidFill`,void 0,[K(`a:srgbClr`,{val:g})])]));let _=q(`xdr:spPr`,void 0,m),v={lang:`en-US`,sz:(r.style?.fontSize??11)*100};r.style?.bold&&(v.b=1);let y=[];r.style?.color&&y.push(q(`a:solidFill`,void 0,[K(`a:srgbClr`,{val:r.style.color})]));let b=y.length>0?q(`a:rPr`,v,y):K(`a:rPr`,v),x=q(`xdr:twoCellAnchor`,void 0,[d,f,q(`xdr:sp`,void 0,[p,_,q(`xdr:txBody`,void 0,[K(`a:bodyPr`,{wrap:`square`}),q(`a:p`,void 0,[q(`a:r`,void 0,[b,q(`a:t`,void 0,G(r.text))])])])]),K(`xdr:clientData`)]);a.push(x)}}return{drawingXml:J(`xdr:wsDr`,{"xmlns:xdr":`http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing`,"xmlns:a":`http://schemas.openxmlformats.org/drawingml/2006/main`,"xmlns:r":`http://schemas.openxmlformats.org/officeDocument/2006/relationships`},a),drawingRels:J(`Relationships`,{xmlns:`http://schemas.openxmlformats.org/package/2006/relationships`},i),images:r}}function gr(e,t){let n=[];for(let[t,r]of e){if(!r.comment)continue;let[e,i]=t.split(`,`),a=parseInt(e,10),o=parseInt(i,10),s=Un(a,o),c=r.comment.author??``,l=r.comment.text;n.push({ref:s,row:a,col:o,author:c,text:l})}if(n.length===0)return null;n.sort((e,t)=>e.row-t.row||e.col-t.col);let r=new Map;for(let e of n)r.has(e.author)||r.set(e.author,r.size);return{commentsXml:_r(n,r),vmlXml:vr(n,t),comments:n}}function _r(e,t){let n=[];for(let[e]of t)n.push(q(`author`,void 0,G(e)));let r=q(`authors`,void 0,n),i=[];for(let n of e){let e=t.get(n.author)??0,r=q(`text`,void 0,[q(`r`,void 0,[q(`t`,void 0,G(n.text))])]);i.push(q(`comment`,{ref:n.ref,authorId:e},[r]))}return J(`comments`,{xmlns:`http://schemas.openxmlformats.org/spreadsheetml/2006/main`},[r,q(`commentList`,void 0,i)])}function vr(e,t){let n=[];n.push(`<xml xmlns:v="urn:schemas-microsoft-com:vml"`,` xmlns:o="urn:schemas-microsoft-com:office:office"`,` xmlns:x="urn:schemas-microsoft-com:office:excel">`),n.push(`<o:shapelayout v:ext="edit">`,`<o:idmap v:ext="edit" data="${t+1}"/>`,`</o:shapelayout>`),n.push(`<v:shapetype id="_x0000_t202" coordsize="21600,21600" o:spt="202"`,` path="m,l,21600r21600,l21600,xe">`,`<v:stroke joinstyle="miter"/>`,`<v:path gradientshapeok="t" o:connecttype="rect"/>`,`</v:shapetype>`);let r=(t+1)*1024+1;for(let t=0;t<e.length;t++){let i=e[t],a=r+t,o=i.col+1,s=i.row,c=o+2,l=s+4,u=(i.col+1)*48,d=i.row*15;n.push(`<v:shape id="_x0000_s${a}" type="#_x0000_t202"`,` style="position:absolute;margin-left:${u}pt;margin-top:${d}pt;`,`width:108pt;height:59.25pt;z-index:${t+1};visibility:hidden"`,` fillcolor="#ffffe1" o:insetmode="auto">`,`<v:fill color2="#ffffe1"/>`,`<v:shadow on="t" color="black" obscured="t"/>`,`<v:path o:connecttype="none"/>`,`<v:textbox style="mso-direction-alt:auto">`,`<div style="text-align:left"/>`,`</v:textbox>`,`<x:ClientData ObjectType="Note">`,`<x:MoveWithCells/>`,`<x:SizeWithCells/>`,`<x:Anchor>${o},15,${s},2,${c},31,${l},4</x:Anchor>`,`<x:AutoFill>False</x:AutoFill>`,`<x:Row>${i.row}</x:Row>`,`<x:Column>${i.col}</x:Column>`,`</x:ClientData>`,`</v:shape>`)}return n.push(`</xml>`),n.join(``)}function yr(e,t,n){let r=e.displayName??e.name,i=e.range??``,a=e.showAutoFilter!==!1,o=e.showTotalRow===!0,s={xmlns:`http://schemas.openxmlformats.org/spreadsheetml/2006/main`,id:t,name:e.name,displayName:r,ref:i};o?s.totalsRowCount=1:s.totalsRowShown=0;let c=[];if(a){let e=o?br(i):i;c.push(K(`autoFilter`,{ref:e}))}let l=[];for(let t=0;t<e.columns.length;t++){let n=e.columns[t],r={id:t+1,name:n.name};if(o&&n.totalFunction&&(r.totalsRowFunction=n.totalFunction),o&&n.totalLabel&&(r.totalsRowLabel=n.totalLabel),o&&n.totalFunction===`custom`&&n.totalFormula){let e=q(`totalsRowFormula`,void 0,G(n.totalFormula));l.push(q(`tableColumn`,r,[e]))}else l.push(K(`tableColumn`,r))}c.push(q(`tableColumns`,{count:e.columns.length},l));let u=e.style??`TableStyleMedium2`,d=e.showRowStripes!==!1,f=e.showColumnStripes===!0;return c.push(K(`tableStyleInfo`,{name:u,showFirstColumn:0,showLastColumn:0,showRowStripes:d?1:0,showColumnStripes:f?1:0})),{tableXml:J(`table`,s,c),tableId:t}}function br(e){let t=e.indexOf(`:`);if(t===-1)return e;let n=e.slice(t+1),r=n.length;for(;r>0&&n.charCodeAt(r-1)>=48&&n.charCodeAt(r-1)<=57;)r--;let i=n.slice(0,r),a=parseInt(n.slice(r),10);return isNaN(a)||a<=1?e:`${e.slice(0,t+1)}${i}${a-1}`}function xr(e){return e.toISOString().replace(/\.\d{3}Z$/,`Z`)}function Sr(e){let t=[];e?.title&&t.push(q(`dc:title`,void 0,G(e.title))),e?.subject&&t.push(q(`dc:subject`,void 0,G(e.subject))),e?.creator&&t.push(q(`dc:creator`,void 0,G(e.creator))),e?.keywords&&t.push(q(`cp:keywords`,void 0,G(e.keywords))),e?.description&&t.push(q(`dc:description`,void 0,G(e.description))),e?.lastModifiedBy&&t.push(q(`cp:lastModifiedBy`,void 0,G(e.lastModifiedBy))),e?.category&&t.push(q(`cp:category`,void 0,G(e.category))),e?.created&&t.push(q(`dcterms:created`,{"xsi:type":`dcterms:W3CDTF`},xr(e.created)));let n=e?.modified??new Date;return t.push(q(`dcterms:modified`,{"xsi:type":`dcterms:W3CDTF`},xr(n))),J(`cp:coreProperties`,{"xmlns:cp":`http://schemas.openxmlformats.org/package/2006/metadata/core-properties`,"xmlns:dc":`http://purl.org/dc/elements/1.1/`,"xmlns:dcterms":`http://purl.org/dc/terms/`,"xmlns:xsi":`http://www.w3.org/2001/XMLSchema-instance`},t)}function Cr(e){if(!e?.custom)return null;let t=Object.entries(e.custom);if(t.length===0)return null;let n=[],r=2;for(let[e,i]of t){let t;if(typeof i==`string`)t=q(`vt:lpwstr`,void 0,G(i));else if(typeof i==`number`)t=q(Number.isInteger(i)?`vt:i4`:`vt:r8`,void 0,String(i));else if(typeof i==`boolean`)t=q(`vt:bool`,void 0,i?`true`:`false`);else if(i instanceof Date)t=q(`vt:filetime`,void 0,xr(i));else continue;n.push(q(`property`,{fmtid:`{D5CDD505-2E9C-101B-9397-08002B2CF9AE}`,pid:r++,name:e},t))}return n.length===0?null:J(`Properties`,{xmlns:`http://schemas.openxmlformats.org/officeDocument/2006/custom-properties`,"xmlns:vt":`http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes`},n)}function wr(e){let t=[];return t.push(q(`Application`,void 0,`hucre`)),t.push(q(`DocSecurity`,void 0,`0`)),e?.company&&t.push(q(`Company`,void 0,G(e.company))),e?.manager&&t.push(q(`Manager`,void 0,G(e.manager))),J(`Properties`,{xmlns:`http://schemas.openxmlformats.org/officeDocument/2006/extended-properties`},t)}function Tr(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`}var $=new TextEncoder;async function Er(e){let{sheets:t,defaultFont:n,dateSystem:r,namedRanges:i,properties:a,activeSheet:o,workbookProtection:s}=e,c=Mn(n),l=Gn(),u=1,d=[];for(let e of t)e.tables&&e.tables.length>0?(d.push(u),u+=e.tables.length):d.push(void 0);let f=[];for(let n=0;n<t.length;n++){let i=t[n],a=Jn(i,c,l,r,d[n],e.stringMode===`inline`);f.push(a)}let p=l.count()>0,m=[],h=[],g=new Set,_=1;for(let e=0;e<t.length;e++){let n=t[e],r=n.images&&n.images.length>0,i=n.textBoxes&&n.textBoxes.length>0;if(r||i){let t=hr(n.images??[],_,n.textBoxes);m.push(t),h.push(e+1);for(let e of t.images){let t=e.path.split(`.`).pop();t&&g.add(t)}n.images&&(_+=n.images.length)}else m.push(null)}let v=[];for(let e=0;e<t.length;e++)if(t[e].backgroundImage){let e=`xl/media/image${_}.png`;v.push(e),g.add(`png`),_++}else v.push(null);let y=[],b=[];for(let e=0;e<t.length;e++){let n=t[e];if(n.cells){let t=gr(n.cells,e);t?(y.push(t),b.push(e+1)):y.push(null)}else y.push(null)}let x=[];for(let e of f)for(let t of e.tables)x.push(t.globalTableIndex);let S=new Ie,C=Cr(a),w=C!==null,T=e.vbaProject!==void 0&&e.vbaProject.length>0,E={sheetCount:t.length,hasSharedStrings:p,drawingIndices:h.length>0?h:void 0,imageExtensions:g.size>0?g:void 0,commentIndices:b.length>0?b:void 0,tableIndices:x.length>0?x:void 0,hasCoreProps:!0,hasAppProps:!0,hasCustomProps:w,hasMacros:T};S.add(`[Content_Types].xml`,$.encode(gn(E))),S.add(`_rels/.rels`,$.encode(xn({hasCoreProps:!0,hasAppProps:!0,hasCustomProps:w}))),S.add(`docProps/core.xml`,$.encode(Sr(a))),S.add(`docProps/app.xml`,$.encode(wr(a))),C&&S.add(`docProps/custom.xml`,$.encode(C));let D=Dr(t,i);S.add(`xl/workbook.xml`,$.encode(yn(t,D.length>0?D:void 0,r,o,s))),S.add(`xl/_rels/workbook.xml.rels`,$.encode(bn(t.length,p,T))),S.add(`xl/styles.xml`,$.encode(c.toXml())),S.add(`xl/theme/theme1.xml`,$.encode(Tr())),p&&S.add(`xl/sharedStrings.xml`,$.encode(Kn(l))),T&&S.add(`xl/vbaProject.bin`,e.vbaProject);for(let e=0;e<f.length;e++){let n=f[e],r=m[e],i=y[e];S.add(`xl/worksheets/sheet${e+1}.xml`,$.encode(n.xml));let a=n.hyperlinkRelationships.length>0,o=r!==null&&n.drawingRId!==null,s=i!==null&&n.legacyDrawingRId!==null,c=n.tables.length>0,l=n.pictureRId!==null&&v[e]!==null;if(a||o||s||c||l){let t=[];for(let e of n.hyperlinkRelationships)t.push(K(`Relationship`,{Id:e.id,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink`,Target:e.target,TargetMode:`External`}));o&&n.drawingRId&&t.push(K(`Relationship`,{Id:n.drawingRId,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing`,Target:`../drawings/drawing${e+1}.xml`})),s&&n.legacyDrawingRId&&n.commentsRId&&(t.push(K(`Relationship`,{Id:n.legacyDrawingRId,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing`,Target:`../drawings/vmlDrawing${e+1}.vml`})),t.push(K(`Relationship`,{Id:n.commentsRId,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments`,Target:`../comments${e+1}.xml`})));for(let e of n.tables)t.push(K(`Relationship`,{Id:e.rId,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/table`,Target:`../tables/table${e.globalTableIndex}.xml`}));if(l&&n.pictureRId&&v[e]){let r=`../${v[e].slice(3)}`;t.push(K(`Relationship`,{Id:n.pictureRId,Type:`http://schemas.openxmlformats.org/officeDocument/2006/relationships/image`,Target:r}))}let r=J(`Relationships`,{xmlns:`http://schemas.openxmlformats.org/package/2006/relationships`},t);S.add(`xl/worksheets/_rels/sheet${e+1}.xml.rels`,$.encode(r))}if(r){S.add(`xl/drawings/drawing${e+1}.xml`,$.encode(r.drawingXml)),S.add(`xl/drawings/_rels/drawing${e+1}.xml.rels`,$.encode(r.drawingRels));for(let e of r.images)S.add(e.path,e.data,{compress:!1})}l&&v[e]&&t[e].backgroundImage&&S.add(v[e],t[e].backgroundImage,{compress:!1}),i&&(S.add(`xl/comments${e+1}.xml`,$.encode(i.commentsXml)),S.add(`xl/drawings/vmlDrawing${e+1}.vml`,$.encode(i.vmlXml)));let u=t[e];if(u.tables&&u.tables.length>0)for(let e=0;e<u.tables.length;e++){let t=u.tables[e],r=n.tables[e].globalTableIndex,i=t.range;i||=Or(t,u);let a=yr({...t,range:i},r,r);S.add(`xl/tables/table${r}.xml`,$.encode(a.tableXml))}}return S.build()}function Dr(e,t){let n=t?[...t]:[];for(let t of e){let e=t.pageSetup;if(!e)continue;e.printArea&&n.push({name:`_xlnm.Print_Area`,range:`${t.name}!${e.printArea}`,scope:t.name});let r=[];e.printTitlesRow&&r.push(`${t.name}!${e.printTitlesRow}`),e.printTitlesColumn&&r.push(`${t.name}!${e.printTitlesColumn}`),r.length>0&&n.push({name:`_xlnm.Print_Titles`,range:r.join(`,`),scope:t.name})}return n}function Or(e,t){let n=e.columns.length,r=0;if(t.rows)r=t.rows.length;else if(t.data){let e=t.columns?.some(e=>e.header);r=t.data.length+(e?1:0)}return e.showTotalRow&&(r+=1),r<1&&(r=1),`${Hn(0)}1:${Hn(n-1)}${r}`}new TextEncoder;async function kr(e,t){let n=e instanceof Uint8Array?e:new Uint8Array(e),r=await $t(n,t),i=new Ee(n),a=await i.extractAll(),o=new TextDecoder(`utf-8`),s=i.has(`[Content_Types].xml`)?o.decode(await i.extract(`[Content_Types].xml`)):``,c=i.has(`_rels/.rels`)?o.decode(await i.extract(`_rels/.rels`)):``,l=a.has(`xl/vbaProject.bin`);return{...r,_rawEntries:a,_modifiedParts:new Set,_contentTypes:s,_rootRels:c,hasMacros:l}}new TextEncoder,new TextEncoder;function Ar(e,t,n){let r=n?.headerRow??1,i=n?.skipEmptyRows??!1,a=n?.errorMode??`collect`,o=Object.keys(t);if(o.length===0||e.length===0)return{data:[],errors:[]};let s=r-1,c=s>=0&&s<e.length?e[s]:[],l=new Map;for(let e=0;e<c.length;e++){let t=c[e];if(t!=null){let n=String(t).trim().toLowerCase();n!==``&&l.set(n,e)}}let u=new Map,d=[];for(let e of o){let n=t[e];if(n.columnIndex!=null)u.set(e,n.columnIndex);else{let t=(n.column??e).trim().toLowerCase(),r=l.get(t);r==null?u.set(e,-1):u.set(e,r)}}let f=[],p=s+1;for(let n=p;n<e.length;n++){let r=e[n];if(i&&Mr(r))continue;let s={};for(let e of o){let i=t[e],o=u.get(e),c=o>=0&&o<r.length?r[o]??null:null,l=n+1,f=i.column??e;if(i.required&&jr(c)){let t={row:l,column:f,message:`Required field '${f}' is empty`,value:c,field:e};if(d.push(t),a===`throw`)throw new I(t.message,[t]);s[e]=null;continue}if(jr(c)){i.default===void 0?s[e]=null:s[e]=i.default;continue}let p=c,m=!1;if(i.type){let t=Nr(c,i.type,f);if(t.error){let n={row:l,column:f,message:t.error,value:c,field:e};if(d.push(n),a===`throw`)throw new I(n.message,[n]);m=!0,s[e]=null;continue}p=t.value}if(!m){if(i.pattern&&typeof p==`string`&&!i.pattern.test(p)){let t={row:l,column:f,message:`'${f}' does not match pattern`,value:c,field:e};if(d.push(t),a===`throw`)throw new I(t.message,[t]);s[e]=null;continue}if(i.min!=null||i.max!=null){let t=zr(p,i,f,l,c,e);if(t){if(d.push(t),a===`throw`)throw new I(t.message,[t]);s[e]=null;continue}}if(i.enum&&!i.enum.includes(p)){let t={row:l,column:f,message:`'${f}' must be one of: ${i.enum.map(e=>String(e)).join(`, `)}`,value:c,field:e};if(d.push(t),a===`throw`)throw new I(t.message,[t]);s[e]=null;continue}if(i.validate){let t=i.validate(p);if(t!==!0){let n={row:l,column:f,message:typeof t==`string`?t:`Custom validation failed for '${f}'`,value:c,field:e};if(d.push(n),a===`throw`)throw new I(n.message,[n]);s[e]=null;continue}}i.transform&&(p=i.transform(p)),s[e]=p}}f.push(s)}return{data:f,errors:d}}function jr(e){return e==null||typeof e==`string`&&e.trim()===``}function Mr(e){return e.length===0?!0:e.every(e=>e==null||typeof e==`string`&&e.trim()===``)}function Nr(e,t,n){switch(t){case`string`:return Pr(e);case`number`:return Fr(e,n);case`integer`:return Ir(e,n);case`boolean`:return Lr(e,n);case`date`:return Rr(e,n);default:return{value:e}}}function Pr(e){return e==null?{value:``}:typeof e==`string`?{value:e.trim()}:typeof e==`boolean`||typeof e==`number`?{value:String(e)}:e instanceof Date?{value:e.toISOString()}:{value:String(e)}}function Fr(e,t){if(typeof e==`number`)return{value:e};if(typeof e==`boolean`)return{value:e?1:0};if(typeof e==`string`){let n=e.replace(/,/g,``).trim();if(n===``)return{error:`Expected number for '${t}', got ''`};let r=Number.parseFloat(n);return Number.isNaN(r)?{error:`Expected number for '${t}', got '${e}'`}:{value:r}}return{error:`Expected number for '${t}', got '${String(e)}'`}}function Ir(e,t){if(typeof e==`number`)return!Number.isFinite(e)||e%1!=0?{error:`Expected integer for '${t}', got '${e}'`}:{value:Math.trunc(e)};if(typeof e==`string`){let n=e.replace(/,/g,``).trim();if(n===``)return{error:`Expected integer for '${t}', got ''`};let r=Number(n);return Number.isNaN(r)||r%1!=0?{error:`Expected integer for '${t}', got '${e}'`}:{value:Math.trunc(r)}}return{error:`Expected integer for '${t}', got '${String(e)}'`}}function Lr(e,t){if(typeof e==`boolean`)return{value:e};if(typeof e==`number`)return e===1?{value:!0}:e===0?{value:!1}:{error:`Expected boolean for '${t}', got '${e}'`};if(typeof e==`string`){let n=e.trim().toLowerCase();return n===`true`||n===`yes`||n===`1`?{value:!0}:n===`false`||n===`no`||n===`0`?{value:!1}:{error:`Expected boolean for '${t}', got '${e}'`}}return{error:`Expected boolean for '${t}', got '${String(e)}'`}}function Rr(e,t){if(e instanceof Date)return{value:e};if(typeof e==`number`)return{value:Ye(e)};if(typeof e==`string`){let n=it(e);return n===null?{error:`Expected date for '${t}', got '${e}'`}:{value:n}}return{error:`Expected date for '${t}', got '${String(e)}'`}}function zr(e,t,n,r,i,a){if(typeof e==`number`){if(t.min!=null&&e<t.min)return{row:r,column:n,message:`Value ${e} for '${n}' is below minimum ${t.min}`,value:i,field:a};if(t.max!=null&&e>t.max)return{row:r,column:n,message:`Value ${e} for '${n}' exceeds maximum ${t.max}`,value:i,field:a}}else if(typeof e==`string`){if(t.min!=null&&e.length<t.min)return{row:r,column:n,message:`'${n}' length ${e.length} is below minimum ${t.min}`,value:i,field:a};if(t.max!=null&&e.length>t.max)return{row:r,column:n,message:`'${n}' length ${e.length} exceeds maximum ${t.max}`,value:i,field:a}}return null}var Br={"en-US":{decimal:`.`,thousands:`,`,currency:`$`},"de-DE":{decimal:`,`,thousands:`.`,currency:`€`},"fr-FR":{decimal:`,`,thousands:`\xA0`,currency:`€`},"tr-TR":{decimal:`,`,thousands:`.`,currency:`₺`}};function Vr(e){if(e)return Br[e]}function Hr(e,t,n){if(e==null)return``;if(typeof e==`boolean`)return e?`TRUE`:`FALSE`;if(!t||/^General$/i.test(t.trim()))return e instanceof Date?e.toISOString():String(e);let r=Ur(t);if(typeof e==`string`)return Zr(e,r.length>=4?r[3]:r[0]);let i;if(e instanceof Date)i=Xe(e);else if(typeof e==`number`)i=e;else return String(e);let a;r.length>=3?i>0?a=r[0]:i<0?(a=r[1],i=Math.abs(i)):a=r[2]:r.length===2?i>=0?a=r[0]:(a=r[1],i=Math.abs(i)):a=r[0];let o=Jr(a);o.condition&&(a=r.length>=2?Xr(typeof e==`number`?e:i,o.condition)?o.rest:r.length>=2?Yr(r[1]):o.rest:o.rest);let s=Vr(n?.locale);return $r(i,a,s)}function Ur(e){let t=[],n=``,r=!1,i=0;for(;i<e.length;){let a=e[i];if(a===`\\`){n+=a,i++,i<e.length&&(n+=e[i],i++);continue}if(a===`"`){r=!r,n+=a,i++;continue}if(a===`;`&&!r){t.push(n),n=``,i++;continue}n+=a,i++}return t.push(n),t}function Wr(e){return e.replace(/\[(Black|Blue|Cyan|Green|Magenta|Red|White|Yellow|Color\s*\d+)\]/gi,``)}function Gr(e){return e.replace(/\[\$[^\]]*\]/g,``)}function Kr(e){return e.replace(/[_*]./g,``)}function qr(e){let t=Wr(e);return t=Gr(t),t=Kr(t),t}function Jr(e){let t=e.match(/\[([<>=!]+)(-?\d+(?:\.\d+)?)\]/);return t?{condition:{operator:t[1],value:Number(t[2])},rest:e.replace(t[0],``)}:{condition:null,rest:e}}function Yr(e){return e.replace(/\[([<>=!]+)(-?\d+(?:\.\d+)?)\]/,``)}function Xr(e,t){switch(t.operator){case`>`:return e>t.value;case`<`:return e<t.value;case`>=`:return e>=t.value;case`<=`:return e<=t.value;case`=`:case`==`:return e===t.value;case`<>`:case`!=`:return e!==t.value;default:return!0}}function Zr(e,t){let n=Qr(qr(t));return n.includes(`@`)?n.replace(/@/g,e):e}function Qr(e){let t=``,n=0;for(;n<e.length;)if(e[n]===`"`){for(n++;n<e.length&&e[n]!==`"`;)t+=e[n],n++;n++}else e[n]===`\\`?(n++,n<e.length&&(t+=e[n],n++)):(t+=e[n],n++);return t}function $r(e,t,n){let r=qr(t);return r.trim()===`@`?String(e):Qe(r)?nt(Ye(e),t):r.includes(`%`)?ei(e,r,n):/[eE][+-]/.test(r)||/[eE]\d/.test(r)?ti(e,r,n):ri(r)?ii(e,r):oi(e,r,n)}function ei(e,t,n){return oi(e*100,t.replace(/%/g,``),n)+`%`}function ti(e,t,n){let r=t.match(/^([#0?.,]*?)([eE])([+-])(\d+)$/);if(!r){let n=t.match(/\.([0#?]+)[eE]/),r=n?n[1].length:2;return ni(e.toExponential(r),t)}let i=r[1],a=r[2],o=r[3],s=r[4].length,c=i.indexOf(`.`),l=c>=0?i.length-c-1:0,u=e.toExponential(l).split(/[eE]/),d=u[0],f=Number.parseInt(u[1],10);n&&n.decimal!==`.`&&(d=d.replace(`.`,n.decimal));let p=f>=0?`+`:`-`,m=Math.abs(f).toString().padStart(s,`0`),h=o===`+`?p:f<0?`-`:``;return d+a+h+m}function ni(e,t){let n=e.split(/[eE]/),r=n[0],i=Number.parseInt(n[1],10),a=t.includes(`E`)?`E`:`e`,o=t.includes(`E+`)||t.includes(`e+`),s=i>=0?`+`:`-`,c=Math.abs(i).toString().padStart(2,`0`),l=o?s:i<0?`-`:``;return r+a+l+c}function ri(e){return/[#0?]\s*[?#0]+\/[?#0]+/.test(e)}function ii(e,t){let n=Math.trunc(e),r=Math.abs(e-n);if(r===0)return(t.includes(`#`)||/^[0?]/.test(t.trim()))&&n!==0?String(n):String(n)+`      `;let i=t.match(/([?#0]+)\/([?#0]+)/);if(!i)return String(e);let a=i[2].length,o=/^\d+$/.test(i[2])?Number.parseInt(i[2],10):0,s,c;if(o>0)c=o,s=Math.round(r*o);else{let e=ai(r,10**a-1);s=e.num,c=e.den}let l=t.includes(`#`)||t.includes(`0`),u=n!==0&&l?String(n)+` `:n<0?`-`:``,d=String(s).padStart(i[1].length,` `),f=String(c).padStart(i[2].length,` `);return u+d+`/`+f}function ai(e,t){let n=0,r=1,i=Math.abs(e);for(let a=1;a<=t;a++){let t=Math.round(e*a),o=Math.abs(e-t/a);if(o<i&&(i=o,n=t,r=a,o===0))break}return{num:n,den:r}}function oi(e,t,n){let{prefix:r,suffix:i,core:a}=si(t);if(!a.trim())return r+i;let o=a.includes(`,`)&&/[#0?],/.test(a)&&!a.match(/,{2,}/),s=0,c=a.match(/(,+)(?=[^#0?]*$)/);c&&!o&&(s=c[1].length);let l=e;for(let e=0;e<s;e++)l/=1e3;let u=a.indexOf(`.`),d=0;u>=0&&(d=a.slice(u+1).replace(/[^0#?]/g,``).length);let f=ci(Math.abs(l),d),p=e<0,[m,h]=li(f,d),g=ui(m,(u>=0?a.slice(0,u):a).replace(/,/g,``),o),_=``;u>=0&&(_=`.`+di(h,a.slice(u+1)));let v=g,y=_;n&&(n.thousands!==`,`&&o&&(v=v.replace(/,/g,n.thousands)),n.decimal!==`.`&&y.length>0&&(y=n.decimal+y.slice(1)));let b=r;return p&&t.indexOf(`-`)===-1&&(b+=`-`),b+=v+y+i,b}function si(e){let t=``,n=``,r=``,i=0,a=!1,o=!1;for(;i<e.length;){let s=e[i];if(s===`"`){let r=``;for(i++;i<e.length&&e[i]!==`"`;)r+=e[i],i++;i++,a?(o=!0,n+=r):t+=r;continue}if(s===`\\`){i++,i<e.length&&(a?(o=!0,n+=e[i]):t+=e[i],i++);continue}if(`#0?.,%Ee+-`.includes(s)){o&&`#0?`.includes(s)?(r+=n+s,n=``,o=!1):r+=s,`#0?`.includes(s)&&(a=!0),i++;continue}if(s===`,`){a&&(r+=s),i++;continue}a?(o=!0,n+=s):t+=s,i++}return{prefix:t,suffix:n,core:r}}function ci(e,t){let n=10**t;return Math.round(e*n)/n}function li(e,t){let n=e.toFixed(t),r=n.indexOf(`.`);return r<0?[n,``]:[n.slice(0,r),n.slice(r+1)]}function ui(e,t,n){let r=(t.match(/0/g)||[]).length,i=t.includes(`#`),a=e;return a.length<r&&(a=a.padStart(r,`0`)),a===`0`&&r===0&&i&&(a=``),n&&a.length>0&&(a=pi(a)),a}function di(e,t){let n=``,r=t.replace(/[^0#?]/g,``);for(let t=0;t<r.length;t++){let i=r[t],a=t<e.length?e[t]:`0`;switch(i){case`0`:n+=a;break;case`#`:fi(e,t)&&(n+=a);break;case`?`:t<e.length?n+=a:n+=` `;break}}return n}function fi(e,t){for(let n=t;n<e.length;n++)if(e[n]!==`0`)return!0;return!1}function pi(e){let t=e.startsWith(`-`),n=t?e.slice(1):e,r=``,i=n.length;for(let e=0;e<i;e++)e>0&&(i-e)%3==0&&(r+=`,`),r+=n[e];return t?`-`+r:r}var mi=class e{sheets=[];_properties;_defaultFont;_dateSystem;_activeSheet;static create(){return new e}addSheet(e){let t=new hi(e,this);return this.sheets.push(t),t}properties(e){return this._properties=e,this}defaultFont(e){return this._defaultFont=e,this}dateSystem(e){return this._dateSystem=e,this}activeSheet(e){return this._activeSheet=e,this}async build(){return Er({sheets:this.sheets.map(e=>e._toWriteSheet()),properties:this._properties,defaultFont:this._defaultFont,dateSystem:this._dateSystem,activeSheet:this._activeSheet})}},hi=class{_columns=[];_rows=[];_merges=[];_freezePane;_validations=[];_cells;_hidden;_veryHidden;constructor(e,t){this._name=e,this._wb=t}column(e){return this._columns.push(e),this}columns(e){return this._columns.push(...e),this}row(e){return this._rows.push(e),this}rows(e){return this._rows.push(...e),this}merge(e,t,n,r){return this._merges.push({startRow:e,startCol:t,endRow:n,endCol:r}),this}freeze(e,t){return this._freezePane={rows:e,columns:t},this}validation(e){return this._validations.push(e),this}cell(e,t,n){return this._cells||=new Map,this._cells.set(`${e},${t}`,n),this}hidden(e=!0){return this._hidden=e,this}veryHidden(e=!0){return this._veryHidden=e,this}done(){return this._wb}async build(){return this._wb.build()}_toWriteSheet(){return{name:this._name,columns:this._columns.length>0?this._columns:void 0,rows:this._rows,cells:this._cells,merges:this._merges.length>0?this._merges:void 0,freezePane:this._freezePane,dataValidations:this._validations.length>0?this._validations:void 0,hidden:this._hidden,veryHidden:this._veryHidden}}},gi=/\{\{\s*([^}\s]+)\s*\}\}/g;function _i(e,t){for(let n of e.sheets){for(let e=0;e<n.rows.length;e++){let r=n.rows[e];for(let e=0;e<r.length;e++){let n=r[e];if(typeof n!=`string`||!n.includes(`{{`))continue;let i=n.match(/^\{\{\s*([^}\s]+)\s*\}\}$/);if(i){let n=i[1];n in t&&(r[e]=t[n]);continue}r[e]=n.replace(gi,(e,n)=>{if(n in t){let e=t[n];return e===null?``:e instanceof Date?e.toISOString():String(e)}return e})}}if(n.cells)for(let[e,r]of n.cells){if(typeof r.value!=`string`||!r.value.includes(`{{`))continue;let e=r.value.match(/^\{\{\s*([^}\s]+)\s*\}\}$/);if(e){let n=e[1];n in t&&(r.value=t[n],typeof r.value==`number`?r.type=`number`:typeof r.value==`boolean`?r.type=`boolean`:r.value instanceof Date?r.type=`date`:r.type=`string`);continue}r.value=r.value.replace(gi,(e,n)=>{if(n in t){let e=t[n];return e===null?``:e instanceof Date?e.toISOString():String(e)}return e})}}return e}`read.write.readObjects.writeObjects.readXlsx.writeXlsx.openXlsx.saveXlsx.hashSheetPassword.streamXlsxRows.XlsxStreamWriter.readOds.writeOds.parseCsv.parseCsvObjects.detectDelimiter.stripBom.writeCsv.writeCsvObjects.formatCsvValue.streamCsvRows.CsvStreamWriter.validateWithSchema.serialToDate.dateToSerial.isDateFormat.formatDate.parseDate.serialToTime.timeToSerial.insertRows.deleteRows.insertColumns.deleteColumns.moveRows.hideRows.hideColumns.groupRows`.split(`.`);function vi(e){let t=0;for(let n=0;n<e.length;n++){let r=e.charCodeAt(n),i;if(r>=65&&r<=90)i=r-64;else if(r>=97&&r<=122)i=r-96;else break;t=t*26+i}return t-1}function yi(e){let t=e.split(`:`),n=X(t[0]),r=t.length>1?X(t[1]):n;return{startRow:n.row,startCol:n.col,endRow:r.row,endCol:r.col}}function bi(e,t,n){return e>=n.startRow&&e<=n.endRow&&t>=n.startCol&&t<=n.endCol}function xi(e,t){let n=t?.headerRow??0;if(e.rows.length<=n)return[];let r=e.rows[n].map(e=>e==null?``:String(e).trim()),i=[];for(let t=n+1;t<e.rows.length;t++){let n=e.rows[t],a={};for(let e=0;e<r.length;e++)a[r[e]]=e<n.length?n[e]??null:null;i.push(a)}return i}function Si(e){return e.rows.length===0?{headers:[],data:[]}:{headers:e.rows[0].map(e=>e==null?``:String(e).trim()),data:e.rows.slice(1)}}function Ci(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function wi(e){return e&&e.rgb?`#${e.rgb}`:null}function Ti(e){let t=[];if(e.font){if(e.font.bold&&t.push(`font-weight:bold`),e.font.italic&&t.push(`font-style:italic`),e.font.underline&&t.push(`text-decoration:underline`),e.font.strikethrough){let e=t.findIndex(e=>e.startsWith(`text-decoration:`));e>=0?t[e]=`text-decoration:underline line-through`:t.push(`text-decoration:line-through`)}e.font.size&&t.push(`font-size:${e.font.size}pt`),e.font.name&&t.push(`font-family:${e.font.name}`);let n=wi(e.font.color);n&&t.push(`color:${n}`)}if(e.fill&&e.fill.type===`pattern`&&e.fill.pattern===`solid`){let n=wi(e.fill.fgColor);n&&t.push(`background-color:${n}`)}if(e.alignment&&(e.alignment.horizontal&&e.alignment.horizontal!==`general`&&t.push(`text-align:${e.alignment.horizontal}`),e.alignment.vertical&&t.push(`vertical-align:${e.alignment.vertical}`),e.alignment.wrapText&&t.push(`white-space:pre-wrap`)),e.border)for(let n of[`top`,`right`,`bottom`,`left`]){let r=e.border[n];if(r){let e=wi(r.color)||`#000000`,i=`1px`;r.style===`medium`||r.style===`mediumDashed`||r.style===`mediumDashDot`||r.style===`mediumDashDotDot`?i=`2px`:r.style===`thick`&&(i=`3px`);let a=`solid`;r.style===`dashed`||r.style===`mediumDashed`?a=`dashed`:r.style===`dotted`?a=`dotted`:r.style===`double`&&(a=`double`),t.push(`border-${n}:${i} ${a} ${e}`)}}return t.join(`;`)}function Ei(e){return e==null?``:e instanceof Date?e.toISOString().slice(0,10):typeof e==`boolean`||typeof e==`number`?String(e):Ci(String(e))}function Di(e,t){return e==null?`${t}-null`:e instanceof Date?`${t}-date`:typeof e==`number`?`${t}-num`:typeof e==`boolean`?`${t}-bool`:null}function Oi(e){let t=new Map;if(!e)return t;for(let n of e){let e=n.endCol-n.startCol+1,r=n.endRow-n.startRow+1;t.set(`${n.startRow},${n.startCol}`,{colspan:e>1?e:void 0,rowspan:r>1?r:void 0});for(let e=n.startRow;e<=n.endRow;e++)for(let r=n.startCol;r<=n.endCol;r++)e===n.startRow&&r===n.startCol||t.set(`${e},${r}`,{hidden:!0})}return t}function ki(e,t){let n={styles:t?.styles??!1,classes:t?.classes??!0,headerRow:t?.headerRow??!1,classPrefix:t?.classPrefix??`hucre`,includeStyleTag:t?.includeStyleTag??!1,caption:t?.caption,ariaLabel:t?.ariaLabel},r=n.classPrefix,i=[];n.includeStyleTag&&i.push(`class="${r}-table"`),n.headerRow&&i.push(`role="table"`),n.ariaLabel&&i.push(`aria-label="${Ci(n.ariaLabel)}"`);let a=i.length>0?` `+i.join(` `):``,o=e.rows;if(!o||o.length===0){let e=`<table${a}>`;return n.caption&&(e+=`<caption>${Ci(n.caption)}</caption>`),e+=`</table>`,n.includeStyleTag?ji(r)+e:e}let s=Oi(e.merges),c=[];n.includeStyleTag&&c.push(ji(r)),c.push(`<table${a}>`),n.caption&&c.push(`<caption>${Ci(n.caption)}</caption>`);let l=n.headerRow?1:0;if(n.headerRow&&o.length>0){c.push(`<thead>`),c.push(`<tr>`);let t=o[0];for(let r=0;r<t.length;r++){let i=s.get(`0,${r}`);if(i?.hidden)continue;let a=t[r],o=Ai(a,0,r,e,n,i);c.push(`<th scope="col"${o}>${Ei(a)}</th>`)}c.push(`</tr>`),c.push(`</thead>`)}c.push(`<tbody>`);for(let t=l;t<o.length;t++){c.push(`<tr>`);let r=o[t];for(let i=0;i<r.length;i++){let a=s.get(`${t},${i}`);if(a?.hidden)continue;let o=r[i],l=Ai(o,t,i,e,n,a);c.push(`<td${l}>${Ei(o)}</td>`)}c.push(`</tr>`)}return c.push(`</tbody>`),c.push(`</table>`),c.join(``)}function Ai(e,t,n,r,i,a){let o=[];if(i.classes){let t=Di(e,i.classPrefix);t&&o.push(`class="${t}"`)}if(i.styles){let e=r.cells?.get(`${t},${n}`);if(e?.style){let t=Ti(e.style);t&&o.push(`style="${t}"`)}}return a&&(a.colspan&&o.push(`colspan="${a.colspan}"`),a.rowspan&&o.push(`rowspan="${a.rowspan}"`)),o.length>0?` `+o.join(` `):``}function ji(e){return[`<style>`,`.${e}-table{border-collapse:collapse;width:100%;font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#1a1a1a;background:#fff}`,`.${e}-table th,.${e}-table td{border:1px solid #e0e0e0;padding:6px 10px;text-align:left}`,`.${e}-table th{background:#f5f5f5;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.03em}`,`.${e}-table tr:hover td{background:#f8f8f8}`,`.${e}-num{text-align:right;font-variant-numeric:tabular-nums}`,`.${e}-bool{text-align:center}`,`.${e}-null{color:#999;font-style:italic}`,`@media(prefers-color-scheme:dark){`,`.${e}-table{color:#e0e0e0;background:#1a1a1a}`,`.${e}-table th,.${e}-table td{border-color:#333}`,`.${e}-table th{background:#252525}`,`.${e}-table tr:hover td{background:#222}`,`.${e}-null{color:#666}`,`}`,`</style>`].join(``)}function Mi(e){return e.replace(/\|/g,`\\|`)}function Ni(e){return e==null?``:e instanceof Date?e.toISOString().slice(0,10):typeof e==`boolean`||typeof e==`number`?String(e):Mi(String(e))}function Pi(e,t){return e.length<=t?e:t<=3?e.slice(0,t):e.slice(0,t-3)+`...`}function Fi(e,t,n){for(let r=n;r<e.length;r++){let n=e[r]?.[t];if(n!=null)return typeof n==`number`?`right`:`left`}return`left`}function Ii(e,t){return`|`+e.map((e,n)=>{let r=Math.max(t[n],3);return e===`right`?` `+`-`.repeat(r)+`:`:e===`center`?`:`+`-`.repeat(r)+`:`:` `+`-`.repeat(r)+` `}).join(`|`)+`|`}function Li(e,t,n){if(n===`right`)return` `+e.padStart(t)+` `;if(n===`center`){let n=t-e.length,r=Math.floor(n/2),i=n-r;return` `+` `.repeat(r)+e+` `.repeat(i)+` `}return` `+e.padEnd(t)+` `}function Ri(e,t){let n={headerRow:t?.headerRow??!0,alignment:t?.alignment??[],maxWidth:t?.maxWidth??50},r=e.rows;if(!r||r.length===0)return``;let i=0;for(let e of r)e.length>i&&(i=e.length);if(i===0)return``;let a=r.map(e=>{let t=[];for(let r=0;r<i;r++){let i=Ni(e[r]);t.push(Pi(i,n.maxWidth))}return t}),o=n.headerRow?1:0,s=[];for(let e=0;e<i;e++)n.alignment&&n.alignment[e]?s.push(n.alignment[e]):s.push(Fi(r,e,o));let c=[];for(let e=0;e<i;e++){let t=3;for(let n of a)n[e]&&n[e].length>t&&(t=n[e].length);c.push(t)}let l=[];if(n.headerRow){let e=a[0].map((e,t)=>Li(e,c[t],s[t]));l.push(`|`+e.join(`|`)+`|`),l.push(Ii(s,c));for(let e=1;e<a.length;e++){let t=a[e].map((e,t)=>Li(e,c[t],s[t]));l.push(`|`+t.join(`|`)+`|`)}}else{let e=[];for(let t=0;t<i;t++)e.push(Li(String(t+1),c[t],s[t]));l.push(`|`+e.join(`|`)+`|`),l.push(Ii(s,c));for(let e of a){let t=e.map((e,t)=>Li(e,c[t],s[t]));l.push(`|`+t.join(`|`)+`|`)}}return l.join(`
`)}function zi(e,t){return t instanceof Date?t.toISOString():t}function Bi(e,t){let n=t?.headerRow??0,r=t?.format??`objects`,i=t?.pretty??!1?2:void 0,a=e.rows;if(a.length===0)return JSON.stringify(r===`arrays`?{headers:[],data:[]}:r===`columns`?{}:[],zi,i);let o=a[n];if(!o)return JSON.stringify(r===`arrays`?{headers:[],data:[]}:r===`columns`?{}:[],zi,i);let s=o.map(e=>e==null?``:String(e).trim()),c=a.slice(n+1);if(r===`arrays`){let e=c.map(e=>{let t=[];for(let n=0;n<s.length;n++)t.push(n<e.length?e[n]??null:null);return t});return JSON.stringify({headers:s,data:e},zi,i)}if(r===`columns`){let e={};for(let t of s)e[t]=[];for(let t of c)for(let n=0;n<s.length;n++)e[s[n]].push(n<t.length?t[n]??null:null);return JSON.stringify(e,zi,i)}let l=[];for(let e of c){let t={};for(let n=0;n<s.length;n++)t[s[n]]=n<e.length?e[n]??null:null;l.push(t)}return JSON.stringify(l,zi,i)}function Vi(e,t){return k(e,{...t,delimiter:`	`})}var Hi={class:`demo-section__head`},Ui={class:`demo-field-stack`},Wi={class:`demo-field-row`},Gi={class:`demo-field-controls`},Ki={class:`demo-log`},qi={class:`demo-field-stack`},Ji={class:`demo-field-row`},Yi={class:`demo-field-controls`},Xi={class:`demo-field-row`},Zi={class:`demo-field-controls`},Qi={class:`demo-field-row`},$i={class:`demo-field-controls`},ea={key:0,class:`demo-field-row`},ta={class:`demo-field-controls`},na={key:1,class:`demo-field-row demo-field-row--block`},ra={class:`demo-field-controls demo-field-controls--column`},ia={class:`demo-import-native`},aa=[`title`],oa={class:`demo-field-stack`},sa={class:`demo-field-row`},ca={class:`demo-field-controls`},la=[`innerHTML`],ua={key:1,class:`code-block demo-preview-body`},da={class:`demo-util-row`},fa={class:`demo-util-result`},pa={class:`demo-util-row`},ma={class:`demo-util-result`},ha={class:`demo-util-row`},ga={class:`demo-util-result`},_a={class:`demo-util-row`},va={class:`demo-util-result`},ya={class:`demo-util-row`},ba={class:`demo-util-result`},xa={class:`demo-util-row`},Sa={class:`demo-util-result`},Ca={class:`demo-util-row`},wa={class:`demo-util-result`},Ta={class:`demo-template-fields`},Ea={class:`demo-util-label`},Da={class:`demo-field-stack demo-field-stack--follow`},Oa={class:`demo-field-row`},ka={class:`demo-field-controls`},Aa={key:0,class:`code-block`,style:{"margin-top":`12px`}},ja={class:`demo-field-stack demo-field-stack--follow`},Ma={class:`demo-field-row`},Na={class:`demo-field-controls`},Pa={key:0,class:`code-block`,style:{"margin-top":`12px`}},Fa={class:`demo-field-stack demo-field-stack--follow`},Ia={class:`demo-field-row`},La={class:`demo-field-controls`},Ra={key:0,class:`code-block`,style:{"margin-top":`12px`}},za=p(g({__name:`playground`,setup(e){let p=d([...[{name:`Widget Pro`,category:`配件`,price:29.99,stock:142,active:!0,date:`2026-01-15`},{name:`Gadget X`,category:`电子`,price:89.5,stock:67,active:!0,date:`2026-02-20`},{name:`Bolt Set`,category:`硬件`,price:5.25,stock:530,active:!1,date:`2026-01-05`},{name:`Cable Pack`,category:`配件`,price:12,stock:0,active:!1,date:`2025-12-01`},{name:`Sensor V2`,category:`电子`,price:45,stock:213,active:!0,date:`2026-03-10`},{name:`Frame Kit`,category:`硬件`,price:78,stock:34,active:!0,date:`2026-04-01`}]]),h=d(`xlsx`),g=d(`file`),b=d(`Name,Price,Stock
Widget,9.99,142
Gadget,24.50,87`),x=d(`—`),C=d(null),w=c([]),T=d([]),E=d(`auto`),D=d(1),ee=d(0),te=d([]),O=c(null);function ne(){C.value?.click()}function A(e,t){let n=Math.max(...e.map(e=>e.length)),r=e=>e==null||e===``,i=e=>e.filter(e=>!r(e)).length,a=new Set;if(t){for(let e of t)if(e.startCol===0&&e.endCol>=n-1)for(let t=e.startRow;t<=e.endRow;t++)a.add(t)}let o=-1;for(let t=0;t<e.length;t++){if(a.has(t))continue;let r=i(e[t]);if(r>=2&&(r>=3||r/(n||1)>=.15)){o=t;break}}if(o===-1)return{headers:[],dataStart:0};let s=o,c=e[o+1];if(c){let t=0,i=0;for(let a=0;a<n;a++)r(e[o][a])&&(t++,r(c[a])||i++);t>n*.3&&i>t*.4&&(s=o+1)}let l=e.slice(o,s+1).map(e=>[...e]);if(t)for(let n of t){if(n.startRow>s||n.endRow<o)continue;let t=e[n.startRow]?.[n.startCol];if(!r(t))for(let e=Math.max(n.startRow,o);e<=Math.min(n.endRow,s);e++)for(let r=n.startCol;r<=n.endCol;r++)l[e-o][r]=t}let u=[];for(let e=0;e<n;e++){let t=null,n=null;for(let i=l.length-1;i>=0;i--){let a=l[i][e];if(!r(a)){if(!t)t=a;else if(String(a)!==String(t)){n=a;break}}}t?u.push(n?`${n}-${t}`:String(t)):u.push(`列${e+1}`)}let d=new Map;return{headers:u.map(e=>{let t=d.get(e)??0;return d.set(e,t+1),t>0?`${e}_${t}`:e}),dataStart:s+1}}function re(e){return e==null?`null`:e instanceof Date?e.toISOString().slice(0,10):String(e)}function j(e){let t=e.rows;if(!t?.length){T.value=[],w.value=[],y.warning(`未读取到数据`);return}let n,r;if(E.value===`none`){let e=Math.max(...t.map(e=>e.length));n=Array.from({length:e},(e,t)=>`列 ${t+1}`),r=0}else if(E.value===`manual`){let e=D.value-1;if(e<0||e>=t.length){y.warning(`表头行号超出范围`);return}let i=Math.max(...t.map(e=>e.length));for(n=(t[e]??[]).map((e,t)=>e!=null&&e!==``?String(e):`列 ${t+1}`);n.length<i;)n.push(`列 ${n.length+1}`);r=e+1}else{let i=A(t,e.merges);n=i.headers,r=i.dataStart}if(!n.length){y.warning(`未识别到表头`);return}let i=t.slice(r).filter(e=>e.some(e=>e!=null&&e!==``)).map(e=>{let t={};return n.forEach((n,r)=>{t[n]=e[r]??null}),t});T.value=n,w.value=i,y.success(`已导入 ${i.length} 行 × ${n.length} 列`)}async function ie(e){let t=e.target.files?.[0];if(t)try{let e=await t.arrayBuffer(),n=await $t(new Uint8Array(e));O.value=n,te.value=n.sheets.map(e=>e.name),ee.value=0,j(n.sheets[0])}catch(e){y.error(`导入失败：${e.message}`)}}function ae(e){let t=O.value;!t||!t.sheets[e]||j(t.sheets[e])}function M(){let e=O.value;e&&j(e.sheets[ee.value])}async function oe(){try{let e=S(b.value,{typeInference:!0});if(!e.length){y.warning(`CSV 为空`);return}let t=(e[0]??[]).map(String),n=e.slice(1).map(e=>{let n={};return t.forEach((t,r)=>{n[t]=e[r]}),n});T.value=t,w.value=n,y.success(`已解析 ${n.length} 行`)}catch(e){y.error(`解析失败：${e.message}`)}}async function N(){try{if(h.value===`xlsx`){let e=await Er({sheets:[{name:`产品列表`,columns:[{header:`名称`,key:`name`,width:20},{header:`分类`,key:`category`,width:12},{header:`价格`,key:`price`,width:12,numFmt:`¥#,##0.00`},{header:`库存`,key:`stock`,width:10},{header:`状态`,key:`active`,width:10},{header:`日期`,key:`date`,width:15}],data:p.value,freezePane:{rows:1},autoFilter:{range:`A1:F${p.value.length+1}`}}],defaultFont:{name:`Microsoft YaHei`,size:11}});P(e,`hucre-demo.xlsx`,`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`),x.value=`导出 XLSX：${p.value.length} 行，${(e.length/1024).toFixed(1)} KB`}else{let e=[[`名称`,`分类`,`价格`,`库存`,`状态`,`日期`],...p.value.map(e=>[e.name,e.category,e.price,e.stock,e.active,e.date])];if(h.value===`tsv`){let t=Vi(e,{bom:!0});P(new TextEncoder().encode(t),`hucre-demo.tsv`,`text/tab-separated-values;charset=utf-8`),x.value=`导出 TSV：${p.value.length} 行`}else{let t=k(e,{bom:!0});P(new TextEncoder().encode(t),`hucre-demo.csv`,`text/csv;charset=utf-8`),x.value=`导出 CSV：${p.value.length} 行`}}y.success(`导出成功`)}catch(e){y.error(`导出失败：${e.message}`)}}async function se(){try{let e=await mi.create().properties({creator:`hucre demo`,title:`产品报表`}).defaultFont({name:`Microsoft YaHei`,size:11}).addSheet(`产品`).columns([{header:`名称`,width:20},{header:`分类`,width:12},{header:`价格`,width:12},{header:`库存`,width:10}]).rows(p.value.map(e=>[e.name,e.category,e.price,e.stock])).freeze(1).done().build();P(e,`hucre-builder.xlsx`,`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`),x.value=`Builder API 导出：${(e.length/1024).toFixed(1)} KB`,y.success(`Builder 导出成功`)}catch(e){y.error(`导出失败：${e.message}`)}}function P(e,t,n){let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,a.click(),URL.revokeObjectURL(i)}let F=d(`html`),ce=m(()=>{let e={name:`Preview`,rows:[[`名称`,`分类`,`价格`,`库存`],...p.value.slice(0,5).map(e=>[e.name,e.category,e.price,e.stock])]};switch(F.value){case`html`:return ki(e,{headerRow:!0,styles:!0});case`markdown`:return Ri(e);case`json`:return JSON.stringify(Bi(e,{format:`objects`}),null,2);default:return``}}),I=d(1234567.89),le=d(`#,##0.00`),L=m(()=>{try{return Hr(I.value,le.value)}catch{return`格式错误`}}),ue=d(`C15`),de=m(()=>{try{let e=X(ue.value);return`row: ${e.row}, col: ${e.col}  →  colToLetter: ${Hn(e.col)}  →  letterToCol("${Hn(e.col)}"): ${vi(Hn(e.col))}  →  cellRef: ${Un(e.row,e.col)}`}catch{return`无效引用`}}),R=m(()=>Wn(0,0,9,3)),fe=d(`B2:E10`),pe=m(()=>{try{let e=yi(fe.value),t={row:e.startRow,col:e.startCol},n=bi(t.row,t.col,e),r=bi(e.endRow+1,e.endCol+1,e);return`startRow: ${e.startRow}, startCol: ${e.startCol}, endRow: ${e.endRow}, endCol: ${e.endCol}  |  isInRange(${t.row},${t.col}): ${n}  |  isInRange(${e.endRow+1},${e.endCol+1}): ${r}`}catch{return`无效范围`}}),z=d(45307),me=m(()=>{try{let e=Ye(z.value);return`${e.toISOString().slice(0,10)}  (dateToSerial → ${Xe(e)})`}catch{return`无效序列号`}}),B=d(.75),he=m(()=>{try{let e=at(B.value);return`${String(e.hours).padStart(2,`0`)}:${String(e.minutes).padStart(2,`0`)}:${String(e.seconds).padStart(2,`0`)}  (timeToSerial → ${ot(e.hours,e.minutes,e.seconds)})`}catch{return`无效时间序列`}}),ge=d(`2026-04-12`),_e=m(()=>{try{let e=it(ge.value);return e?`${e.toISOString().slice(0,10)}  (dateToSerial → ${Xe(e)})`:`无法解析`}catch{return`解析失败`}}),ve=d({company:`Acme 科技`,date:`2026-04-12`,total:12500}),ye=d(``);async function be(){try{ye.value=_i(await kr(await mi.create().addSheet(`Report`).columns([{header:`项目`,width:20},{header:`值`,width:20}]).rows([[`公司`,`{{company}}`],[`日期`,`{{date}}`],[`总额`,`{{total}}`]]).done().build()),ve.value).sheets[0].rows.map(e=>e.map(e=>e??``).join(` → `)).join(`
`),y.success(`模板填充完成`)}catch(e){ye.value=`模板错误：${e.message}`}}let V=d(``);function xe(){let e={name:`Demo`,rows:[[`名称`,`分类`,`价格`,`库存`],[`Widget Pro`,`配件`,29.99,142],[`Gadget X`,`电子`,89.5,67],[`Bolt Set`,`硬件`,5.25,530]]},t=xi(e),n=Si(e);V.value=[`sheetToObjects →`,JSON.stringify(t,null,2),``,`sheetToArrays →`,`headers: ${JSON.stringify(n.headers)}`,`data: ${JSON.stringify(n.data)}`].join(`
`)}let Se=d(`Name,Price,Stock,Status
Widget,9.99,142,active
Gadget,abc,87,active
,24.50,,unknown`),Ce=d(``);function we(){try{let e=Ar(S(Se.value,{typeInference:!1}),{Name:{type:`string`,required:!0},Price:{type:`number`,required:!0,min:0},Stock:{type:`integer`,min:0,default:0},Status:{type:`string`,enum:[`active`,`inactive`,`draft`]}},{headerRow:1}),t=[`有效数据：${e.data.length} 行`];e.errors.length?(t.push(`错误：${e.errors.length} 个`),e.errors.forEach(e=>{t.push(`  行 ${e.row}: [${e.field}] ${e.message} (值="${e.value}")`)})):t.push(`无校验错误`),Ce.value=t.join(`
`)}catch(e){Ce.value=`校验异常：${e.message}`}}return(e,c)=>{let d=t(`el-tag`),m=t(`el-table-column`),y=t(`el-table`),S=t(`el-card`),O=t(`el-radio-button`),k=t(`el-radio-group`),A=t(`el-button`),j=t(`el-divider`),P=t(`el-input-number`),H=t(`el-input`);return v(),l(`div`,null,[a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[o(`div`,Hi,[c[15]||=o(`span`,{class:`demo-section__title`},`示例数据`,-1),a(d,{size:`small`,type:`info`,effect:`plain`,"disable-transitions":!0},{default:f(()=>[_(r(p.value.length)+` 条 `,1)]),_:1})])]),default:f(()=>[a(y,{data:p.value,border:``,stripe:``,size:`small`,class:`demo-table`},{default:f(()=>[a(m,{prop:`name`,label:`名称`,"min-width":`130`}),a(m,{prop:`category`,label:`分类`,width:`100`}),a(m,{prop:`price`,label:`价格`,width:`100`,align:`right`},{default:f(({row:e})=>[_(`¥ `+r(e.price.toFixed(2)),1)]),_:1}),a(m,{prop:`stock`,label:`库存`,width:`80`,align:`right`}),a(m,{prop:`active`,label:`状态`,width:`80`,align:`center`},{default:f(({row:e})=>[a(d,{type:e.active?`success`:`info`,size:`small`,"disable-transitions":!0},{default:f(()=>[_(r(e.active?`启用`:`停用`),1)]),_:2},1032,[`type`])]),_:1}),a(m,{prop:`date`,label:`日期`,width:`120`})]),_:1},8,[`data`])]),_:1}),a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[...c[16]||=[o(`span`,{class:`demo-section__title`},`导出 (writeXlsx / writeCsv / writeTsv)`,-1)]]),default:f(()=>[o(`div`,Ui,[o(`div`,Wi,[c[22]||=o(`span`,{class:`demo-field-label`},`格式`,-1),o(`div`,Gi,[a(k,{modelValue:h.value,"onUpdate:modelValue":c[0]||=e=>h.value=e,size:`small`},{default:f(()=>[a(O,{value:`xlsx`},{default:f(()=>[...c[17]||=[_(`XLSX`,-1)]]),_:1}),a(O,{value:`csv`},{default:f(()=>[...c[18]||=[_(`CSV`,-1)]]),_:1}),a(O,{value:`tsv`},{default:f(()=>[...c[19]||=[_(`TSV`,-1)]]),_:1})]),_:1},8,[`modelValue`]),a(A,{size:`small`,type:`primary`,onClick:N},{default:f(()=>[...c[20]||=[_(`导出文件`,-1)]]),_:1}),a(j,{direction:`vertical`,class:`demo-field-divider`}),a(A,{size:`small`,onClick:se},{default:f(()=>[...c[21]||=[_(`Builder API 导出`,-1)]]),_:1}),a(j,{direction:`vertical`,class:`demo-field-divider`}),o(`span`,Ki,r(x.value),1)])])])]),_:1}),a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[...c[23]||=[o(`span`,{class:`demo-section__title`},`导入 (readXlsx / parseCsv)`,-1)]]),default:f(()=>[o(`div`,qi,[o(`div`,Ji,[c[26]||=o(`span`,{class:`demo-field-label`},`方式`,-1),o(`div`,Yi,[a(k,{modelValue:g.value,"onUpdate:modelValue":c[1]||=e=>g.value=e,size:`small`},{default:f(()=>[a(O,{value:`file`},{default:f(()=>[...c[24]||=[_(`XLSX 文件`,-1)]]),_:1}),a(O,{value:`csv-text`},{default:f(()=>[...c[25]||=[_(`CSV 文本`,-1)]]),_:1})]),_:1},8,[`modelValue`])])]),g.value===`file`?(v(),l(i,{key:0},[o(`input`,{ref_key:`fileInputRef`,ref:C,type:`file`,accept:`.xlsx,.xls`,hidden:``,onChange:ie},null,544),o(`div`,Xi,[c[28]||=o(`span`,{class:`demo-field-label`},`文件`,-1),o(`div`,Zi,[a(A,{size:`small`,type:`primary`,onClick:ne},{default:f(()=>[...c[27]||=[_(`选择 XLSX 文件`,-1)]]),_:1})])]),o(`div`,Qi,[c[32]||=o(`span`,{class:`demo-field-label`},`表头`,-1),o(`div`,$i,[a(k,{modelValue:E.value,"onUpdate:modelValue":c[2]||=e=>E.value=e,size:`small`,onChange:M},{default:f(()=>[a(O,{value:`auto`},{default:f(()=>[...c[29]||=[_(`自动识别`,-1)]]),_:1}),a(O,{value:`manual`},{default:f(()=>[...c[30]||=[_(`指定行`,-1)]]),_:1}),a(O,{value:`none`},{default:f(()=>[...c[31]||=[_(`无表头`,-1)]]),_:1})]),_:1},8,[`modelValue`]),E.value===`manual`?(v(),s(P,{key:0,modelValue:D.value,"onUpdate:modelValue":c[3]||=e=>D.value=e,size:`small`,class:`demo-input-number-fixed`,min:1,max:999,step:1,controls:!0,onChange:M},null,8,[`modelValue`])):u(``,!0)])]),te.value.length>1?(v(),l(`div`,ea,[c[33]||=o(`span`,{class:`demo-field-label`},`工作表`,-1),o(`div`,ta,[a(k,{modelValue:ee.value,"onUpdate:modelValue":c[4]||=e=>ee.value=e,size:`small`,onChange:ae},{default:f(()=>[(v(!0),l(i,null,n(te.value,(e,t)=>(v(),s(O,{key:t,value:t},{default:f(()=>[_(r(e),1)]),_:2},1032,[`value`]))),128))]),_:1},8,[`modelValue`])])])):u(``,!0)],64)):(v(),l(`div`,na,[c[35]||=o(`span`,{class:`demo-field-label`},`文本`,-1),o(`div`,ra,[a(H,{modelValue:b.value,"onUpdate:modelValue":c[5]||=e=>b.value=e,type:`textarea`,autosize:{minRows:3,maxRows:8},placeholder:`输入 CSV 文本…`},null,8,[`modelValue`]),a(A,{size:`small`,type:`primary`,class:`demo-field-row__action`,onClick:oe},{default:f(()=>[...c[34]||=[_(` 解析 `,-1)]]),_:1})])]))]),w.value.length?(v(),l(i,{key:0},[a(j),o(`div`,ia,[o(`table`,null,[o(`thead`,null,[o(`tr`,null,[(v(!0),l(i,null,n(T.value,e=>(v(),l(`th`,{key:e},r(e),1))),128))])]),o(`tbody`,null,[(v(!0),l(i,null,n(w.value,(e,t)=>(v(),l(`tr`,{key:t},[(v(!0),l(i,null,n(T.value,n=>(v(),l(`td`,{key:`${t}-${n}`,title:re(e[n])},r(re(e[n])),9,aa))),128))]))),128))])])])],64)):u(``,!0)]),_:1}),a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[...c[36]||=[o(`span`,{class:`demo-section__title`},`导出预览 (toHtml / toMarkdown / toJson)`,-1)]]),default:f(()=>[o(`div`,oa,[o(`div`,sa,[c[40]||=o(`span`,{class:`demo-field-label`},`视图`,-1),o(`div`,ca,[a(k,{modelValue:F.value,"onUpdate:modelValue":c[6]||=e=>F.value=e,size:`small`},{default:f(()=>[a(O,{value:`html`},{default:f(()=>[...c[37]||=[_(`HTML`,-1)]]),_:1}),a(O,{value:`markdown`},{default:f(()=>[...c[38]||=[_(`Markdown`,-1)]]),_:1}),a(O,{value:`json`},{default:f(()=>[...c[39]||=[_(`JSON`,-1)]]),_:1})]),_:1},8,[`modelValue`])])])]),F.value===`html`?(v(),l(`div`,{key:0,class:`demo-preview-html demo-preview-body`,innerHTML:ce.value},null,8,la)):(v(),l(`pre`,ua,[o(`code`,null,r(ce.value),1)]))]),_:1}),a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[...c[41]||=[o(`span`,{class:`demo-section__title`},`工具函数`,-1)]]),default:f(()=>[o(`div`,da,[c[42]||=o(`span`,{class:`demo-util-label`},`formatValue`,-1),a(P,{modelValue:I.value,"onUpdate:modelValue":c[7]||=e=>I.value=e,size:`small`,controls:!1,class:`demo-util-input`},null,8,[`modelValue`]),a(H,{modelValue:le.value,"onUpdate:modelValue":c[8]||=e=>le.value=e,size:`small`,placeholder:`格式`,class:`demo-util-input`,style:{width:`140px`}},null,8,[`modelValue`]),o(`span`,fa,`→ `+r(L.value),1)]),a(j),o(`div`,pa,[c[43]||=o(`span`,{class:`demo-util-label`},`parseCellRef`,-1),a(H,{modelValue:ue.value,"onUpdate:modelValue":c[9]||=e=>ue.value=e,size:`small`,placeholder:`如 C15`,class:`demo-util-input`,style:{width:`100px`}},null,8,[`modelValue`]),o(`span`,ma,`→ `+r(de.value),1)]),o(`div`,ha,[c[44]||=o(`span`,{class:`demo-util-label`},`rangeRef(0,0,9,3)`,-1),o(`span`,ga,`→ `+r(R.value),1)]),o(`div`,_a,[c[45]||=o(`span`,{class:`demo-util-label`},`parseRange`,-1),a(H,{modelValue:fe.value,"onUpdate:modelValue":c[10]||=e=>fe.value=e,size:`small`,placeholder:`如 B2:E10`,class:`demo-util-input`,style:{width:`120px`}},null,8,[`modelValue`]),o(`span`,va,`→ `+r(pe.value),1)]),a(j),o(`div`,ya,[c[46]||=o(`span`,{class:`demo-util-label`},`serialToDate`,-1),a(P,{modelValue:z.value,"onUpdate:modelValue":c[11]||=e=>z.value=e,size:`small`,controls:!1,class:`demo-util-input`},null,8,[`modelValue`]),o(`span`,ba,`→ `+r(me.value),1)]),o(`div`,xa,[c[47]||=o(`span`,{class:`demo-util-label`},`serialToTime`,-1),a(P,{modelValue:B.value,"onUpdate:modelValue":c[12]||=e=>B.value=e,size:`small`,controls:!1,step:.01,class:`demo-util-input`},null,8,[`modelValue`]),o(`span`,Sa,`→ `+r(he.value),1)]),o(`div`,Ca,[c[48]||=o(`span`,{class:`demo-util-label`},`parseDate`,-1),a(H,{modelValue:ge.value,"onUpdate:modelValue":c[13]||=e=>ge.value=e,size:`small`,placeholder:`日期字符串`,class:`demo-util-input`,style:{width:`160px`}},null,8,[`modelValue`]),o(`span`,wa,`→ `+r(_e.value),1)])]),_:1}),a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[...c[49]||=[o(`span`,{class:`demo-section__title`},`模板引擎 (fillTemplate)`,-1)]]),default:f(()=>[c[52]||=o(`p`,{class:`demo-hint`},[_(`在 XLSX 单元格中使用 `),o(`code`,null,`{{key}}`),_(` 占位符，用数据填充后导出：`)],-1),o(`div`,Ta,[(v(!0),l(i,null,n(ve.value,(e,t)=>(v(),l(`div`,{key:t,class:`demo-util-row`},[o(`span`,Ea,r(t),1),a(H,{modelValue:ve.value[t],"onUpdate:modelValue":e=>ve.value[t]=e,size:`small`,class:`demo-util-input`},null,8,[`modelValue`,`onUpdate:modelValue`])]))),128))]),o(`div`,Da,[o(`div`,Oa,[c[51]||=o(`span`,{class:`demo-field-label`},`操作`,-1),o(`div`,ka,[a(A,{size:`small`,type:`primary`,onClick:be},{default:f(()=>[...c[50]||=[_(`运行模板填充`,-1)]]),_:1})])])]),ye.value?(v(),l(`pre`,Aa,[o(`code`,null,r(ye.value),1)])):u(``,!0)]),_:1}),a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[...c[53]||=[o(`span`,{class:`demo-section__title`},`Sheet 工具 (sheetToObjects / sheetToArrays)`,-1)]]),default:f(()=>[c[56]||=o(`p`,{class:`demo-hint`},`将 Sheet 数据转换为对象数组或带表头的二维数组：`,-1),o(`div`,ja,[o(`div`,Ma,[c[55]||=o(`span`,{class:`demo-field-label`},`操作`,-1),o(`div`,Na,[a(A,{size:`small`,type:`primary`,onClick:xe},{default:f(()=>[...c[54]||=[_(`运行转换`,-1)]]),_:1})])])]),V.value?(v(),l(`pre`,Pa,[o(`code`,null,r(V.value),1)])):u(``,!0)]),_:1}),a(S,{class:`demo-section`,shadow:`never`},{header:f(()=>[...c[57]||=[o(`span`,{class:`demo-section__title`},`Schema 校验 (validateWithSchema)`,-1)]]),default:f(()=>[a(H,{modelValue:Se.value,"onUpdate:modelValue":c[14]||=e=>Se.value=e,type:`textarea`,autosize:{minRows:3,maxRows:8},placeholder:`输入含表头的 CSV`},null,8,[`modelValue`]),o(`div`,Fa,[o(`div`,Ia,[c[59]||=o(`span`,{class:`demo-field-label`},`操作`,-1),o(`div`,La,[a(A,{size:`small`,type:`primary`,onClick:we},{default:f(()=>[...c[58]||=[_(`运行校验`,-1)]]),_:1})])])]),Ce.value?(v(),l(`pre`,Ra,[o(`code`,null,r(Ce.value),1)])):u(``,!0)]),_:1})])}}}),[[`__scopeId`,`data-v-8129d2ba`]]),Ba=`<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import { parseCsv, writeCsv } from 'hucre/csv';
import {
  cellRef,
  colToLetter,
  openXlsx,
  parseCellRef,
  rangeRef,
  readXlsx,
  writeXlsx,
} from 'hucre/xlsx';
import {
  WorkbookBuilder,
  dateToSerial,
  fillTemplate,
  formatValue,
  isInRange,
  letterToCol,
  parseDate,
  parseRange,
  serialToDate,
  serialToTime,
  sheetToArrays,
  sheetToObjects,
  timeToSerial,
  toHtml,
  toJson,
  toMarkdown,
  validateWithSchema,
  writeTsv,
} from 'hucre';

interface Product {
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  date: string;
}

const sampleProducts: Product[] = [
  { name: 'Widget Pro', category: '配件', price: 29.99, stock: 142, active: true, date: '2026-01-15' },
  { name: 'Gadget X', category: '电子', price: 89.5, stock: 67, active: true, date: '2026-02-20' },
  { name: 'Bolt Set', category: '硬件', price: 5.25, stock: 530, active: false, date: '2026-01-05' },
  { name: 'Cable Pack', category: '配件', price: 12.0, stock: 0, active: false, date: '2025-12-01' },
  { name: 'Sensor V2', category: '电子', price: 45.0, stock: 213, active: true, date: '2026-03-10' },
  { name: 'Frame Kit', category: '硬件', price: 78.0, stock: 34, active: true, date: '2026-04-01' },
];

const tableData = ref<Product[]>([...sampleProducts]);
const exportFormat = ref<'xlsx' | 'csv' | 'tsv'>('xlsx');
const importMode = ref<'file' | 'csv-text'>('file');
const csvInput = ref(\`Name,Price,Stock\\nWidget,9.99,142\\nGadget,24.50,87\`);
const exportLog = ref('—');

// ── Read / Import ──

const fileInputRef = ref<HTMLInputElement | null>(null);
const importedData = shallowRef<Record<string, unknown>[]>([]);
const importedHeaders = ref<string[]>([]);
const headerRowMode = ref<'auto' | 'manual' | 'none'>('auto');
const manualHeaderRow = ref(1);
const importSheetIndex = ref(0);
const importSheetNames = ref<string[]>([]);
const lastWorkbook = shallowRef<{ sheets: { name: string; rows: unknown[][]; merges?: MergeRange[] }[] } | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

interface MergeRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

function resolveSheetHeaders(
  rows: unknown[][],
  merges?: MergeRange[],
) {
  const colCount = Math.max(...rows.map((r) => r.length));
  const isEmpty = (v: unknown) => v == null || v === '';
  const nonNullCount = (row: unknown[]) => row.filter((v) => !isEmpty(v)).length;

  const fullWidthRows = new Set<number>();
  if (merges) {
    for (const m of merges) {
      if (m.startCol === 0 && m.endCol >= colCount - 1)
        for (let r = m.startRow; r <= m.endRow; r++) fullWidthRows.add(r);
    }
  }

  let headerStart = -1;
  for (let i = 0; i < rows.length; i++) {
    if (fullWidthRows.has(i)) continue;
    const nnc = nonNullCount(rows[i]);
    if (nnc >= 2 && (nnc >= 3 || nnc / (colCount || 1) >= 0.15)) {
      headerStart = i;
      break;
    }
  }
  if (headerStart === -1) return { headers: [] as string[], dataStart: 0 };

  let headerEnd = headerStart;
  const next = rows[headerStart + 1];
  if (next) {
    let curEmpty = 0;
    let filledByNext = 0;
    for (let c = 0; c < colCount; c++) {
      if (isEmpty(rows[headerStart][c])) {
        curEmpty++;
        if (!isEmpty(next[c])) filledByNext++;
      }
    }
    if (curEmpty > colCount * 0.3 && filledByNext > curEmpty * 0.4)
      headerEnd = headerStart + 1;
  }

  const expanded = rows.slice(headerStart, headerEnd + 1).map((r) => [...r]);
  if (merges) {
    for (const m of merges) {
      if (m.startRow > headerEnd || m.endRow < headerStart) continue;
      const val = rows[m.startRow]?.[m.startCol];
      if (isEmpty(val)) continue;
      for (let r = Math.max(m.startRow, headerStart); r <= Math.min(m.endRow, headerEnd); r++) {
        for (let c = m.startCol; c <= m.endCol; c++) {
          expanded[r - headerStart][c] = val;
        }
      }
    }
  }

  const merged: string[] = [];
  for (let c = 0; c < colCount; c++) {
    let sub: unknown = null;
    let group: unknown = null;
    for (let r = expanded.length - 1; r >= 0; r--) {
      const cell = expanded[r][c];
      if (!isEmpty(cell)) {
        if (!sub) sub = cell;
        else if (String(cell) !== String(sub)) { group = cell; break; }
      }
    }
    if (sub) {
      merged.push(group ? \`\${group}-\${sub}\` : String(sub));
    } else {
      merged.push(\`列\${c + 1}\`);
    }
  }

  const seen = new Map<string, number>();
  const headers = merged.map((h) => {
    const count = seen.get(h) ?? 0;
    seen.set(h, count + 1);
    return count > 0 ? \`\${h}_\${count}\` : h;
  });

  return { headers, dataStart: headerEnd + 1 };
}

function displayImportCell(v: unknown): string {
  if (v == null) return 'null';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function buildImportTable(sheet: { rows: unknown[][]; merges?: MergeRange[] }) {
  const rows = sheet.rows;
  if (!rows?.length) {
    importedHeaders.value = [];
    importedData.value = [];
    ElMessage.warning('未读取到数据');
    return;
  }

  let headers: string[];
  let dataStart: number;

  if (headerRowMode.value === 'none') {
    const colCount = Math.max(...rows.map((r) => r.length));
    headers = Array.from({ length: colCount }, (_, i) => \`列 \${i + 1}\`);
    dataStart = 0;
  } else if (headerRowMode.value === 'manual') {
    const idx = manualHeaderRow.value - 1;
    if (idx < 0 || idx >= rows.length) {
      ElMessage.warning('表头行号超出范围');
      return;
    }
    const colCount = Math.max(...rows.map((r) => r.length));
    headers = (rows[idx] ?? []).map((v, i) =>
      v != null && v !== '' ? String(v) : \`列 \${i + 1}\`,
    );
    while (headers.length < colCount) headers.push(\`列 \${headers.length + 1}\`);
    dataStart = idx + 1;
  } else {
    const result = resolveSheetHeaders(rows, sheet.merges);
    headers = result.headers;
    dataStart = result.dataStart;
  }

  if (!headers.length) {
    ElMessage.warning('未识别到表头');
    return;
  }

  const data = rows.slice(dataStart)
    .filter((row) => row.some((v) => v != null && v !== ''))
    .map((row) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? null; });
      return obj;
    });

  importedHeaders.value = headers;
  importedData.value = data;
  ElMessage.success(\`已导入 \${data.length} 行 × \${headers.length} 列\`);
}

async function handleFileImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    const wb = await readXlsx(new Uint8Array(buffer));

    lastWorkbook.value = wb;
    importSheetNames.value = wb.sheets.map((s) => s.name);
    importSheetIndex.value = 0;

    buildImportTable(wb.sheets[0]);
  } catch (e) {
    ElMessage.error(\`导入失败：\${(e as Error).message}\`);
  }
}

function onSheetChange(idx: number) {
  const wb = lastWorkbook.value;
  if (!wb || !wb.sheets[idx]) return;
  buildImportTable(wb.sheets[idx]);
}

function onHeaderModeChange() {
  const wb = lastWorkbook.value;
  if (!wb) return;
  buildImportTable(wb.sheets[importSheetIndex.value]);
}

async function handleCsvParse() {
  try {
    const rows = parseCsv(csvInput.value, { typeInference: true });
    if (!rows.length) {
      ElMessage.warning('CSV 为空');
      return;
    }

    const headers = (rows[0] ?? []).map(String);
    const data = rows.slice(1).map((row) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    importedHeaders.value = headers;
    importedData.value = data;
    ElMessage.success(\`已解析 \${data.length} 行\`);
  } catch (e) {
    ElMessage.error(\`解析失败：\${(e as Error).message}\`);
  }
}

// ── Write / Export ──

async function handleExport() {
  try {
    if (exportFormat.value === 'xlsx') {
      const buffer = await writeXlsx({
        sheets: [{
          name: '产品列表',
          columns: [
            { header: '名称', key: 'name', width: 20 },
            { header: '分类', key: 'category', width: 12 },
            { header: '价格', key: 'price', width: 12, numFmt: '¥#,##0.00' },
            { header: '库存', key: 'stock', width: 10 },
            { header: '状态', key: 'active', width: 10 },
            { header: '日期', key: 'date', width: 15 },
          ],
          data: tableData.value,
          freezePane: { rows: 1 },
          autoFilter: { range: \`A1:F\${tableData.value.length + 1}\` },
        }],
        defaultFont: { name: 'Microsoft YaHei', size: 11 },
      });

      downloadBlob(buffer, 'hucre-demo.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      exportLog.value = \`导出 XLSX：\${tableData.value.length} 行，\${(buffer.length / 1024).toFixed(1)} KB\`;
    } else {
      const rows = [
        ['名称', '分类', '价格', '库存', '状态', '日期'],
        ...tableData.value.map((p) => [p.name, p.category, p.price, p.stock, p.active, p.date]),
      ];
      if (exportFormat.value === 'tsv') {
        const tsv = writeTsv(rows as (string | number | boolean)[][], { bom: true });
        downloadBlob(new TextEncoder().encode(tsv), 'hucre-demo.tsv', 'text/tab-separated-values;charset=utf-8');
        exportLog.value = \`导出 TSV：\${tableData.value.length} 行\`;
      } else {
        const csv = writeCsv(rows as (string | number | boolean)[][], { bom: true });
        downloadBlob(new TextEncoder().encode(csv), 'hucre-demo.csv', 'text/csv;charset=utf-8');
        exportLog.value = \`导出 CSV：\${tableData.value.length} 行\`;
      }
    }

    ElMessage.success('导出成功');
  } catch (e) {
    ElMessage.error(\`导出失败：\${(e as Error).message}\`);
  }
}

async function handleBuilderExport() {
  try {
    const buffer = await WorkbookBuilder.create()
      .properties({ creator: 'hucre demo', title: '产品报表' })
      .defaultFont({ name: 'Microsoft YaHei', size: 11 })
      .addSheet('产品')
        .columns([
          { header: '名称', width: 20 },
          { header: '分类', width: 12 },
          { header: '价格', width: 12 },
          { header: '库存', width: 10 },
        ])
        .rows(tableData.value.map((p) => [p.name, p.category, p.price, p.stock]))
        .freeze(1)
      .done()
      .build();

    downloadBlob(buffer, 'hucre-builder.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    exportLog.value = \`Builder API 导出：\${(buffer.length / 1024).toFixed(1)} KB\`;
    ElMessage.success('Builder 导出成功');
  } catch (e) {
    ElMessage.error(\`导出失败：\${(e as Error).message}\`);
  }
}

function downloadBlob(data: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export Preview (HTML / Markdown / JSON) ──

type PreviewMode = 'html' | 'markdown' | 'json';
const previewMode = ref<PreviewMode>('html');

const previewContent = computed(() => {
  const sheet = {
    name: 'Preview',
    rows: [
      ['名称', '分类', '价格', '库存'],
      ...tableData.value.slice(0, 5).map((p) => [p.name, p.category, p.price, p.stock]),
    ] as (string | number)[][],
  };

  switch (previewMode.value) {
    case 'html':
      return toHtml(sheet, { headerRow: true, styles: true });
    case 'markdown':
      return toMarkdown(sheet);
    case 'json':
      return JSON.stringify(toJson(sheet, { format: 'objects' }), null, 2);
    default:
      return '';
  }
});

// ── Utility Playground ──

const fmtValue = ref(1234567.89);
const fmtPattern = ref('#,##0.00');
const formattedResult = computed(() => {
  try {
    return formatValue(fmtValue.value, fmtPattern.value);
  } catch {
    return '格式错误';
  }
});

const cellRefInput = ref('C15');
const cellRefParsed = computed(() => {
  try {
    const r = parseCellRef(cellRefInput.value);
    return \`row: \${r.row}, col: \${r.col}  →  colToLetter: \${colToLetter(r.col)}  →  letterToCol("\${colToLetter(r.col)}"): \${letterToCol(colToLetter(r.col))}  →  cellRef: \${cellRef(r.row, r.col)}\`;
  } catch {
    return '无效引用';
  }
});

const rangeResult = computed(() => rangeRef(0, 0, 9, 3));

const rangeParseInput = ref('B2:E10');
const rangeParsed = computed(() => {
  try {
    const r = parseRange(rangeParseInput.value);
    const sample = { row: r.startRow, col: r.startCol };
    const inside = isInRange(sample.row, sample.col, r);
    const outside = isInRange(r.endRow + 1, r.endCol + 1, r);
    return \`startRow: \${r.startRow}, startCol: \${r.startCol}, endRow: \${r.endRow}, endCol: \${r.endCol}  |  isInRange(\${sample.row},\${sample.col}): \${inside}  |  isInRange(\${r.endRow + 1},\${r.endCol + 1}): \${outside}\`;
  } catch {
    return '无效范围';
  }
});

const serialInput = ref(45307);
const serialDateResult = computed(() => {
  try {
    const d = serialToDate(serialInput.value);
    return \`\${d.toISOString().slice(0, 10)}  (dateToSerial → \${dateToSerial(d)})\`;
  } catch {
    return '无效序列号';
  }
});

const timeSerialInput = ref(0.75);
const timeSerialResult = computed(() => {
  try {
    const t = serialToTime(timeSerialInput.value);
    return \`\${String(t.hours).padStart(2, '0')}:\${String(t.minutes).padStart(2, '0')}:\${String(t.seconds).padStart(2, '0')}  (timeToSerial → \${timeToSerial(t.hours, t.minutes, t.seconds)})\`;
  } catch {
    return '无效时间序列';
  }
});

const parseDateInput = ref('2026-04-12');
const parseDateResult = computed(() => {
  try {
    const d = parseDate(parseDateInput.value);
    return d ? \`\${d.toISOString().slice(0, 10)}  (dateToSerial → \${dateToSerial(d)})\` : '无法解析';
  } catch {
    return '解析失败';
  }
});

// ── Template Engine ──

const templateData = ref<Record<string, string | number>>({
  company: 'Acme 科技',
  date: '2026-04-12',
  total: 12500,
});

const templateResult = ref('');

async function runTemplateDemo() {
  try {
    const wb = await WorkbookBuilder.create()
      .addSheet('Report')
        .columns([
          { header: '项目', width: 20 },
          { header: '值', width: 20 },
        ])
        .rows([
          ['公司', '{{company}}'],
          ['日期', '{{date}}'],
          ['总额', '{{total}}'],
        ])
      .done()
      .build();

    const rtWb = await openXlsx(wb);
    const filled = fillTemplate(rtWb, templateData.value);

    const rows = filled.sheets[0].rows;
    const lines = rows.map((r) => r.map((c) => c ?? '').join(' → '));
    templateResult.value = lines.join('\\n');
    ElMessage.success('模板填充完成');
  } catch (e) {
    templateResult.value = \`模板错误：\${(e as Error).message}\`;
  }
}

// ── Sheet Utils ──

const sheetUtilResult = ref('');

function runSheetUtilsDemo() {
  const sheet = {
    name: 'Demo',
    rows: [
      ['名称', '分类', '价格', '库存'],
      ['Widget Pro', '配件', 29.99, 142],
      ['Gadget X', '电子', 89.5, 67],
      ['Bolt Set', '硬件', 5.25, 530],
    ] as (string | number)[][],
  };

  const objects = sheetToObjects<{ 名称: string; 分类: string; 价格: number }>(sheet);
  const arrays = sheetToArrays(sheet);

  const lines = [
    'sheetToObjects →',
    JSON.stringify(objects, null, 2),
    '',
    'sheetToArrays →',
    \`headers: \${JSON.stringify(arrays.headers)}\`,
    \`data: \${JSON.stringify(arrays.data)}\`,
  ];
  sheetUtilResult.value = lines.join('\\n');
}

// ── Schema Validation ──

const validationCsv = ref(\`Name,Price,Stock,Status\\nWidget,9.99,142,active\\nGadget,abc,87,active\\n,24.50,,unknown\`);
const validationResult = ref('');

function runValidation() {
  try {
    const rows = parseCsv(validationCsv.value, { typeInference: false });
    const result = validateWithSchema(rows, {
      Name: { type: 'string', required: true },
      Price: { type: 'number', required: true, min: 0 },
      Stock: { type: 'integer', min: 0, default: 0 },
      Status: { type: 'string', enum: ['active', 'inactive', 'draft'] },
    }, { headerRow: 1 });

    const lines = [\`有效数据：\${result.data.length} 行\`];
    if (result.errors.length) {
      lines.push(\`错误：\${result.errors.length} 个\`);
      result.errors.forEach((e) => {
        lines.push(\`  行 \${e.row}: [\${e.field}] \${e.message} (值="\${e.value}")\`);
      });
    } else {
      lines.push('无校验错误');
    }
    validationResult.value = lines.join('\\n');
  } catch (e) {
    validationResult.value = \`校验异常：\${(e as Error).message}\`;
  }
}
<\/script>

<template>
  <div>
    <!-- ── Data Table ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <div class="demo-section__head">
          <span class="demo-section__title">示例数据</span>
          <el-tag size="small" type="info" effect="plain" :disable-transitions="true">
            {{ tableData.length }} 条
          </el-tag>
        </div>
      </template>
      <el-table :data="tableData" border stripe size="small" class="demo-table">
        <el-table-column prop="name" label="名称" min-width="130" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="100" align="right">
          <template #default="{ row }">¥ {{ row.price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="right" />
        <el-table-column prop="active" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" size="small" :disable-transitions="true">
              {{ row.active ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120" />
      </el-table>
    </el-card>

    <!-- ── Export ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">导出 (writeXlsx / writeCsv / writeTsv)</span>
      </template>
      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">格式</span>
          <div class="demo-field-controls">
            <el-radio-group v-model="exportFormat" size="small">
              <el-radio-button value="xlsx">XLSX</el-radio-button>
              <el-radio-button value="csv">CSV</el-radio-button>
              <el-radio-button value="tsv">TSV</el-radio-button>
            </el-radio-group>
            <el-button size="small" type="primary" @click="handleExport">导出文件</el-button>
            <el-divider direction="vertical" class="demo-field-divider" />
            <el-button size="small" @click="handleBuilderExport">Builder API 导出</el-button>
            <el-divider direction="vertical" class="demo-field-divider" />
            <span class="demo-log">{{ exportLog }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ── Import ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">导入 (readXlsx / parseCsv)</span>
      </template>
      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">方式</span>
          <div class="demo-field-controls">
            <el-radio-group v-model="importMode" size="small">
              <el-radio-button value="file">XLSX 文件</el-radio-button>
              <el-radio-button value="csv-text">CSV 文本</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <template v-if="importMode === 'file'">
          <input ref="fileInputRef" type="file" accept=".xlsx,.xls" hidden @change="handleFileImport">
          <div class="demo-field-row">
            <span class="demo-field-label">文件</span>
            <div class="demo-field-controls">
              <el-button size="small" type="primary" @click="triggerFileInput">选择 XLSX 文件</el-button>
            </div>
          </div>
          <div class="demo-field-row">
            <span class="demo-field-label">表头</span>
            <div class="demo-field-controls">
              <el-radio-group v-model="headerRowMode" size="small" @change="onHeaderModeChange">
                <el-radio-button value="auto">自动识别</el-radio-button>
                <el-radio-button value="manual">指定行</el-radio-button>
                <el-radio-button value="none">无表头</el-radio-button>
              </el-radio-group>
              <el-input-number
                v-if="headerRowMode === 'manual'"
                v-model="manualHeaderRow"
                size="small"
                class="demo-input-number-fixed"
                :min="1"
                :max="999"
                :step="1"
                :controls="true"
                @change="onHeaderModeChange"
              />
            </div>
          </div>
          <div v-if="importSheetNames.length > 1" class="demo-field-row">
            <span class="demo-field-label">工作表</span>
            <div class="demo-field-controls">
              <el-radio-group v-model="importSheetIndex" size="small" @change="onSheetChange">
                <el-radio-button v-for="(name, i) in importSheetNames" :key="i" :value="i">
                  {{ name }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="demo-field-row demo-field-row--block">
            <span class="demo-field-label">文本</span>
            <div class="demo-field-controls demo-field-controls--column">
              <el-input
                v-model="csvInput"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 8 }"
                placeholder="输入 CSV 文本…"
              />
              <el-button size="small" type="primary" class="demo-field-row__action" @click="handleCsvParse">
                解析
              </el-button>
            </div>
          </div>
        </template>
      </div>

      <template v-if="importedData.length">
        <el-divider />
        <div class="demo-import-native">
          <table>
            <thead>
              <tr>
                <th v-for="h in importedHeaders" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in importedData" :key="idx">
                <td
                  v-for="h in importedHeaders"
                  :key="\`\${idx}-\${h}\`"
                  :title="displayImportCell(row[h])"
                >
                  {{ displayImportCell(row[h]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </el-card>

    <!-- ── Export Preview ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">导出预览 (toHtml / toMarkdown / toJson)</span>
      </template>
      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">视图</span>
          <div class="demo-field-controls">
            <el-radio-group v-model="previewMode" size="small">
              <el-radio-button value="html">HTML</el-radio-button>
              <el-radio-button value="markdown">Markdown</el-radio-button>
              <el-radio-button value="json">JSON</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
      <div v-if="previewMode === 'html'" class="demo-preview-html demo-preview-body" v-html="previewContent" />
      <pre v-else class="code-block demo-preview-body"><code>{{ previewContent }}</code></pre>
    </el-card>

    <!-- ── Utility Playground ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">工具函数</span>
      </template>

      <div class="demo-util-row">
        <span class="demo-util-label">formatValue</span>
        <el-input-number v-model="fmtValue" size="small" :controls="false" class="demo-util-input" />
        <el-input v-model="fmtPattern" size="small" placeholder="格式" class="demo-util-input" style="width: 140px" />
        <span class="demo-util-result">→ {{ formattedResult }}</span>
      </div>

      <el-divider />

      <div class="demo-util-row">
        <span class="demo-util-label">parseCellRef</span>
        <el-input v-model="cellRefInput" size="small" placeholder="如 C15" class="demo-util-input" style="width: 100px" />
        <span class="demo-util-result">→ {{ cellRefParsed }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">rangeRef(0,0,9,3)</span>
        <span class="demo-util-result">→ {{ rangeResult }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">parseRange</span>
        <el-input v-model="rangeParseInput" size="small" placeholder="如 B2:E10" class="demo-util-input" style="width: 120px" />
        <span class="demo-util-result">→ {{ rangeParsed }}</span>
      </div>

      <el-divider />

      <div class="demo-util-row">
        <span class="demo-util-label">serialToDate</span>
        <el-input-number v-model="serialInput" size="small" :controls="false" class="demo-util-input" />
        <span class="demo-util-result">→ {{ serialDateResult }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">serialToTime</span>
        <el-input-number v-model="timeSerialInput" size="small" :controls="false" :step="0.01" class="demo-util-input" />
        <span class="demo-util-result">→ {{ timeSerialResult }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">parseDate</span>
        <el-input v-model="parseDateInput" size="small" placeholder="日期字符串" class="demo-util-input" style="width: 160px" />
        <span class="demo-util-result">→ {{ parseDateResult }}</span>
      </div>
    </el-card>

    <!-- ── Template Engine ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">模板引擎 (fillTemplate)</span>
      </template>
      <p class="demo-hint">在 XLSX 单元格中使用 <code v-pre>{{key}}</code> 占位符，用数据填充后导出：</p>
      <div class="demo-template-fields">
        <div v-for="(val, key) in templateData" :key="key" class="demo-util-row">
          <span class="demo-util-label">{{ key }}</span>
          <el-input v-model="templateData[key]" size="small" class="demo-util-input" />
        </div>
      </div>
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runTemplateDemo">运行模板填充</el-button>
          </div>
        </div>
      </div>
      <pre v-if="templateResult" class="code-block" style="margin-top: 12px"><code>{{ templateResult }}</code></pre>
    </el-card>

    <!-- ── Sheet Utils ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Sheet 工具 (sheetToObjects / sheetToArrays)</span>
      </template>
      <p class="demo-hint">将 Sheet 数据转换为对象数组或带表头的二维数组：</p>
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runSheetUtilsDemo">运行转换</el-button>
          </div>
        </div>
      </div>
      <pre v-if="sheetUtilResult" class="code-block" style="margin-top: 12px"><code>{{ sheetUtilResult }}</code></pre>
    </el-card>

    <!-- ── Schema Validation ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Schema 校验 (validateWithSchema)</span>
      </template>
      <el-input v-model="validationCsv" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" placeholder="输入含表头的 CSV" />
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runValidation">运行校验</el-button>
          </div>
        </div>
      </div>
      <pre v-if="validationResult" class="code-block" style="margin-top: 12px"><code>{{ validationResult }}</code></pre>
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

.demo-section__head {
  display: inline-flex;
  align-items: center;
  gap: 10px;
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

.demo-field-row--block {
  align-items: start;

  .demo-field-label {
    padding-top: 6px;
  }
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

  :deep(.el-radio-group),
  :deep(.el-button),
  :deep(.el-input-number) {
    vertical-align: middle;
  }
}

.demo-field-controls--column {
  flex-direction: column;
  align-items: stretch;
  align-self: stretch;
  width: 100%;
  min-height: 0;
  gap: 10px;
}

.demo-field-row__action {
  align-self: flex-start;
}

.demo-field-divider {
  flex-shrink: 0;
  align-self: center;
  height: 26px;
  margin: 0 4px;
}

.demo-input-number-fixed {
  width: 100px;
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
}

.demo-table {
  width: 100%;
  margin-top: 12px;
}

.demo-import-native {
  margin-top: 12px;
  max-height: 260px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 0;
  background: var(--card);

  table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
    table-layout: auto;
    font-size: 12px;
    line-height: 1.5;
  }

  th,
  td {
    padding: 8px 12px;
    border: 1px solid var(--border);
    text-align: left;
    white-space: nowrap;
    vertical-align: top;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    font-weight: 500;
    background: var(--muted);
  }

  tbody tr:nth-child(even) td {
    background: var(--muted);
  }
}

.demo-preview-body {
  margin-top: 14px;
}

.demo-preview-html {
  overflow-x: auto;

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    th, td {
      padding: 8px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    th {
      background: var(--muted);
      font-weight: 500;
    }

    tr:nth-child(even) td {
      background: var(--muted);
    }
  }
}

.demo-util-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.demo-util-label {
  min-width: 140px;
  font-size: 12px;
  font-weight: 500;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--foreground);
}

.demo-util-input {
  width: 160px;
}

.demo-util-result {
  font-size: 12px;
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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
</style>
`;const Va=JSON.parse(`{"title":"hucre","description":"零依赖电子表格引擎（XLSX / CSV / ODS）","frontmatter":{"title":"hucre","description":"零依赖电子表格引擎（XLSX / CSV / ODS）"},"headers":[],"relativePath":"libraries/hucre/index.md","filePath":"libraries/hucre/index.md"}`);var Ha=g({name:`libraries/hucre/index.md`,setup(n){return(n,r)=>{let i=t(`ClientOnly`),s=t(`DemoBlock`);return v(),l(`div`,null,[r[0]||=h("",5),a(s,{title:`hucre 综合示例`,description:`导出 XLSX/CSV/TSV、导入文件/文本、导出预览、工具函数、模板引擎与 Schema 校验。`,source:e(Ba)},{default:f(()=>[a(i,null,{default:f(()=>[a(za)]),_:1})]),_:1},8,[`source`]),r[1]||=h("",37),r[2]||=o(`table`,{tabindex:`0`},[o(`thead`,null,[o(`tr`,null,[o(`th`,null,`函数`),o(`th`,null,`说明`)])]),o(`tbody`,null,[o(`tr`,null,[o(`td`,null,[o(`code`,null,`formatValue(value, numFmt, options?)`)]),o(`td`,null,`应用 Excel 数字格式（支持 locale）`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`validateWithSchema(rows, schema, options?)`)]),o(`td`,null,`按 schema 校验和类型转换`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`serialToDate(serial, is1904?)`)]),o(`td`,null,`Excel 序列号 → Date (UTC)`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`dateToSerial(date, is1904?)`)]),o(`td`,null,`Date → Excel 序列号`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`serialToTime(serial)`)]),o(`td`,{"hours,":``,"minutes,":``,"seconds,":``,milliseconds:``},`序列号小数部分 →`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`timeToSerial(h, m, s?, ms?)`)]),o(`td`,null,`时间分量 → Excel 序列号小数`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`parseDate(value)`)]),o(`td`,null,`解析日期字符串 → Date（支持 ISO 8601 及常见格式）`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`parseCellRef(ref)`)]),o(`td`,{"row:":``,"14,":``,"col:":``,26:``},`"AA15" →`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`cellRef(row, col)`)]),o(`td`,null,`(14, 26) → "AA15"`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`colToLetter(col)`),_(` / `),o(`code`,null,`letterToCol(letter)`)]),o(`td`,null,`列序号与字母互转`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`rangeRef(r1, c1, r2, c2)`),_(` / `),o(`code`,null,`parseRange(range)`)]),o(`td`,null,`范围引用与对象互转`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`isInRange(row, col, range)`)]),o(`td`,null,`判断单元格是否在范围内`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`calculateColumnWidth(values, options?)`)]),o(`td`,null,`计算最优列宽（字体感知）`)]),o(`tr`,null,[o(`td`,null,[o(`code`,null,`sheetToObjects(sheet, options?)`),_(` / `),o(`code`,null,`sheetToArrays(sheet)`)]),o(`td`,null,`Sheet 与对象/二维数组互转`)])])],-1),r[3]||=h("",10)])}}});export{Va as __pageData,Ha as default};