/*******************************************************************************
 * ext4ScratchX - Fr
 *
 * Créer par ethernety.net le 05/11/2016
 * Inspiré par Xi4s v.004 du 07/11/2014 par Alan Yorinks
 * Version v.001
 *
 * https://github.com/LLK/scratchx/wiki#load-a-javascript-file
 *
 * @author: Jean BLIN
 * @Copyright (c) 2016 Jean BLIN right reserved.
 *
Documentation :
---------------
Trad : Générer les mots du langage pour faciliter la traduction
Trad.traduir('m', v{}) : Retourne la phrase m en remplacent les balises %mot par l'entrée v[mot]

newSimulateur : Créer une carte virtuel pour les tests

ext_tools : Outils d'interfaçage avec les serveurs piext
 *
 ******************************************************************************/
new (function() {
	var ext = this;
	console.log('ext4ScratchX v1.0 par Ethernety.net');
	var version = "20180322";

	// Mots du langage {{{
	var Trad = {
		'traduir': function(m, v) {
			var msg = this[m];
			for(var i in v)
				msg = msg.replace('%'+i, v[i]);
			return msg;
		},
		'offline': "Hors ligne",
		'online': "Connecté",
		'err-unknow': "Code d'erreur inconnue %code",
		'err-board': " de la carte %board",
		'err-pin': " pour la pin %pin",
		'err-init-board': "Il faut initialiser la carte %board avant de l'utiliser.",
		'err-init-pin': "Il faut initialiser %msg de la carte %board sur la pin %pin.",
		'err-led': "le bandeau à leds",
		'err-connect': "Pas de réponse du serveur %ip:%port! Avez-vous pensé à démarrer le service piext pour la carte %board? Vérifier le service sur la carte, la connexion sur le réseau, puis essayer à nouveau.",
		'err-message': "Message retourné par la carte %board non reconu : %msg.",
		'err-noboard': "La carte %board n'est pas rattachée à un serveur piext.",
		'err-nomode': "Le mode %mode n'est pas reconnue par cette version de ext4ScratchX.",
		'err-2pins': "L'initialisation d'un pilote de moteur pas à pas doit ce faire sur 2 pins différentes! Essayez à nouveau.",
		'err-4pins': "L'initialisation d'un moteur pas à pas doit ce faire sur 4 pins différentes! Essayez à nouveau.",
		'err-version': "La version du serveur de la carte %board n'est pas suffisante. Veuillez effectuer une mise à jour avant de poursuivre.",
		'server-version': "Le serveur de la carte %board à l'adresse %ip:%port en est à la version %version.",
		'trace-virtual': "Affectation de la carte %board au simulateur.",
		'trace-connect': "Affectation de la carte %board au serveur piext %ip:%port.",
		'trace-link': "Canal ouvert pour la carte %board sur le serveur %ip:%port.",
		'trace-uplink': "Canal rataché pour la carte %board sur le serveur %ip:%port.",
		'trace-nblink': "Nombre de connexion ouverte vers des serveurs piext : %nb.",
		'trace-message': "Réception d'un message du serveur %ip:%port = %msg.",
		'trace-close': "Fermeture du canal vers le serveur %ip:%port.",
		'trace-sensor': "Donnée du capteur [%id] = %val.",
		'trace-sensor-key': "Clef du capteur : %key.",
		'trace-input': "La pin %pin de la carte %board n'est pas initialisée comme entrée %type.",
		//'trace-set-pin': "Fixer la pin %pin de la carte %board en mode %mode.",
		'trace-set-pin': "Affecter au connecteur %con de la carte %board le module %mode%opt",
		'type-a': 'analogique',
		'type-d': 'numérique',
		'trace-send': "Transmission du message : %msg.",
		'err-0': "Numéro de pin au delà de ceux admis par la carte.",
		'err-1': "Requette nom supportée par la carte.",
		'err-2': "Ecriture numérique sur la pin impossible.",
		'err-3': "Ecriture analogique sur la pin impossible.",
		'err-4': "Ecriture tone sur la pin impossible.",
		'err-5': "Ecriture servomoteur sur la pin impossible.",
		'err-6': "Ecriture servomoteur sur la pin incompatible (standard).",
		'err-7': "Ecriture servomoteur sur la pin incompatible (continuous).",
		'err-8': "Ecriture servomoteur sur la pin hors limite.",
		'err-9': "Pilotage moteur pas à pas impossible.",
		'err-10': "Mode de pin déjà définit.",
		'err-11': "Mode incompatible sur la pin.",
		'err-12': "Initialisation du bandeau à leds (rpi).",
		'err-13': "Erreur d'initialisation du bandeau à leds.",
		'err-14': "Erreur d'accès",
		'err-15': "Erreur shield Grove non déclaré",
		'sim-alert-pin': "La pin %pin de la carte %board %msg.",
		'sim-alert-carte': "La carte %board %msg.",
		'sim-err-no-pin': "n'a pas été définit",
		'sim-err-no-mode': "ne peut pas être initialisée dans le mode %mode",
		'sim-err-no-led': "n'a pas éré définit comme LED",
		'sim-err-no-board': "Il faut initialiser la carte %board avant de l'utiliser.",
		'sim-led': "Pin %pin : DEL %wx%h",
		'sim-set': "Pin %pin : %mode",
	};
	window.trad = Trad;
	// }}}

	// Console de debugage {{{
	var newConsole = function() {
		var cons = null;
		var trace = {
			count:0,
		};

		function addScript(scr) {
			var s = cons.document.createElement('script');
			s.type = 'text/javascript';
			s.src = "http://ethernety.free.fr/extension4scratch/ScratchX/"+scr+".js";
			if(s.readyState) {
				s.onreadystatechange = function() {
					remplir();
				};
			} else if(s.addEventListener) {
				s.addEventListener('load', function(event) {
					remplir();
				});
			} else if(s.attachEvent) {
				s.attachEvent('onload', function() {
					remplir();
				});
			}
			cons.document.getElementsByTagName("head")[0].appendChild(s);
		}

		function log(type, message) {
			var code = {
				stack: new Error("trace"),
				type: type,
				message: message,
			};
			trace[trace.count++] = code;
			try {
				if(cons.content)
					cons.Console.append(code);
			} catch(ex) {
			}
		}

		function remplir() {
			try {
				if(cons.Console.clear!=undefined)
					cons.Console.clear();
				for(var i=0; i<trace.count; i++)
					cons.Console.append(trace[i]);
			} catch(ex) {
				setTimeout(remplir, 100);
			}
		}

		function reconstruire() {
			if(cons==null || cons.top==null) {
				cons = window.open('', '_blank', 'scrollbars=yes,location=no,menubar=no,status=no,titlebar=no,toolbar=no,fullscreen=no,width=320,height=200'),
				window.cons = cons;
			}
			setTimeout(init, 100);
		}

		function init() {
			if(cons.document.body) {
				// Ajout les scripts
				addScript("lib/console");
			} else
				setTimeout(init, 100);
		}

		return {
			'log': function(msg) {
				log('log', msg);
			},
			'error': function(msg) {
				log('error', msg);
			},
			'draw': function() {
				reconstruire();
			},
			'undraw': function() {
				if(cons!=null) cons.close();
				cons = null;
			},
		};
	};
	// }}}

	// Gestion en mode simulé {{{
	var newSimulateur = function(ext_tools, boardID, callback) {
		var simulateur = {};

		function newEl(t, c) {
			var e = simulateur.board.document.createElement(t);
			if(c!=undefined)
				e.className = c;
			return e;
		}
		function addScript(scr) {
			simulateur.init++;
			var s = newEl('script');
			s.type = 'text/javascript';
			s.src = "http://ethernety.free.fr/extension4scratch/ScratchX/"+scr+".js";
			if(s.readyState) {
				s.onreadystatechange = function() {
					simulateur.free();
				};
			} else if(s.addEventListener) {
				s.addEventListener('load', function(event) {
					simulateur.free();
				});
			} else if(s.attachEvent) {
				s.attachEvent('onload', function() {
					simulateur.free();
				});
			}
			simulateur.board.document.getElementsByTagName("head")[0].appendChild(s);
		}

		function addStyle(src) {
			simulateur.init++;
			var s = newEl('link');
			s.type = 'text/css';
			s.rel = "stylesheet";
			s.href = "http://ethernety.free.fr/extension4scratch/ScratchX/"+src+".css";
			if(s.readyState) {
				s.onreadystatechange = function() {
					simulateur.free();
				};
			} else if(s.addEventListener) {
				s.addEventListener('load', function(event) {
					simulateur.free();
				});
			} else if(s.attachEvent) {
				s.attachEvent('onload', function() {
					simulateur.free();
				});
			}
			simulateur.board.document.getElementsByTagName("head")[0].appendChild(s);
		}

		simulateur.init = 1;
		simulateur.boardID = boardID;
		simulateur.board = window.open('', '_blank', 'scrollbars=yes,location=no,menubar=no,status=no,titlebar=no,toolbar=no,fullscreen=no,width=320,height=200');
		simulateur.close = function() {
			ext_tools.simulateurs[boardID] = undefined;
			this.board.close();
		};
		simulateur.sendOrder = function(order, message) {
			this.board.Modules.sendOrder(order, message);
		};
		simulateur.free = function() {
			if(--simulateur.init==0) {
				callback();
				this.board.Modules.init(ext_tools, boardID);
			}
		};

		var init = function() {
			console.log("init simulateur");
			if(simulateur.board.document.body) {
				// Ajout de la class de style
				// addStyle("simulateur");
				// Ajout les scripts
				addScript("lib/jquery-1.11.0.min");
				addScript("lib/jquery-ui-1.10.4.custom.min");
				addScript("lib/simulateur");
				simulateur.free();
			} else
				setTimeout(init, 100);
		};
		setTimeout(init, 100);

		return simulateur;
	};
	// }}}

	// Ensemble des outils {{{
	var ext_tools = {};
	ext_tools.newStack = function(max) {
		var priv = {
			l: 0,
		};
		priv[0] = 0;
		return {
			push: function(v) {
				if(priv.l>=max) {
					for(var i=1; i<priv.l; i++)
						priv[i-1] = priv[i];
					priv.l--;
				}
				priv[priv.l++] = v;
			},
			pop: function() {
				var v = priv[0];
				for(var i=1; i<priv.l; i++)
					priv[i-1] = priv[i];
				if(priv.l>0)
					priv.l--;
				return v;
			},
			toString: function() {
				var t = 'Stack{len:'+priv.l+',max:'+max;
				for(var i=0; i<priv.l; i++)
					t+= ','+i+':"'+priv[i]+'"';
				return t+'}';
			},
		};
	};
	ext_tools.simulateurs = {};
	ext_tools.debugLevel = 0;
	ext_tools.boardStatus = 1;
	ext_tools.boardMessage = Trad['offline'];
	ext_tools.trace = function(level, message, parm) {
		if(this.console==undefined)
			this.console = newConsole();
		if(this.debugLevel >= level) {
			if(parm==undefined)
				this.console.log(Trad[message]);
			else
				this.console.log(Trad.traduir(message, parm));
		}
	};
	ext_tools.error = function(msg) {
		if(this.console==undefined)
			this.console = newConsole();
		this.console.error(msg);
		ext_tools.boardStatus = 0;
		ext_tools.boardMessage = msg;
	};
	ext_tools.showConsole = function(b) {
		if(this.console==undefined)
			this.console = newConsole();
		if(b)
			this.console.draw();
		else
			this.console.undraw();
	};
	ext_tools.webSocketsArray = [];
	ext_tools.boardLinkedArray = [];
	ext_tools.sensorDataArray = [];
	ext_tools.bufferData = {};
	ext_tools.isBuffer = function(boardID, pin, message) {
		if(this.bufferData[boardID+'_'+pin]==undefined) {
			this.error(Trad.traduir('err-init-pin', {msg:Trad[message], board:boardID, pin:pin}));
			return false;
		}
		return true;
	};
	ext_tools.pushWebSocket = function(ipAddress, port, socket) {
		for(var i=0; i<this.webSocketsArray.length; i++) {
			if((this.webSocketsArray[i].ip === ipAddress) && (this.webSocketsArray[i].port === port)) {
				this.webSocketsArray[i].ws = socket;
				return;
			}
		}
		this.webSocketsArray.push({'ip': ipAddress, 'port': port, 'ws': socket});
	};
	ext_tools.foundWebSocket = function(ipAddress, port) {
		for(var i=0; i<this.webSocketsArray.length; i++) {
			if((this.webSocketsArray[i].ip === ipAddress) && (this.webSocketsArray[i].port === port) && (this.webSocketsArray[i].ws !== null))
				return i;
		}
		return -1;
	};
	ext_tools.killWebSocket = function(ipAddress, port) {
		for(var i=0; i<this.webSocketsArray.length; i++) {
			if((this.webSocketsArray[i].ip === ipAddress) && (this.webSocketsArray[i].port === port)) {
				this.webSocketsArray[i].ws = null;
				for(var j=0; j<this.boardLinkedArray.length; j++)
					if(this.boardLinkedArray[j] === i)
						this.boardLinkedArray[j] = -1;
				return;
			}
		}
	};
	ext_tools.shutdown = function() {
		for(var i=0; i<this.webSocketsArray.length; i++)
			this.webSocketsArray[i].ws.send('resetBoard');
		for(var i=0; i<this.webSocketsArray.length; i++) {
			this.webSocketsArray[i].ws.onclose = function() {};
			this.webSocketsArray[i].ws.close();
		}
		this.webSocketsArray = [];
		this.boardLinkedArray = [];
		this.sensorDataArray = [];
		this.bufferData = {};
		for(var i in this.simulateurs)
			if(this.simulateurs[i]!=undefined)
				this.simulateurs[i].close();
	};
	ext_tools.getSocket = function(boardID) {
		if((this.boardLinkedArray[boardID] === undefined) || (this.boardLinkedArray[boardID] === -1))
			return null;
		return this.webSocketsArray[this.boardLinkedArray[boardID]];
	};
	ext_tools.linkBoard = function(boardID, webSocketIdx) {
		this.boardLinkedArray[boardID] = webSocketIdx;
	};
	ext_tools.unlinkBoard = function(boardID) {
		this.boardLinkedArray[boardID] = -1;
	};
	ext_tools.isLinkedBoard = function(boardID, notrace) {
		if((this.boardLinkedArray[boardID] === undefined) || (this.boardLinkedArray[boardID] === -1)) {
			if(!notrace)
				this.error(Trad.traduir('err-init-board', {board:boardID}));
			return false;
		}
		return true;
	};
	ext_tools.isSimulateBoard = function(boardID) {
		return this.simulateurs[boardID]!=undefined;
	};
	ext_tools.onMessage = function(message, info) {
		var msg = message.split('/');

		// Analyse du message
		switch (msg[0]) {
		case 'dataUpdate':
			this.setSensorData(parseInt(msg[1]), msg[2]);
			break;
		case 'fatal':
			var message = Trad['err-'+msg[1]];
			if(message == undefined)
				message = Trad.traduir('err-unknow', {code:msg[1]});
			message+= Trad.traduir('err-board', info);
			if(msg[2]!=undefined)
				message+= Trad.traduir('err-pin', {pin:msg[2]});
			this.error(message);
			alert(message);
			break;
		case 'version':
			// Fixer la version du serveur actuelle
			var idSoc = ext_tools.foundWebSocket(info.ip, info.port);
			var so = ext_tools.webSocketsArray[idSoc];
			so.version = msg[1];
			ext_tools.trace(1, 'server-version', {board:info.board, ip: info.ip, port: info.port, version: msg[1]});
			break;
		default:
			ext_tools.trace(1, 'err-message', {board:info.board, msg:message});
		}
	};
	ext_tools.setBoard = function(boardID, ipAddress, port, callback) {
		if(this.simulateurs[boardID]!=undefined)
			this.simulateurs[boardID].close();
		if(ipAddress=='virtual') {
			ext_tools.trace(1, 'trace-virtual', {board:boardID});
			this.simulateurs[boardID] = newSimulateur(this, boardID, callback);
		} else {
			function noServerAlert() {
				ext_tools.error(Trad.traduir('err-connect', {ip:ipAddress, port:port, board:boardID}));
			}

			var timeoutID;

			ext_tools.trace(1, 'trace-connect', {ip:ipAddress, port:port, board:boardID});

			// Recherche une connexion au serveur piext déjà éxistante...
			var idSoc = ext_tools.foundWebSocket(ipAddress, port);

			if(idSoc >= 0) {
				// Relier le serveur piext à la carte
				ext_tools.linkBoard(boardID, idSoc);
				ext_tools.trace(0, 'trace-uplink', {ip:ipAddress, port:port, board:boardID});
				ext_tools.boardStatus = 2;
	 			ext_tools.boardMessage = Trad['online'];
 				var socket = this.getSocket(boardID);
				socket.ws.send('resetBoard/'+version);
				callback();
			} else {
				// Ouverture du Socket vers le serveur piext puis enregistrement de celui-ci
				var socket = new WebSocket('ws://' + ipAddress + ':' + port);

				// Démarrage d'un timer pour interrompre l'execution en cas de non réponse
				timeoutID = window.setTimeout(noServerAlert, 2000);

				// Attachement de la connexion en cas de réussite
				socket.onopen = function(event) {
					window.clearTimeout(timeoutID);
					ext_tools.boardStatus = 2;
					ext_tools.boardMessage = Trad['online'];
					ext_tools.pushWebSocket(ipAddress, port, socket);
					ext_tools.linkBoard(boardID, ext_tools.foundWebSocket(ipAddress, port));

					ext_tools.trace(0, 'trace-link', {ip:ipAddress, port:port, board:boardID});
					ext_tools.trace(1, 'trace-nblink', {nb:ext_tools.webSocketsArray.length});

					socket.send('ext4sOnline/'+version);

					socket.onmessage = function(message) {
						ext_tools.trace(1, 'trace-message', {ip:ipAddress, port:port, msg:message.data});
						ext_tools.onMessage(message.data, {board: boardID, ip:ipAddress, port:port});
					};

					socket.onclose = function(message) {
						ext_tools.killWebSocket(ipAddress, port);
						ext_tools.trace(1, 'trace-close', {ip:ipAddress, port:port});
						ext_tools.boardStatus = 1;
						ext_tools.boardMessage = Trad['offline'];
					};
					callback();
				};
			}
		}
	};
	ext_tools.addShield = function(boardID, shName, option) {
		var shield = {
			'1': 'GrovePi',
			'2': 'ServoHat',
			'3': 'TSNeoLed',
		};
		var cmd = shName.split('.');

		if(shield[cmd[0]]==undefined) {
			this.trace(1, 'err-1', {});
		} else {
			this.sendOrder('addShield', boardID, cmd[0]+'/'+option);
		}
	};
	ext_tools.setSensorData = function(idKey, value) {
		this.trace(2, 'trace-sensor', {id:idKey, val:value});
		this.sensorDataArray[idKey].stack.push(value);
	};
	ext_tools.getSensorData = function(boardID, addr) {
		var idx = this.getIndexSensor(boardID, addr);
		if(idx == -1) {
			//ext_tools.trace(0, 'trace-input', {pin:addr, board:boardID});
			return 0;
		}
		return this.sensorDataArray[idx].stack.pop();
	};
	ext_tools.getIndexSensor = function(boardID, addr) {
		var keyGen = '';
		if(this.isSimulateBoard(boardID))
			keyGen = 'S'+boardID+addr;
		else if(this.isLinkedBoard(boardID, true))
			keyGen = 'R'+this.boardLinkedArray[boardID]+addr;
		else
			return -1;
		for(var i=0; i<this.sensorDataArray.length; i++)
			if(this.sensorDataArray[i].key === keyGen)
				return i;
		this.sensorDataArray.push({'key': keyGen, 'stack': this.newStack(10)});
		return i;
	};
	ext_tools.genReporterKey = function(boardID, pinNum, designator) {
		if((this.boardLinkedArray[boardID] === undefined) || (this.boardLinkedArray[boardID] === -1)) {
			this.error(Trad.traduir('err-noboard', {board:boardID}));
			return null;
		}
		this.trace(1, 'trace-sensor-key', {key: this.boardLinkedArray[boardID]+designator+pinNum});
		return this.boardLinkedArray[boardID]+designator+pinNum;
	};
	ext_tools.setDigitPin = function(boardID, addr, module, opt) {
		this.trace(1, 'trace-set-pin', {board:boardID, con:addr, mode:module, opt:(opt.length>0?(' (option : '+opt+')'):(''))});
		addr = parseInt(addr[1]);
		var mc = module.split('.'); mc = parseInt(mc[0]);
		if(mc>=11 && !this.isVersion(boardID, "20180322")) {
			this.trace(1, 'err-version', {board:boardID});
		} else {
			if(!Number.isNaN(mc) && !Number.isNaN(addr)) {
				if(this.isDigitSensor(mc)) {
					var sensorId = this.getIndexSensor(boardID, 'D'+addr);
					opt = sensorId+'/'+opt;
				}
				this.sendOrder('setDigit', boardID, addr+'/'+mc+'/'+opt);
			}
		}
	};
	ext_tools.setAnalogPin = function(boardID, addr, module, opt) {
		this.trace(1, 'trace-set-pin', {board:boardID, con:addr, mode:module, opt:(opt.length>0?(' (option : '+opt+')'):(''))});
		addr = parseInt(addr[1]);
		var mc = module.split('.'); mc = parseInt(mc[0]);
		if(!Number.isNaN(mc) && !Number.isNaN(addr)) {
			if(this.isAnalogSensor(mc)) {
				var sensorId = this.getIndexSensor(boardID, 'A'+addr);
				opt = sensorId+'/'+opt;
			}
			this.sendOrder('setAnalog', boardID, addr+'/'+mc+'/'+opt);
		}
	};
	ext_tools.setModuleMode = function(boardID, module, opt) {
		this.trace(1, 'trace-set-pin', {board:boardID, con:"I2C ou série", mode:module, opt:(opt.length>0?(' (option : '+opt+')'):(''))});
		var mc = module.split('.'); mc = parseInt(mc[0]);
		if(!Number.isNaN(mc)) {
			if(this.isModuleSensor(mc)) {
				var sensorId = this.getIndexSensor(boardID, this.getModuleAddr(mc));
				opt = sensorId+'/'+opt;
			}
			this.sendOrder('setModule', boardID, mc+'/'+opt);
		}
	};
	ext_tools.sendOrder = function(order, boardID, message) {
		if(this.isSimulateBoard(boardID)) {
			this.simulateurs[boardID].sendOrder(order + '/' + boardID + '/' + message);
		} else if(this.isLinkedBoard(boardID)) {
			var boardLnk = this.boardLinkedArray[boardID];
			var socket = this.getSocket(boardID);
			socket.ws.send(order + '/' + boardLnk + '/' + message);
			this.trace(2, 'trace-send', {msg:order+'/'+boardID+':='+boardLnk+'/'+message});
		}
	};
	ext_tools.isVersion = function(boardID, version) {
		if(this.isSimulateBoard(boardID)) {
			return true;
		} else if(this.isLinkedBoard(boardID)) {
			var so = this.webSocketsArray[this.boardLinkedArray[boardID]];
			if(so.version==undefined) return false;
			return (parseInt(so.version)>=parseInt(version));
		}
		return false;
	};
	ext_tools.encodeText = function(txt) {
		var r = '';
		txt = ''+txt;
		for(var i=0; i<txt.length; i++) {
			var c = ''+txt[i].charCodeAt(0).toString(16);
			while(c.length<2)
				c = '0'+c;
			r+=c;
		}

		return r;
	};
	var matrix_setLed = function(buf, x, y, w, h, value) {
		x--, y--;
		if(x<0 || y<0 || x>=w || y>=h) return;
		y = h-y-1;
		var l = y*w;
		if(y%2==0)
			l+= x;
		else
			l+= w-x-1;
		buf[l] = value;
	};
	ext_tools.initLed = function(boardID, pin, x, y) {
		var leds = x*y;
		this.sendOrder('initLED', boardID, pin + '/' + x + '/' + y);
		this.bufferData[boardID+'_'+pin] = {
			'w': parseInt(x),
			'h': parseInt(y),
			'value': {length:leds},
		};
		for(var i=0;i<leds;i++)
			this.bufferData[boardID+'_'+pin].value[i] = 0;
	};
	ext_tools.setXYLed = function(boardID, pin, x, y, value) {
		if(this.isBuffer(boardID, pin, 'err-led'))
			matrix_setLed(this.bufferData[boardID+'_'+pin].value, x, y, this.bufferData[boardID+'_'+pin].w, this.bufferData[boardID+'_'+pin].h, value);
	};
	ext_tools.fixeLeds = function(boardID, pin) {
		if(this.isBuffer(boardID, pin, 'err-led')) {
			value = ''+pin;
			// Compression les données :
			// :: Nombre codés en base 35 [0-9a-y]    (pas 'z' car réservé ci-dessous)
			// :: le code z/[n]/[c] traduit la répétition du code c, n fois (n>2)
			var c=-1; var n=0; var v = this.bufferData[boardID+'_'+pin].value;
			for(var i=0;i<v.length;i++) {
				if(c==v[i]) {
					n++;
				} else {
					c = parseInt(c,10).toString(35);
					if(n<3) while(n-->0) value+= '/'+c;
					else value+='/z/'+n.toString(35)+'/'+c
					c=v[i];
					n=1;
				}
			}
			c = parseInt(c,10).toString(35);
			if(n<3) while(n-->0) value+= '/'+c;
			else value+='/z/'+n.toString(35)+'/'+c
			this.sendOrder('fixeLED', boardID, value);
		}
	};
	ext_tools.resetLed = function(boardID, pin) {
		if(this.isBuffer(boardID, pin, 'err-led')) {
			for(var i=0;i<this.bufferData[boardID+'_'+pin].value.length;i++)
				this.bufferData[boardID+'_'+pin].value[i]=0;
			this.sendOrder('resetLED', boardID, pin);
		}
	};
	ext_tools.drawLine = function(boardID, pin, x0, y0, x1, y1, col) {
		if(this.isBuffer(boardID, pin, 'err-led')) {
			var buf = this.bufferData[boardID+'_'+pin].value;
			var w = this.bufferData[boardID+'_'+pin].w;
			var h = this.bufferData[boardID+'_'+pin].h;
			x0 = parseInt(x0);
			x1 = parseInt(x1);
			y0 = parseInt(y0);
			y1 = parseInt(y1);

			if(x1<x0) {
				var s = x0; x0 = x1; x1 = s;
				s=y0; y0 = y1; y1 = s;
			}
			var dx = x1-x0;
			var dy = y1-y0;
			var cy = 1;

			var x=x0, y=y0;

			if(dy<0) {
				dy=-dy;
				cy=-1;
			}
			matrix_setLed(buf, x, y, w, h, col);
			if(dy>dx) {
				var de = 2*dx;
				var dp = de-dy;
				var dne = 2*(dx-dy);
				if(cy>0) {
					while(y<y1) {
						y++;
						if(dp<=0) dp+=de;
						else { dp+=dne; x++; }
						matrix_setLed(buf, x, y, w, h, col);
					}
				} else {
					while(y>y1) {
						y--;
						if(dp<=0) dp+=de;
						else { dp+=dne; x++; }
						matrix_setLed(buf, x, y, w, h, col);
					}
				}
			} else {
				var de = 2*dy;
				var dp = de-dx;
				var dne = 2*(dy-dx);
				while(x<x1) {
					x++;
					if(dp<=0) dp+=de;
					else { dp+=dne; y+=cy; }
					matrix_setLed(buf, x, y, w, h, col);
				}
			}
		}
	};
	ext_tools.drawRect = function(boardID, pin, x0, y0, x1, y1, col) {
		if(this.isBuffer(boardID, pin, 'err-led')) {
			var buf = this.bufferData[boardID+'_'+pin].value;
			var w = this.bufferData[boardID+'_'+pin].w;
			var h = this.bufferData[boardID+'_'+pin].h;

			if(x0>x1) { var s=x0; x0=x1; x1=s; }
			if(y0>y1) { var s=y0; y0=y1; y1=s; }

			for(var x=x0; x<=x1; x++) {
				matrix_setLed(buf, x, y0, w, h, col);
				matrix_setLed(buf, x, y1, w, h, col);
			}
			for(var y=y0; y<=y1; y++) {
				matrix_setLed(buf, x0, y, w, h, col);
				matrix_setLed(buf, x1, y, w, h, col);
			}
		}
	};
	ext_tools.colorRect = function(boardID, pin, x0, y0, x1, y1, col) {
		if(this.isBuffer(boardID, pin, 'err-led')) {
			var buf = this.bufferData[boardID+'_'+pin].value;
			var w = this.bufferData[boardID+'_'+pin].w;
			var h = this.bufferData[boardID+'_'+pin].h;
			if(x0>x1) { var s=x0; x0=x1; x1=s; }
			if(y0>y1) { var s=y0; y0=y1; y1=s; }

			for(var y=(y0<1)?1:y0; y<=h && y<=y1; y++)
				for(var x=(x0<1)?1:x0; x<=w && x<=x1; x++)
					matrix_setLed(buf, x, y, w, h, col);
		}
	};
	ext_tools.drawMask = function(boardID, pin, x0, y0, col, m, mw, mh) {
		if(this.isBuffer(boardID, pin, 'err-led')) {
			var buf = this.bufferData[boardID+'_'+pin].value;
			var w = this.bufferData[boardID+'_'+pin].w;
			var h = this.bufferData[boardID+'_'+pin].h;

			for(var y=0; y<mh; y++)
				for(var x=0; x<mw; x++) {
					var c = m&0x1;
					m = (m-c)/2;
					if(c==0) matrix_setLed(buf, x0+x, y0+y, w, h, 0);
					else matrix_setLed(buf, x0+x, y0+y, w, h, col);
				}
		}
	};
	ext_tools.drawPicture = function(boardID, pin, x0, y0, img, zero) {
		if(this.isBuffer(boardID, pin, 'err-led')) {
			var buf = this.bufferData[boardID+'_'+pin].value;
			var w = this.bufferData[boardID+'_'+pin].w;
			var h = this.bufferData[boardID+'_'+pin].h;

			var x=0, y=0;
			var v = img.split('/');
			var w0 = parseInt(v[0]);
			for(var i=2; i<v.length; i++) {
				if(v[i]=='z') {
					var n=parseInt(v[++i],35), c=parseInt(v[++i],35);
					while(n-->0) {
						matrix_setLed(buf, x+x0, y+y0, w, h, c);
						if(++x>=w0) { x=0; y++; }
					}
				} else {
					matrix_setLed(buf, x+x0, y+y0, w, h, parseInt(v[i],35));
					if(++x>=w0) { x=0; y++; }
				}
			}
		}
	};
	ext_tools.isDigitSensor = function(n) {
		var list = [3, 8, 9, 10, 11];
		return (list.indexOf(n)!=-1);
	};
	ext_tools.isAnalogSensor = function(n) {
		var list = [1, 2, 3, 4];
		return (list.indexOf(n)!=-1);
	};
	ext_tools.isModuleSensor = function(n) {
		var list = [4, 6];
		return (list.indexOf(n)!=-1);
	};
	ext_tools.getModuleAddr = function(n) {
		var list = {
			4: 'SP',
			6: 'i0x4a',
		};
		return list[n];
	};
	ext_tools.police5x5 ={'0':15521390,'1':6426766,'2':16267327,'3':16265743,'4':12920808,'5':32554511,'6':31505966,'7':33038466,'8':15252014,'9':15268367,'A':4540401,'B':16301615,'C':31491134,'D':16303663,'E':32545855,'F':32545825,'G':31516222,'H':18415153,'I':32641183,'J':32776486,'K':18128177,'L':1082431,'M':18732593,'N':18470705,'O':15255086,'P':16301089,'Q':15258934,'R':16301617,'S':31504911,'T':32641156,'U':18400814,'V':18400580,'W':18405233,'X':18157905,'Y':18157700,'Z':32772191,' ':0,'.':198,',':4226,"'":4325376,'"':10813440,'(':8523912,')':2232450,'[':12718220,']':6426758,'{':12720268,'}':6434950,'#':11512810,'+':145536,'-':14336,'*':332096,'/':266304,'err':33412991};
	ext_tools.police5x7 ={'0':4657433924,'1':4503769247,'2':15619854431,'3':15619998254,'4':17452574696,'5':33321107983,'6':15604368942,'7':33831522434,'8':15621113390,'9':15621636623,'A':15621670449,'B':16694887983,'C':15603893806,'D':7836583207,'E':16140960831,'F':33321092129,'G':15603922478,'H':18842895921,'I':33424543903,'J':33563092262,'K':18560947505,'L':1108378687,'M':19192792625,'N':18916238897,'O':15621211694,'P':16694871073,'Q':15621215542,'R':16694875441,'S':32247333391,'T':33424543876,'U':18842437166,'V':18842429764,'W':18842572106,'X':18834663985,'Y':18834657412,'Z':33831389247,' ':0,'.':198,',':4226,"'":6648037376,'"':11072962560,'(':8728481928,')':2286030978,'[':13023449228,']':6580998278,'{':8728416392,'}':2286162050,'#':11788430314,'+':4657152,'-':458752,'*':10627072,'/':17456826433,'err':33885449791};
	// }}}

	// Définition des blocs de l'extension {{{
	// Fermeture de l'extension
	ext._shutdown = function() {
		ext_tools.shutdown();
	};

	// Retour du status du service
	ext._getStatus = function() {
		return {
			status: ext_tools.boardStatus,
			msg: ext_tools.boardMessage,
		};
	};

	// Connexion à une carte piext
	ext.setBoard = function(boardID, ipAddress, port, callback) {
		ext_tools.setBoard(boardID, ipAddress, port, callback);
	};

	ext.addShield = function(boardID, shName, option) {
		ext_tools.addShield(boardID, shName, option);
	};

	// Les modules Grove {{{
	// Ajouter un module numérique
	ext.digitPin = function(boardID, pin, mode, opt) {
		ext_tools.setDigitPin(boardID, pin, mode, ''+opt);
	};

	// Ajouter un module analogique
	ext.analogPin = function(boardID, pin, mode, opt) {
		ext_tools.setAnalogPin(boardID, pin, mode, ''+opt);
	};

	// Ajouter un module I2C ou série
	ext.moduleMode = function(boardID, mode, opt) {
		ext_tools.setModuleMode(boardID, mode, opt);
	};

	// Affecter une valeur logique
	ext.digitWrite = function(boardID, addr, value) {
		addr = parseInt(addr[1]);
		value = (value=='Off')?0:1;
		if(!Number.isNaN(addr))
			ext_tools.sendOrder('digitWrite', boardID, addr+'/'+value);
	};

	ext.chainableWrite = function(boardID, addr, num, value) {
		addr = parseInt(addr[1]);
		num = parseInt(num)-1; value=parseInt(value);
		if(!Number.isNaN(addr))
			ext_tools.sendOrder('CLED', boardID, addr+'/set/'+num+'/'+value);
	};

	ext.barWrite = function(boardID, addr, num, value) {
		addr = parseInt(addr[1]);
		num = parseInt(num);
		value = (value=='Off')?0:1;
		if(!Number.isNaN(addr))
			ext_tools.sendOrder('LBar', boardID, addr+'/set/'+num+'/'+value);
	};

	ext.barLevel = function(boardID, addr, value, max) {
		addr = parseInt(addr[1]);
		value = parseInt(value);
		max = parseInt(max);
		if(max<2) max = 2;
		if(value<0) value=0;
		else if(value>max) value=max;
		value = Math.round(10*value/max);
		if(!Number.isNaN(addr))
			ext_tools.sendOrder('LBar', boardID, addr+'/level/'+value);
	};

	ext.barConfig = function(boardID, addr, cmd) {
		addr = parseInt(addr[1]);
		var cmd2str = {
			'1': 'clear',
			'2': 'redFirst',
			'3': 'redLast',
			'4': 'full',
		};
		if(!Number.isNaN(addr) && cmd2str[cmd[0]]!=undefined)
			ext_tools.sendOrder('LBar', boardID, addr+'/'+cmd2str[cmd[0]]);
	};

	ext.digitDisp = function(boardID, addr, value) {
		addr = parseInt(addr[1]);
		if(!Number.isNaN(addr))
			ext_tools.sendOrder('4DD', boardID, addr+'/set/'+value);
	};

	// Gestion Grove-LCD RGB Backlight
	ext.LCDTxt = function(boardID, l1, l2) {
		ext_tools.sendOrder('LCD', boardID, 'print/'+ext_tools.encodeText(l1)+'/'+ext_tools.encodeText(l2));
	};

	ext.LCDRgb = function(boardID, color) {
		ext_tools.sendOrder('LCD', boardID, 'color/'+color);
	};

	ext.LCDMode = function(boardID, cmd) {
		var cmd2str = {
			'1': 'LCDclear',
			'2': 'LCDblink',
			'3': 'LCDblinkLed',
			'4': 'LCDnoblink',
			'5': 'LCDnoblinkLed',
		};
		cmd = cmd.split('.');
		if(cmd2str[cmd[0]]!=undefined)
			ext_tools.sendOrder('LCD', boardID, 'set/'+cmd[0]);
	};

	// Gestion Grove-oLED display
	ext.oLEDtxt = function(boardID, txt) {
		ext_tools.sendOrder('oLED', boardID, 'print/'+ext_tools.encodeText(txt));
	};

	ext.oLEDXY = function(boardID, x, y) {
		ext_tools.sendOrder('oLED', boardID, 'move/'+x+'/'+y);
	};

	ext.oLEDclear = function(boardID) {
		ext_tools.sendOrder('oLED', boardID, 'clear');
	};

	ext.oLEDbright = function(boardID, level) {
		if(!Number.isNaN(level))
			ext_tools.sendOrder('oLED', boardID, 'bright/'+parseInt(level));
	};

	// Lire une valeur logique
	ext.getDigitalInputState = function(boardID, addr, state) {
		state = state[0];
		var v = ext_tools.getSensorData(boardID, addr);
		if(state=='1')
			return v==1;
		else
			return v!=1;
	};

	ext.getDigitalInputData = function(boardID, addr) {
		return ext_tools.getSensorData(boardID, addr)==1;
	};

	// Lire une valeur analogique
	ext.getAnalogSensorData = function(boardID, addr) {
		return ext_tools.getSensorData(boardID, addr);
	};

	// Lire la distance mesuré par le sonar
	ext.getSonarData = function(boardID, addr, units) {
		if(units !== 'CM')
			return (ext_tools.getSensorData(boardID, addr) / 2.54).toFixed(4);
		return ext_tools.getSensorData(boardID, addr);
	};

	ext.getDigitValue = function(boardID, addr, cmd) {
		var v = ext_tools.getSensorData(boardID, addr)
		if(v!=undefined) {
			v = v.split(':');
			cmd = parseInt(cmd.split('.')[0]);
			switch(cmd) {
			case 1:
			case 2:
				if(v[0]=='DHT') return parseInt(v[cmd]);
				break;
			}
		}
		return 0;
	};

	ext.getAnalogValue = function(boardID, addr, cmd) {
		var v = ext_tools.getSensorData(boardID, addr)
		if(v!=undefined) {
			console.log(v);
			v = v.split(':');
			cmd = parseInt(cmd.split('.')[0]);
			switch(cmd) {
			case 1:
			case 2:
			case 3:
				if(v[0]=='JOY') return parseInt(v[cmd]);
				break;
			}
		}
		return 0;
	};

	// Lire les coordonées GPS
	ext.getModValue = function(boardID, cmd) {
		cmd = parseInt(cmd.split('.')[0]);
		switch(cmd) {
		case 1: // GPS Latitude
		case 2: // GPS Longitude
		case 3: // GPS nombre de satelites
			var v = ext_tools.getSensorData(boardID, 'SP');
			if(v!=undefined) {
				v = v.split(':');
				if(v[0]=='GPS')
					return parseFloat(v[cmd]);
			}
			return 0;
		case 4: // miniTrackBall UP
		case 5: // miniTrackBall DOWN
		case 6: // miniTrackBall LEFT
		case 7: // miniTrackBall DOWN
		case 8: // miniTrackBall CONF
			var v = ext_tools.getSensorData(boardID, 'i0x4a');
			if(v!=undefined) {
				v = v.split(':');
				if(v[0]=='MTB')
					return parseInt(v[cmd-3]);
			}
			return 0;
		}
		return 0;
	};

	ext.motorMode = function(boardID, addr, mode) {
		addr = parseInt(addr);
		mode = mode.split('.');
		ext_tools.sendOrder('SMD', boardID, addr+'/mode/'+mode[0]);
	};
	ext.motorWalk = function(boardID, addr, pad) {
		addr = parseInt(addr);
		pad = parseInt(pad);
		ext_tools.sendOrder('SMD', boardID, addr+'/walk/'+pad);
	};
	ext.motorBreak = function(boardID, addr) {
		addr = parseInt(addr);
		ext_tools.sendOrder('SMD', boardID, addr+'/break');
	};
	ext.motorStart = function(boardID, addr, mot, spe) {
		addr = parseInt(addr);
		mot = parseInt(mot);
		spe = parseInt(spe);
		ext_tools.sendOrder('SMD', boardID, addr+'/start/'+mot+'/'+spe);
	};
	ext.motorStop = function(boardID, addr, mot) {
		addr = parseInt(addr);
		mot = parseInt(mot);
		ext_tools.sendOrder('SMD', boardID, addr+'/stop/'+mot);
	};

	// }}}

	// Le shield Adafruit Servo/PWM Pi Hat! {{{
	ext.servoStart = function(boardID, addr, mot, pui) {
		addr = parseInt(addr);
		mot = parseInt(mot);
		pui = parseInt(pui);
		ext_tools.sendOrder('APH', boardID, addr+'/start/'+mot+'/'+pui);
	};
	ext.servoStop = function(boardID, addr, mot) {
		addr = parseInt(addr);
		mot = parseInt(mot);
		ext_tools.sendOrder('APH', boardID, addr+'/stop/'+mot);
	};
	ext.servoFreq = function(boardID, addr, freq) {
		addr = parseInt(addr);
		freq = parseInt(freq);
		ext_tools.sendOrder('APH', boardID, addr+'/freq/'+freq);
	};
	// }}}

	// Gestion des néoLEDs ws2812b {{{
	ext.initLed = function(boardID, w, h, pin) {
		ext_tools.initLed(boardID, pin, w, h);
	};

	ext.setXYLed = function(boardID, x, y, value, pin) {
		ext_tools.setXYLed(boardID, pin, x, y, value);
	};

	ext.drawLine = function(boardID, x0, y0, x1, y1, col, pin) {
		ext_tools.drawLine(boardID, pin, x0, y0, x1, y1, col);
	};

	ext.drawRect = function(boardID, x0, y0, x1, y1, col, pin) {
		ext_tools.drawRect(boardID, pin, x0, y0, x1, y1, col);
	};

	ext.colorRect = function(boardID, x0, y0, x1, y1, col, pin) {
		ext_tools.colorRect(boardID, pin, x0, y0, x1, y1, col);
	};

	ext.drawTxt = function(boardID, x, y, txt, col, pin) {
		txt = ''+txt;
		txt = txt.toUpperCase();
		x = parseInt(x);
		y = parseInt(y);
		for(var i=0; i<txt.length; i++) {
			var m = ext_tools.police5x5[txt[i]];
			if(m==undefined) m = ext_tools.police5x5['err'];
			ext_tools.drawMask(boardID, pin, x+6*i, y, col, m, 5, 5);
		}
	};

	ext.drawPicture = function(boardID, x, y, img, pin) {
		ext_tools.drawPicture(boardID, pin, parseInt(x), parseInt(y), img, true);
	};

	ext.addPicture = function(boardID, x, y, img, pin) {
		ext_tools.drawPicture(boardID, pin, parseInt(x), parseInt(y), img, false);
	};

	ext.fixeLeds = function(boardID, pin) {
		ext_tools.fixeLeds(boardID, pin);
	};

	ext.resetLed = function(boardID, pin) {
		ext_tools.resetLed(boardID, pin);
	};

	// Calcul d'une couleur part ses trois composantes
	ext.calcRVB = function(r, v, b) {
		return (((parseInt(r)*256)+parseInt(v))*256)+parseInt(b);
	};
	// }}}

	// Fixer le niveau de trace
	ext.setDebugLevel = function(level) {
		level = level.split('.');
		ext_tools.debugLevel = parseInt(level[0]);
	};

	ext.setConsole = function() {
		ext_tools.showConsole(true);
	};

	ext.unsetConsole = function() {
		ext_tools.showConsole(false);
	};

	// }}}

	// Description des blocs et des menus {{{
	var descriptor = {
		blocks: [
			// Connexion à la carte piext
			['w', "X0 - Carte %m.bdNum Adresse IP/Port: %s : %s", 'setBoard', '1', 'virtual', '1234'],
			// Ajouter la connexion d'un utiliseur ???
			// w ? definir la conf du serveur
			[' ', "X1 - Carte %m.bdNum Initialiser la carte %m.shield ( %s )", 'addShield', '1', 'Choisir une carte', ''],
			// Défiinition des pins en entrée/sortie
			[' ', "G1.1 - Carte %m.bdNum Init. D %m.digitPin avec %m.moduleDigit ( %s )", 'digitPin', '1', 'Choisir une E/S', 'Choisir un module', ''],
			[' ', "G1.2 - Carte %m.bdNum Init. A %m.analogPin avec %m.moduleAnalog ( %s )", 'analogPin', '1', 'Choisir une E/S', 'Choisir un module', ''],
			[' ', "G1.3 - Carte %m.bdNum Init. M %m.moduleMode ( %s )", 'moduleMode', '1', 'Choisir un mode', ''],
			[' ', "M1.4 - Carte %m.bdNum Init. la matrice de %n x %n leds sur %m.ledPin .", 'initLed', '1', '20', '15', '1'],
			// Transmission sur les pins
			[' ', "G1.1.1 - Carte %m.bdNum Mettre %m.digitPin à la valeur %m.onOff ", 'digitWrite', '1', 'Choisir une E/S', 'Off'],
			[' ', "G1.1.2 - Carte %m.bdNum Sur %m.digitPin mettre la LED %n à %n . ", 'chainableWrite', '1', 'Choisir une E/S', '1', '255'],
			[' ', "G1.1.3 - Carte %m.bdNum Sur %m.digitPin mettre la LED %m.bdNum à %m.onOff . ", 'barWrite', '1', 'Choisir une E/S', '1', 'Off'],
			[' ', "G1.1.4 - Carte %m.bdNum Sur %m.digitPin afficher le score %n sur %n . ", 'barLevel', '1', 'Choisir une E/S', '1', '10'],
			[' ', "G1.1.5 - Carte %m.bdNum Sur %m.digitPin faire %m.ledBar . ", 'barConfig', '1', 'Choisir une E/S', '1. Effacer'],
			[' ', "G1.1.6 - Carte %m.bdNum Sur %m.digitPin afficher %s . ", 'digitDisp', '1', 'Choisir une E/S', '00:00'],
			// Gestion du module Grove-LCD RGB Backlight
			[' ', "G3.1 - Carte %m.bdNum LCD écrire %s %s .", 'LCDTxt', '1', 'Ligne 1', 'Ligne 2'],
			[' ', "G3.2 - Carte %m.bdNum LCD éclairer %n .", 'LCDRgb', '1', '255'],
			[' ', "G3.3 - Carte %m.bdNum LCD %m.LCD .", 'LCDMode', '1', 'Choisir une action'],
			// Gestion des modules Grove-oLED display
			[' ', "G3.4 - Carte %m.bdNum oLed écrire %s .", 'oLEDtxt', '1', 'Texte'],
			[' ', "G3.5 - Carte %m.bdNum oLed placer curseur %n %n .", 'oLEDXY', '1', '0', '0'],
			[' ', "G3.6 - Carte %m.bdNum effacer l'écran oLed.", 'oLEDclear', '1'],
			[' ', "G3.7 - Carte %m.bdNum régler contrast à %s .", 'oLEDbright', '1', '100'],
			// Gestion des matrices de LEDs
			[' ', "M4.1 - Carte %m.bdNum Affecter à la led ( %n ; %n ) la couleur %n sur %m.ledPin .", 'setXYLed', '1', '1', '1', '255', '1'],
			[' ', "M4.2 - Carte %m.bdNum Tracer la ligne de ( %n ; %n ) à ( %n ; %n ) de couleur %n sur %m.ledPin .", 'drawLine', '1', '1', '1', '5', '5', '255', '1'],
			[' ', "M4.3 - Carte %m.bdNum Tracer le rectangle de ( %n ; %n ) à ( %n ; %n ) de couleur %n sur %m.ledPin .", 'drawRect', '1', '1', '1', '5', '5', '255', '1'],
			[' ', "M4.4 - Carte %m.bdNum Remplir le rectangle de ( %n ; %n ) à ( %n ; %n ) de couleur %n sur %m.ledPin .", 'colorRect', '1', '1', '1', '5', '5', '255', '1'],
			[' ', "M4.5 - Carte %m.bdNum Écrire en ( %n ; %n ) le texte %s de couleur %n sur %m.ledPin .", 'drawTxt', '1', '1', '1', 'TEXTE', '255', '1'],
			[' ', "M4.6 - Carte %m.bdNum Dessiner en ( %n ; %n ) l'image %s sur %m.ledPin .", 'drawPicture', '1', '1', '1', '20/15/z/8k/0', '1'],
			[' ', "M4.7 - Carte %m.bdNum Ajouter en ( %n ; %n ) l'image %s sur %m.ledPin .", 'addPicture', '1', '1', '1', '20/15/z/8k/0', '1'],
			[' ', "M4.8 - Carte %m.bdNum Afficher les LEDs sur %m.ledPin .", 'fixeLeds', '1', '1'],
			[' ', "M4.9 - Carte %m.bdNum Réinitialiser les LEDs sur %m.ledPin .", 'resetLed', '1', '1'],
			// Gestion des moteurs pas-à-pas
			[' ', "G5.1 - Carte %m.dbNum Definir le fonctionnement de %n comme %m.stepMode .",  'motorMode', '1', '5', '1. Pas-à-pas'],
			[' ', "G5.2 - Carte %m.dbNum Faire avancer le moteur %n de %n pas .",  'motorWalk', '1', '5', '20'],
			[' ', "G5.3 - Carte %m.dbNum Interrompre le moteur %n .",  'motorBreak', '1', '5'],
			[' ', "G5.4 - Carte %m.dbNum Démarrer sur %n le moteur %m.ledPin à la vitesse %n .",  'motorStart', '1', '5', '1', '200'],
			[' ', "G5.5 - Carte %m.dbNum Stopper sur %n le moteur %m.ledPin .",  'motorStop', '1', '5', '1'],
			// Gestion des servo-moteur Adafruit PWM PI/HAT
			[' ', "A6.1 - Carte %m.dbNum Pilot %n Alimenter le moteur %n avec %n .",  'servoStart', '1', '64', '1', '100'],
			[' ', "A6.2 - Carte %m.dbNum Pilot %n Stoper le moteur %n .",  'servoStop', '1', '64', '1'],
			[' ', "A6.3 - Carte %m.dbNum Pilot %n configurer la fréquence %n .",  'servoFreq', '1', '64', '1000'],
			// Gestion des matrices de LEDs
			['r', "M9.1 - Calculer RVB %n %n %n", 'calcRVB', '255', '255', '255'],
			// Lecture sur les pins
			['h', "G9.2 - Carte %m.bdNum Quand %m.digitPin est %m.logique", 'getDigitalInputState', '1', 'Choisir une E/S', '1: Haut'],
			['b', "G9.3 - Carte %m.bdNum État de %m.digitPin", 'getDigitalInputData', '1', 'Choisir une E/S'],
			['r', "G9.4 - Carte %m.bdNum État de %m.analogPin", 'getAnalogSensorData', '1', 'Choisir une E/S'],
			['r', "G9.5 - Carte %m.bdNum lire %m.modValue", 'getModValue', '1', 'Choisir une valeur'],
			['r', "G9.5.1 - Carte %m.bdNum Distance sonar de %m.digitPin en %m.distance", 'getSonarData', '1', 'Choisir une E/S', 'CM'],
			['r', "G9.5.2 - Carte %m.bdNum Lire sur %m.digitPin la valeur %m.digitValue", 'getDigitValue', '1', 'Choisir une E/S', '1. Température'],
			['r', "G9.5.3 - Carte %m.bdNum Lire sur %m.analogPin la valeur %m.analogValue", 'getAnalogValue', '1', 'Choisir une E/S', '1. Joystick X'],
			// Utilitaires
			[' ', "Xz - Fixer le niveau de trace %m.trace", 'setDebugLevel', '1. Normal'],
			[' ', "Xz - Afficher la console", 'setConsole'],
			[' ', "Xz - Cacher la console", 'unsetConsole'],
		],
		menus: {
			bdNum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
			shield: ['1. GrovePi +', '2. PWM/Servo Hat', '3. TS néoLED driver'],
			logique: ['1: Haut', '0: Bas'],
			digitPin: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
			moduleDigit: ['1. Grove LED', '2. Grove Relais', '3. Grove Button', '4. Grove Buzzer', '5. Grove Chainable RGB LED', '6. Grove LED Bar', '7. Grove 4 Digit Display', '8. Grove UltraSonic', '9. Grove DHT Digital Sensor', '10. Grove PIR Motion Sensor', '11. Grove Line Finder'],
			analogPin: ['A0', 'A1', 'A2'],
			moduleAnalog: ['1. Grove Rotor Position', '2. Grove Light Sensor', '3. Grove Thermometer', '4. Grove Joystick'],
			moduleMode: ['1. Grove-LCD RGB Backlight', '2. Grove oLed 128x64', '3. Grove oLed 96x96', '4. Grove-GPS', '5. Grove Step Motor Driver','6. Grove miniTrackBall'],
			ledPin: ['1', '2'],
			LCD: ["1. Effacer l'écran", "2. Faire clignoter le curseur", "3. Faire clignoter l'écran", "4. Stopper le clig. du curseur", "5. Stopper le clig. de l'écran"],
			onOff: ['Off', 'On'],
			inversion: ['False', 'True'],
			distance: ['CM', 'Pouces'],
			trace: ['0. Minimal', '1. Normal', '2. Intense'],
			modValue: ['1. GPS Latitude','2. GPS Longitude','3. GPS Nb satelites','4. TrackBall Haut','5. TrackBall Bas','6. TrackBall Gauche','7. TrackBall Droite','8. TrackBall Confirmer'],
			ledBar: ['1. Effacer', '2. Rouge premier', '3. Rouge dernier', '4. Allumer tout'],
			digitValue: ['1. Température', '2. Humidité'],
			analogValue: ['1. Joystick X', '2. Joystick Y', '3. Joystick Push'],
			stepMode: ['1. Pas-à-pas', '2. Demi-pas', '3. Max-de-puissance', '4. Deux moteurs'],
		},
		url: 'http://scratch.ethernety.net/'
	};


	// Enregistrement de l'extension
	ScratchExtensions.register('ext4ScratchX v 1.0', descriptor, ext);
	// }}}
})();
