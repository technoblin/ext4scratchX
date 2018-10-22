/*******************************************************************************
 * ext4ScratchX - Fr
 *
 * Créer par ethernety.net le 05/11/2016 <Jean BLIN>
 * Inspiré par Xi4s v.004 du 07/11/2014 par Alan Yorinks
 * Version v.001
 *
 * Documentations ScratchX
 * https://github.com/LLK/scratchx/wiki#load-a-javascript-file
 *
 * @author: Jean BLIN <piext@ethernety.net>
 * @Copyright (c) 2016 Jean BLIN right reserved.
 *
 ******************************************************************************/
new function(){var e=this;console.log("ext4ScratchX v1.0 par Ethernety.net");var r="20181020",t={traduir:function(e,r){var t=this[e];for(var n in r)t=t.replace("%"+n,r[n]);return t},offline:"Hors ligne",online:"Connecté","err-unknow":"Code d'erreur inconnue %code","err-board":" de la carte %board","err-pin":" pour la pin %pin","err-init-board":"Il faut initialiser la carte %board avant de l'utiliser.","err-init-pin":"Il faut initialiser %msg de la carte %board sur la pin %pin.","err-led":"le bandeau à leds","err-connect":"Pas de réponse du serveur %ip! Avez-vous pensé à démarrer le service piext pour la carte %board? Vérifier le service sur la carte, la connexion sur le réseau, puis essayer à nouveau.","err-message":"Message retourné par la carte %board non reconu : %msg.","err-noboard":"La carte %board n'est pas rattachée à un serveur piext.","err-nomode":"Le mode %mode n'est pas reconnue par cette version de ext4ScratchX.","err-2pins":"L'initialisation d'un pilote de moteur pas à pas doit ce faire sur 2 pins différentes! Essayez à nouveau.","err-4pins":"L'initialisation d'un moteur pas à pas doit ce faire sur 4 pins différentes! Essayez à nouveau.","err-version":"La version du serveur de la carte %board n'est pas suffisante. Veuillez effectuer une mise à jour avant de poursuivre.","server-version":"Le serveur de la carte %board à l'adresse %ip en est à la version %version.","trace-virtual":"Affectation de la carte %board au simulateur.","trace-connect":"Affectation de la carte %board au serveur piext %ip.","trace-link":"Canal ouvert pour la carte %board sur le serveur %ip.","trace-uplink":"Canal rataché pour la carte %board sur le serveur %ip.","trace-nblink":"Nombre de connexion ouverte vers des serveurs piext : %nb.","trace-message":"Réception d'un message du serveur %ip = %msg.","trace-close":"Fermeture du canal vers le serveur %ip.","trace-sensor":"Donnée du capteur [%id] = %val.","trace-sensor-key":"Clef du capteur : %key.","trace-input":"La pin %pin de la carte %board n'est pas initialisée comme entrée %type.","trace-set-pin":"Affecter au connecteur %con de la carte %board le module %mode%opt","type-a":"analogique","type-d":"numérique","trace-send":"Transmission du message : %msg.","err-0":"Numéro de pin au delà de ceux admis par la carte.","err-1":"Requette nom supportée par la carte.","err-2":"Ecriture numérique sur la pin impossible.","err-3":"Ecriture analogique sur la pin impossible.","err-4":"Ecriture tone sur la pin impossible.","err-5":"Ecriture servomoteur sur la pin impossible.","err-6":"Ecriture servomoteur sur la pin incompatible (standard).","err-7":"Ecriture servomoteur sur la pin incompatible (continuous).","err-8":"Ecriture servomoteur sur la pin hors limite.","err-9":"Pilotage moteur pas à pas impossible.","err-10":"Mode de la pin déjà définit.","err-11":"Mode incompatible sur la pin.","err-12":"Initialisation du bandeau à leds (rpi).","err-13":"Erreur d'initialisation du bandeau à leds.","err-14":"Erreur d'accès","err-15":"Erreur shield Grove non déclaré","sim-alert-pin":"La pin %pin de la carte %board %msg.","sim-alert-carte":"La carte %board %msg.","sim-err-no-pin":"n'a pas été définit","sim-err-no-mode":"ne peut pas être initialisée dans le mode %mode","sim-err-no-led":"n'a pas éré définit comme LED","sim-err-no-board":"Il faut initialiser la carte %board avant de l'utiliser.","sim-led":"Pin %pin : DEL %wx%h","sim-set":"Pin %pin : %mode"};window.trad=t;var n=function(){var e=null,r={count:0};function t(t,n){var i={stack:new Error("trace"),type:t,message:n};r[r.count++]=i;try{e.content&&e.Console.append(i)}catch(e){}}function n(){try{void 0!=e.Console.clear&&e.Console.clear();for(var t=0;t<r.count;t++)e.Console.append(r[t])}catch(e){setTimeout(n,100)}}function i(){var r,t;e.document.body?(r="console",(t=e.document.createElement("script")).type="text/javascript",t.src="https://technoblin.github.io/ext4scratchX/lib/"+r+".js",t.readyState?t.onreadystatechange=function(){n()}:t.addEventListener?t.addEventListener("load",function(e){n()}):t.attachEvent&&t.attachEvent("onload",function(){n()}),e.document.getElementsByTagName("head")[0].appendChild(t)):setTimeout(i,100)}return{log:function(e){t("log",e)},error:function(e){t("error",e)},draw:function(){null!=e&&null!=e.top||(e=window.open("","_blank","scrollbars=yes,location=no,menubar=no,status=no,titlebar=no,toolbar=no,fullscreen=no,width=320,height=200"),window.cons=e),setTimeout(i,100)},undraw:function(){null!=e&&e.close(),e=null}}},i=function(e,r,t){var n={};function i(e,r){var t=n.board.document.createElement(e);return void 0!=r&&(t.className=r),t}function a(e){n.init++;var r=i("script");r.type="text/javascript",r.src="https://technoblin.github.io/ext4scratchX/lib/"+e+".js",r.readyState?r.onreadystatechange=function(){n.free()}:r.addEventListener?(r.addEventListener("error",function(e){n.free()}),r.addEventListener("load",function(e){n.free()})):r.attachEvent&&(r.attachEvent("onerror",function(){n.free()}),r.attachEvent("onload",function(){n.free()})),n.board.document.getElementsByTagName("head")[0].appendChild(r)}n.init=1,n.boardID=r,n.board=window.open("","_blank","scrollbars=yes,location=no,menubar=no,status=no,titlebar=no,toolbar=no,fullscreen=no,width=320,height=200"),n.close=function(){e.simulateurs[r]=void 0,this.board.close()},n.sendOrder=function(e,r){this.board.Modules.sendOrder(e,r)},n.free=function(){0==--n.init&&(t(),this.board.Modules.init(e,r))};var o=function(){console.log("init simulateur"),n.board.document.body?(!function(e){n.init++;var r=i("link");r.type="text/css",r.rel="stylesheet",r.href="https://technoblin.github.io/ext4scratchX/lib/"+e+".css",r.readyState?r.onreadystatechange=function(){n.free()}:r.addEventListener?(r.addEventListener("error",function(e){n.free()}),r.addEventListener("load",function(e){n.free()})):r.attachEvent&&(r.attachEvent("onerror",function(){n.free()}),r.attachEvent("onload",function(){n.free()})),n.board.document.getElementsByTagName("head")[0].appendChild(r)}("simulateur"),a("jquery-1.11.0.min"),a("jquery-ui-1.10.4.custom.min"),a("simulateur"),n.free()):setTimeout(o,100)};return setTimeout(o,100),n},a={newRoll:function(e){var r={r:0,w:0,0:0};return{push:function(t){r[r.w]!=t&&(r.w=(r.w+1)%e,r[r.w]=t,r.w==r.r&&(r.r=(r.r+1)%e))},pop:function(){var t=r[r.r];return r.r!=r.w&&(r.r=(r.r+1)%e),t}}},newStack:function(e,r){if(void 0==e){var t=newRoll(r);return{push:function(e){t.push(e)},pop:function(e,r){if(void 0==e)return t.pop()}}}e=e.split(":");t={};for(var n=1;n<e.length;n++)t[e[n]]=newRoll(r);return{push:function(r){if((r=r.split(":"))[0]==e[0])for(var n=1;n<e.length;n++)t[e[n]].push(r[n])},pop:function(r,n){if(r==e[0]&&void 0!=t[n])return t[n].pop()}}},simulateurs:{},debugLevel:0,boardStatus:1};a.boardMessage=t.offline,a.trace=function(e,r,i){void 0==this.console&&(this.console=n()),this.debugLevel>=e&&(void 0==i?this.console.log(t[r]):this.console.log(t.traduir(r,i)))},a.error=function(e){void 0==this.console&&(this.console=n()),this.console.error(e),a.boardStatus=0,a.boardMessage=e},a.showConsole=function(e){void 0==this.console&&(this.console=n()),e?this.console.draw():this.console.undraw()},a.webSocketsArray=[],a.boardLinkedArray=[],a.sensorDataArray=[],a.bufferData={},a.isBuffer=function(e,r,n){return void 0!=this.bufferData[e+"_"+r]||(this.error(t.traduir("err-init-pin",{msg:t[n],board:e,pin:r})),!1)},a.pushWebSocket=function(e,r){for(var t=0;t<this.webSocketsArray.length;t++)if(this.webSocketsArray[t].ip===e)return void(this.webSocketsArray[t].ws=r);this.webSocketsArray.push({ip:e,ws:r})},a.foundWebSocket=function(e){for(var r=0;r<this.webSocketsArray.length;r++)if(this.webSocketsArray[r].ip===e&&null!==this.webSocketsArray[r].ws)return r;return-1},a.killWebSocket=function(e){for(var r=0;r<this.webSocketsArray.length;r++)if(this.webSocketsArray[r].ip===e){this.webSocketsArray[r].ws=null;for(var t=0;t<this.boardLinkedArray.length;t++)this.boardLinkedArray[t]===r&&(this.boardLinkedArray[t]=-1);return}},a.shutdown=function(){for(var e=0;e<this.webSocketsArray.length;e++)this.webSocketsArray[e].ws.send("resetBoard");for(e=0;e<this.webSocketsArray.length;e++)this.webSocketsArray[e].ws.onclose=function(){},this.webSocketsArray[e].ws.close();this.webSocketsArray=[],this.boardLinkedArray=[],this.sensorDataArray=[],this.bufferData={};for(var e in this.simulateurs)void 0!=this.simulateurs[e]&&this.simulateurs[e].close()},a.getSocket=function(e){return void 0===this.boardLinkedArray[e]||-1===this.boardLinkedArray[e]?null:this.webSocketsArray[this.boardLinkedArray[e]]},a.linkBoard=function(e,r){this.boardLinkedArray[e]=r},a.unlinkBoard=function(e){this.boardLinkedArray[e]=-1},a.isLinkedBoard=function(e,r){return void 0!==this.boardLinkedArray[e]&&-1!==this.boardLinkedArray[e]||(r||this.error(t.traduir("err-init-board",{board:e})),!1)},a.isSimulateBoard=function(e){return void 0!=this.simulateurs[e]},a.onMessage=function(e,r){var n=e.split("/");switch(n[0]){case"dataUpdate":this.setSensorData(parseInt(n[1]),n[2]);break;case"fatal":void 0==(e=t["err-"+n[1]])&&(e=t.traduir("err-unknow",{code:n[1]})),e+=t.traduir("err-board",r),void 0!=n[2]&&(e+=t.traduir("err-pin",{pin:n[2]})),this.error(e),alert(e);break;case"version":var i=a.foundWebSocket(r.ip);a.webSocketsArray[i].version=n[1],a.trace(1,"server-version",{board:r.board,ip:r.ip,version:n[1]});break;default:a.trace(1,"err-message",{board:r.board,msg:e})}},a.setBoard=function(e,n,o){if(void 0!=this.simulateurs[e]&&this.simulateurs[e].close(),"virtual"==n)a.trace(1,"trace-virtual",{board:e}),this.simulateurs[e]=i(this,e,o);else{var s;a.trace(1,"trace-connect",{ip:n,board:e});var u,d=a.foundWebSocket(n);if(d>=0)a.linkBoard(e,d),a.trace(0,"trace-uplink",{ip:n,board:e}),a.boardStatus=2,a.boardMessage=t.online,(u=this.getSocket(e)).ws.send("resetBoard/"+r),o();else(u=new WebSocket("wss://"+n+":1234")).onerror=function(e){window.open("https://"+n+":1234")},s=window.setTimeout(function(){a.error(t.traduir("err-connect",{ip:n,board:e}))},2e3),u.onopen=function(i){window.clearTimeout(s),a.boardStatus=2,a.boardMessage=t.online,a.pushWebSocket(n,u),a.linkBoard(e,a.foundWebSocket(n)),a.trace(0,"trace-link",{ip:n,board:e}),a.trace(1,"trace-nblink",{nb:a.webSocketsArray.length}),u.send("ext4sOnline/"+r),u.onmessage=function(r){a.trace(1,"trace-message",{ip:n,msg:r.data}),a.onMessage(r.data,{board:e,ip:n})},u.onclose=function(e){a.killWebSocket(n),a.trace(1,"trace-close",{ip:n}),a.boardStatus=1,a.boardMessage=t.offline},o()}}},a.addShield=function(e,r,t){var n=r.split(".");void 0=={1:"GrovePi",2:"ServoHat",3:"TSNeoLed"}[n[0]]?this.trace(1,"err-1",{}):this.sendOrder("addShield",e,n[0]+"/"+t)},a.setSensorData=function(e,r){this.trace(2,"trace-sensor",{id:e,val:r}),this.sensorDataArray[e].stack.push(r)},a.getSensorData=function(e,r,t,n){var i=this.getIndexSensor(e,r);return-1==i?0:this.sensorDataArray[i].stack.pop(t,n)},a.keyGen=function(e,r){return this.isSimulateBoard(e)?"S"+e+r:this.isLinkedBoard(e,!0)?"R"+this.boardLinkedArray[e]+r:-1},a.setIndexSensor=function(e,r,t){this.keyGen(e,r);for(var n=0;n<this.sensorDataArray.length&&this.sensorDataArray[n].key!==keyGen;n++);return this.sensorDataArray[n]={key:keyGen,stack:this.newStack(t,10)},n},a.getIndexSensor=function(e,r){var t="";if(this.isSimulateBoard(e))t="S"+e+r;else{if(!this.isLinkedBoard(e,!0))return-1;t="R"+this.boardLinkedArray[e]+r}for(var n=0;n<this.sensorDataArray.length;n++)if(this.sensorDataArray[n].key===t)return n;return-1},a.setDigitPin=function(e,r,t,n){this.trace(1,"trace-set-pin",{board:e,con:r,mode:t,opt:n.length>0?" (option : "+n+")":""}),r=parseInt(r[1]);var i=t.split(".");if((i=parseInt(i[0]))>=11&&!this.isVersion(e,"20180322"))this.trace(1,"err-version",{board:e});else if(!Number.isNaN(i)&&!Number.isNaN(r)){if(this.isDigitSensor(i))n=this.setIndexSensor(e,"D"+r,this.getDigitSensorType(i))+"/"+n;this.sendOrder("setDigit",e,r+"/"+i+"/"+n)}},a.setAnalogPin=function(e,r,t,n){this.trace(1,"trace-set-pin",{board:e,con:r,mode:t,opt:n.length>0?" (option : "+n+")":""}),r=parseInt(r[1]);var i=t.split(".");if(i=parseInt(i[0]),!Number.isNaN(i)&&!Number.isNaN(r)){if(this.isAnalogSensor(i))n=this.setIndexSensor(e,"A"+r,this.getAnalogSensorType(i))+"/"+n;this.sendOrder("setAnalog",e,r+"/"+i+"/"+n)}},a.setModuleMode=function(e,r,t){this.trace(1,"trace-set-pin",{board:e,con:"I2C ou série",mode:r,opt:t.length>0?" (option : "+t+")":""});var n=r.split(".");if(n=parseInt(n[0]),!Number.isNaN(n)){if(this.isModuleSensor(n))t=this.setIndexSensor(e,this.getModuleAddr(n),this.getModuleSensorType(n))+"/"+t;this.sendOrder("setModule",e,n+"/"+t)}},a.sendOrder=function(e,r,t){if(this.isSimulateBoard(r))this.simulateurs[r].sendOrder(e+"/"+r+"/"+t);else if(this.isLinkedBoard(r)){var n=this.boardLinkedArray[r];this.getSocket(r).ws.send(e+"/"+n+"/"+t),this.trace(2,"trace-send",{msg:e+"/"+r+":="+n+"/"+t})}},a.isVersion=function(e,r){if(this.isSimulateBoard(e))return!0;if(this.isLinkedBoard(e)){var t=this.webSocketsArray[this.boardLinkedArray[e]];return void 0!=t.version&&parseInt(t.version)>=parseInt(r)}return!1},a.encodeText=function(e){var r="";e=""+e;for(var t=0;t<e.length;t++){for(var n=""+e[t].charCodeAt(0).toString(16);n.length<2;)n="0"+n;r+=n}return r};var o=function(e,r,t,n,i,a){t--,--r<0||t<0||r>=n||t>=i||(e[r+(t=i-t-1)*n]=a)};a.initLed=function(e,r,t,n){var i=t*n;this.sendOrder("initLED",e,r+"/"+t+"/"+n),this.bufferData[e+"_"+r]={w:parseInt(t),h:parseInt(n),value:{length:i}};for(var a=0;a<i;a++)this.bufferData[e+"_"+r].value[a]=0},a.setXYLed=function(e,r,t,n,i){this.isBuffer(e,r,"err-led")&&o(this.bufferData[e+"_"+r].value,t,n,this.bufferData[e+"_"+r].w,this.bufferData[e+"_"+r].h,i)},a.fixeLeds=function(e,r){if(this.isBuffer(e,r,"err-led")){value=""+r;for(var t=-1,n=0,i=this.bufferData[e+"_"+r].value,a=0;a<i.length;a++)if(t==i[a])n++;else{if(t=parseInt(t,10).toString(35),n<3)for(;n-- >0;)value+="/"+t;else value+="/z/"+n.toString(35)+"/"+t;t=i[a],n=1}if(t=parseInt(t,10).toString(35),n<3)for(;n-- >0;)value+="/"+t;else value+="/z/"+n.toString(35)+"/"+t;this.sendOrder("fixeLED",e,value)}},a.resetLed=function(e,r){if(this.isBuffer(e,r,"err-led")){for(var t=0;t<this.bufferData[e+"_"+r].value.length;t++)this.bufferData[e+"_"+r].value[t]=0;this.sendOrder("resetLED",e,r)}},a.drawLine=function(e,r,t,n,i,a,s){if(this.isBuffer(e,r,"err-led")){var u=this.bufferData[e+"_"+r].value,d=this.bufferData[e+"_"+r].w,l=this.bufferData[e+"_"+r].h;if(t=parseInt(t),i=parseInt(i),n=parseInt(n),a=parseInt(a),i<t){var c=t;t=i,i=c,c=n,n=a,a=c}var f=i-t,m=a-n,p=1,h=t,b=n;if(m<0&&(m=-m,p=-1),o(u,h,b,d,l,s),m>f){var v=(S=2*f)-m,g=2*(f-m);if(p>0)for(;b<a;)b++,v<=0?v+=S:(v+=g,h++),o(u,h,b,d,l,s);else for(;b>a;)b--,v<=0?v+=S:(v+=g,h++),o(u,h,b,d,l,s)}else{var S;for(v=(S=2*m)-f,g=2*(m-f);h<i;)h++,v<=0?v+=S:(v+=g,b+=p),o(u,h,b,d,l,s)}}},a.drawRect=function(e,r,t,n,i,a,s){if(this.isBuffer(e,r,"err-led")){var u=this.bufferData[e+"_"+r].value,d=this.bufferData[e+"_"+r].w,l=this.bufferData[e+"_"+r].h;if(t>i){var c=t;t=i,i=c}if(n>a){c=n;n=a,a=c}for(var f=t;f<=i;f++)o(u,f,n,d,l,s),o(u,f,a,d,l,s);for(var m=n;m<=a;m++)o(u,t,m,d,l,s),o(u,i,m,d,l,s)}},a.colorRect=function(e,r,t,n,i,a,s){if(this.isBuffer(e,r,"err-led")){var u=this.bufferData[e+"_"+r].value,d=this.bufferData[e+"_"+r].w,l=this.bufferData[e+"_"+r].h;if(t>i){var c=t;t=i,i=c}if(n>a){c=n;n=a,a=c}for(var f=n<1?1:n;f<=l&&f<=a;f++)for(var m=t<1?1:t;m<=d&&m<=i;m++)o(u,m,f,d,l,s)}},a.drawMask=function(e,r,t,n,i,a,s,u){if(this.isBuffer(e,r,"err-led"))for(var d=this.bufferData[e+"_"+r].value,l=this.bufferData[e+"_"+r].w,c=this.bufferData[e+"_"+r].h,f=0;f<u;f++)for(var m=0;m<s;m++){var p=1&a;a=(a-p)/2,o(d,t+m,n+f,l,c,0==p?0:i)}},a.drawPicture=function(e,r,t,n,i,a){if(this.isBuffer(e,r,"err-led"))for(var s=this.bufferData[e+"_"+r].value,u=this.bufferData[e+"_"+r].w,d=this.bufferData[e+"_"+r].h,l=0,c=0,f=i.split("/"),m=parseInt(f[0]),p=2;p<f.length;p++)if("z"==f[p])for(var h=parseInt(f[++p],35),b=parseInt(f[++p],35);h-- >0;)o(s,l+t,c+n,u,d,b),++l>=m&&(l=0,c++);else o(s,l+t,c+n,u,d,parseInt(f[p],35)),++l>=m&&(l=0,c++)},a.isDigitSensor=function(e){return-1!=[3,8,9,10,11].indexOf(e)},a.getDigitSensorType=function(e){return{9:"DHT:1:2"}[e]},a.isAnalogSensor=function(e){return-1!=[1,2,3,4].indexOf(e)},a.getAnalogSensorType=function(e){return{4:"JOY:1:2:3"}[e]},a.isModuleSensor=function(e){return void 0!=this.getModuleAddr(e)},a.getModuleAddr=function(e){return{4:"SP",7:"i0x4a"}[e]},a.getModuleSensorType=function(e){return{5:"GPS:1:2:3:-",7:"MTB:4:5:6"}[e]},a.police5x5={0:15521390,1:6426766,2:16267327,3:16265743,4:12920808,5:32554511,6:31505966,7:33038466,8:15252014,9:15268367,A:4540401,B:16301615,C:31491134,D:16303663,E:32545855,F:32545825,G:31516222,H:18415153,I:32641183,J:32776486,K:18128177,L:1082431,M:18732593,N:18470705,O:15255086,P:16301089,Q:15258934,R:16301617,S:31504911,T:32641156,U:18400814,V:18400580,W:18405233,X:18157905,Y:18157700,Z:32772191," ":0,".":198,",":4226,"'":4325376,'"':10813440,"(":8523912,")":2232450,"[":12718220,"]":6426758,"{":12720268,"}":6434950,"#":11512810,"+":145536,"-":14336,"*":332096,"/":266304,err:33412991},a.police5x7={0:4657433924,1:4503769247,2:15619854431,3:15619998254,4:17452574696,5:33321107983,6:15604368942,7:33831522434,8:15621113390,9:15621636623,A:15621670449,B:16694887983,C:15603893806,D:7836583207,E:16140960831,F:33321092129,G:15603922478,H:18842895921,I:33424543903,J:33563092262,K:18560947505,L:1108378687,M:19192792625,N:18916238897,O:15621211694,P:16694871073,Q:15621215542,R:16694875441,S:32247333391,T:33424543876,U:18842437166,V:18842429764,W:18842572106,X:18834663985,Y:18834657412,Z:33831389247," ":0,".":198,",":4226,"'":6648037376,'"':11072962560,"(":8728481928,")":2286030978,"[":13023449228,"]":6580998278,"{":8728416392,"}":2286162050,"#":11788430314,"+":4657152,"-":458752,"*":10627072,"/":17456826433,err:33885449791},e._shutdown=function(){a.shutdown()},e._getStatus=function(){return{status:a.boardStatus,msg:a.boardMessage}},e.setBoard=function(e,r,t){a.setBoard(e,r,t)},e.addShield=function(e,r,t){a.addShield(e,r,t)},e.digitPin=function(e,r,t,n){a.setDigitPin(e,r,t,""+n)},e.analogPin=function(e,r,t,n){a.setAnalogPin(e,r,t,""+n)},e.moduleMode=function(e,r,t){a.setModuleMode(e,r,t)},e.digitWrite=function(e,r,t){r=parseInt(r[1]),t="Off"==t?0:1,Number.isNaN(r)||a.sendOrder("digitWrite",e,r+"/"+t)},e.chainableWrite=function(e,r,t,n){r=parseInt(r[1]),t=parseInt(t)-1,n=parseInt(n),Number.isNaN(r)||a.sendOrder("CLED",e,r+"/set/"+t+"/"+n)},e.barWrite=function(e,r,t,n){r=parseInt(r[1]),t=parseInt(t),n="Off"==n?0:1,Number.isNaN(r)||a.sendOrder("LBar",e,r+"/set/"+t+"/"+n)},e.barLevel=function(e,r,t,n){r=parseInt(r[1]),t=parseInt(t),(n=parseInt(n))<1&&(n=1),t<0?t=0:t>n&&(t=n),t=Math.round(10*t/n),Number.isNaN(r)||a.sendOrder("LBar",e,r+"/level/"+t)},e.barConfig=function(e,r,t){r=parseInt(r[1]);var n={1:"clear",2:"redFirst",3:"redLast",4:"full"};Number.isNaN(r)||void 0==n[t[0]]||a.sendOrder("LBar",e,r+"/"+n[t[0]])},e.digitDisp=function(e,r,t){r=parseInt(r[1]),Number.isNaN(r)||a.sendOrder("4DD",e,r+"/set/"+t)},e.LCDTxt=function(e,r,t){a.sendOrder("LCD",e,"print/"+a.encodeText(r)+"/"+a.encodeText(t))},e.LCDRgb=function(e,r){a.sendOrder("LCD",e,"color/"+r)},e.LCDMode=function(e,r){void 0!={1:"LCDclear",2:"LCDblink",3:"LCDblinkLed",4:"LCDnoblink",5:"LCDnoblinkLed"}[(r=r.split("."))[0]]&&a.sendOrder("LCD",e,"set/"+r[0])},e.oLEDtxt=function(e,r){a.sendOrder("oLED",e,"print/"+a.encodeText(r))},e.oLEDXY=function(e,r,t){a.sendOrder("oLED",e,"move/"+r+"/"+t)},e.oLEDclear=function(e){a.sendOrder("oLED",e,"clear")},e.oLEDbright=function(e,r){Number.isNaN(r)||a.sendOrder("oLED",e,"bright/"+parseInt(r))},e.getDigitalInputState=function(e,r,t){t=t[0];var n=a.getSensorData(e,r);return"1"==t?1==n:1!=n},e.getDigitalInputData=function(e,r){return 1==a.getSensorData(e,r)},e.getAnalogSensorData=function(e,r){return a.getSensorData(e,r)},e.getDigitValue=function(e,r,t){switch(t=parseInt(t.split(".")[0])){case 1:case 2:return a.getSensorData(e,r,"DHT",t);case 3:return a.getSensorData(e,r)}return 0},e.getAnalogValue=function(e,r,t){switch(t=parseInt(t.split(".")[0])){case 1:case 2:case 3:return a.getSensorData(e,r,"JOY",t)}return 0},e.getModValue=function(e,r){switch(r=parseInt(r.split(".")[0])){case 1:case 2:case 3:return a.getSensorData(e,"SP","GPS",r);case 4:case 5:case 6:return a.getSensorData(e,"i0x4a","MTB",r)}return 0},e.motorMode=function(e,r,t){r=parseInt(r),t=t.split("."),a.sendOrder("SMD",e,r+"/mode/"+t[0])},e.motorWalk=function(e,r,t){r=parseInt(r),t=parseInt(t),a.sendOrder("SMD",e,r+"/walk/"+t)},e.motorBreak=function(e,r){r=parseInt(r),a.sendOrder("SMD",e,r+"/break")},e.motorStart=function(e,r,t,n){r=parseInt(r),t=parseInt(t),n=parseInt(n),a.sendOrder("SMD",e,r+"/start/"+t+"/"+n)},e.motorStop=function(e,r,t){r=parseInt(r),t=parseInt(t),a.sendOrder("SMD",e,r+"/stop/"+t)},e.servoStart=function(e,r,t,n){r=parseInt(r),t=parseInt(t),n=parseInt(n),a.sendOrder("APH",e,r+"/start/"+t+"/"+n)},e.servoStop=function(e,r,t){r=parseInt(r),t=parseInt(t),a.sendOrder("APH",e,r+"/stop/"+t)},e.servoFreq=function(e,r,t){r=parseInt(r),t=parseInt(t),a.sendOrder("APH",e,r+"/freq/"+t)},e.initLed=function(e,r,t,n){a.initLed(e,n,r,t)},e.setXYLed=function(e,r,t,n,i){a.setXYLed(e,i,r,t,n)},e.drawLine=function(e,r,t,n,i,o,s){a.drawLine(e,s,r,t,n,i,o)},e.drawRect=function(e,r,t,n,i,o,s){a.drawRect(e,s,r,t,n,i,o)},e.colorRect=function(e,r,t,n,i,o,s){a.colorRect(e,s,r,t,n,i,o)},e.drawTxt=function(e,r,t,n,i,o){n=(n=""+n).toUpperCase(),r=parseInt(r),t=parseInt(t);for(var s=0;s<n.length;s++){var u=a.police5x5[n[s]];void 0==u&&(u=a.police5x5.err),a.drawMask(e,o,r+6*s,t,i,u,5,5)}},e.drawPicture=function(e,r,t,n,i){a.drawPicture(e,i,parseInt(r),parseInt(t),n,!0)},e.addPicture=function(e,r,t,n,i){a.drawPicture(e,i,parseInt(r),parseInt(t),n,!1)},e.fixeLeds=function(e,r){a.fixeLeds(e,r)},e.resetLed=function(e,r){a.resetLed(e,r)},e.calcRVB=function(e,r,t){return 256*(256*parseInt(e)+parseInt(r))+parseInt(t)},e.setDebugLevel=function(e){e=e.split("."),a.debugLevel=parseInt(e[0])},e.setConsole=function(){a.showConsole(!0)},e.unsetConsole=function(){a.showConsole(!1)};ScratchExtensions.register("ext4ScratchX v 1.0",{blocks:[["w","X0 - Carte %m.bdNum Adresse IP: %s","setBoard","1","virtual"],[" ","X1 - Carte %m.bdNum Initialiser la carte %m.shield ( %s )","addShield","1","Choisir une carte",""],[" ","G1.1 - Carte %m.bdNum Init. D %m.digitPin avec %m.moduleDigit ( %s )","digitPin","1","Choisir une E/S","Choisir un module",""],[" ","G1.2 - Carte %m.bdNum Init. A %m.analogPin avec %m.moduleAnalog ( %s )","analogPin","1","Choisir une E/S","Choisir un module",""],[" ","G1.3 - Carte %m.bdNum Init. M %m.moduleMode ( %s )","moduleMode","1","Choisir un mode",""],[" ","M1.4 - Carte %m.bdNum Init. la matrice de %n x %n leds sur %m.ledPin .","initLed","1","20","15","1"],[" ","G1.1.1 - Carte %m.bdNum Mettre %m.digitPin à la valeur %m.onOff ","digitWrite","1","Choisir une E/S","Off"],[" ","G1.1.2 - Carte %m.bdNum Sur %m.digitPin mettre la LED %n à %n . ","chainableWrite","1","Choisir une E/S","1","255"],[" ","G1.1.3 - Carte %m.bdNum Sur %m.digitPin mettre la LED %m.bdNum à %m.onOff . ","barWrite","1","Choisir une E/S","1","Off"],[" ","G1.1.4 - Carte %m.bdNum Sur %m.digitPin afficher le score %n sur %n . ","barLevel","1","Choisir une E/S","1","10"],[" ","G1.1.5 - Carte %m.bdNum Sur %m.digitPin faire %m.ledBar . ","barConfig","1","Choisir une E/S","1. Effacer"],[" ","G1.1.6 - Carte %m.bdNum Sur %m.digitPin afficher %s . ","digitDisp","1","Choisir une E/S","00:00"],[" ","G3.1 - Carte %m.bdNum LCD écrire %s %s .","LCDTxt","1","Ligne 1","Ligne 2"],[" ","G3.2 - Carte %m.bdNum LCD éclairer %n .","LCDRgb","1","255"],[" ","G3.3 - Carte %m.bdNum LCD %m.LCD .","LCDMode","1","Choisir une action"],[" ","G3.4 - Carte %m.bdNum oLed écrire %s .","oLEDtxt","1","Texte"],[" ","G3.5 - Carte %m.bdNum oLed placer curseur %n %n .","oLEDXY","1","0","0"],[" ","G3.6 - Carte %m.bdNum effacer l'écran oLed.","oLEDclear","1"],[" ","G3.7 - Carte %m.bdNum régler contrast à %s .","oLEDbright","1","100"],[" ","M4.1 - Carte %m.bdNum Affecter à la led ( %n ; %n ) la couleur %n sur %m.ledPin .","setXYLed","1","1","1","255","1"],[" ","M4.2 - Carte %m.bdNum Tracer la ligne de ( %n ; %n ) à ( %n ; %n ) de couleur %n sur %m.ledPin .","drawLine","1","1","1","5","5","255","1"],[" ","M4.3 - Carte %m.bdNum Tracer le rectangle de ( %n ; %n ) à ( %n ; %n ) de couleur %n sur %m.ledPin .","drawRect","1","1","1","5","5","255","1"],[" ","M4.4 - Carte %m.bdNum Remplir le rectangle de ( %n ; %n ) à ( %n ; %n ) de couleur %n sur %m.ledPin .","colorRect","1","1","1","5","5","255","1"],[" ","M4.5 - Carte %m.bdNum Écrire en ( %n ; %n ) le texte %s de couleur %n sur %m.ledPin .","drawTxt","1","1","1","TEXTE","255","1"],[" ","M4.6 - Carte %m.bdNum Dessiner en ( %n ; %n ) l'image %s sur %m.ledPin .","drawPicture","1","1","1","20/15/z/8k/0","1"],[" ","M4.7 - Carte %m.bdNum Ajouter en ( %n ; %n ) l'image %s sur %m.ledPin .","addPicture","1","1","1","20/15/z/8k/0","1"],[" ","M4.8 - Carte %m.bdNum Afficher les LEDs sur %m.ledPin .","fixeLeds","1","1"],[" ","M4.9 - Carte %m.bdNum Réinitialiser les LEDs sur %m.ledPin .","resetLed","1","1"],[" ","G5.1 - Carte %m.dbNum Definir le fonctionnement de %n comme %m.stepMode .","motorMode","1","5","1. Pas-à-pas"],[" ","G5.2 - Carte %m.dbNum Faire avancer le moteur %n de %n pas .","motorWalk","1","5","20"],[" ","G5.3 - Carte %m.dbNum Interrompre le moteur %n .","motorBreak","1","5"],[" ","G5.4 - Carte %m.dbNum Démarrer sur %n le moteur %m.ledPin à la vitesse %n .","motorStart","1","5","1","200"],[" ","G5.5 - Carte %m.dbNum Stopper sur %n le moteur %m.ledPin .","motorStop","1","5","1"],[" ","A6.1 - Carte %m.dbNum Pilot %n Alimenter le moteur %n avec %n .","servoStart","1","64","1","100"],[" ","A6.2 - Carte %m.dbNum Pilot %n Stoper le moteur %n .","servoStop","1","64","1"],[" ","A6.3 - Carte %m.dbNum Pilot %n configurer la fréquence %n .","servoFreq","1","64","1000"],["r","X9.1 - Calculer RVB %n %n %n","calcRVB","255","255","255"],["h","G9.2 - Carte %m.bdNum Quand %m.digitPin est %m.logique","getDigitalInputState","1","Choisir une E/S","1: Haut"],["b","G9.3 - Carte %m.bdNum État de %m.digitPin","getDigitalInputData","1","Choisir une E/S"],["r","G9.4 - Carte %m.bdNum État de %m.analogPin","getAnalogSensorData","1","Choisir une E/S"],["r","G9.5 - Carte %m.bdNum lire %m.modValue","getModValue","1","Choisir une valeur"],["r","G9.5.1 - Carte %m.bdNum Lire sur %m.digitPin la valeur %m.digitValue","getDigitValue","1","Choisir une E/S","Choisir une valeur"],["r","G9.5.2 - Carte %m.bdNum Lire sur %m.analogPin la valeur %m.analogValue","getAnalogValue","1","Choisir une E/S","1. Joystick X"],[" ","Xz - Fixer le niveau de trace %m.trace","setDebugLevel","1. Normal"],[" ","Xz - Afficher la console","setConsole"],[" ","Xz - Cacher la console","unsetConsole"]],menus:{bdNum:["1","2","3","4","5","6","7","8","9","10"],shield:["1. GrovePi +","2. PWM/Servo Hat","3. TS néoLED driver"],logique:["1: Haut","0: Bas"],digitPin:["D2","D3","D4","D5","D6","D7","D8"],moduleDigit:["1. Grove LED","2. Grove Relais","3. Grove Button","4. Grove Buzzer","5. Grove Chainable RGB LED","6. Grove LED Bar","7. Grove 4 Digit Display","8. Grove UltraSonic","9. Grove DHT Digital Sensor","10. Grove PIR Motion Sensor","11. Grove Line Finder"],analogPin:["A0","A1","A2"],moduleAnalog:["1. Grove Rotor Position","2. Grove Light Sensor","3. Grove Thermometer","4. Grove Joystick"],moduleMode:["1. Grove-LCD RGB Backlight","2. Grove oLed 128x64","3. Grove oLed 96x96","4. Grove oLed 128x128","5. Grove-GPS","6. Grove Step Motor Driver","7. Grove miniTrackBall"],ledPin:["1","2"],LCD:["1. Effacer l'écran","2. Faire clignoter le curseur","3. Faire clignoter l'écran","4. Stopper le clig. du curseur","5. Stopper le clig. de l'écran"],onOff:["Off","On"],inversion:["False","True"],trace:["0. Minimal","1. Normal","2. Intense"],modValue:["1. GPS Latitude","2. GPS Longitude","3. GPS Nb satelites","4. TrackBall X","5. TrackBall Y","6. TrackBall Confirmation"],ledBar:["1. Effacer","2. Rouge premier","3. Rouge dernier","4. Allumer tout"],digitValue:["1. Température","2. Humidité","3. Distance Sonar"],analogValue:["1. Joystick X","2. Joystick Y","3. Joystick Push"],stepMode:["1. Pas-à-pas","2. Demi-pas","3. Max-de-puissance","4. Deux moteurs"]},url:"http://scratch.ethernety.net/"},e)};
