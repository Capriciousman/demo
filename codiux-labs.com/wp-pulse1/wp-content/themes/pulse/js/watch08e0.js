(function(window){var _watch=function(elements,props,options,callback){var self=this;var check;var toArray;toArray=function(obj){var arr=[];for(var i=obj.length>>>0;i--;){arr[i]=obj[i];}
return arr;};check=function(e){var self=this;for(var i=0;i<self.watching.length;i++){var data=self.watching[i];var changed=true;var temp;for(var j=0;j<data.props.length;j++){temp=self.attributes[data.props[j]]||self.style[data.props[j]];if(data.vals[j]!=temp){data.vals[j]=temp;data.changed[j]=true;}}
for(var k=0;k<data.props.length;k++){if(!data.changed[k]){changed=false;break;}}
if(changed&&data.callback){data.callback.apply(self,e);}};};elements=toArray(elements);if(typeof(options)=='function'){callback=options;options={};}
if(typeof(callback)!='function'){callback=function(){};}
options.throttle=options.throttle||10;for(var i=0;i<elements.length;i++){var element=elements[i];var data={props:props.split(' '),vals:[],changed:[],callback:callback};for(var j=0;j<data.props.length;j++){data.vals[j]=element.attributes[data.props[j]]||element.style[data.props[j]];data.changed[j]=false;}
if(!element.watching){element.watching=[];}
element.watching.push(data);var observer=new MutationObserver(function(mutations){for(var k=0;k<mutations.length;k++){check.call(mutations[k].target,mutations[k]);}});observer.observe(element,{subtree:false,attributes:true});}
return self;};window.watch=function(){return _watch.apply(arguments[0],arguments);};(function($){$.fn.watch=function(){Array.prototype.unshift.call(arguments,this);return _watch.apply(this,arguments);};})(jQuery);})(window);if(typeof WeakMap==='undefined'){(function(){var defineProperty=Object.defineProperty;var counter=Date.now()%1e9;var WeakMap=function(){this.name='__st'+(Math.random()*1e9>>>0)+(counter++ +'__');};WeakMap.prototype={set:function(key,value){var entry=key[this.name];if(entry&&entry[0]===key)
entry[1]=value;else
defineProperty(key,this.name,{value:[key,value],writable:true});},get:function(key){var entry;return(entry=key[this.name])&&entry[0]===key?entry[1]:undefined;},delete:function(key){var entry=key[this.name];if(!entry)return false;var hasValue=entry[0]===key;entry[0]=entry[1]=undefined;return hasValue;},has:function(key){var entry=key[this.name];if(!entry)return false;return entry[0]===key;}};window.WeakMap=WeakMap;})();}
(function(global){var registrationsTable=new WeakMap();var setImmediate=window.msSetImmediate;if(!setImmediate){var setImmediateQueue=[];var sentinel=String(Math.random());window.addEventListener('message',function(e){if(e.data===sentinel){var queue=setImmediateQueue;setImmediateQueue=[];queue.forEach(function(func){func();});}});setImmediate=function(func){setImmediateQueue.push(func);window.postMessage(sentinel,'*');};}
var isScheduled=false;var scheduledObservers=[];function scheduleCallback(observer){scheduledObservers.push(observer);if(!isScheduled){isScheduled=true;setImmediate(dispatchCallbacks);}}
function wrapIfNeeded(node){return window.ShadowDOMPolyfill&&window.ShadowDOMPolyfill.wrapIfNeeded(node)||node;}
function dispatchCallbacks(){isScheduled=false;var observers=scheduledObservers;scheduledObservers=[];observers.sort(function(o1,o2){return o1.uid_-o2.uid_;});var anyNonEmpty=false;observers.forEach(function(observer){var queue=observer.takeRecords();removeTransientObserversFor(observer);if(queue.length){observer.callback_(queue,observer);anyNonEmpty=true;}});if(anyNonEmpty)
dispatchCallbacks();}
function removeTransientObserversFor(observer){observer.nodes_.forEach(function(node){var registrations=registrationsTable.get(node);if(!registrations)
return;registrations.forEach(function(registration){if(registration.observer===observer)
registration.removeTransientObservers();});});}
function forEachAncestorAndObserverEnqueueRecord(target,callback){for(var node=target;node;node=node.parentNode){var registrations=registrationsTable.get(node);if(registrations){for(var j=0;j<registrations.length;j++){var registration=registrations[j];var options=registration.options;if(node!==target&&!options.subtree)
continue;var record=callback(options);if(record)
registration.enqueue(record);}}}}
var uidCounter=0;function JsMutationObserver(callback){this.callback_=callback;this.nodes_=[];this.records_=[];this.uid_=++uidCounter;}
JsMutationObserver.prototype={observe:function(target,options){target=wrapIfNeeded(target);if(!options.childList&&!options.attributes&&!options.characterData||options.attributeOldValue&&!options.attributes||options.attributeFilter&&options.attributeFilter.length&&!options.attributes||options.characterDataOldValue&&!options.characterData){throw new SyntaxError();}
var registrations=registrationsTable.get(target);if(!registrations)
registrationsTable.set(target,registrations=[]);var registration;for(var i=0;i<registrations.length;i++){if(registrations[i].observer===this){registration=registrations[i];registration.removeListeners();registration.options=options;break;}}
if(!registration){registration=new Registration(this,target,options);registrations.push(registration);this.nodes_.push(target);}
registration.addListeners();},disconnect:function(){this.nodes_.forEach(function(node){var registrations=registrationsTable.get(node);for(var i=0;i<registrations.length;i++){var registration=registrations[i];if(registration.observer===this){registration.removeListeners();registrations.splice(i,1);break;}}},this);this.records_=[];},takeRecords:function(){var copyOfRecords=this.records_;this.records_=[];return copyOfRecords;}};function MutationRecord(type,target){this.type=type;this.target=target;this.addedNodes=[];this.removedNodes=[];this.previousSibling=null;this.nextSibling=null;this.attributeName=null;this.attributeNamespace=null;this.oldValue=null;}
function copyMutationRecord(original){var record=new MutationRecord(original.type,original.target);record.addedNodes=original.addedNodes.slice();record.removedNodes=original.removedNodes.slice();record.previousSibling=original.previousSibling;record.nextSibling=original.nextSibling;record.attributeName=original.attributeName;record.attributeNamespace=original.attributeNamespace;record.oldValue=original.oldValue;return record;};var currentRecord,recordWithOldValue;function getRecord(type,target){return currentRecord=new MutationRecord(type,target);}
function getRecordWithOldValue(oldValue){if(recordWithOldValue)
return recordWithOldValue;recordWithOldValue=copyMutationRecord(currentRecord);recordWithOldValue.oldValue=oldValue;return recordWithOldValue;}
function clearRecords(){currentRecord=recordWithOldValue=undefined;}
function recordRepresentsCurrentMutation(record){return record===recordWithOldValue||record===currentRecord;}
function selectRecord(lastRecord,newRecord){if(lastRecord===newRecord)
return lastRecord;if(recordWithOldValue&&recordRepresentsCurrentMutation(lastRecord))
return recordWithOldValue;return null;}
function Registration(observer,target,options){this.observer=observer;this.target=target;this.options=options;this.transientObservedNodes=[];}
Registration.prototype={enqueue:function(record){var records=this.observer.records_;var length=records.length;if(records.length>0){var lastRecord=records[length-1];var recordToReplaceLast=selectRecord(lastRecord,record);if(recordToReplaceLast){records[length-1]=recordToReplaceLast;return;}}else{scheduleCallback(this.observer);}
records[length]=record;},addListeners:function(){this.addListeners_(this.target);},addListeners_:function(node){var options=this.options;if(options.attributes)
node.addEventListener('DOMAttrModified',this,true);if(options.characterData)
node.addEventListener('DOMCharacterDataModified',this,true);if(options.childList)
node.addEventListener('DOMNodeInserted',this,true);if(options.childList||options.subtree)
node.addEventListener('DOMNodeRemoved',this,true);},removeListeners:function(){this.removeListeners_(this.target);},removeListeners_:function(node){var options=this.options;if(options.attributes)
node.removeEventListener('DOMAttrModified',this,true);if(options.characterData)
node.removeEventListener('DOMCharacterDataModified',this,true);if(options.childList)
node.removeEventListener('DOMNodeInserted',this,true);if(options.childList||options.subtree)
node.removeEventListener('DOMNodeRemoved',this,true);},addTransientObserver:function(node){if(node===this.target)
return;this.addListeners_(node);this.transientObservedNodes.push(node);var registrations=registrationsTable.get(node);if(!registrations)
registrationsTable.set(node,registrations=[]);registrations.push(this);},removeTransientObservers:function(){var transientObservedNodes=this.transientObservedNodes;this.transientObservedNodes=[];transientObservedNodes.forEach(function(node){this.removeListeners_(node);var registrations=registrationsTable.get(node);for(var i=0;i<registrations.length;i++){if(registrations[i]===this){registrations.splice(i,1);break;}}},this);},handleEvent:function(e){e.stopImmediatePropagation();switch(e.type){case'DOMAttrModified':var name=e.attrName;var namespace=e.relatedNode.namespaceURI;var target=e.target;var record=new getRecord('attributes',target);record.attributeName=name;record.attributeNamespace=namespace;var oldValue=e.attrChange===MutationEvent.ADDITION?null:e.prevValue;forEachAncestorAndObserverEnqueueRecord(target,function(options){if(!options.attributes)
return;if(options.attributeFilter&&options.attributeFilter.length&&options.attributeFilter.indexOf(name)===-1&&options.attributeFilter.indexOf(namespace)===-1){return;}
if(options.attributeOldValue)
return getRecordWithOldValue(oldValue);return record;});break;case'DOMCharacterDataModified':var target=e.target;var record=getRecord('characterData',target);var oldValue=e.prevValue;forEachAncestorAndObserverEnqueueRecord(target,function(options){if(!options.characterData)
return;if(options.characterDataOldValue)
return getRecordWithOldValue(oldValue);return record;});break;case'DOMNodeRemoved':this.addTransientObserver(e.target);case'DOMNodeInserted':var target=e.relatedNode;var changedNode=e.target;var addedNodes,removedNodes;if(e.type==='DOMNodeInserted'){addedNodes=[changedNode];removedNodes=[];}else{addedNodes=[];removedNodes=[changedNode];}
var previousSibling=changedNode.previousSibling;var nextSibling=changedNode.nextSibling;var record=getRecord('childList',target);record.addedNodes=addedNodes;record.removedNodes=removedNodes;record.previousSibling=previousSibling;record.nextSibling=nextSibling;forEachAncestorAndObserverEnqueueRecord(target,function(options){if(!options.childList)
return;return record;});}
clearRecords();}};global.JsMutationObserver=JsMutationObserver;if(!global.MutationObserver)
global.MutationObserver=JsMutationObserver;})(this);