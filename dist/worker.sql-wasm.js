
// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
// https://github.com/kripken/emscripten/issues/5820
// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
// which is able to be used/called before the WASM is loaded.
// The modularization below exports a promise that loads and resolves to the actual sql.js module.
// That way, this module can't be used before the WASM is finished loading.

// We are going to define a function that a user will call to start loading initializing our Sql.js library
// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
// Instead, we want to return the previously loaded module

// TODO: Make this not declare a global if used in the browser
var initSqlJsPromise = undefined;

var initSqlJs = function (moduleConfig) {

    if (initSqlJsPromise){
      return initSqlJsPromise;
    }
    // If we're here, we've never called this function before
    initSqlJsPromise = new Promise(function (resolveModule, reject) {

        // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
        // https://github.com/kripken/emscripten/issues/5820

        // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
        // properties to it, like `preRun`, `postRun`, etc
        // We are using that to get notified when the WASM has finished loading.
        // Only then will we return our promise

        // If they passed in a moduleConfig object, use that
        // Otherwise, initialize Module to the empty object
        var Module = typeof moduleConfig !== 'undefined' ? moduleConfig : {};

        // EMCC only allows for a single onAbort function (not an array of functions)
        // So if the user defined their own onAbort function, we remember it and call it
        var originalOnAbortFunction = Module['onAbort'];
        Module['onAbort'] = function (errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction){
              originalOnAbortFunction(errorThatCausedAbort);
            }
        };

        Module['postRun'] = Module['postRun'] || [];
        Module['postRun'].push(function () {
            // When Emscripted calls postRun, this promise resolves with the built Module
            resolveModule(Module);
        });

        // There is a section of code in the emcc-generated code below that looks like this:
        // (Note that this is lowercase `module`)
        // if (typeof module !== 'undefined') {
        //     module['exports'] = Module;
        // }
        // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
        // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
        // but that carries with it additional unnecessary baggage/bugs we don't want either.
        // So, we have three options:
        // 1) We undefine `module`
        // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
        // 3) We write a script to remove those lines of code as part of the Make process.
        //
        // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
        // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
        // That's a nice side effect since we're handling the modularization efforts ourselves
        module = undefined;

        // The emcc-generated code and shell-post.js code goes below,
        // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort

var e;e||(e=typeof Module !== 'undefined' ? Module : {});null;
e.onRuntimeInitialized=function(){function a(h,l){this.Sa=h;this.db=l;this.Qa=1;this.mb=[]}function b(h,l){this.db=l;l=ca(h)+1;this.fb=da(l);if(null===this.fb)throw Error("Unable to allocate memory for the SQL string");k(h,n,this.fb,l);this.kb=this.fb;this.ab=this.qb=null}function c(h){this.filename="dbfile_"+(4294967295*Math.random()>>>0);null!=h&&ea(this.filename,h);this.handleError(g(this.filename,d));this.db=p(d,"i32");ic(this.db);jc(this.db);this.gb={};this.Ya={}}var d=v(4),f=e.cwrap,g=f("sqlite3_open",
"number",["string","number"]),m=f("sqlite3_close_v2","number",["number"]),q=f("sqlite3_exec","number",["number","string","number","number","number"]),w=f("sqlite3_changes","number",["number"]),u=f("sqlite3_prepare_v2","number",["number","string","number","number","number"]),C=f("sqlite3_sql","string",["number"]),I=f("sqlite3_normalized_sql","string",["number"]),aa=f("sqlite3_prepare_v2","number",["number","number","number","number","number"]),kc=f("sqlite3_bind_text","number",["number","number","number",
"number","number"]),pb=f("sqlite3_bind_blob","number",["number","number","number","number","number"]),lc=f("sqlite3_bind_double","number",["number","number","number"]),mc=f("sqlite3_bind_int","number",["number","number","number"]),nc=f("sqlite3_bind_parameter_index","number",["number","string"]),oc=f("sqlite3_step","number",["number"]),pc=f("sqlite3_errmsg","string",["number"]),qc=f("sqlite3_column_count","number",["number"]),rc=f("sqlite3_data_count","number",["number"]),sc=f("sqlite3_column_double",
"number",["number","number"]),qb=f("sqlite3_column_text","string",["number","number"]),tc=f("sqlite3_column_blob","number",["number","number"]),uc=f("sqlite3_column_bytes","number",["number","number"]),vc=f("sqlite3_column_type","number",["number","number"]),wc=f("sqlite3_column_name","string",["number","number"]),xc=f("sqlite3_reset","number",["number"]),yc=f("sqlite3_clear_bindings","number",["number"]),zc=f("sqlite3_finalize","number",["number"]),Ac=f("sqlite3_create_function_v2","number","number string number number number number number number number".split(" ")),
Bc=f("sqlite3_value_type","number",["number"]),Cc=f("sqlite3_value_bytes","number",["number"]),Dc=f("sqlite3_value_text","string",["number"]),Ec=f("sqlite3_value_blob","number",["number"]),Fc=f("sqlite3_value_double","number",["number"]),Gc=f("sqlite3_result_double","",["number","number"]),rb=f("sqlite3_result_null","",["number"]),Hc=f("sqlite3_result_text","",["number","string","number","number"]),Ic=f("sqlite3_result_blob","",["number","number","number","number"]),Jc=f("sqlite3_result_int","",["number",
"number"]),sb=f("sqlite3_result_error","",["number","string","number"]),ic=f("RegisterExtensionFunctions","number",["number"]),jc=f("RegisterCSVTable","number",["number"]);a.prototype.bind=function(h){if(!this.Sa)throw"Statement closed";this.reset();return Array.isArray(h)?this.Eb(h):null!=h&&"object"===typeof h?this.Fb(h):!0};a.prototype.step=function(){if(!this.Sa)throw"Statement closed";this.Qa=1;var h=oc(this.Sa);switch(h){case 100:return!0;case 101:return!1;default:throw this.db.handleError(h);
}};a.prototype.Ab=function(h){null==h&&(h=this.Qa,this.Qa+=1);return sc(this.Sa,h)};a.prototype.Ib=function(h){null==h&&(h=this.Qa,this.Qa+=1);h=qb(this.Sa,h);if("function"!==typeof BigInt)throw Error("BigInt is not supported");return BigInt(h)};a.prototype.Jb=function(h){null==h&&(h=this.Qa,this.Qa+=1);return qb(this.Sa,h)};a.prototype.getBlob=function(h){null==h&&(h=this.Qa,this.Qa+=1);var l=uc(this.Sa,h);h=tc(this.Sa,h);for(var t=new Uint8Array(l),r=0;r<l;r+=1)t[r]=x[h+r];return t};a.prototype.get=
function(h,l){l=l||{};null!=h&&this.bind(h)&&this.step();h=[];for(var t=rc(this.Sa),r=0;r<t;r+=1)switch(vc(this.Sa,r)){case 1:var B=l.useBigInt?this.Ib(r):this.Ab(r);h.push(B);break;case 2:h.push(this.Ab(r));break;case 3:h.push(this.Jb(r));break;case 4:h.push(this.getBlob(r));break;default:h.push(null)}return h};a.prototype.getColumnNames=function(){for(var h=[],l=qc(this.Sa),t=0;t<l;t+=1)h.push(wc(this.Sa,t));return h};a.prototype.getAsObject=function(h,l){h=this.get(h,l);l=this.getColumnNames();
for(var t={},r=0;r<l.length;r+=1)t[l[r]]=h[r];return t};a.prototype.getSQL=function(){return C(this.Sa)};a.prototype.getNormalizedSQL=function(){return I(this.Sa)};a.prototype.run=function(h){null!=h&&this.bind(h);this.step();return this.reset()};a.prototype.vb=function(h,l){null==l&&(l=this.Qa,this.Qa+=1);h=fa(h);var t=ha(h);this.mb.push(t);this.db.handleError(kc(this.Sa,l,t,h.length-1,0))};a.prototype.Db=function(h,l){null==l&&(l=this.Qa,this.Qa+=1);var t=ha(h);this.mb.push(t);this.db.handleError(pb(this.Sa,
l,t,h.length,0))};a.prototype.ub=function(h,l){null==l&&(l=this.Qa,this.Qa+=1);this.db.handleError((h===(h|0)?mc:lc)(this.Sa,l,h))};a.prototype.Gb=function(h){null==h&&(h=this.Qa,this.Qa+=1);pb(this.Sa,h,0,0,0)};a.prototype.wb=function(h,l){null==l&&(l=this.Qa,this.Qa+=1);switch(typeof h){case "string":this.vb(h,l);return;case "number":this.ub(h,l);return;case "bigint":this.vb(h.toString(),l);return;case "boolean":this.ub(h+0,l);return;case "object":if(null===h){this.Gb(l);return}if(null!=h.length){this.Db(h,
l);return}}throw"Wrong API use : tried to bind a value of an unknown type ("+h+").";};a.prototype.Fb=function(h){var l=this;Object.keys(h).forEach(function(t){var r=nc(l.Sa,t);0!==r&&l.wb(h[t],r)});return!0};a.prototype.Eb=function(h){for(var l=0;l<h.length;l+=1)this.wb(h[l],l+1);return!0};a.prototype.reset=function(){this.freemem();return 0===yc(this.Sa)&&0===xc(this.Sa)};a.prototype.freemem=function(){for(var h;void 0!==(h=this.mb.pop());)ia(h)};a.prototype.free=function(){this.freemem();var h=
0===zc(this.Sa);delete this.db.gb[this.Sa];this.Sa=0;return h};b.prototype.next=function(){if(null===this.fb)return{done:!0};null!==this.ab&&(this.ab.free(),this.ab=null);if(!this.db.db)throw this.ob(),Error("Database closed");var h=ka(),l=v(4);la(d);la(l);try{this.db.handleError(aa(this.db.db,this.kb,-1,d,l));this.kb=p(l,"i32");var t=p(d,"i32");if(0===t)return this.ob(),{done:!0};this.ab=new a(t,this.db);this.db.gb[t]=this.ab;return{value:this.ab,done:!1}}catch(r){throw this.qb=y(this.kb),this.ob(),
r;}finally{ma(h)}};b.prototype.ob=function(){ia(this.fb);this.fb=null};b.prototype.getRemainingSQL=function(){return null!==this.qb?this.qb:y(this.kb)};"function"===typeof Symbol&&"symbol"===typeof Symbol.iterator&&(b.prototype[Symbol.iterator]=function(){return this});c.prototype.createCSVTable=function(h,l){if(!this.db)throw"Database closed";if(null==h)throw"No data for CSV file";this.filename="csvfile_"+(4294967295*Math.random()>>>0);null!=h&&ea(this.filename,h);this.handleError(q(this.db,'CREATE VIRTUAL TABLE temp."'+
l+"\" USING csv(filename='"+this.filename+"', header=true);",0,0,d))};c.prototype.run=function(h,l){if(!this.db)throw"Database closed";if(l){h=this.prepare(h,l);try{h.step()}finally{h.free()}}else this.handleError(q(this.db,h,0,0,d));return this};c.prototype.exec=function(h,l,t){if(!this.db)throw"Database closed";var r=ka(),B=null;try{var U=ca(h)+1,G=v(U);k(h,x,G,U);var ja=G;var ba=v(4);for(h=[];0!==p(ja,"i8");){la(d);la(ba);this.handleError(aa(this.db,ja,-1,d,ba));var D=p(d,"i32");ja=p(ba,"i32");
if(0!==D){U=null;B=new a(D,this);for(null!=l&&B.bind(l);B.step();)null===U&&(U={columns:B.getColumnNames(),values:[]},h.push(U)),U.values.push(B.get(null,t));B.free()}}return h}catch(N){throw B&&B.free(),N;}finally{ma(r)}};c.prototype.each=function(h,l,t,r,B){"function"===typeof l&&(r=t,t=l,l=void 0);h=this.prepare(h,l);try{for(;h.step();)t(h.getAsObject(null,B))}finally{h.free()}if("function"===typeof r)return r()};c.prototype.prepare=function(h,l){la(d);this.handleError(u(this.db,h,-1,d,0));h=p(d,
"i32");if(0===h)throw"Nothing to prepare";var t=new a(h,this);null!=l&&t.bind(l);return this.gb[h]=t};c.prototype.iterateStatements=function(h){return new b(h,this)};c.prototype["export"]=function(){Object.values(this.gb).forEach(function(l){l.free()});Object.values(this.Ya).forEach(na);this.Ya={};this.handleError(m(this.db));var h=oa(this.filename);this.handleError(g(this.filename,d));this.db=p(d,"i32");return h};c.prototype.close=function(){null!==this.db&&(Object.values(this.gb).forEach(function(h){h.free()}),
Object.values(this.Ya).forEach(na),this.Ya={},this.handleError(m(this.db)),pa("/"+this.filename),this.db=null)};c.prototype.handleError=function(h){if(0===h)return null;h=pc(this.db);throw Error(h);};c.prototype.getRowsModified=function(){return w(this.db)};c.prototype.create_function=function(h,l){Object.prototype.hasOwnProperty.call(this.Ya,h)&&(na(this.Ya[h]),delete this.Ya[h]);var t=qa(function(r,B,U){for(var G,ja=[],ba=0;ba<B;ba+=1){var D=p(U+4*ba,"i32"),N=Bc(D);if(1===N||2===N)D=Fc(D);else if(3===
N)D=Dc(D);else if(4===N){N=D;D=Cc(N);N=Ec(N);for(var vb=new Uint8Array(D),Aa=0;Aa<D;Aa+=1)vb[Aa]=x[N+Aa];D=vb}else D=null;ja.push(D)}try{G=l.apply(null,ja)}catch(Mc){sb(r,Mc,-1);return}switch(typeof G){case "boolean":Jc(r,G?1:0);break;case "number":Gc(r,G);break;case "string":Hc(r,G,-1,-1);break;case "object":null===G?rb(r):null!=G.length?(B=ha(G),Ic(r,B,G.length,-1),ia(B)):sb(r,"Wrong API use : tried to return a value of an unknown type ("+G+").",-1);break;default:rb(r)}});this.Ya[h]=t;this.handleError(Ac(this.db,
h,l.length,1,0,t,0,0,0));return this};e.Database=c};var ra={},z;for(z in e)e.hasOwnProperty(z)&&(ra[z]=e[z]);var sa="./this.program",ta="object"===typeof window,ua="function"===typeof importScripts,va="object"===typeof process&&"object"===typeof process.versions&&"string"===typeof process.versions.node,A="",wa,xa,ya,za,Ba;
if(va)A=ua?require("path").dirname(A)+"/":__dirname+"/",wa=function(a,b){za||(za=require("fs"));Ba||(Ba=require("path"));a=Ba.normalize(a);return za.readFileSync(a,b?null:"utf8")},ya=function(a){a=wa(a,!0);a.buffer||(a=new Uint8Array(a));a.buffer||E("Assertion failed: undefined");return a},xa=function(a,b,c){za||(za=require("fs"));Ba||(Ba=require("path"));a=Ba.normalize(a);za.readFile(a,function(d,f){d?c(d):b(f.buffer)})},1<process.argv.length&&(sa=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),
"undefined"!==typeof module&&(module.exports=e),e.inspect=function(){return"[Emscripten Module object]"};else if(ta||ua)ua?A=self.location.href:"undefined"!==typeof document&&document.currentScript&&(A=document.currentScript.src),A=0!==A.indexOf("blob:")?A.substr(0,A.lastIndexOf("/")+1):"",wa=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},ua&&(ya=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),
xa=function(a,b,c){var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=function(){200==d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)};var Ca=e.print||console.log.bind(console),F=e.printErr||console.warn.bind(console);for(z in ra)ra.hasOwnProperty(z)&&(e[z]=ra[z]);ra=null;e.thisProgram&&(sa=e.thisProgram);var Da=[],Ea;function na(a){Ea.delete(H.get(a));Da.push(a)}
function qa(a){if(!Ea){Ea=new WeakMap;for(var b=0;b<H.length;b++){var c=H.get(b);c&&Ea.set(c,b)}}if(Ea.has(a))a=Ea.get(a);else{if(Da.length)b=Da.pop();else{try{H.grow(1)}catch(g){if(!(g instanceof RangeError))throw g;throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}b=H.length-1}try{H.set(b,a)}catch(g){if(!(g instanceof TypeError))throw g;if("function"===typeof WebAssembly.Function){var d={i:"i32",j:"i64",f:"f32",d:"f64"},f={parameters:[],results:[]};for(c=1;4>c;++c)f.parameters.push(d["viii"[c]]);
c=new WebAssembly.Function(f,a)}else{d=[1,0,1,96];f={i:127,j:126,f:125,d:124};d.push(3);for(c=0;3>c;++c)d.push(f["iii"[c]]);d.push(0);d[1]=d.length-2;c=new Uint8Array([0,97,115,109,1,0,0,0].concat(d,[2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0]));c=new WebAssembly.Module(c);c=(new WebAssembly.Instance(c,{e:{f:a}})).exports.f}H.set(b,c)}Ea.set(a,b);a=b}return a}var Fa;e.wasmBinary&&(Fa=e.wasmBinary);var noExitRuntime=e.noExitRuntime||!0;"object"!==typeof WebAssembly&&E("no native wasm support detected");
function la(a){var b="i32";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":x[a>>0]=0;break;case "i8":x[a>>0]=0;break;case "i16":Ga[a>>1]=0;break;case "i32":J[a>>2]=0;break;case "i64":K=[0,(L=0,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[a>>2]=K[0];J[a+4>>2]=K[1];break;case "float":Ha[a>>2]=0;break;case "double":Ia[a>>3]=0;break;default:E("invalid type for setValue: "+b)}}
function p(a,b){b=b||"i8";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":return x[a>>0];case "i8":return x[a>>0];case "i16":return Ga[a>>1];case "i32":return J[a>>2];case "i64":return J[a>>2];case "float":return Ha[a>>2];case "double":return Ia[a>>3];default:E("invalid type for getValue: "+b)}return null}var Ja,Ka=!1;function La(a){var b=e["_"+a];b||E("Assertion failed: Cannot call unknown function "+(a+", make sure it is exported"));return b}
function Ma(a,b,c,d){var f={string:function(u){var C=0;if(null!==u&&void 0!==u&&0!==u){var I=(u.length<<2)+1;C=v(I);k(u,n,C,I)}return C},array:function(u){var C=v(u.length);x.set(u,C);return C}};a=La(a);var g=[],m=0;if(d)for(var q=0;q<d.length;q++){var w=f[c[q]];w?(0===m&&(m=ka()),g[q]=w(d[q])):g[q]=d[q]}c=a.apply(null,g);return c=function(u){0!==m&&ma(m);return"string"===b?y(u):"boolean"===b?!!u:u}(c)}var Na=0,Oa=1;
function ha(a){var b=Na==Oa?v(a.length):da(a.length);a.subarray||a.slice?n.set(a,b):n.set(new Uint8Array(a),b);return b}var Pa="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0;
function Qa(a,b,c){var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.subarray&&Pa)return Pa.decode(a.subarray(b,c));for(d="";b<c;){var f=a[b++];if(f&128){var g=a[b++]&63;if(192==(f&224))d+=String.fromCharCode((f&31)<<6|g);else{var m=a[b++]&63;f=224==(f&240)?(f&15)<<12|g<<6|m:(f&7)<<18|g<<12|m<<6|a[b++]&63;65536>f?d+=String.fromCharCode(f):(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else d+=String.fromCharCode(f)}return d}function y(a,b){return a?Qa(n,a,b):""}
function k(a,b,c,d){if(!(0<d))return 0;var f=c;d=c+d-1;for(var g=0;g<a.length;++g){var m=a.charCodeAt(g);if(55296<=m&&57343>=m){var q=a.charCodeAt(++g);m=65536+((m&1023)<<10)|q&1023}if(127>=m){if(c>=d)break;b[c++]=m}else{if(2047>=m){if(c+1>=d)break;b[c++]=192|m>>6}else{if(65535>=m){if(c+2>=d)break;b[c++]=224|m>>12}else{if(c+3>=d)break;b[c++]=240|m>>18;b[c++]=128|m>>12&63}b[c++]=128|m>>6&63}b[c++]=128|m&63}}b[c]=0;return c-f}
function ca(a){for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&(d=65536+((d&1023)<<10)|a.charCodeAt(++c)&1023);127>=d?++b:b=2047>=d?b+2:65535>=d?b+3:b+4}return b}function Ra(a){var b=ca(a)+1,c=da(b);c&&k(a,x,c,b);return c}var Sa,x,n,Ga,J,Ha,Ia;
function Ta(){var a=Ja.buffer;Sa=a;e.HEAP8=x=new Int8Array(a);e.HEAP16=Ga=new Int16Array(a);e.HEAP32=J=new Int32Array(a);e.HEAPU8=n=new Uint8Array(a);e.HEAPU16=new Uint16Array(a);e.HEAPU32=new Uint32Array(a);e.HEAPF32=Ha=new Float32Array(a);e.HEAPF64=Ia=new Float64Array(a)}var H,Ua=[],Va=[],Wa=[];function Xa(){var a=e.preRun.shift();Ua.unshift(a)}var Ya=0,Za=null,$a=null;e.preloadedImages={};e.preloadedAudios={};
function E(a){if(e.onAbort)e.onAbort(a);F(a);Ka=!0;throw new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");}function ab(){return M.startsWith("data:application/octet-stream;base64,")}var M;M="sql-wasm.wasm";if(!ab()){var bb=M;M=e.locateFile?e.locateFile(bb,A):A+bb}function cb(){var a=M;try{if(a==M&&Fa)return new Uint8Array(Fa);if(ya)return ya(a);throw"both async and sync fetching of the wasm failed";}catch(b){E(b)}}
function db(){if(!Fa&&(ta||ua)){if("function"===typeof fetch&&!M.startsWith("file://"))return fetch(M,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+M+"'";return a.arrayBuffer()}).catch(function(){return cb()});if(xa)return new Promise(function(a,b){xa(M,function(c){a(new Uint8Array(c))},b)})}return Promise.resolve().then(function(){return cb()})}var L,K;
function eb(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(e);else{var c=b.Tb;"number"===typeof c?void 0===b.nb?H.get(c)():H.get(c)(b.nb):c(void 0===b.nb?null:b.nb)}}}function fb(a){return a.replace(/\b_Z[\w\d_]+/g,function(b){return b===b?b:b+" ["+b+"]"})}
function gb(){function a(m){return(m=m.toTimeString().match(/\(([A-Za-z ]+)\)$/))?m[1]:"GMT"}var b=(new Date).getFullYear(),c=new Date(b,0,1),d=new Date(b,6,1);b=c.getTimezoneOffset();var f=d.getTimezoneOffset(),g=Math.max(b,f);J[hb()>>2]=60*g;J[ib()>>2]=Number(b!=f);c=a(c);d=a(d);c=Ra(c);d=Ra(d);f<b?(J[jb()>>2]=c,J[jb()+4>>2]=d):(J[jb()>>2]=d,J[jb()+4>>2]=c)}var kb;
function lb(a,b){for(var c=0,d=a.length-1;0<=d;d--){var f=a[d];"."===f?a.splice(d,1):".."===f?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a}function O(a){var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=lb(a.split("/").filter(function(d){return!!d}),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a}
function mb(a){var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return".";b&&(b=b.substr(0,b.length-1));return a+b}function nb(a){if("/"===a)return"/";a=O(a);a=a.replace(/\/$/,"");var b=a.lastIndexOf("/");return-1===b?a:a.substr(b+1)}
function ob(){if("object"===typeof crypto&&"function"===typeof crypto.getRandomValues){var a=new Uint8Array(1);return function(){crypto.getRandomValues(a);return a[0]}}if(va)try{var b=require("crypto");return function(){return b.randomBytes(1)[0]}}catch(c){}return function(){E("randomDevice")}}
function tb(){for(var a="",b=!1,c=arguments.length-1;-1<=c&&!b;c--){b=0<=c?arguments[c]:"/";if("string"!==typeof b)throw new TypeError("Arguments to path.resolve must be strings");if(!b)return"";a=b+"/"+a;b="/"===b.charAt(0)}a=lb(a.split("/").filter(function(d){return!!d}),!b).join("/");return(b?"/":"")+a||"."}var ub=[];function wb(a,b){ub[a]={input:[],output:[],eb:b};xb(a,yb)}
var yb={open:function(a){var b=ub[a.node.rdev];if(!b)throw new P(43);a.tty=b;a.seekable=!1},close:function(a){a.tty.eb.flush(a.tty)},flush:function(a){a.tty.eb.flush(a.tty)},read:function(a,b,c,d){if(!a.tty||!a.tty.eb.Bb)throw new P(60);for(var f=0,g=0;g<d;g++){try{var m=a.tty.eb.Bb(a.tty)}catch(q){throw new P(29);}if(void 0===m&&0===f)throw new P(6);if(null===m||void 0===m)break;f++;b[c+g]=m}f&&(a.node.timestamp=Date.now());return f},write:function(a,b,c,d){if(!a.tty||!a.tty.eb.rb)throw new P(60);
try{for(var f=0;f<d;f++)a.tty.eb.rb(a.tty,b[c+f])}catch(g){throw new P(29);}d&&(a.node.timestamp=Date.now());return f}},zb={Bb:function(a){if(!a.input.length){var b=null;if(va){var c=Buffer.alloc(256),d=0;try{d=za.readSync(process.stdin.fd,c,0,256,null)}catch(f){if(f.toString().includes("EOF"))d=0;else throw f;}0<d?b=c.slice(0,d).toString("utf-8"):b=null}else"undefined"!=typeof window&&"function"==typeof window.prompt?(b=window.prompt("Input: "),null!==b&&(b+="\n")):"function"==typeof readline&&(b=
readline(),null!==b&&(b+="\n"));if(!b)return null;a.input=fa(b,!0)}return a.input.shift()},rb:function(a,b){null===b||10===b?(Ca(Qa(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&(Ca(Qa(a.output,0)),a.output=[])}},Ab={rb:function(a,b){null===b||10===b?(F(Qa(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&(F(Qa(a.output,0)),a.output=[])}};
function Bb(a){a=65536*Math.ceil(a/65536);var b=Cb(65536,a);if(!b)return 0;n.fill(0,b,b+a);return b}
var Q={Wa:null,Xa:function(){return Q.createNode(null,"/",16895,0)},createNode:function(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new P(63);Q.Wa||(Q.Wa={dir:{node:{Va:Q.Na.Va,Ua:Q.Na.Ua,lookup:Q.Na.lookup,hb:Q.Na.hb,rename:Q.Na.rename,unlink:Q.Na.unlink,rmdir:Q.Na.rmdir,readdir:Q.Na.readdir,symlink:Q.Na.symlink},stream:{$a:Q.Oa.$a}},file:{node:{Va:Q.Na.Va,Ua:Q.Na.Ua},stream:{$a:Q.Oa.$a,read:Q.Oa.read,write:Q.Oa.write,tb:Q.Oa.tb,ib:Q.Oa.ib,jb:Q.Oa.jb}},link:{node:{Va:Q.Na.Va,Ua:Q.Na.Ua,
readlink:Q.Na.readlink},stream:{}},xb:{node:{Va:Q.Na.Va,Ua:Q.Na.Ua},stream:Db}});c=Eb(a,b,c,d);R(c.mode)?(c.Na=Q.Wa.dir.node,c.Oa=Q.Wa.dir.stream,c.Pa={}):32768===(c.mode&61440)?(c.Na=Q.Wa.file.node,c.Oa=Q.Wa.file.stream,c.Ta=0,c.Pa=null):40960===(c.mode&61440)?(c.Na=Q.Wa.link.node,c.Oa=Q.Wa.link.stream):8192===(c.mode&61440)&&(c.Na=Q.Wa.xb.node,c.Oa=Q.Wa.xb.stream);c.timestamp=Date.now();a&&(a.Pa[b]=c,a.timestamp=c.timestamp);return c},Ub:function(a){return a.Pa?a.Pa.subarray?a.Pa.subarray(0,a.Ta):
new Uint8Array(a.Pa):new Uint8Array(0)},yb:function(a,b){var c=a.Pa?a.Pa.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)>>>0),0!=c&&(b=Math.max(b,256)),c=a.Pa,a.Pa=new Uint8Array(b),0<a.Ta&&a.Pa.set(c.subarray(0,a.Ta),0))},Qb:function(a,b){if(a.Ta!=b)if(0==b)a.Pa=null,a.Ta=0;else{var c=a.Pa;a.Pa=new Uint8Array(b);c&&a.Pa.set(c.subarray(0,Math.min(b,a.Ta)));a.Ta=b}},Na:{Va:function(a){var b={};b.dev=8192===(a.mode&61440)?a.id:1;b.ino=a.id;b.mode=a.mode;b.nlink=1;b.uid=0;b.gid=0;b.rdev=a.rdev;R(a.mode)?
b.size=4096:32768===(a.mode&61440)?b.size=a.Ta:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.atime=new Date(a.timestamp);b.mtime=new Date(a.timestamp);b.ctime=new Date(a.timestamp);b.Hb=4096;b.blocks=Math.ceil(b.size/b.Hb);return b},Ua:function(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);void 0!==b.size&&Q.Qb(a,b.size)},lookup:function(){throw Fb[44];},hb:function(a,b,c,d){return Q.createNode(a,b,c,d)},rename:function(a,b,c){if(R(a.mode)){try{var d=
Gb(b,c)}catch(g){}if(d)for(var f in d.Pa)throw new P(55);}delete a.parent.Pa[a.name];a.parent.timestamp=Date.now();a.name=c;b.Pa[c]=a;b.timestamp=a.parent.timestamp;a.parent=b},unlink:function(a,b){delete a.Pa[b];a.timestamp=Date.now()},rmdir:function(a,b){var c=Gb(a,b),d;for(d in c.Pa)throw new P(55);delete a.Pa[b];a.timestamp=Date.now()},readdir:function(a){var b=[".",".."],c;for(c in a.Pa)a.Pa.hasOwnProperty(c)&&b.push(c);return b},symlink:function(a,b,c){a=Q.createNode(a,b,41471,0);a.link=c;return a},
readlink:function(a){if(40960!==(a.mode&61440))throw new P(28);return a.link}},Oa:{read:function(a,b,c,d,f){var g=a.node.Pa;if(f>=a.node.Ta)return 0;a=Math.min(a.node.Ta-f,d);if(8<a&&g.subarray)b.set(g.subarray(f,f+a),c);else for(d=0;d<a;d++)b[c+d]=g[f+d];return a},write:function(a,b,c,d,f,g){b.buffer===x.buffer&&(g=!1);if(!d)return 0;a=a.node;a.timestamp=Date.now();if(b.subarray&&(!a.Pa||a.Pa.subarray)){if(g)return a.Pa=b.subarray(c,c+d),a.Ta=d;if(0===a.Ta&&0===f)return a.Pa=b.slice(c,c+d),a.Ta=
d;if(f+d<=a.Ta)return a.Pa.set(b.subarray(c,c+d),f),d}Q.yb(a,f+d);if(a.Pa.subarray&&b.subarray)a.Pa.set(b.subarray(c,c+d),f);else for(g=0;g<d;g++)a.Pa[f+g]=b[c+g];a.Ta=Math.max(a.Ta,f+d);return d},$a:function(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.Ta);if(0>b)throw new P(28);return b},tb:function(a,b,c){Q.yb(a.node,b+c);a.node.Ta=Math.max(a.node.Ta,b+c)},ib:function(a,b,c,d,f,g){if(0!==b)throw new P(28);if(32768!==(a.node.mode&61440))throw new P(43);a=a.node.Pa;if(g&
2||a.buffer!==Sa){if(0<d||d+c<a.length)a.subarray?a=a.subarray(d,d+c):a=Array.prototype.slice.call(a,d,d+c);d=!0;c=Bb(c);if(!c)throw new P(48);x.set(a,c)}else d=!1,c=a.byteOffset;return{Pb:c,lb:d}},jb:function(a,b,c,d,f){if(32768!==(a.node.mode&61440))throw new P(43);if(f&2)return 0;Q.Oa.write(a,b,0,d,c,!1);return 0}}},Hb=null,Ib={},S=[],Jb=1,T=null,Kb=!0,V={},P=null,Fb={};
function W(a,b){a=tb("/",a);b=b||{};if(!a)return{path:"",node:null};var c={zb:!0,sb:0},d;for(d in c)void 0===b[d]&&(b[d]=c[d]);if(8<b.sb)throw new P(32);a=lb(a.split("/").filter(function(m){return!!m}),!1);var f=Hb;c="/";for(d=0;d<a.length;d++){var g=d===a.length-1;if(g&&b.parent)break;f=Gb(f,a[d]);c=O(c+"/"+a[d]);f.bb&&(!g||g&&b.zb)&&(f=f.bb.root);if(!g||b.Za)for(g=0;40960===(f.mode&61440);)if(f=Lb(c),c=tb(mb(c),f),f=W(c,{sb:b.sb}).node,40<g++)throw new P(32);}return{path:c,node:f}}
function Mb(a){for(var b;;){if(a===a.parent)return a=a.Xa.Cb,b?"/"!==a[a.length-1]?a+"/"+b:a+b:a;b=b?a.name+"/"+b:a.name;a=a.parent}}function Nb(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%T.length}function Ob(a){var b=Nb(a.parent.id,a.name);if(T[b]===a)T[b]=a.cb;else for(b=T[b];b;){if(b.cb===a){b.cb=a.cb;break}b=b.cb}}
function Gb(a,b){var c;if(c=(c=Pb(a,"x"))?c:a.Na.lookup?0:2)throw new P(c,a);for(c=T[Nb(a.id,b)];c;c=c.cb){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.Na.lookup(a,b)}function Eb(a,b,c,d){a=new Qb(a,b,c,d);b=Nb(a.parent.id,a.name);a.cb=T[b];return T[b]=a}function R(a){return 16384===(a&61440)}var Rb={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090};function Sb(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}
function Pb(a,b){if(Kb)return 0;if(!b.includes("r")||a.mode&292){if(b.includes("w")&&!(a.mode&146)||b.includes("x")&&!(a.mode&73))return 2}else return 2;return 0}function Tb(a,b){try{return Gb(a,b),20}catch(c){}return Pb(a,"wx")}function Ub(a,b,c){try{var d=Gb(a,b)}catch(f){return f.Ra}if(a=Pb(a,"wx"))return a;if(c){if(!R(d.mode))return 54;if(d===d.parent||"/"===Mb(d))return 10}else if(R(d.mode))return 31;return 0}function Vb(a){var b=4096;for(a=a||0;a<=b;a++)if(!S[a])return a;throw new P(33);}
function Wb(a,b){Xb||(Xb=function(){},Xb.prototype={});var c=new Xb,d;for(d in a)c[d]=a[d];a=c;b=Vb(b);a.fd=b;return S[b]=a}var Db={open:function(a){a.Oa=Ib[a.node.rdev].Oa;a.Oa.open&&a.Oa.open(a)},$a:function(){throw new P(70);}};function xb(a,b){Ib[a]={Oa:b}}
function Yb(a,b){var c="/"===b,d=!b;if(c&&Hb)throw new P(10);if(!c&&!d){var f=W(b,{zb:!1});b=f.path;f=f.node;if(f.bb)throw new P(10);if(!R(f.mode))throw new P(54);}b={type:a,Vb:{},Cb:b,Nb:[]};a=a.Xa(b);a.Xa=b;b.root=a;c?Hb=a:f&&(f.bb=b,f.Xa&&f.Xa.Nb.push(b))}function Zb(a,b,c){var d=W(a,{parent:!0}).node;a=nb(a);if(!a||"."===a||".."===a)throw new P(28);var f=Tb(d,a);if(f)throw new P(f);if(!d.Na.hb)throw new P(63);return d.Na.hb(d,a,b,c)}
function X(a,b){return Zb(a,(void 0!==b?b:511)&1023|16384,0)}function $b(a,b,c){"undefined"===typeof c&&(c=b,b=438);Zb(a,b|8192,c)}function ac(a,b){if(!tb(a))throw new P(44);var c=W(b,{parent:!0}).node;if(!c)throw new P(44);b=nb(b);var d=Tb(c,b);if(d)throw new P(d);if(!c.Na.symlink)throw new P(63);c.Na.symlink(c,b,a)}
function pa(a){var b=W(a,{parent:!0}).node,c=nb(a),d=Gb(b,c),f=Ub(b,c,!1);if(f)throw new P(f);if(!b.Na.unlink)throw new P(63);if(d.bb)throw new P(10);try{V.willDeletePath&&V.willDeletePath(a)}catch(g){F("FS.trackingDelegate['willDeletePath']('"+a+"') threw an exception: "+g.message)}b.Na.unlink(b,c);Ob(d);try{if(V.onDeletePath)V.onDeletePath(a)}catch(g){F("FS.trackingDelegate['onDeletePath']('"+a+"') threw an exception: "+g.message)}}
function Lb(a){a=W(a).node;if(!a)throw new P(44);if(!a.Na.readlink)throw new P(28);return tb(Mb(a.parent),a.Na.readlink(a))}function bc(a,b){a=W(a,{Za:!b}).node;if(!a)throw new P(44);if(!a.Na.Va)throw new P(63);return a.Na.Va(a)}function cc(a){return bc(a,!0)}function dc(a,b){a="string"===typeof a?W(a,{Za:!0}).node:a;if(!a.Na.Ua)throw new P(63);a.Na.Ua(a,{mode:b&4095|a.mode&-4096,timestamp:Date.now()})}
function ec(a){a="string"===typeof a?W(a,{Za:!0}).node:a;if(!a.Na.Ua)throw new P(63);a.Na.Ua(a,{timestamp:Date.now()})}function fc(a,b){if(0>b)throw new P(28);a="string"===typeof a?W(a,{Za:!0}).node:a;if(!a.Na.Ua)throw new P(63);if(R(a.mode))throw new P(31);if(32768!==(a.mode&61440))throw new P(28);var c=Pb(a,"w");if(c)throw new P(c);a.Na.Ua(a,{size:b,timestamp:Date.now()})}
function gc(a,b,c,d){if(""===a)throw new P(44);if("string"===typeof b){var f=Rb[b];if("undefined"===typeof f)throw Error("Unknown file open mode: "+b);b=f}c=b&64?("undefined"===typeof c?438:c)&4095|32768:0;if("object"===typeof a)var g=a;else{a=O(a);try{g=W(a,{Za:!(b&131072)}).node}catch(m){}}f=!1;if(b&64)if(g){if(b&128)throw new P(20);}else g=Zb(a,c,0),f=!0;if(!g)throw new P(44);8192===(g.mode&61440)&&(b&=-513);if(b&65536&&!R(g.mode))throw new P(54);if(!f&&(c=g?40960===(g.mode&61440)?32:R(g.mode)&&
("r"!==Sb(b)||b&512)?31:Pb(g,Sb(b)):44))throw new P(c);b&512&&fc(g,0);b&=-131713;d=Wb({node:g,path:Mb(g),flags:b,seekable:!0,position:0,Oa:g.Oa,Sb:[],error:!1},d);d.Oa.open&&d.Oa.open(d);!e.logReadFiles||b&1||(hc||(hc={}),a in hc||(hc[a]=1,F("FS.trackingDelegate error on read file: "+a)));try{V.onOpenFile&&(g=0,1!==(b&2097155)&&(g|=1),0!==(b&2097155)&&(g|=2),V.onOpenFile(a,g))}catch(m){F("FS.trackingDelegate['onOpenFile']('"+a+"', flags) threw an exception: "+m.message)}return d}
function Kc(a){if(null===a.fd)throw new P(8);a.pb&&(a.pb=null);try{a.Oa.close&&a.Oa.close(a)}catch(b){throw b;}finally{S[a.fd]=null}a.fd=null}function Lc(a,b,c){if(null===a.fd)throw new P(8);if(!a.seekable||!a.Oa.$a)throw new P(70);if(0!=c&&1!=c&&2!=c)throw new P(28);a.position=a.Oa.$a(a,b,c);a.Sb=[]}
function Nc(a,b,c,d,f){if(0>d||0>f)throw new P(28);if(null===a.fd)throw new P(8);if(1===(a.flags&2097155))throw new P(8);if(R(a.node.mode))throw new P(31);if(!a.Oa.read)throw new P(28);var g="undefined"!==typeof f;if(!g)f=a.position;else if(!a.seekable)throw new P(70);b=a.Oa.read(a,b,c,d,f);g||(a.position+=b);return b}
function Oc(a,b,c,d,f,g){if(0>d||0>f)throw new P(28);if(null===a.fd)throw new P(8);if(0===(a.flags&2097155))throw new P(8);if(R(a.node.mode))throw new P(31);if(!a.Oa.write)throw new P(28);a.seekable&&a.flags&1024&&Lc(a,0,2);var m="undefined"!==typeof f;if(!m)f=a.position;else if(!a.seekable)throw new P(70);b=a.Oa.write(a,b,c,d,f,g);m||(a.position+=b);try{if(a.path&&V.onWriteToFile)V.onWriteToFile(a.path)}catch(q){F("FS.trackingDelegate['onWriteToFile']('"+a.path+"') threw an exception: "+q.message)}return b}
function oa(a){var b={encoding:"binary"};b=b||{};b.flags=b.flags||0;b.encoding=b.encoding||"binary";if("utf8"!==b.encoding&&"binary"!==b.encoding)throw Error('Invalid encoding type "'+b.encoding+'"');var c,d=gc(a,b.flags);a=bc(a).size;var f=new Uint8Array(a);Nc(d,f,0,a,0);"utf8"===b.encoding?c=Qa(f,0):"binary"===b.encoding&&(c=f);Kc(d);return c}
function Pc(){P||(P=function(a,b){this.node=b;this.Rb=function(c){this.Ra=c};this.Rb(a);this.message="FS error"},P.prototype=Error(),P.prototype.constructor=P,[44].forEach(function(a){Fb[a]=new P(a);Fb[a].stack="<generic error, no stack>"}))}var Qc;function Rc(a,b){var c=0;a&&(c|=365);b&&(c|=146);return c}
function ea(a,b){var c=a?O("//"+a):"/";a=Rc(!0,!0);c=Zb(c,(void 0!==a?a:438)&4095|32768,0);if(b){if("string"===typeof b){for(var d=Array(b.length),f=0,g=b.length;f<g;++f)d[f]=b.charCodeAt(f);b=d}dc(c,a|146);d=gc(c,577);Oc(d,b,0,b.length,0,void 0);Kc(d);dc(c,a)}}
function Sc(a,b,c){a=O("/dev/"+a);var d=Rc(!!b,!!c);Tc||(Tc=64);var f=Tc++<<8|0;xb(f,{open:function(g){g.seekable=!1},close:function(){c&&c.buffer&&c.buffer.length&&c(10)},read:function(g,m,q,w){for(var u=0,C=0;C<w;C++){try{var I=b()}catch(aa){throw new P(29);}if(void 0===I&&0===u)throw new P(6);if(null===I||void 0===I)break;u++;m[q+C]=I}u&&(g.node.timestamp=Date.now());return u},write:function(g,m,q,w){for(var u=0;u<w;u++)try{c(m[q+u])}catch(C){throw new P(29);}w&&(g.node.timestamp=Date.now());return u}});
$b(a,d,f)}var Tc,Y={},Xb,hc,Uc={};
function Vc(a,b,c){try{var d=a(b)}catch(f){if(f&&f.node&&O(b)!==O(Mb(f.node)))return-54;throw f;}J[c>>2]=d.dev;J[c+4>>2]=0;J[c+8>>2]=d.ino;J[c+12>>2]=d.mode;J[c+16>>2]=d.nlink;J[c+20>>2]=d.uid;J[c+24>>2]=d.gid;J[c+28>>2]=d.rdev;J[c+32>>2]=0;K=[d.size>>>0,(L=d.size,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[c+40>>2]=K[0];J[c+44>>2]=K[1];J[c+48>>2]=4096;J[c+52>>2]=d.blocks;J[c+56>>2]=d.atime.getTime()/1E3|0;J[c+60>>2]=
0;J[c+64>>2]=d.mtime.getTime()/1E3|0;J[c+68>>2]=0;J[c+72>>2]=d.ctime.getTime()/1E3|0;J[c+76>>2]=0;K=[d.ino>>>0,(L=d.ino,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[c+80>>2]=K[0];J[c+84>>2]=K[1];return 0}var Wc=void 0;function Xc(){Wc+=4;return J[Wc-4>>2]}function Z(a){a=S[a];if(!a)throw new P(8);return a}var Yc;Yc=va?function(){var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:function(){return performance.now()};
var Zc={};function $c(){if(!ad){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"===typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:sa||"./this.program"},b;for(b in Zc)void 0===Zc[b]?delete a[b]:a[b]=Zc[b];var c=[];for(b in a)c.push(b+"="+a[b]);ad=c}return ad}var ad;
function Qb(a,b,c,d){a||(a=this);this.parent=a;this.Xa=a.Xa;this.bb=null;this.id=Jb++;this.name=b;this.mode=c;this.Na={};this.Oa={};this.rdev=d}Object.defineProperties(Qb.prototype,{read:{get:function(){return 365===(this.mode&365)},set:function(a){a?this.mode|=365:this.mode&=-366}},write:{get:function(){return 146===(this.mode&146)},set:function(a){a?this.mode|=146:this.mode&=-147}}});Pc();T=Array(4096);Yb(Q,"/");X("/tmp");X("/home");X("/home/web_user");
(function(){X("/dev");xb(259,{read:function(){return 0},write:function(b,c,d,f){return f}});$b("/dev/null",259);wb(1280,zb);wb(1536,Ab);$b("/dev/tty",1280);$b("/dev/tty1",1536);var a=ob();Sc("random",a);Sc("urandom",a);X("/dev/shm");X("/dev/shm/tmp")})();
(function(){X("/proc");var a=X("/proc/self");X("/proc/self/fd");Yb({Xa:function(){var b=Eb(a,"fd",16895,73);b.Na={lookup:function(c,d){var f=S[+d];if(!f)throw new P(8);c={parent:null,Xa:{Cb:"fake"},Na:{readlink:function(){return f.path}}};return c.parent=c}};return b}},"/proc/self/fd")})();function fa(a,b){var c=Array(ca(a)+1);a=k(a,c,0,c.length);b&&(c.length=a);return c}
var cd={a:function(a,b,c,d){E("Assertion failed: "+y(a)+", at: "+[b?y(b):"unknown filename",c,d?y(d):"unknown function"])},r:function(a,b){kb||(kb=!0,gb());a=new Date(1E3*J[a>>2]);J[b>>2]=a.getSeconds();J[b+4>>2]=a.getMinutes();J[b+8>>2]=a.getHours();J[b+12>>2]=a.getDate();J[b+16>>2]=a.getMonth();J[b+20>>2]=a.getFullYear()-1900;J[b+24>>2]=a.getDay();var c=new Date(a.getFullYear(),0,1);J[b+28>>2]=(a.getTime()-c.getTime())/864E5|0;J[b+36>>2]=-(60*a.getTimezoneOffset());var d=(new Date(a.getFullYear(),
6,1)).getTimezoneOffset();c=c.getTimezoneOffset();a=(d!=c&&a.getTimezoneOffset()==Math.min(c,d))|0;J[b+32>>2]=a;a=J[jb()+(a?4:0)>>2];J[b+40>>2]=a;return b},w:function(a,b){try{a=y(a);if(b&-8)var c=-28;else{var d;(d=W(a,{Za:!0}).node)?(a="",b&4&&(a+="r"),b&2&&(a+="w"),b&1&&(a+="x"),c=a&&Pb(d,a)?-2:0):c=-44}return c}catch(f){return"undefined"!==typeof Y&&f instanceof P||E(f),-f.Ra}},D:function(a,b){try{return a=y(a),dc(a,b),0}catch(c){return"undefined"!==typeof Y&&c instanceof P||E(c),-c.Ra}},t:function(a){try{return a=
y(a),ec(a),0}catch(b){return"undefined"!==typeof Y&&b instanceof P||E(b),-b.Ra}},E:function(a,b){try{var c=S[a];if(!c)throw new P(8);dc(c.node,b);return 0}catch(d){return"undefined"!==typeof Y&&d instanceof P||E(d),-d.Ra}},u:function(a){try{var b=S[a];if(!b)throw new P(8);ec(b.node);return 0}catch(c){return"undefined"!==typeof Y&&c instanceof P||E(c),-c.Ra}},b:function(a,b,c){Wc=c;try{var d=Z(a);switch(b){case 0:var f=Xc();return 0>f?-28:gc(d.path,d.flags,0,f).fd;case 1:case 2:return 0;case 3:return d.flags;
case 4:return f=Xc(),d.flags|=f,0;case 12:return f=Xc(),Ga[f+0>>1]=2,0;case 13:case 14:return 0;case 16:case 8:return-28;case 9:return J[bd()>>2]=28,-1;default:return-28}}catch(g){return"undefined"!==typeof Y&&g instanceof P||E(g),-g.Ra}},H:function(a,b){try{var c=Z(a);return Vc(bc,c.path,b)}catch(d){return"undefined"!==typeof Y&&d instanceof P||E(d),-d.Ra}},x:function(a,b,c){try{var d=S[a];if(!d)throw new P(8);if(0===(d.flags&2097155))throw new P(28);fc(d.node,c);return 0}catch(f){return"undefined"!==
typeof Y&&f instanceof P||E(f),-f.Ra}},A:function(a,b){try{if(0===b)return-28;if(b<ca("/")+1)return-68;k("/",n,a,b);return a}catch(c){return"undefined"!==typeof Y&&c instanceof P||E(c),-c.Ra}},B:function(){return 0},e:function(){return 42},k:function(a,b,c){Wc=c;try{var d=Z(a);switch(b){case 21509:case 21505:return d.tty?0:-59;case 21510:case 21511:case 21512:case 21506:case 21507:case 21508:return d.tty?0:-59;case 21519:if(!d.tty)return-59;var f=Xc();return J[f>>2]=0;case 21520:return d.tty?-28:
-59;case 21531:a=f=Xc();if(!d.Oa.Kb)throw new P(59);return d.Oa.Kb(d,b,a);case 21523:return d.tty?0:-59;case 21524:return d.tty?0:-59;default:E("bad ioctl syscall "+b)}}catch(g){return"undefined"!==typeof Y&&g instanceof P||E(g),-g.Ra}},F:function(a,b){try{return a=y(a),Vc(cc,a,b)}catch(c){return"undefined"!==typeof Y&&c instanceof P||E(c),-c.Ra}},G:function(a,b){try{return a=y(a),a=O(a),"/"===a[a.length-1]&&(a=a.substr(0,a.length-1)),X(a,b),0}catch(c){return"undefined"!==typeof Y&&c instanceof P||
E(c),-c.Ra}},K:function(a,b,c,d,f,g){try{a:{g<<=12;var m=!1;if(0!==(d&16)&&0!==a%65536)var q=-28;else{if(0!==(d&32)){var w=Bb(b);if(!w){q=-48;break a}m=!0}else{var u=S[f];if(!u){q=-8;break a}var C=g;if(0!==(c&2)&&0===(d&2)&&2!==(u.flags&2097155))throw new P(2);if(1===(u.flags&2097155))throw new P(2);if(!u.Oa.ib)throw new P(43);var I=u.Oa.ib(u,a,b,C,c,d);w=I.Pb;m=I.lb}Uc[w]={Mb:w,Lb:b,lb:m,fd:f,Ob:c,flags:d,offset:g};q=w}}return q}catch(aa){return"undefined"!==typeof Y&&aa instanceof P||E(aa),-aa.Ra}},
J:function(a,b){try{var c=Uc[a];if(0!==b&&c){if(b===c.Lb){var d=S[c.fd];if(d&&c.Ob&2){var f=c.flags,g=c.offset,m=n.slice(a,a+b);d&&d.Oa.jb&&d.Oa.jb(d,m,g,b,f)}Uc[a]=null;c.lb&&ia(c.Mb)}var q=0}else q=-28;return q}catch(w){return"undefined"!==typeof Y&&w instanceof P||E(w),-w.Ra}},h:function(a,b,c){Wc=c;try{var d=y(a),f=c?Xc():0;return gc(d,b,f).fd}catch(g){return"undefined"!==typeof Y&&g instanceof P||E(g),-g.Ra}},z:function(a,b,c){try{a=y(a);if(0>=c)var d=-28;else{var f=Lb(a),g=Math.min(c,ca(f)),
m=x[b+g];k(f,n,b,c+1);x[b+g]=m;d=g}return d}catch(q){return"undefined"!==typeof Y&&q instanceof P||E(q),-q.Ra}},v:function(a){try{a=y(a);var b=W(a,{parent:!0}).node,c=nb(a),d=Gb(b,c),f=Ub(b,c,!0);if(f)throw new P(f);if(!b.Na.rmdir)throw new P(63);if(d.bb)throw new P(10);try{V.willDeletePath&&V.willDeletePath(a)}catch(g){F("FS.trackingDelegate['willDeletePath']('"+a+"') threw an exception: "+g.message)}b.Na.rmdir(b,c);Ob(d);try{if(V.onDeletePath)V.onDeletePath(a)}catch(g){F("FS.trackingDelegate['onDeletePath']('"+
a+"') threw an exception: "+g.message)}return 0}catch(g){return"undefined"!==typeof Y&&g instanceof P||E(g),-g.Ra}},i:function(a,b){try{return a=y(a),Vc(bc,a,b)}catch(c){return"undefined"!==typeof Y&&c instanceof P||E(c),-c.Ra}},y:function(a){try{return a=y(a),pa(a),0}catch(b){return"undefined"!==typeof Y&&b instanceof P||E(b),-b.Ra}},I:function(){return 2147483648},m:function(a,b,c){n.copyWithin(a,b,b+c)},d:function(a){var b=n.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*
(1+.2/c);d=Math.min(d,a+100663296);d=Math.max(a,d);0<d%65536&&(d+=65536-d%65536);a:{try{Ja.grow(Math.min(2147483648,d)-Sa.byteLength+65535>>>16);Ta();var f=1;break a}catch(g){}f=void 0}if(f)return!0}return!1},q:function(a){for(var b=Yc();Yc()-b<a;);},o:function(a,b){var c=0;$c().forEach(function(d,f){var g=b+c;f=J[a+4*f>>2]=g;for(g=0;g<d.length;++g)x[f++>>0]=d.charCodeAt(g);x[f>>0]=0;c+=d.length+1});return 0},p:function(a,b){var c=$c();J[a>>2]=c.length;var d=0;c.forEach(function(f){d+=f.length+1});
J[b>>2]=d;return 0},c:function(a){try{var b=Z(a);Kc(b);return 0}catch(c){return"undefined"!==typeof Y&&c instanceof P||E(c),c.Ra}},n:function(a,b){try{var c=Z(a);x[b>>0]=c.tty?2:R(c.mode)?3:40960===(c.mode&61440)?7:4;return 0}catch(d){return"undefined"!==typeof Y&&d instanceof P||E(d),d.Ra}},g:function(a,b,c,d){try{a:{for(var f=Z(a),g=a=0;g<c;g++){var m=J[b+(8*g+4)>>2],q=Nc(f,x,J[b+8*g>>2],m,void 0);if(0>q){var w=-1;break a}a+=q;if(q<m)break}w=a}J[d>>2]=w;return 0}catch(u){return"undefined"!==typeof Y&&
u instanceof P||E(u),u.Ra}},l:function(a,b,c,d,f){try{var g=Z(a);a=4294967296*c+(b>>>0);if(-9007199254740992>=a||9007199254740992<=a)return-61;Lc(g,a,d);K=[g.position>>>0,(L=g.position,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[f>>2]=K[0];J[f+4>>2]=K[1];g.pb&&0===a&&0===d&&(g.pb=null);return 0}catch(m){return"undefined"!==typeof Y&&m instanceof P||E(m),m.Ra}},s:function(a){try{var b=Z(a);return b.Oa&&b.Oa.fsync?-b.Oa.fsync(b):
0}catch(c){return"undefined"!==typeof Y&&c instanceof P||E(c),c.Ra}},f:function(a,b,c,d){try{a:{for(var f=Z(a),g=a=0;g<c;g++){var m=Oc(f,x,J[b+8*g>>2],J[b+(8*g+4)>>2],void 0);if(0>m){var q=-1;break a}a+=m}q=a}J[d>>2]=q;return 0}catch(w){return"undefined"!==typeof Y&&w instanceof P||E(w),w.Ra}},j:function(a){var b=Date.now();J[a>>2]=b/1E3|0;J[a+4>>2]=b%1E3*1E3|0;return 0},L:function(a){var b=Date.now()/1E3|0;a&&(J[a>>2]=b);return b},C:function(a,b){if(b){var c=b+8;b=1E3*J[c>>2];b+=J[c+4>>2]/1E3}else b=
Date.now();a=y(a);try{var d=W(a,{Za:!0}).node;d.Na.Ua(d,{timestamp:Math.max(b,b)});var f=0}catch(g){if(!(g instanceof P)){b:{f=Error();if(!f.stack){try{throw Error();}catch(m){f=m}if(!f.stack){f="(no stack trace available)";break b}}f=f.stack.toString()}e.extraStackTrace&&(f+="\n"+e.extraStackTrace());f=fb(f);throw g+" : "+f;}f=g.Ra;J[bd()>>2]=f;f=-1}return f}};
(function(){function a(f){e.asm=f.exports;Ja=e.asm.M;Ta();H=e.asm.Da;Va.unshift(e.asm.N);Ya--;e.monitorRunDependencies&&e.monitorRunDependencies(Ya);0==Ya&&(null!==Za&&(clearInterval(Za),Za=null),$a&&(f=$a,$a=null,f()))}function b(f){a(f.instance)}function c(f){return db().then(function(g){return WebAssembly.instantiate(g,d)}).then(function(g){return g}).then(f,function(g){F("failed to asynchronously prepare wasm: "+g);E(g)})}var d={a:cd};Ya++;e.monitorRunDependencies&&e.monitorRunDependencies(Ya);
if(e.instantiateWasm)try{return e.instantiateWasm(d,a)}catch(f){return F("Module.instantiateWasm callback failed with error: "+f),!1}(function(){return Fa||"function"!==typeof WebAssembly.instantiateStreaming||ab()||M.startsWith("file://")||"function"!==typeof fetch?c(b):fetch(M,{credentials:"same-origin"}).then(function(f){return WebAssembly.instantiateStreaming(f,d).then(b,function(g){F("wasm streaming compile failed: "+g);F("falling back to ArrayBuffer instantiation");return c(b)})})})();return{}})();
e.___wasm_call_ctors=function(){return(e.___wasm_call_ctors=e.asm.N).apply(null,arguments)};e._sqlite3_free=function(){return(e._sqlite3_free=e.asm.O).apply(null,arguments)};var bd=e.___errno_location=function(){return(bd=e.___errno_location=e.asm.P).apply(null,arguments)};e._sqlite3_step=function(){return(e._sqlite3_step=e.asm.Q).apply(null,arguments)};e._sqlite3_finalize=function(){return(e._sqlite3_finalize=e.asm.R).apply(null,arguments)};
e._sqlite3_prepare_v2=function(){return(e._sqlite3_prepare_v2=e.asm.S).apply(null,arguments)};e._sqlite3_reset=function(){return(e._sqlite3_reset=e.asm.T).apply(null,arguments)};e._sqlite3_clear_bindings=function(){return(e._sqlite3_clear_bindings=e.asm.U).apply(null,arguments)};e._sqlite3_value_blob=function(){return(e._sqlite3_value_blob=e.asm.V).apply(null,arguments)};e._sqlite3_value_text=function(){return(e._sqlite3_value_text=e.asm.W).apply(null,arguments)};
e._sqlite3_value_bytes=function(){return(e._sqlite3_value_bytes=e.asm.X).apply(null,arguments)};e._sqlite3_value_double=function(){return(e._sqlite3_value_double=e.asm.Y).apply(null,arguments)};e._sqlite3_value_int=function(){return(e._sqlite3_value_int=e.asm.Z).apply(null,arguments)};e._sqlite3_value_type=function(){return(e._sqlite3_value_type=e.asm._).apply(null,arguments)};e._sqlite3_result_blob=function(){return(e._sqlite3_result_blob=e.asm.$).apply(null,arguments)};
e._sqlite3_result_double=function(){return(e._sqlite3_result_double=e.asm.aa).apply(null,arguments)};e._sqlite3_result_error=function(){return(e._sqlite3_result_error=e.asm.ba).apply(null,arguments)};e._sqlite3_result_int=function(){return(e._sqlite3_result_int=e.asm.ca).apply(null,arguments)};e._sqlite3_result_int64=function(){return(e._sqlite3_result_int64=e.asm.da).apply(null,arguments)};e._sqlite3_result_null=function(){return(e._sqlite3_result_null=e.asm.ea).apply(null,arguments)};
e._sqlite3_result_text=function(){return(e._sqlite3_result_text=e.asm.fa).apply(null,arguments)};e._sqlite3_column_count=function(){return(e._sqlite3_column_count=e.asm.ga).apply(null,arguments)};e._sqlite3_data_count=function(){return(e._sqlite3_data_count=e.asm.ha).apply(null,arguments)};e._sqlite3_column_blob=function(){return(e._sqlite3_column_blob=e.asm.ia).apply(null,arguments)};e._sqlite3_column_bytes=function(){return(e._sqlite3_column_bytes=e.asm.ja).apply(null,arguments)};
e._sqlite3_column_double=function(){return(e._sqlite3_column_double=e.asm.ka).apply(null,arguments)};e._sqlite3_column_text=function(){return(e._sqlite3_column_text=e.asm.la).apply(null,arguments)};e._sqlite3_column_type=function(){return(e._sqlite3_column_type=e.asm.ma).apply(null,arguments)};e._sqlite3_column_name=function(){return(e._sqlite3_column_name=e.asm.na).apply(null,arguments)};e._sqlite3_bind_blob=function(){return(e._sqlite3_bind_blob=e.asm.oa).apply(null,arguments)};
e._sqlite3_bind_double=function(){return(e._sqlite3_bind_double=e.asm.pa).apply(null,arguments)};e._sqlite3_bind_int=function(){return(e._sqlite3_bind_int=e.asm.qa).apply(null,arguments)};e._sqlite3_bind_text=function(){return(e._sqlite3_bind_text=e.asm.ra).apply(null,arguments)};e._sqlite3_bind_parameter_index=function(){return(e._sqlite3_bind_parameter_index=e.asm.sa).apply(null,arguments)};e._sqlite3_sql=function(){return(e._sqlite3_sql=e.asm.ta).apply(null,arguments)};
e._sqlite3_normalized_sql=function(){return(e._sqlite3_normalized_sql=e.asm.ua).apply(null,arguments)};e._sqlite3_errmsg=function(){return(e._sqlite3_errmsg=e.asm.va).apply(null,arguments)};e._sqlite3_exec=function(){return(e._sqlite3_exec=e.asm.wa).apply(null,arguments)};e._sqlite3_changes=function(){return(e._sqlite3_changes=e.asm.xa).apply(null,arguments)};e._sqlite3_close_v2=function(){return(e._sqlite3_close_v2=e.asm.ya).apply(null,arguments)};
e._sqlite3_create_function_v2=function(){return(e._sqlite3_create_function_v2=e.asm.za).apply(null,arguments)};e._sqlite3_open=function(){return(e._sqlite3_open=e.asm.Aa).apply(null,arguments)};var da=e._malloc=function(){return(da=e._malloc=e.asm.Ba).apply(null,arguments)},ia=e._free=function(){return(ia=e._free=e.asm.Ca).apply(null,arguments)};e._RegisterExtensionFunctions=function(){return(e._RegisterExtensionFunctions=e.asm.Ea).apply(null,arguments)};
e._RegisterCSVTable=function(){return(e._RegisterCSVTable=e.asm.Fa).apply(null,arguments)};
var jb=e.__get_tzname=function(){return(jb=e.__get_tzname=e.asm.Ga).apply(null,arguments)},ib=e.__get_daylight=function(){return(ib=e.__get_daylight=e.asm.Ha).apply(null,arguments)},hb=e.__get_timezone=function(){return(hb=e.__get_timezone=e.asm.Ia).apply(null,arguments)},ka=e.stackSave=function(){return(ka=e.stackSave=e.asm.Ja).apply(null,arguments)},ma=e.stackRestore=function(){return(ma=e.stackRestore=e.asm.Ka).apply(null,arguments)},v=e.stackAlloc=function(){return(v=e.stackAlloc=e.asm.La).apply(null,
arguments)},Cb=e._memalign=function(){return(Cb=e._memalign=e.asm.Ma).apply(null,arguments)};e.cwrap=function(a,b,c,d){c=c||[];var f=c.every(function(g){return"number"===g});return"string"!==b&&f&&!d?La(a):function(){return Ma(a,b,c,arguments)}};e.UTF8ToString=y;e.stackSave=ka;e.stackRestore=ma;e.stackAlloc=v;var dd;$a=function ed(){dd||fd();dd||($a=ed)};
function fd(){function a(){if(!dd&&(dd=!0,e.calledRun=!0,!Ka)){e.noFSInit||Qc||(Qc=!0,Pc(),e.stdin=e.stdin,e.stdout=e.stdout,e.stderr=e.stderr,e.stdin?Sc("stdin",e.stdin):ac("/dev/tty","/dev/stdin"),e.stdout?Sc("stdout",null,e.stdout):ac("/dev/tty","/dev/stdout"),e.stderr?Sc("stderr",null,e.stderr):ac("/dev/tty1","/dev/stderr"),gc("/dev/stdin",0),gc("/dev/stdout",1),gc("/dev/stderr",1));Kb=!1;eb(Va);if(e.onRuntimeInitialized)e.onRuntimeInitialized();if(e.postRun)for("function"==typeof e.postRun&&
(e.postRun=[e.postRun]);e.postRun.length;){var b=e.postRun.shift();Wa.unshift(b)}eb(Wa)}}if(!(0<Ya)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;)Xa();eb(Ua);0<Ya||(e.setStatus?(e.setStatus("Running..."),setTimeout(function(){setTimeout(function(){e.setStatus("")},1);a()},1)):a())}}e.run=fd;if(e.preInit)for("function"==typeof e.preInit&&(e.preInit=[e.preInit]);0<e.preInit.length;)e.preInit.pop()();fd();


        // The shell-pre.js and emcc-generated code goes above
        return Module;
    }); // The end of the promise being returned

  return initSqlJsPromise;
} // The end of our initSqlJs function

// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
// However, we don't want to use the emcc modularization. See shell-pre.js
if (typeof exports === 'object' && typeof module === 'object'){
    module.exports = initSqlJs;
    // This will allow the module to be used in ES6 or CommonJS
    module.exports.default = initSqlJs;
}
else if (typeof define === 'function' && define['amd']) {
    define([], function() { return initSqlJs; });
}
else if (typeof exports === 'object'){
    exports["Module"] = initSqlJs;
}
/* global initSqlJs */
/* eslint-env worker */
/* eslint no-restricted-globals: ["error"] */

"use strict";

var db;

function onModuleReady(SQL) {
    function createDb(data) {
        if (db != null) db.close();
        db = new SQL.Database(data);
        return db;
    }

    var buff; var data; var result;
    data = this["data"];
    var config = data["config"] ? data["config"] : {};
    switch (data && data["action"]) {
        case "open":
            buff = data["buffer"];
            createDb(buff && new Uint8Array(buff));
            return postMessage({
                id: data["id"],
                ready: true
            });
        case "createCSVTable":
            if (db === null) {
                createDb();
            }
            buff = data["buffer"];
            fileName = data["fileName"];
            return postMessage({
                id: data["id"],
                results: db.createCSVTable(buff && new Uint8Array(buff), fileName)
            });
        case "exec":
            if (db === null) {
                createDb();
            }
            if (!data["sql"]) {
                throw "exec: Missing query string";
            }
            return postMessage({
                id: data["id"],
                results: db.exec(data["sql"], data["params"], config)
            });
        case "each":
            if (db === null) {
                createDb();
            }
            var callback = function callback(row) {
                return postMessage({
                    id: data["id"],
                    row: row,
                    finished: false
                });
            };
            var done = function done() {
                return postMessage({
                    id: data["id"],
                    finished: true
                });
            };
            return db.each(data["sql"], data["params"], callback, done, config);
        case "export":
            buff = db["export"]();
            result = {
                id: data["id"],
                buffer: buff
            };
            try {
                return postMessage(result, [result]);
            } catch (error) {
                return postMessage(result);
            }
        case "close":
            if (db) {
                db.close();
            }
            return postMessage({
                id: data["id"]
            });
        default:
            throw new Error("Invalid action : " + (data && data["action"]));
    }
}

function onError(err) {
    return postMessage({
        id: this["data"]["id"],
        error: err["message"]
    });
}

if (typeof importScripts === "function") {
    db = null;
    var sqlModuleReady = initSqlJs();
    self.onmessage = function onmessage(event) {
        return sqlModuleReady
            .then(onModuleReady.bind(event))
            .catch(onError.bind(event));
    };
}
