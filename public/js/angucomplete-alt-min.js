/*! Copyright (c) 2014 Hidenari Nozaki and contributors | Licensed under the MIT license */
!function(e,t){"use strict";"undefined"!=typeof module&&module.exports?module.exports=t(require("angular")):"function"==typeof define&&define.amd?define(["angular"],t):t(e.angular)}(window,function(e){"use strict";e.module("angucomplete-alt",[]).directive("angucompleteAlt",["$q","$parse","$http","$sce","$timeout","$templateCache","$interpolate",function(e,t,n,r,l,i,a){var o=40,s=39,c=38,u=37,d=27,p=13,g=9,h=3,f=524288,m=500,v=200,S="autocomplete-required",x="Searching...",w="No results found",C="/angucomplete-alt/index.html";function R(t,i,a,C){var R,I,y,b,D,F,$=i.find("input"),O=h,q=null,U=S,j=null,H=null,N=!1,T=i[0].querySelector(".angucomplete-dropdown"),k=!1,E=null;function A(e,n){e&&("object"==typeof e?(t.searchStr=V(e),M({originalObject:e})):"string"==typeof e&&e.length>0?t.searchStr=e:console&&console.error&&console.error("Tried to set "+(n?"initial":"")+" value of angucomplete to",e,"which is an invalid value"),z(!0))}function L(e){E=null,t.hideResults(e),document.body.removeEventListener("click",L)}function B(e){return e.which?e.which:e.keyCode}function M(e){"function"==typeof t.selectedObject?t.selectedObject(e,t.selectedObjectData):t.selectedObject=e,z(!!e)}function V(e){return t.titleField.split(",").map(function(t){return _(e,t)}).join(" ")}function _(e,t){var n,r;if(t){n=t.split("."),r=e;for(var l=0;l<n.length;l++)r=r[n[l]]}else r=e;return r}function W(e,n){var l,i,a;if(a=new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"),e)return e.match&&e.replace||(e=e.toString()),l=(i=e.match(a))?e.replace(a,'<span class="'+t.matchClass+'">'+i[0]+"</span>"):e,r.trustAsHtml(l)}function z(e){t.notEmpty=e,j=t.searchStr,t.fieldRequired&&C&&t.inputName&&C[t.inputName].$setValidity(U,e)}function Y(e){var n;!t.overrideSuggestions||t.selectedObject&&t.selectedObject.originalObject===t.searchStr||(e&&e.preventDefault(),l.cancel(q),X(),n=t.searchStr,t.exactMatch||(M({originalObject:n}),t.clearSelected&&(t.searchStr=null),te()))}function G(){return i[0].querySelectorAll(".angucomplete-row")[t.currentIndex]}function J(e){T.scrollTop=T.scrollTop+e}function K(){var e=t.results[t.currentIndex];t.matchClass?$.val(V(e.originalObject)):$.val(e.title)}function P(e){return function(n,r,l,i){r||l||i||!n.data||(n=n.data),t.searching=!1,le(_(I(n),t.remoteUrlDataField),e)}}function Q(e,n,r,l){t.searching=N,n||r||l||(n=e.status),0!==n&&-1!==n&&(t.remoteUrlErrorCallback?t.remoteUrlErrorCallback(e,n,r,l):console&&console.error&&console.error("http error"))}function X(){H&&H.resolve()}function Z(r){var l={},i=t.remoteUrl+encodeURIComponent(r);t.remoteUrlRequestFormatter&&(l={params:t.remoteUrlRequestFormatter(r)},i=t.remoteUrl),t.remoteUrlRequestWithCredentials&&(l.withCredentials=!0),X(),H=e.defer(),l.timeout=H.promise,N=!0,n.get(i,l).then(P(r)).catch(Q).finally(function(){N=!1})}function ee(n){X(),H=e.defer(),t.remoteApiHandler(n,H.promise).then(P(n)).catch(Q)}function te(){t.showDropdown=!1,t.results=[],T&&(T.scrollTop=0)}function ne(){t.showDropdown=b,t.currentIndex=t.focusFirst?0:-1,t.results=[]}function re(e){!e||e.length<O||(t.localData?t.$apply(function(){var n;n=void 0!==t.localSearch()?t.localSearch()(e,t.localData):function(e){var n,r,l,i,a=t.searchFields.split(","),o=[];for(void 0!==t.parseInput()&&(e=t.parseInput()(e)),n=0;n<t.localData.length;n++){for(r=!1,l=0;l<a.length;l++)i=_(t.localData[n],a[l])||"",r=r||i.toString().toLowerCase().indexOf(e.toString().toLowerCase())>=0;r&&(o[o.length]=t.localData[n])}return o}(e),t.searching=!1,le(n,e)}):t.remoteApiHandler?ee(e):Z(e))}function le(e,n){var r,l,i,a,o,s;if(e)for(t.results=[],r=0;r<e.length;r++)t.titleField&&""!==t.titleField&&(a=o=V(e[r])),l="",t.descriptionField&&(l=s=_(e[r],t.descriptionField)),i="",t.imageField&&(i=_(e[r],t.imageField)),t.matchClass&&(o=W(a,n),s=W(l,n)),t.results[t.results.length]={title:o,description:s,image:i,originalObject:e[r]};else t.results=[];t.autoMatch&&1===t.results.length&&function(e,n,r){if(!r)return!1;for(var l in n)if(n[l].toLowerCase()===r.toLowerCase())return t.exactMatch=!0,t.selectResult(e),!0;return t.exactMatch=!1,!1}(t.results[0],{title:a,desc:l||""},t.searchStr)?t.showDropdown=!1:0!==t.results.length||D?t.showDropdown=!0:t.showDropdown=!1}function ie(){t.localData?(t.searching=!1,le(t.localData,"")):t.remoteApiHandler?(t.searching=!0,ee("")):(t.searching=!0,Z(""))}i.on("mousedown",function(e){e.target.id?(E=e.target.id)===t.id+"_dropdown"&&document.body.addEventListener("click",L):(E=e.target.className,e.target.innerText===t.textNoResults&&t.hideResults(e))}),t.currentIndex=t.focusFirst?0:null,t.searching=!1,y=t.$watch("initialValue",function(e){e&&(y(),A(e,!0))}),t.$watch("fieldRequired",function(e,n){e!==n&&(e?j&&-1!==t.currentIndex?z(!0):z(!1):C[t.inputName].$setValidity(U,!0))}),t.$on("angucomplete-alt:clearInput",function(e,n){n&&n!==t.id||(t.searchStr=null,M(),z(!1),te())}),t.$on("angucomplete-alt:changeInput",function(e,n,r){n&&n===t.id&&A(r)}),t.onFocusHandler=function(){t.focusIn&&t.focusIn(),0!==O||t.searchStr&&0!==t.searchStr.length||(t.currentIndex=t.focusFirst?0:t.currentIndex,t.showDropdown=!0,ie())},t.hideResults=function(){E&&(E===t.id+"_dropdown"||E.indexOf("angucomplete")>=0)?E=null:(R=l(function(){te(),t.$apply(function(){t.searchStr&&$.val(t.searchStr)})},v),X(),t.focusOut&&t.focusOut(),t.overrideSuggestions&&t.searchStr&&-1===t.currentIndex&&Y())},t.resetHideResults=function(){R&&l.cancel(R)},t.hoverRow=function(e){t.currentIndex=e},t.selectResult=function(e){t.matchClass&&(e.title=V(e.originalObject),e.description=_(e.originalObject,t.descriptionField)),t.clearSelected?t.searchStr=null:t.searchStr=e.title,M(e),te()},t.inputChangeHandler=function(e){return e.length<O?(X(),te()):0===e.length&&0===O&&ie(),t.inputChanged&&(e=t.inputChanged(e)),e},t.fieldRequiredClass&&""!==t.fieldRequiredClass&&(U=t.fieldRequiredClass),t.minlength&&""!==t.minlength&&(O=parseInt(t.minlength,10)),t.pause||(t.pause=m),t.clearSelected||(t.clearSelected=!1),t.overrideSuggestions||(t.overrideSuggestions=!1),t.fieldRequired&&C&&(t.initialValue?z(!0):z(!1)),t.inputType=a.type?a.type:"text",t.textSearching=a.textSearching?a.textSearching:x,t.textNoResults=a.textNoResults?a.textNoResults:w,b="false"!==t.textSearching,D="false"!==t.textNoResults,t.maxlength=a.maxlength?a.maxlength:f,$.on("keydown",function(e){var n,r,l=B(e),i=null,a=null;l===p&&t.results?(t.currentIndex>=0&&t.currentIndex<t.results.length?(e.preventDefault(),t.selectResult(t.results[t.currentIndex])):(Y(e),te()),t.$apply()):l===o&&t.results?(e.preventDefault(),t.currentIndex+1<t.results.length&&t.showDropdown&&(t.$apply(function(){t.currentIndex++,K()}),k&&(i=G(),T.getBoundingClientRect().top+parseInt(getComputedStyle(T).maxHeight,10)<i.getBoundingClientRect().bottom&&J((n=i,r=getComputedStyle(n),n.offsetHeight+parseInt(r.marginTop,10)+parseInt(r.marginBottom,10)))))):l===c&&t.results?(e.preventDefault(),t.currentIndex>=1?(t.$apply(function(){t.currentIndex--,K()}),k&&(a=G().getBoundingClientRect().top-(T.getBoundingClientRect().top+parseInt(getComputedStyle(T).paddingTop,10)))<0&&J(a-1)):0===t.currentIndex&&t.$apply(function(){t.currentIndex=-1,$.val(t.searchStr)})):l===g?t.results&&t.showDropdown?-1===t.currentIndex&&t.overrideSuggestions?Y():(-1===t.currentIndex&&(t.currentIndex=0),t.selectResult(t.results[t.currentIndex]),t.$digest()):t.searchStr&&Y():l===d&&e.preventDefault()}),$.on("keyup compositionend",function(e){var n=B(e);if(n!==u&&n!==s)if(n===c||n===p)e.preventDefault();else if(n===o)e.preventDefault(),!t.showDropdown&&t.searchStr&&t.searchStr.length>=O&&(ne(),t.searching=!0,re(t.searchStr));else if(n===d)te(),t.$apply(function(){$.val(t.searchStr)});else{if(0===O&&!t.searchStr)return;t.searchStr&&""!==t.searchStr?t.searchStr.length>=O&&(ne(),q&&l.cancel(q),t.searching=!0,q=l(function(){re(t.searchStr)},t.pause)):t.showDropdown=!1,j&&j!==t.searchStr&&!t.clearSelected&&t.$apply(function(){M()})}}),F="remoteUrlResponseFormatter",I=function(e){return t[F]?t[F](e):e},l(function(){var e=getComputedStyle(T);k=e.maxHeight&&"auto"===e.overflowY})}return i.put(C,'<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">  <input id="{{id}}_value" name="{{inputName}}" tabindex="{{fieldTabindex}}" ng-class="{\'angucomplete-input-not-empty\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ng-bind="textNoResults"></div>    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">      <div ng-if="imageField" class="angucomplete-image-holder">        <img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/>        <div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div>      </div>      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>      <div ng-if="matchClass && result.description && result.description != \'\'" class="angucomplete-description" ng-bind-html="result.description"></div>      <div ng-if="!matchClass && result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div>    </div>  </div></div>'),{restrict:"EA",require:"^?form",scope:{selectedObject:"=",selectedObjectData:"=",disableInput:"=",initialValue:"=",localData:"=",localSearch:"&",remoteUrlRequestFormatter:"=",remoteUrlRequestWithCredentials:"@",remoteUrlResponseFormatter:"=",remoteUrlErrorCallback:"=",remoteApiHandler:"=",id:"@",type:"@",placeholder:"@",textSearching:"@",textNoResults:"@",remoteUrl:"@",remoteUrlDataField:"@",titleField:"@",descriptionField:"@",imageField:"@",inputClass:"@",pause:"@",searchFields:"@",minlength:"@",matchClass:"@",clearSelected:"@",overrideSuggestions:"@",fieldRequired:"=",fieldRequiredClass:"@",inputChanged:"=",autoMatch:"@",focusOut:"&",focusIn:"&",fieldTabindex:"@",inputName:"@",focusFirst:"@",parseInput:"&"},templateUrl:function(e,t){return t.templateUrl||C},compile:function(e){var t=a.startSymbol(),n=a.endSymbol();if("{{"!==t||"}}"!==n){var r=e.html().replace(/\{\{/g,t).replace(/\}\}/g,n);e.html(r)}return R}}}])});
