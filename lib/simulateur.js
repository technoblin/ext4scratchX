/*
 simulateur.js
(c) 2017, ethernety.net
 *
 * Simulation des appareillages Grove / Ethernety / Adafruit PWM PiHat!
 *
 * TODO:
 *  - Ajouter un menu pour enregistrer/charger la configuration du simulateur
 *  - Programmer la carte Adafruit PWM PiHat!
 *  - Ajouter les infosbulles
 *  - Ajouter les périphériques extensibles (moteur, ampoule, ...)
 *  - Ajouter des outils graphiques simple (texte, ligne, flèche)
 */
(function(window) {
	'use strict';

	function makeModule() {
		// Variables du langage, privé {{{
		var Trad = {
			'traduir': function(m, v) {
				var msg = this[m];
				for(var i in v)
					msg = msg.replace('%'+i, v[i]);
				return msg;
			},
			'exception': "Exception %message à la ligne %lineNumber\n%stack",
			'declaration': " - Créer nouveau %name sur la sortie %addr.",
			'reinit': " - Réinitialiser %name.",
			'addModule': "GrovePi.addModule(%name%opt)",
			'getModule': "GrovePi.getModule(%name)",
			'order': "Réception de l'ordre %order, %message.",
			'addMatrix': "TSnéoLED.addMatrix(%con, %width, %height)",
			'err_1': "Impossible d'initialiser le module %name, il y a un conflict d'adresse.",
			'err_2': "Vous n'avez pas initialisé la matrice du port %port du shield TSNéoLed!!!",
			'err_3': "Vous n'avez pas initialisé le shield GrovePi + avant de l'utiliser!!!",
			'err_4': "Vous n'avez pas initialisé le module %module avant de l'utiliser!!!",
			'err_5': "Vous n'avez pas initialisé de module sur la broche D%addr avant de l'utiliser!!!",
			'err_6': "Vous n'avez pas initialisé le shield TSNéoLed avant de l'utiliser!!!",
			'err_7': "La fonction addEvent n'est pas prise en charge.",
			'menu_file': 'Fichier',
			'menu_file_open': 'Ouvrir un fichier de mise en place',
			'menu_file_save': 'Enregistrer cette mise ne place',
		};

		var priv = {
			'GrovePi': null,
			'TSNeoLed': null,
			'ServoHat': {},
			'ext_tools': null,
			'debug': 3,
		};
		// }}}

		// Construction de l'espace de travail {{{
		var menus = newIndexed();
		var menu_top = newElement('div', 'bandeau');
		var menu = newElement('div', 'menu_context');
		var input = newElement('input');
		var div = newElement('div');
		var svg = newSVG('svg');

		input.type = 'file';
		input.accept = '.placement';
		input.style.display = 'none';
		addEvent(input, 'change', function() {
			if(window.FileReader) {
				var reader = new FileReader();
				var f = input.files[0];
				addEvent(reader, 'loadend', function(evt) {
					if(evt.target.readyState==FileReader.DONE) {
						unserialize(evt.target.result);
						resizeCaneva();
					}
				});
				addEvent(reader, 'error|abord', function(evt) {
					alert('Faire la fonction ouvrir un fichier en distant');
				});
				reader.readAsBinaryString(f);
			}
			input.value = '';
		});

		document.body.appendChild(menu_top);
		document.body.appendChild(menu);
		document.body.appendChild(div);
		document.body.appendChild(input);

		addEvent(document.body, "contextmenu", function(event) { 
			if(event.preventDefault != undefined)
				event.preventDefault();
			return false;
		});
		div.appendChild(svg);
		fillStyle(div, {position: 'absolute', top: '20px', left: '0px', minWidth:'100%', minHeight:'100%'});
		fillSVG(svg, {width: '800', height: '600'});

		var formular = newElement('div');
		document.body.appendChild(formular);
		fillStyle(formular, {position:'absolute', top:'24px', left:'0px'});

		function resizeCaneva() {
			var l = svg.getBBox();
			fillSVG(svg, {width:l.x+l.width+10, height:l.y+l.height+10});
		}

		var style = newElement('link');
		style.type = 'text/css';
		style.rel = 'stylesheet';
		style.href = "https://technoblin.github.io/ext4scratchX/lib/style.css";
		document.getElementsByTagName('head')[0].appendChild(style);
		// }}}

		// Gestion des événements du menu {{{
		var timerMenu = null;
		function cacher_menu() {
			if(timerMenu!=null) clearTimeout(timerMenu);
			timerMenu = setTimeout(function() { timerMenu=null; menu.style.display =  "none"; }, 100);
		}
		addEvent(menu, "mouseout", function() {
			cacher_menu();
		});
		addEvent(menu, "mouseover", function() {
			if(timerMenu!=null) { clearTimeout(timerMenu); timerMenu = null; }
			menu.style.display = 'block';
		});

		function ajouterMenuTitle(id, label, icon, text) {
			// Charger le menu, ajouter une entrée
			if(!menus.have(id))
				menus.set(id, {
					'div': newElement('div'),
					'items': newIndexed(),
				});
			var m = menus.get(id);

			var div = newElement('div');
			div.className = "menu_context_ligne";
			var ligne = newElement('nobr');
			div.appendChild(ligne);
			var div_img = newElement('div');
			div_img.className = "menu_context_img";
			var img = newImage(label, icon);
			div_img.appendChild(img);
			ligne.appendChild(div_img);
			var div_txt = newElement('div');
			div_txt.className = "menu_context_title";
			div_txt.appendChild(newText(text));
			ligne.appendChild(div_txt);
			m.div.appendChild(div);
		}

		function ajouterMenuItem(id, label, icon, text, callback) {
			// Charger le menu, ajouter une entrée
			if(!menus.have(id))
				menus.set(id, {
					'div': newelement('div'),
					'items': newindexed(),
				});
			var m = menus.get(id);

			var div = newElement('div');
			div.className = "menu_context_ligne lien";
			var ligne = newElement('nobr');
			div.appendChild(ligne);
			var div_img = newElement('div');
			div_img.className = "menu_context_img";
			var img = newImage(label, icon);
			div_img.appendChild(img);
			ligne.appendChild(div_img);
			var div_txt = newElement('div');
			div_txt.className = "menu_context_txt";
			div_txt.appendChild(newText(text));
			ligne.appendChild(div_txt);
			addEvent(div, 'click', function() {
				if(timerMenu!=null) { clearTimeout(timerMenu); timerMenu = null; }
				menu.style.display = "none";
				callback();
			});
			m.div.appendChild(div);
			m.items.set(label, div);
		}

		function selectItem(id, label, etat) {
			if(menus.have(id))
				if(menus.get(id).items.have(label)) {
					if(etat)
						menus.get(id).items.get(label).className = 'menu_context_ligne lien';
					else
						menus.get(id).items.get(label).className = 'menu_context_unselect';
				}
		}

		function afficherMenu(id, elem) {
			if(menus.have(id)) {
				if(timerMenu!=null) { clearTimeout(timerMenu); timerMenu = null; }
				menu.style.display = "none";
				cleanElement(menu);

				try {
					$(menu).fadeIn(200);
				} catch(ex) {}

				menu.appendChild(menus.get(id).div);
				menu.style.display = "block";

				try {
					var pos = $(elem).position();
					menu.style.left = pos.left+"px";
					menu.style.top = (10+pos.top)+"px";
				} catch(ex) {
					console.error(ex);
				}
			}
		}

		function ajouterItem(label, icon, text, callback) {
			var div = newElement('div');
			div.className = "menu_context_ligne lien";
			var ligne = newElement('nobr');
			div.appendChild(ligne);
			var div_img = newElement('div');
			div_img.className = "menu_context_img";
			var img = newImage(label, icon);
			div_img.appendChild(img);
			ligne.appendChild(div_img);
			var div_txt = newElement('div');
			div_txt.className = "menu_context_txt";
			div_txt.appendChild(newText(text));
			ligne.appendChild(div_txt);
			addEvent(div, 'click', function() {
				menu.style.display = "none";
				try {
					callback();
				} catch(ex) {
					console.error(ex);
				}
			});
			menu.appendChild(div);
		}

		function afficherMenuAjout(chaine, s, line, box) {
			if(timerMenu!=null) { clearTimeout(timerMenu); timerMenu = null; }
			menu.style.display = "none";
			cleanElement(menu);
			try {
				$(menu).fadeIn(200);
			} catch(ex) {}
			ajouterItem('action', 'images/icon_action.png', 'Ajouter une action', function() {
				var bl = newBlock('action', null);
				bl.fils[0] = chaine.fils[s];
				chaine.fils[s] = bl;
				exercice.redraw();
			});
			ajouterItem('test', 'images/icon_test.png', 'Ajouter un test', function() {
				var bl = newBlock('test', null);
				bl.fils[0] = chaine.fils[s];
				chaine.fils[s] = bl;
				exercice.redraw();
			});
			ajouterItem('branchement', 'images/icon_branche.png', 'Ajouter un branchement', function() {
				var bl = newBlock('branchement', null);
				bl.fils[0] = chaine.fils[s];
				chaine.fils[s] = bl;
				exercice.redraw();
			});
			ajouterItem('fin', 'images/icon_fin.png', 'Ajouter une fin', function() {
				var bl = newBlock('fin', null);
				bl.fils[0] = chaine.fils[s];
				chaine.fils[s] = bl;
				exercice.redraw();
			});
			ajouterItem('timer', 'images/icon_timer.png', 'Ajouter un timer', function() {
				var bl = newBlock('timer', 3);
				bl.fils[0] = chaine.fils[s];
				chaine.fils[s] = bl;
				exercice.redraw();
			});
			ajouterItem('attacher', 'images/icon_attacher.png', 'Relier la sortie à ...', function() {
				addC = {'chaine':chaine, 's':s};
			});
			menu.style.display = "block";

			var pos = $(box).position();
			var x = pos.left;
			var y = pos.top;

			x = ((x+menu.offsetWidth)>EnvData.width())?(x-menu.offsetWidth):x;
			y = ((y+menu.offsetHeight)>EnvData.height())?(y-menu.offsetHeight):y;

			if(x<0) x=0;
			if(y<15) y=15;

			menu.style.left = x+"px";
			menu.style.top = y+"px";
		}

		function afficherMenuBloque(chaine) {
			if(timerMenu!=null) { clearTimeout(timerMenu); timerMenu = null; }
			menu.style.display = "none";
			if(running) return;
			if(chaine!=debut) {
				cleanElement(menu);
				try {
					$(menu).fadeIn(200);
				} catch(ex) {}

				if(chaine.type=='action') {
					ajouterItem('change', 'images/icon_change.png', "Changer l'action", function() {
						modifierBloque(chaine);
					});
				} else {
					ajouterItem('change', 'images/icon_change.png', "Changer la condition", function() {
						modifierBloque(chaine);
					});
				}
				ajouterItem('action', 'images/icon_action.png', 'Ajouter une action avant', function() {
					var bl = newBlock('action', null);
					blocks.call(function(c) {
						if(c.fils[0]==chaine)
							c.fils[0] = bl;
						if(c.fils[1]==chaine)
							c.fils[1] = bl;
					});
					bl.fils[0] = chaine;
					exercice.redraw();
				});
				ajouterItem('test', 'images/icon_test.png', 'Ajouter un test avant', function() {
					var bl = newBlock('test', null);
					blocks.call(function(c) {
						if(c.fils[0]==chaine)
							c.fils[0] = bl;
						if(c.fils[1]==chaine)
							c.fils[1] = bl;
					});
					bl.fils[0] = chaine;
					exercice.redraw();
				});
				ajouterItem('branchement', 'images/icon_branche.png', 'Ajouter un branchement avant', function() {
					var bl = newBlock('branchement', null);
					blocks.call(function(c) {
						if(c.fils[0]==chaine)
							c.fils[0] = bl;
						if(c.fils[1]==chaine)
							c.fils[1] = bl;
					});
					bl.fils[0] = chaine;
					exercice.redraw();
				});
				ajouterItem('timer', 'images/icon_timer.png', 'Ajouter un timer avant', function() {
					var bl = newBlock('timer', 3);
					blocks.call(function(c) {
						if(c.fils[0]==chaine)
							c.fils[0] = bl;
						if(c.fils[1]==chaine)
							c.fils[1] = bl;
					});
					bl.fils[0] = chaine;
					exercice.redraw();
				});
				ajouterItem('supprimer', 'images/icon_supprimer.png', 'Supprimer le noeud', function() {
					var msg = LightBox.errorDescription('Attention !!!');
					msg.add("Voulez-vous supprimer définitivement le noeud ?");
					var buttons = newListe();
					buttons.add({label: Traducteur.GetMessage('Oui'), callback: function() { chaine.type = 'NOP'; exercice.redraw(); LightBox.close(); }});
					buttons.add({label: Traducteur.GetMessage('Non'), callback: function() { LightBox.close(); }});
					LightBox.demanderMessage(msg.message, buttons);
				});
				if(chaine.fils[0]!=null)
					ajouterItem('broke', 'images/icon_broke.png', 'Détacher du noeud suivant', function() { chaine.fils[0] = null; exercice.redraw(); });
				if(chaine.type=='branchement' && chaine.fils[1]!=null)
				ajouterItem('broke', 'images/icon_broke.png', 'Détacher du noeud à droite', function() { chaine.fils[1] = null; exercice.redraw(); });
				menu.style.display = "block";

				var pos = $(chaine.bloque).position();
				var x = pos.left;
				var y = pos.top;

				x = ((x+menu.offsetWidth)>EnvData.width())?(x-menu.offsetWidth):x;
				y = ((y+menu.offsetHeight)>EnvData.height())?(y-menu.offsetHeight):y;

				if(x<0) x=0;
				if(y<15) y=15;

				menu.style.left = x+"px";
				menu.style.top = y+"px";
			}
		}

		// }}}

		/* {{{ ** Fonctions courantes *************************************************
		 * Ethernety.net (Fonctions simples, manipulation XML/SVG)                    *
		 ******************************************************************************/

		function trace(level, message, parm) {
			console.log(parm);
			if(priv.debug >= level) {
				if(parm==undefined)
					console.log(Trad[message]);
				else
					console.log(Trad.traduir(message, parm));
			}
		}

		function opt2str(option) {
			var s = '';
			if(isSet(option)) {
				switch(typeof option) {
				case 'object':
					for(var i in option)
						s+= ', '+i+':'+serial(option[i]);
					break;
				case 'function':
					s = ', function '+option+'()';
					break;
				default:
					s = ', '+option;
				}
			}
			return s;
		}

		function min(a, b) {
			return (a<b)?a:b;
		}

		function max(a, b) {
			return (a<b)?b:a;
		}

		function dif(a, b) {
			return (a<b)?(b-a):(a-b);
		}

		function isSet(elem) {
			if(elem==false || elem==undefined || elem==null)
				return false;
			return true;
		}

		function newElement(name, cName) {
			var el = document.createElement(name);
			if(isSet(cName))
				el.className = cName;
			return el;
		}

		function newText(text) {
			return document.createTextNode(text);
		}

		function fillStyle(elem, fill) {
			if(isSet(elem))
				for(var i in fill)
					elem.style[i] = fill[i];
		}

		function newSVG(name) {
			return document.createElementNS("http://www.w3.org/2000/svg", name);
		}

		function fillSVG(elem, fill) {
			if(isSet(elem))
				for(var i in fill)
					elem.setAttribute(i, fill[i]);
		}

		function cleanElement(e) {
			try {
				if(e.lastChild!=undefined)
					while(e.lastChild!=null)
						e.removeChild(e.lastChild);
			} catch(ex) {}
		}

		function intToCol(i) {
			var h = parseInt(i).toString(16);
			while(h.length<6)
				h = '0'+h;
			return '#'+h;
		}

		function intToColLow(i, d) {
			var r = i&0xff0000;
			var g = i&0xff00;
			var b = i&0xff;
			r/=d; g/=d; b/=d;
			return intToCol((r&0xff0000)+(g&0xff00)+(b&0xff));
		}

		function alpha(i) {
			i = parseInt(i);
			var m = i & 0xff;
			i = (i - m)/256;
			var n = i & 0xff;
			i = (i - n)/256;
			if(n>m) m=n;
			n = i & 0xff;
			if(n>m) m=n;
			return 0.1+m/300;
		}

		function addr2hex(a) {
			a = parseInt(a).toString(16);
			if(a.length%2!=0)
				a = '0'+a;
			return '0x'+a;
		}

		function serial(o) {
			if(o==undefined)
				return "undefined";
			if(o==null)
				return "null";
			switch(typeof(o)) {
			case "object":
				var t = '', s='{';
				for(var i in o) {
					t+=s+i+':"'+serial(o[i])+'"';
					s=' ,';
				}
				return t+'}';
			case "function":
				return "function "+o+'()';
			}
			return o;
		}

		function clear(el) {
			while(el.firstChild!=null)
				el.removeChild(el.firstChild);
		}

		function decodeText(hex) {
			var str = '';
			for (var i = 0; i < hex.length; i += 2)
				str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
			return str;
		}

		function addEvent(element, type, callback) {
			if(callback==undefined || callback==null)
				return;
			if(typeof(callback)!='function') {
				var code = callback;
				callback = function() { eval(code); };
			}

			var f = function(event) {
				try {
					if(isSet(event.stopPropagation))
						event.stopPropagation();
				} catch(ex) {}
				try {
					return callback(event);
				} catch(ex) {
					trace(1, 'exception', ex);
				}
			};

			var t = type.split("|");
			for(var i=0; i<t.length; i++) {
				if(t[i].length>0) {
					if(isSet(element.addEventListener))
						element.addEventListener(t[i], f);
					else if(isSet(element.attachEvent))
						element.attachEvent('on'+t[i], f);
					else
						trace(1, 'err_7');
				}
			}
		}

		function addEventClick(element, action_click, action_dblclick) {
			var clicks = 0, timer = null;

			if(action_click==undefined || action_click==null)
				action_click = function() {};
			if(typeof(action_click)!='function') {
				var code = action_click;
				action_click = function() { eval(code); };
			}

			if(action_dblclick==undefined || action_dblclick==null)
				action_dblclick = function() {};
			if(typeof(action_dblclick)!='function') {
				var code = action_dblclick;
				action_dblclick = function() { eval(code); };
			}

			addEvent(element, 'click', function(event) {
				clicks++;
				if(clicks==1) {
					timer = setTimeout(function() {
						try  {
							action_click(event);
						} catch(ex) {
							console.error(ex);
						}
						clicks = 0;
					}, 400);
				} else {
					clearTimeout(timer);
					try  {
						action_dblclick(event);
					} catch(ex) {
						console.error(ex);
					}
					clicks = 0;
				}
			});
		}

		function newImage(label, icone) {
			var img = newElement('img');
			img.src = icone;
			addEvent(img, "error", function() {
				img.parentNode.removeChild(img);
			});
			return img;
		}

		function newAudio() {
			try {
				if(typeof(Audio)=='function') {
					return new Audio();
				} else if(typeof(Element)=='function') {
					return new Element("audio", {});
				}
			} catch(ex) {
				console.error(ex);
			}
			return null;
		}

		function newIndexed(init) {
			var priv = {};
			var indexed = {
				'set': function(id, value) {
					priv[id] = {
						'index': id,
						'value': value,
					};
				},
				'get': function(id) {
					if(priv[id]!=undefined)
						return priv[id].value;
					return undefined;
				},
				'unset': function(id) {
					priv[id] = undefined;
				},
				'have': function(id) {
					return priv[id] != undefined;
				},
				'serialize': function() {
					var serial = {};
					for(var i in priv)
						if(priv[i]!=undefined)
							serial[i] = priv[i].value;
					return serial;
				},
				'init': function(init) {
					if(isSet(init)) {
						if(isSet(init.serialize))
							init = init.serialize();
						for(i in init)
							this.set(i, init[i]);
					}
				},
				'clone': function(all) {
					if(!isSet(all))
						all = false;
					var cl = newIndexed();
					for(var i in priv)
						if(priv[i]!=undefined) {
							if(all) {
								// Clonnage HTML si possible
								try {
									if(isSet(priv[i].value.cloneNode)) {
										cl.add(i, priv[i].value.cloneNode(all));
										continue;
									}
								} catch(ex) { }
								// Clonnage JS si possible
								try {
									if(isSet(priv[i].value.clone)) {
										cl.add(i, priv[i].value.clone(all));
										continue;
									}
								} catch(ex) { }
							}
							cl.add(i, priv[i].value);
						}
					return cl;
				},
				'call': function(callback) {
					for(var i in priv)
						if(priv[i]!=undefined)
							callback(i, priv[i].value);
				},
				'free': function() {
					priv = {};
				},
			};
			indexed.init(init);
			return indexed;
		}
		// }}}

		/* {{{ ** EnvData *************************************************************
		 * Ethernety.net (Gestion des informations de l'environnement)                *
		 *                                                                            *
		 * EnvData::scrollTop : Récupérer la position du scroll Y de la fenêtre       *
		 * EnvData::scrollLeft : Récupérer la position du scroll X de la fenêtre      *
		 * EnvData::width : Récupérer la hauter de la fenêtre intérieur               *
		 * EnvData::height : Récupérer la largeur de la fenêtre intérieur             *
		 *                                                                            *
		 ******************************************************************************/
		function newEnvData() {
			var priv = {
				'souris': {'x':0, 'y':0},
				'infobulle': newElement('div'),
				'move': {
					'count': 0,
				},
			};

			function affiche_bulle(message) {
				if(isSet(message)) {
					priv.infobulle.innerHTML = "<div class='infobulle_contenu' style='text-align:"+ ((message.length > 30)?'left;':'center;') +"'>"+message+"</div>";
					priv.infobulle.style.display = "block";
					if(priv.infobulle.parentNode==null)
						document.body.appendChild(priv.infobulle);
				}
			}

			priv.infobulle.className = 'noprint infobulle';
			addEvent(document, "mousemove", function(event) {
				if(event.pageX) {
					priv.souris.x = event.pageX; priv.souris.y = event.pageY;
				} else if(event.clientX) {
					priv.souris.x = event.clientX+document.body.scrollLeft;
					priv.souris.y = event.clientY+document.body.scrollTop;
				}
				if(priv.infobulle.style.display=="block") {
					var x = priv.souris.x;
					var y = priv.souris.y;
					x = ((x+priv.infobulle.offsetWidth)>EnvData.width())?(x-priv.infobulle.offsetWidth):x;
					y = ((y+priv.infobulle.offsetHeight)>EnvData.height())?(y-priv.infobulle.offsetHeight):(y+15);
					if(x<0) x=0; if(y<0) y=0;

					priv.infobulle.style.left = x+'px';
					priv.infobulle.style.top = y+'px';
				}
				for(var i=0; i<priv.move.count; i++)
					if(priv.move[i]!=null) try {
						priv.move[i](priv.souris);
					} catch(ex) {}
			});
			return {
				"addBubble": function(elem, message) {
					addEvent(elem, "mouseover", function() { affiche_bulle(message); });
					addEvent(elem, "mouseout", function() { priv.infobulle.style.display = "none"; });
				},
				"hideBubble": function() {
					priv.infobulle.style.display = "none";
				},
				"souris": function(elem, abs) {
					if(!isSet(elem))
						return priv.souris;
					var p = $(elem).position();
					var w = $(elem).width();
					var h = $(elem).height();
					if(priv.souris.x>p.left && priv.souris.x<p.left+w
					&& priv.souris.y>p.top  && priv.souris.y<p.top+h)
						return { 'x':priv.souris.x-p.left, 'y':priv.souris.y-p.top };
					if(abs)
						return { 'x':priv.souris.x-p.left, 'y':priv.souris.y-p.top };
					return { 'x':0, 'y':0 };
				},
				'scrollTop': function() {
					if(window.pageYOffset!=undefined)
						return window.pageYOffset;
					if(document.documentElement!=undefined)
						return document.documentElement.scrollTop;
					return 0;
				},
				'scrollLeft': function() {
					if(window.pageXOffset!=undefined)
						return window.pageXOffset;
					if(document.documentElement!=undefined)
						return document.documentElement.scrollLeft;
					return 0;
				},
				'height': function() {
					return $(window).height();
				},
				'width': function() {
					return $(window).width();
				},
				'goToByScroll': function(elem, contener) {
					if(!isSet(contener)) {
						vTop = 60;
						contener = document.body;
					} else {
						vTop = contener.offsetTop;
					}
					$(contener).animate({scrollTop: elem.offsetTop()-vTop}, 'slow');
				},
				'alignTable': function(contener) {
					var table = contener.getElementsByTagName('table');
					var s = {};
					for(var i=0; i<table.length; i++) {
						var row = table[i].firstChild;
						var c=1;
						for(var cell=row.firstChild; cell!=null; cell=cell.nextSibling) {
							if(s[c]==undefined)
								s[c] = cell.offsetWidth;
							else
								s[c] = Math.max(s[c], cell.offsetWidth);
							c++;
						}
					}
					for(var i=0; i<table.length; i++) {
						var row = table[i].firstChild;
						var c=1;
						for(var cell=row.firstChild; cell!=null; cell=cell.nextSibling) {
							cell.style.width = (s[c]+10)+'px';
							c++;
						}
					}
				},
				'navigateur': function() {
					try {
						nav = navigator.userAgent.toLowerCase();
						if(trouver("msie",nav))		return "ie";
						if(trouver("firefox",nav))	return "firefox";
						if(trouver("chrome",nav))	return "chrome";
						if(trouver("safari",nav))	return "safari";
						if(trouver("webkit",nav))	return "webkit";
						if(trouver("opera",nav))	return "opera";
						if(trouver("netscape",nav))	return "netscape";

						popupStatus(nav, 5);
					} catch(ex) { }

					return "nothing";
				},
				'isMobileDevice': function() {
					return (/Android|iPhone|iPad|iPod|BlackBerry|windows phone|tablet|Touch/i.test(navigator.userAgent))?true:false;
				},
				// Micro$oft de merde
				'version_ie': function() {
					if(navigateur()=="ie") {
						var ms_version = navigator.appVersion.split("MSIE");
						return parseFloat(ms_version[1]);
					}
				},
				'isPrivateMode': function() {
					// Tester si firefox est en mode privé
					if(typeof(window.openPrivateWindow)=="function")
						return true;
					// Tester si ie est en mode privé
					if(window.clientInformation!=undefined && window.clientInformation.msDoNotTrack=="1")
						return true;
					return false;
				},
				'setMicroRequette': function(titre, url) {
					var stateObj = { foo: "bar" };
					window.history.pushState(stateObj, titre, url);
				},
				'addMouseMove': function(callback) {
					if(typeof(callback)=='function') {
						var i = priv.move.count++;
						priv.move[i] = callback;
						return i;
					}
					return -1;
				},
				'removeMouseMove': function(idx) {
					if(idx>=0 && idx<priv.move.count)
						priv.move[i] = null;
				},
			};
		}

		var EnvData = newEnvData();

		// }}}

		// Fonction de serialisation et déserialisation des données {{{
		function serialize() {
			var ser = '{';
			if(priv.GrovePi==null)
				ser+='NULL';
			else
				ser+= priv.GrovePi.serialize();
			ser+= ';';
			if(priv.TSNeoLed==null)
				ser+='NULL';
			else
				ser+= priv.TSNeoLed.serialize();
			ser+= ';';

			// TODO: Ajouter Adafruit

			return ser+'}';
		}

		function unserialize(ser) {
			var ok = true;
			var m;
			if((m=ser.match(/^{(.*)}$/))!=null) {
				ser = m[1];
				if((m=ser.match(/^((NULL)|(GrovePi\([^)]*\){({[^}]*})*}));(.*)/))!=null) {
					if(m[1]!='NULL' && priv.GrovePi!=null)
						ok&= priv.GrovePi.unserialize(m[1]);
					else if(priv.GrovePi!=null)
						ok = false;
					ser = m[5];
				} else
					return false;
				if((m=ser.match(/^((NULL)|(TSNeoLed\([^)]*\){({[^}]*})*}));(.*)/))!=null) {
					if(m[1]!='NULL' && priv.TSNeoLed!=null)
						ok&= priv.TSNeoLed.unserialize(m[1]);
					else if(priv.TSNeoLed!=null)
						ok = false;
					ser = m[5];
				} else
					return false;
				// TODO: Ajouter Adafruit
			}
		}
		// }}}

		// Création du menu {{{
		var board_name = newElement('span', 'menu_entry');
		menu_top.appendChild(board_name);
		var file = newElement('span', 'menu_entry');
		file.appendChild(newText(Trad['menu_file']));
		menu_top.appendChild(file);
		addEvent(file, 'mouseover', function() { afficherMenu('fichier', file); });
		addEvent(file, 'mouseout', function() { cacher_menu(); });
		ajouterMenuTitle('fichier', 'file', 'icon_file', Trad['menu_file']);
		ajouterMenuItem('fichier', 'open', 'icon_open', Trad['menu_file_open'], function() {
			input.click();
		});
		ajouterMenuItem('fichier', 'save', 'icon_save', Trad['menu_file_save'], function() {
			var f = newElement('a');
			f.setAttribute('href', "data:text/plain;charset=utf-8,"+encodeURIComponent(serialize()));
			f.setAttribute('download', "Virtual.placement");
			f.style.display = 'none';
			document.body.appendChild(f);
			f.click(true);
			document.body.removeChild(f);
		});

		var version = newElement('span');
		version.className = 'menu_version';
		version.appendChild(newText('Simulateur by Ethernety.net'));
		EnvData.addBubble(version, "Simulateur extension 4 scratchX by Ethernety.net<br />Entièrement codé par Jean BLIN - technoblin@free.fr");

		menu_top.appendChild(version);
		addEvent(version, 'click', function() { window.open('http://scratch.ethernety.net'); });
		// }}}

		// Gestion du déplacement des objets graphiques {{{
		var drop = {
			type: null,
			dev: null,
			position: null,
			x:0, dx:0,
			y:0, dy:0,
		};

		function startMove(dev) {
			var s = EnvData.souris();
			drop.type = 'm';
			drop.dev = dev;
			drop.position = dev.position();
			drop.dx = s.x;
			drop.dy = s.y;
			dev.select(true);
			dev.callEvent();
		}

		function startRotate(dev) {
			var s = EnvData.souris();
			drop.type = 'r';
			drop.dev = dev;
			drop.position = dev.position();
			drop.dx = s.x;
			drop.dy = s.y;
			dev.select(true);
			dev.callEvent();
		}

		function startSlide(dev) {
			var s = EnvData.souris();
			drop.type = 's';
			drop.dev = dev;
			drop.pos = dev.get();
			drop.dx = s.x;
			dev.select(true);
			dev.callEvent();
		}

		function stopDrop() {
			if(drop.dev!=null) {
				drop.type = null;
				drop.dev.select(false);
				drop.dev = null;
			}
		}

		function dropEffect(souris) {
			switch(drop.type) {
			case 'm':
				var es = drop.dev.getBBox();
				var x, y;
				if(es.x+drop.position.x+souris.x-drop.dx>0)
					x = drop.position.x+souris.x-drop.dx;
				else
					x = -es.x;
				if(es.y+drop.position.y+souris.y-drop.dy>0)
					y = drop.position.y+souris.y-drop.dy;
				else
					y = -es.y;
				drop.dev.move(x, y);
				resizeCaneva();
				break;
			case 'r':
				var a = drop.position.a;
				if(dif(souris.x, drop.dx)>dif(souris.y, drop.dy)) {
					a+=souris.x-drop.dx;
				} else {
					a+=souris.y-drop.dy;
				}
				drop.dev.rotate(a);
				resizeCaneva();
				break;
			case 's':
				drop.dev.set(drop.pos+souris.x-drop.dx);
				break;
			}
		}

		EnvData.addMouseMove(dropEffect);
		var select_pos = null;
		var select_box = newSVG('rect');
		svg.appendChild(select_box);
		fillSVG(select_box, {'fill':'none', 'stroke':'#000', 'stroke-width':'0.3', 'opacity': '0'});
		addEvent(document, "mousedown", function(event) {
			var s = EnvData.souris(svg, true);
			select_pos = {x:s.x, y:s.y};
			fillSVG(select_box, {'opacity':'1', 'x':s.x,'y':s.y,'width':1,'height':1});
		});
		addEvent(document.body, 'mouseup', function(event) {
			fillSVG(select_box, {opacity:'0'});
			select_pos = null;
			stopDrop();
		});
		EnvData.addMouseMove(function(souris) {
			if(select_pos!=null) {
				var s = EnvData.souris(svg, true);
				var x, y;
				var w = s.x-select_pos.x;
				var h = s.y-select_pos.y;
				if(w<0) {
					x=s.x; w=-w;
				} else
					x=select_pos.x;
				if(h<0) {
					y=s.y; h=-h;
				} else
					y=select_pos.y;
				fillSVG(select_box, {'x':x,'y':y,'width':w,'height':h});
				resizeCaneva();
			}
		});
		// }}}

		// Gestion des retours vers le ext_tools {{{
		function connectionSend(msg) {
			try  {
				if(priv.ext_tools==null)
					setTimeout(function() { connectionSend(msg); }, 100);
				else
					priv.ext_tools.onMessage(msg);
			} catch(ex) {
				trace(1, 'exception', ex);
			}
		}

		function dataUpdate(idx, data) {
			try  {
				if(priv.ext_tools==null)
					setTimeout(function() { dataUpdate(idx, data); }, 100);
				else
					priv.ext_tools.setSensorData(idx, data);
			} catch(ex) {
				trace(1, 'exception', ex);
			}
		}
		function error(message, parm) {
			if(parm==undefined)
				priv.ext_tools.error(Trad[message]);
			else
				priv.ext_tools.error(Trad.traduir(message, parm));
		}
		// }}}

		// Dessiner une slidebar d'un min à max {{{
		function newFormular() {
			var g = newSVG('g');
			svg.appendChild(g);
			var bg = newSVG('path');
			g.appendChild(bg);
			fillSVG(bg, {'fill':'#eee', 'stroke':'#111', 'stroke-width':'0.7'});
			var c = newSVG('g');
			g.appendChild(c);

			// Ajouter un outil au formulaire
			function appendContent(node) {
				var b = c.getBBox();
				c.appendChild(node);
				fillSVG(node, {'transform':'translate(0,'+(b.height)+')'});
				var b = c.getBBox();
				fillSVG(bg, {'d':'m0,-2 h'+b.width+' q2,0 2,2 v'+b.height+' q0,2 -2,2 h-'+b.width+' q-2,0 -2,-2 v-'+b.height+' q0,-2 2,-2 z'});
			}

			function newLabel(label) {
				var g = newSVG('g');
				var t = newSVG('text');
				t.appendChild(newText(label));
				fillSVG(t, {'fill': '#111', 'font-size':'11', 'font-family':'Times New Roman', 'x':0, 'y':10});
				g.appendChild(t);
				appendContent(g);

				return g;
			}

			function newInput(value, cb) {
				var g = newSVG('g');
				var t = newSVG('text');
				t.appendChild(newText(value));
				fillSVG(t, {contentEditable:"true"});
				g.appendChild(t);
				appendContent(g);
				return g;
			}

			// Dessiner une slidebar d'un min à max {{{
			function newSlideBar(min, max, value, cb) {
				var g = newSVG('g');
				var bg = newSVG('path');
				fillSVG(bg, {'fill':'#229', 'stroke':'#111', 'stroke-width':'0.5', 'd':'m2,2 h46 q2,0 2,2 v3 q0,2 -2,2 h-46 q-2,0 -2,-2 v-3 q0,-2 2,-2 z'});
				g.appendChild(bg);
				var cu = newSVG('path');
				fillSVG(cu, {'fill':'#eee', 'stroke':'#222', 'stroke-width':'0.7', 'd':'m1,0 h2 q1,0 1,1 v9 q0,1 -1,1 h-2 q-1,0 -1,-1 v-9 q0,-1 1,-1 z'});
				g.appendChild(cu);
				var pos = Math.floor((value-min)*46/(max-min));
				fillSVG(cu, {'transform':'translate('+pos+',0)'});

				var dev = {
					get: function() { return pos; },
					set: function(p) {
						pos=p;
						if(pos<0) pos=0;
						else if(pos>46) pos=46;
						fillSVG(cu, {'transform':'translate('+pos+',0)'});
						cb(this.value());
					},
					value: function() {
						return min+Math.floor(pos*(max-min)/46);
					},
					select: function(etat) {
						fillSVG(cu, {'stroke':(etat?'#555':'#222'), 'stroke-width':(etat?'1':'0.7')});
					},
					callEvent: function() {
						g.removeChild(cu);
						g.appendChild(cu);
					},
				};

				addEvent(cu, 'mousedown', function(event) {
					event.stopPropagation();
					if(event.buttons==1)
						startSlide(dev);
					return false;
				});

				appendContent(g);

				return dev;
			}
			// }}}

			return {
				addLabel: function(label) {
					newLabel(label);
				},
				addSlidebar: function(min, max, value, cb) {
					newSlideBar(min, max, value, cb);
				},
				addInput: function(value, cb) {
					newInput(value, cb);
				},
				move: function(x, y) {
					fillSVG(g, {transform:'translate('+x+','+y+')'});
				},
				hide: function() {
					fillSVG(g, {opacity:0, width:0, height:0});
				},
				show: function() {
					var l = g.getBBox();
					svg.removeChild(g);
					svg.appendChild(g);
					fillSVG(g, {opacity:1, width:l.width, height:l.height});
				},
			};
		}
		// }}}

		// Connecteurs
		// type: P plat D droit, es: A analog D num I i2c R rpiserie S serie W nothing, orient: N haut E droite S bas W gauche
		// Créer un nouveau périphérique {{{
		function makeDevice(opt) {
			var priv = {
				'cons':{
					'count':0,
				},
				'attach': {
					'count':0,
				},
			};

			var graph = newSVG('g');
			var select = newSVG('path');

			svg.appendChild(graph);
			graph.appendChild(select);
			graph.style.cursor = 'move';

			function newGroveBoard(lx, ly, up) {
				var board = newSVG('path');
				var x = (lx*31)/2;
				var y = (ly*31)/2;
				var path = 'm-'+x+',-'+y;
				var h = "c0,-5 7,-5";
				var b = "c0,5 7,5";
				for(var i=0; i<lx; i++) {
					path+= " h12 "+(up?h:b)+" 7,0 h12";
					up = !up;
				}
				h = "c5,0 5,7";
				b = "c-5,0 -5,7";
				for(var i=0; i<ly; i++) {
					path+= " v12 "+(up?h:b)+" 0,7 v12";
					up = !up;
				}
				h = "c0,5 -7,5";
				b = "c0,-5 -7,-5";
				for(var i=0; i<lx; i++) {
					path+= " h-12 "+(up?h:b)+" -7,0 h-12";
					up = !up;
				}
				h = "c-5,0 -5,-7";
				b = "c5,0 5,-7";
				for(var i=0; i<ly; i++) {
					path+= " v-12 "+(up?h:b)+" 0,-7 v-12";
					up = !up;
				}
				path+= ' z';
				fillSVG(board, {'fill':'#22a', 'stroke':'#333', 'stroke-width':'1', 'd':path});
				fillSVG(select, {'fill':'none', 'stroke':'#0ff', 'stroke-width':'4', 'd':path});
				return board;
			}

			function newConnector(opt) {
				var g = newSVG('g');
				// Connecteur
				var conn = newSVG('path');
				fillSVG(conn, {'fill':opt.color, 'stroke':'#111', 'stroke-width':'1', 'd':opt.path});
				g.appendChild(conn);
				if(isSet(opt.adornment))
					opt.adornment(g);
				// Connecteur du cable emboité
				var wire = newSVG('path');
				if(isSet(opt.wire)) {
					var c = isSet(opt.wcolor)?opt.wire.color:opt.color;
					fillSVG(wire, {'fill':c, 'stroke':'#111', 'stroke-width':'0.5', 'opacity':0, 'd':opt.wire.path});
					g.appendChild(wire);
				}
				// Point d'encrage des câbles et courbure
				var wp = {}; var wd = {};

				var a = opt.anchor;
				for(var i=0; isSet(a[i]); i++) {
					wp[i] = newSVG('line');
					fillSVG(wp[i], {'opacity':'0', 'stroke':'#111', 'stroke-width':'0', 'x1':a[i].x, 'y1':a[i].y, 'x2':a[i].x, 'y2':a[i].y});
					g.appendChild(wp[i]);
					if(a[i].dx!=undefined) {
						wd[i] = newSVG('line');
						fillSVG(wd[i], {'opacity':'0', 'stroke':'#111', 'stroke-width':'0', 'x1':a[i].dx, 'y1':a[i].dy, 'x2':a[i].dx, 'y2':a[i].dy});
						g.appendChild(wd[i]);
					} else {
						wd[i] = null;
					}
				}

				// Positionnement et orientation du connecteur
				var tr = 'translate('+opt.x+','+opt.y+')';
				switch(opt.orient) {
				case 'S':
					tr+= ' rotate(180)';
					break;
				case 'E':
					tr+= ' rotate(90)';
					break;
				case 'W':
					tr+= ' rotate(270)';
					break;
				}
				fillSVG(g, {transform:tr});

				// Exporter le connecteur
				var list = {
					count: 0,
					add: function(i) {
						this[this.count++] = i;
					},
				};

				var con = {
					opt: opt,
					g: g,
					positions: function() {
						var p = {};
						var tx = document.body.scrollLeft;
						var ty = document.body.scrollTop;
						for(var i in wp) {
							var tp = wp[i].getBoundingClientRect();
							if(wd[i]!=null) {
								g.appendChild(wd[i]);
								var td = wd[i].getBoundingClientRect();
								p[i] = {
									x: tp.left+tx,
									y: tp.top+ty-20,
									dx: td.left+tx,
									dy: td.top+ty-20,
								};
								g.removeChild(wd[i]);
							} else {
								var td = opt.anchor.calc(i, tp);
								p[i] = {
									x: tp.left+tx,
									y: tp.top+ty-20,
									dx: td.left+tx,
									dy: td.top+ty-20,
								};
							}
						}
						return p;
					},
					connect: function(state) {
						fillSVG(wire, {'opacity':(state?1:0)});
					},
					addListener: function(callback) {
						list.add(callback);
					},
					callListener: function() {
						for(var i=0; i<list.count; i++)
							list[i]();
					},
				};

				priv.cons[priv.cons.count++] = con;
				graph.appendChild(g);

				return con;
			}

			function newGroveCon(opt) {
				// Couleur du connecteur en fonction de son type (abstrait)
				var color = {
					'A':'#ee9',
					'D':'#e99',
					'I':'#99e',
					'R':'#9e9',
					'S':'#e95',
					'W':'#eee',
				};

				// Initialisation de la couleur
				if(color[opt.es]==undefined)
					opt.es = 'W';

				var parm = {
					color: color[opt.es],
					wire: {},
					anchor: {},
					x: opt.x,
					y: opt.y,
					orient: opt.orient,
				};

				switch(opt.type) {
				case 'D':
					parm.path = "m-10,-5 v10 h20 v-10 h-3 v2 h-14 v-2 z";
					parm.wire.path = "m-9,-4 v8 h18 v-8 h-1 v2 h-16 v-2 z";
					parm.anchor = {
						0: {x:6, y:1},
						1: {x:2, y:1},
						2: {x:-2, y:1},
						3: {x:-6, y:1},
						'calc': function(id, px) {
							return {left:px.left, top:px.top-50};
						},
					};
					parm.adornment = function(g) {
						for(var ox=-6; ox<=6; ox+=4) {
							var p = newSVG('line');
							fillSVG(p, {'stroke':'#333', 'stroke-width':'1', 'x1':ox, 'y1':1, 'x2':ox, 'y2':2});
							g.appendChild(p);
						}
					};
					break;
				case 'P':
				default:
					parm.path = "m-10,-6 h5 v3 h10 v-3 h5 v13 h-20 z";
					parm.wire.path = "m-10,-6 h5 v3 h10 v-3 h5 v-7 h-20 z";
					parm.anchor = {
						0: {x:-6, y:-13, dx:-6, dy:-63},
						1: {x:-2, y:-13, dx:-2, dy:-63},
						2: {x:2, y:-13, dx:2, dy:-63},
						3: {x:6, y:-13, dx:6, dy:-63},
					};
					parm.adornment = function(g) {
						for(var ox=-6; ox<=6; ox+=4) {
							var p = newSVG('line');
							fillSVG(p, {'stroke':'#333', 'stroke-width':'1', 'x1':ox, 'y1':7, 'x2':ox, 'y2':10});
							g.appendChild(p);
						}
					};
					break;
				}

				return newConnector(parm);
			}

			function newLedCon(opt) {
				return newConnector({
					color: '#888',
					path: 'm10,-7 v7 l-7,7 h-6 l-7,-7 v-7 z',
					wire: {
						color: '#8e8',
						path: 'm10,-7 v-7 l-7,-7 h-6 l-7,7 v7 z',
					},
					anchor: {
						0: {x:2, y:-21, dx:2, dy:-71},
						1: {x:0, y:-21, dx:0, dy:-71},
						2: {x:-2, y:-21, dx:-2, dy:-71},
					},
					x: opt.x,
					y: opt.y,
					orient: opt.orient,
				});
			}

			function newBornCon(opt) {
				return newConnector({
					color: '#1a1',
					path: 'm-7,-3 h13 v7 h-13 z',
					anchor: {
						0: {x:-3, y:-3, dx:-3, dy:-53},
						1: {x:3, y:-3, dx:-3, dy:-53},
					},
					x: opt.x,
					y: opt.y,
					orient: opt.orient,
				});
			}

			function newMircoSwitch(opt) {
				var g = newSVG('g');
				// Connecteur 12 x 6*count
				var sw = newSVG('path');
				fillSVG(sw, {'fill':'#222', 'stroke':'#000', 'stroke-width':'1', 'd':'m'+(-3*opt.count)+',6 v-12 h'+(6*opt.count)+' v12 z'});
				g.appendChild(sw);

				var sb = {};
				var sp = {};
				var x = 3*opt.count-6;
				for(var i=0; i<opt.count; i++) {
					sb[i] = newSVG('path');
					sp[i] = newSVG('path');
					fillSVG(sb[i], {'fill':'#eaa', 'stroke':'#888', 'stroke-width':'0.7', 'd':'m'+(x+1)+',-3 h4 v6 h-4 z'});
					fillSVG(sp[i], {'fill':'#aea', 'stroke':'#888', 'stroke-width':'0.5', 'd':'m'+(x+1)+',0 h4 v3 h-4 z'});
					g.appendChild(sb[i]);
					g.appendChild(sp[i]);
					x-=6;
				}
				// Positionnement et orientation du connecteur
				var tr = 'translate('+opt.x+','+opt.y+')';
				switch(opt.orient) {
				case 'S':
					tr+= ' rotate(180)';
					break;
				case 'E':
					tr+= ' rotate(90)';
					break;
				case 'W':
					tr+= ' rotate(270)';
					break;
				}
				fillSVG(g, {transform:tr});

				// Exporter le connecteur
				return {
					opt: opt,
					g: g,
					set: function(v) {
						var x = 3*opt.count-6; var f=1;
						for(var i=0; i<opt.count; i++) {
							if((v&f)!=0)
								fillSVG(sp[i], {'d':'m'+(x+1)+',-3 h4 v3 h-4 z'});
							else
								fillSVG(sp[i], {'d':'m'+(x+1)+',0 h4 v3 h-4 z'});
							x-=6; f*=2;
						}
					},
				};
			}

			function newCI(opt) {
				var g = newSVG('g');

				// Connecteur
				var ci = newSVG('path');

				var p;
				switch(opt.type) {
				case '2x':
					var l = opt.c*3;
					p = 'm-'+(l/4)+',-'+(l/2)+' h'+(l/2);
					for(var i=0; i<opt.c; i++)
						p+= ' v1.5 h2 h-2 v1.5';
					p+= ' h-'+(l/2);
					for(var i=0; i<opt.c; i++)
						p+= ' v-1.5 h-2 h2 v-1.5';
					p+= 'z';
					break;
				case '4x':
					var l = opt.c*3;
					p = 'm-'+(l/2)+',-'+(l/2);
					for(var i=0; i<opt.c; i++)
						p+= ' h1.5 v-2 v2 h1.5';
					for(var i=0; i<opt.c; i++)
						p+= ' v1.5 h2 h-2 v1.5';
					for(var i=0; i<opt.c; i++)
						p+= ' h-1.5 v2 v-2 h-1.5';
					for(var i=0; i<opt.c; i++)
						p+= ' v-1.5 h-2 h2 v-1.5';
					p+= 'z';
					break;
				}

				// Dessin du connecteur complet
				fillSVG(ci, {'fill':'#222', 'stroke':'#555', 'stroke-width':'1', 'd':p});
				g.appendChild(ci);

				// Positionnement et orientation du connecteur
				var tr = 'translate('+opt.x+','+opt.y+')';
				switch(opt.orient) {
				case 'E':
					tr+= ' rotate(90)';
					break;
				case 'S':
					tr+= ' rotate(180)';
					break;
				case 'W':
					tr+= ' rotate(270)';
					break;
				}
				if(opt.scale!=undefined)
					tr+= ' scale('+opt.scale+')';
				fillSVG(g, {transform:tr});

				return {
					opt: opt,
					g: g,
				};
			}

			var px = 0, py = 0, pa = 0;

			var dev = {
				'move': function(x, y) {
					px = x; py = y;
					fillSVG(graph, {transform:'translate('+px+','+py+') rotate('+pa+')'});
					this.callEvent();
				},
				'rotate': function(a) {
					pa = a;
					fillSVG(graph, {transform:'translate('+px+','+py+') rotate('+pa+')'});
					this.callEvent();
				},
				'position': function() {
					return {x:px, y:py, a:pa};
				},
				'serialize': function() {
					return 'x:'+px+';y:'+py+';a:'+pa+';';
				},
				'unserialize': function(ser) {
					var m;
					if((m=ser.match(/^x:([+-]?[0-9.]+);y:([+-]?[0-9.]+);a:([+-]?[0-9.]+);/))!=null) {
						px = parseFloat(m[1]);
						py = parseFloat(m[2]);
						pa = parseFloat(m[3]);
						fillSVG(graph, {transform:'translate('+px+','+py+') rotate('+pa+')'});
						this.callEvent();
						return true;
					}
					return false;
				},
				'select': function(e) {
					fillSVG(select, {'opacity': (e==false)?'0':'0.5'});
				},
				'getBBox': function() {
					return graph.getBBox();
				},
				'addSVG': function(type) {
					var s = newSVG(type);
					graph.appendChild(s);
					return s;
				},
				'addConnector': function(opt) {
					try {
						return newConnector(opt);
					} catch(ex) {
						trace(1, 'exception', ex);
					}
				},
				'addGroveCon': function(opt) {
					try {
						return newGroveCon(opt);
					} catch(ex) {
						trace(1, 'exception', ex);
					}
				},
				'addLedCon': function(opt) {
					try {
						return newLedCon(opt);
					} catch(ex) {
						trace(1, 'exception', ex);
					}
				},
				'addBornCon': function(opt) {
					try {
						return newBornCon(opt);
					} catch(ex) {
						trace(1, 'exception', ex);
					}
				},
				'addMicroSwitch': function(opt) {
					try {
						var s = newMircoSwitch(opt);
						graph.appendChild(s.g);
						return s;
					} catch(ex) {
						trace(1, 'exception', ex);
					}
				},
				'addCI': function(opt) {
					try {
						var c = newCI(opt);
						graph.appendChild(c.g);
						return c;
					} catch(ex) {
						trace(1, 'exception', ex);
					}
				},
				'addLabel': function(txt, opt) {
					try {
						var t = newSVG('text');
						graph.appendChild(t);
						t.appendChild(newText(txt));
						fillSVG(t, {'fill': '#eee', 'x':opt.x, 'y':opt.y, 'font-size':'11', 'font-family':'Monospace'});
						if(opt.color)
							fillSVG(t, {'fill': opt.color});
						var tr = '';
						if(opt.rotate)
							tr = 'rotate('+opt.rotate+')';
						if(opt.scale)
							tr+= ' scale('+opt.scale+')';
						if(tr!='')
							fillSVG(t, {transform:tr});
						return t;
					} catch(ex) {
						trace(1, 'exception', ex);
					}
				},
				'callEvent': function() {
					for(var i=0; i<priv.cons.count; i++)
						priv.cons[i].callListener();
					for(var i=0; i<priv.attach.count; i++)
						priv.attach[i]();
				},
				'addEventListener': function(type, callback) {
					addEvent(graph, type, callback);
				},
				'attach': function(cb) {
					priv.attach[priv.attach.count++] = cb;
				},
			};

			if(isSet(opt.board)) {
				var p = opt.board.split(' ');
				switch(p[0]) {
				case 'Grove':
					graph.appendChild(newGroveBoard(parseInt(p[1]), parseInt(p[2]), p[3]=='u'));
					break;
				case 'Direct':
					var c = opt.bgcolor==undefined?'#22a':opt.bgcolor;
					var b = newSVG('path');
					fillSVG(b, {'fill':c, 'stroke':'#333', 'stroke-width':'1', 'd':opt.board.substr(7)});
					fillSVG(select, {'fill':'none', 'stroke':'#0ee', 'stroke-width':'4', 'd':opt.board.substr(7)});
					graph.appendChild(b);
					break;
				}
			}

			fillSVG(select, {'opacity': '0'});

			addEvent(graph, 'mousedown', function(event) {
				event.stopPropagation();
				svg.removeChild(graph);
				svg.appendChild(graph);
				if(event.buttons==1)
					startMove(dev);
				else if(event.buttons==2)
					startRotate(dev);
				return false;
			});

			return dev;
		}
		// }}}

		// Dessiner les câbles {{{
		function newWire(col, c1, c2) {
			c1.connect(true);
			c2.connect(true);
			var wire = {};
			for(var i in col) {
				wire[i] = newSVG('path');
				svg.appendChild(wire[i]);
				fillSVG(wire[i], {'fill':'none', 'stroke':col[i], 'stroke-width':'2'});
			}

			var calc = function() {
				var p1 = c1.positions();
				var p2 = c2.positions();

				for(var i in wire) {
					var p = 'M'+p1[i].x+','+p1[i].y;
					p+= ' C'+p1[i].dx+','+p1[i].dy;
					p+= ' '+p2[i].dx+','+p2[i].dy;
					p+= ' '+p2[i].x+','+p2[i].y;
					fillSVG(wire[i], {'d':p});
					svg.removeChild(wire[i]);
					svg.appendChild(wire[i]);
				}
			};

			c1.addListener(calc);
			c2.addListener(calc);
			calc();
		}

		function newGroveWire(c1, c2) {
			newWire({
				0: '#ee0',
				1: '#aaa',
				2: '#e00',
				3: '#111',
			}, c1, c2);
		}

		function newTSLedWire(c1, c2) {
			newWire({
				0: '#e00',
				1: '#0e0',
				2: '#111',
			}, c1, c2);
		}
		// }}}

		// Dessin du Grove LED {{{
		function newGroveLED(c) {
			var d = makeDevice({board: 'Grove 1 1 u'});
			EnvData.addBubble(d, "Module LED");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'E', x:-8, y:0});
			var light = d.addSVG('circle');

			var on = '#f00', off = '#500';
			if(isSet(c)) {
				on = intToCol(c);
				off = intToColLow(c, 3);
			}

			var etat = false;
			fillSVG(light, {'fill':off, 'stroke':'#000', 'stroke-width':'0.3', 'cx':'8','cy':'8','r':'6'});

			return {
				'element': d,
				'connector': con,
				'set': function(st) {
					etat = st;
					fillSVG(light, {'fill':st?on:off});
				},
				'reinit': function() {
					this.set(false);
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove button {{{
		function newGroveButton(idx) {
			var d = makeDevice({board: 'Grove 1 1 u'});
			EnvData.addBubble(d, "Module Button");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'E', x:-8, y:0});
			var btnS = d.addSVG('path');
			var btn = d.addSVG('circle');

			fillSVG(btnS, {'fill':'#aaa', 'stroke':'#000', 'stroke-width':'0.7', 'd':'M1,5 h10 v-10 h-10 z'});
			fillSVG(btn, {'fill':'#666', 'stroke':'#000', 'stroke-width':'0.3', 'cx':'6','cy':'0','r':'3'});

			addEvent(btn, 'mousedown', function(event) {
				event.stopPropagation();

				dataUpdate(idx, 1);
			});

			addEvent(btn, 'mouseup', function(event) {
				event.stopPropagation();

				dataUpdate(idx, 0);
			});

			btn.style.cursor = 'pointer';

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove buzzer {{{
		function newGroveBuzzer() {
			var audio = null;
			var d = makeDevice({board: 'Grove 1 1 u'});
			EnvData.addBubble(d, "Module Buzzer");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'E', x:-8, y:0});
			var buzN = d.addSVG('circle');
			var buzG = d.addSVG('circle');
			var grap = d.addLabel('Buz', {color:'#CCC', x:2, y:-2, scale:0.7, opacity:0});

			fillSVG(buzN, {'fill':'#111', 'stroke':'#000', 'stroke-width':'0.3', 'cx':'6','cy':'0','r':'6'});
			fillSVG(buzG, {'fill':'#AAA', 'stroke':'#000', 'stroke-width':'0.3', 'cx':'6','cy':'0','r':'2'});

			return {
				'element': d,
				'connector': con,
				'tone': function() {
					if(audio==null) {
						audio = newAudio();
						if(audio!=null) {
							audio.src = "https://technoblin.github.io/ext4scratchX/lib/buzzer.mp3";
							audio.loop = true;
						}
					}
					if(audio!=null)
						audio.play();
					fillSVG(grap, {opacity: 0.8});
				},
				'notone': function() {
					if(audio!=null)
						audio.pause();
					fillSVG(grap, {opacity: 0});
				},
				'set': function(etat) {
					if(etat)
						this.tone();
					else
						this.notone();
				},
				'reinit': function() {
					if(audio!=null)
						audio.pause();
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove Relay {{{
		function newGroveRelay() {
			var d = makeDevice({board: 'Grove 2 1 u'});
			EnvData.addBubble(d, "Module Relay");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'E', x:-24, y:0});
			var relay = d.addSVG('path');
			var born = d.addBornCon({orient:'S', x:-10, y:8});
			
			fillSVG(relay, {'fill':'#333', 'stroke':'#000', 'stroke-width':'1', 'd':'m0,-10 h27 v20 h-27 z'});

			var etat = false;

			return {
				'element': d,
				'connector': con,
				'set': function(st) {
					etat = st;
				},
				'reinit': function() {
					this.set(false);
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove chainable RGB LED {{{
		function newGroveChainableRGBLed(cnt) {
			var d = makeDevice({board: 'Grove 2 1 u'});
			EnvData.addBubble(d, "Module Chainable RGB LED");

			// Connecteur Droit Digital Orienté Droite
			var cin = d.addGroveCon({type: 'P', es: 'D', orient: 'W', x:-25, y:0});
			var cout = d.addGroveCon({type: 'P', es: 'D', orient: 'E', x:25, y:0});
			var diode = d.addSVG('circle');
			var light = d.addSVG('circle');

			fillSVG(diode, {'fill':'#ccc', 'stroke':'#000', 'stroke-width':'0.3', 'cx':'0','cy':'0','r':'8'});
			fillSVG(light, {'fill':'#000', 'stroke':'none', 'cx':'0','cy':'0','r':'9','opacity':0});
			var mod = {
				'isChainable': true,
				'element': d,
				'connector': cin,
				'set': function(n, color) {
					if(n<=0)
						fillSVG(light, {'fill':intToCol(color), 'opacity': alpha(color)});
					else if(this.next!=undefined)
						this.next.set(n-1, color);
				},
				'reinit': function() {
					this.set(0, 0);
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
					if(this.next!=undefined) {
						p.x+= Math.floor(90*Math.cos(p.a*Math.PI/180));
						p.y+= Math.floor(90*Math.sin(p.a*Math.PI/180));
						this.next.placing(p);
					}
					resizeCaneva();
				},
			};
			if(cnt>1) {
				mod.next = newGroveChainableRGBLed(cnt-1);
				newGroveWire(cout, mod.next.connector);
			}
			d.__serialize = d.serialize;
			d.serialize = function() {
				return this.__serialize()+((mod.next!=undefined)?mod.next.element.serialize():"");
			};
			d.__unserialize = d.unserialize;
			d.unserialize = function(ser) {
				var m;
				if((m=ser.match(/^x:([+-]?[0-9.]+);y:([+-]?[0-9.]+);a:([+-]?[0-9.]+);(.*)/))!=null) {
					this.__unserialize(ser);
					if(mod.next!=undefined)
						return mod.next.element.unserialize(m[4]);
				}
				return false;
			};

			return mod;
		}
		// }}}

		// Dessin du Grove LED Bar {{{
		function newGroveLedBar() {
			var d = makeDevice({board: 'Grove 2 1 d'});
			EnvData.addBubble(d, "Module LED bar");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'P', es: 'D', orient: 'W', x:-25, y:0});
			var box = d.addSVG('rect');
			fillSVG(box, {'fill':'#111', 'stroke':'#000', 'stroke-width':'0.3', 'x':'-10','y':'-8','width':'40', 'height':'16'});
			var diode = {};
			for(var i=1;i<=10;i++) {
				diode[i] = d.addSVG('rect');
				fillSVG(diode[i], {'fill':'#666', 'stroke':'#000', 'stroke-width':'0.3', 'x':(4*i-13),'y':'-6','width':'3', 'height':'12'});
			}

			var redFirst = true;
			var clear = false;
			var mod = {
				'isLedBar': true,
				'element': d,
				'connector': con,
				'set': function(n, etat) {
					if(clear) this.clear();
					if(!redFirst)
						n=11-n
					if(etat==0)
						fillSVG(diode[n], {'fill':'#666'});
					else if(n==1)
						fillSVG(diode[n], {'fill':'#f33'});
					else if(n==2)
						fillSVG(diode[n], {'fill':'#ff3'});
					else
						fillSVG(diode[n], {'fill':'#3f3'});
				},
				'conf': function(order) {
					switch(order) {
					case 'clear':
					case 'full':
						for(var i=1;i<=10;i++)
							this.set(i, order=='full'?1:0);
						break;
					case 'redFirst':
						redFirst=true;
						clear=true;
						break;
					case 'redLast':
						redFirst=false;
						clear=true;
						break;
					}
				},
				'clear': function() {
					clear=false;
					for(var i=1;i<=10;i++)
						this.set(i, 0);
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
					resizeCaneva();
				},
			};
			return mod;
		}
		// }}}

		// Dessin du Grove 4 digit display {{{
		function newGrove4digit() {
			var d = makeDevice({board: 'Grove 2 1 d'});
			EnvData.addBubble(d, "Module 4 digits display");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'P', es: 'D', orient: 'W', x:-25, y:0});
			var box = d.addSVG('rect');
			fillSVG(box, {'fill':'#111', 'stroke':'#000', 'stroke-width':'0.3', 'x':'-27','y':'-13','width':'64', 'height':'25'});
			var diode = {};
			var digit = {
				1:{x:-13,d:"-11 h8 l1,1 l-2,2 h-6 l-2,-2"},	// haut
				2:{x:-3,d:"-9 v8 l-1,1 l-2,-2 v-6 l2,-2"},	// haut droite
				3:{x:-3,d:"0 v8 l-1,1 l-2,-2 v-6 l2,-2"},	// bas droite
				4:{x:-12,d:"7 h6 l2,2 l-1,1 h-8 l-1,-1"},	// bas
				5:{x:-14,d:"9 l2,-2 v-6 l-2,-2 l-1,1 v8"},	// bas gauche
				6:{x:-14,d:"0 l2,-2 v-6 l-2,-2 l-1,1 v8"},	// haut gauche
				0:{x:-13.5,d:"0 l1.5,-1.5 h6 l1.5,1.5 l-1.5,1.5 h-6"},	// milieu
			};
			var code = {
				'0': '1111110',
				'1': '0110000',
				'2': '1101101',
				'3': '1111001',
				'4': '0110011',
				'5': '1011011',
				'6': '1011111',
				'7': '1110000',
				'8': '1111111',
				'9': '1111011',
				'a': '1110111',
				'A': '1110111',
				'b': '0011111',
				'B': '0011111',
				'c': '1001110',
				'C': '1001110',
				'd': '0111101',
				'D': '0111101',
				'e': '1001111',
				'E': '1001111',
				'f': '1000111',
				'F': '1000111',
			};
			var p=0;
			for(var i=1;i<=28;i++) {
				diode[i] = d.addSVG('path');
				fillSVG(diode[i], {'fill':'#333', 'stroke':'#000', 'stroke-width':'0.3', 'd':"m"+(digit[i%7].x+(16*p-10))+","+(digit[i%7].d)+" z"});
				if(i%7==0) p++;
			}
			diode[29] = d.addSVG('circle');
			fillSVG(diode[29], {'fill':'#333', 'stroke':'#000', 'stroke-width':'0.3', "cx":5, "cy":-4, 'r':1.5});
			diode[30] = d.addSVG('circle');
			fillSVG(diode[30], {'fill':'#333', 'stroke':'#000', 'stroke-width':'0.3', "cx":5, "cy":4, 'r':1.5});

			var redFirst = true;
			var clear = false;
			var mod = {
				'isDigitDisp': true,
				'element': d,
				'connector': con,
				'set': function(n, etat) {
					if(diode[n]!=undefined)
						fillSVG(diode[n], {"fill":(etat?'#f33':'#333')});
				},
				'aff': function(num) {
					for(var i=0;i<5;i++) {
						if(num[i]!=undefined) {
							if(i==2) {
								switch(num[i]) {
								case ':':
									fillSVG(diode[29], {'fill':'#f33'});
									fillSVG(diode[30], {'fill':'#f33'});
									break;
								case '.':
									fillSVG(diode[29], {'fill':'#333'});
									fillSVG(diode[30], {'fill':'#f33'});
									break;
								case "'":
									fillSVG(diode[29], {'fill':'#f33'});
									fillSVG(diode[30], {'fill':'#333'});
									break;
								default:
									fillSVG(diode[29], {'fill':'#333'});
									fillSVG(diode[30], {'fill':'#333'});
									break;
								}
							} else if(code[num[i]]!=undefined) { // Digit reconnue
								var k=i<2?i:i-1;
								for(var j=0; j<7; j++)
									fillSVG(diode[k*7+j+1], {'fill':(code[num[i]][j]=='0'?'#333':'#f33')});
							} else { // Digit inconnue
								var k=i<2?i:i-1;
								for(var j=0; j<7; j++)
									fillSVG(diode[k*7+j+1], {'fill':'#333'});
							}
						}
					}
				},
				'clear': function() {
					for(var i=1;i<=30;i++)
						fillSVG(diode[i], {"fill":'#333'});
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
					resizeCaneva();
				},
			};
			return mod;
		}
		// }}}

		// Dessin du Grove Ultrasonic Digital {{{
		function newGroveUltrasonic(idx) {
			var d = makeDevice({bgcolor: '#22a', board: 'Direct m0,-20.5 h40.75 q3,0 3,3 v35 q0,3 -3,3 h-81.5 q-3,0 -3,-3 v-35 q0,-3 3,-3 z'});
			EnvData.addBubble(d, "Module Ultrasonic Ranger");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'N', x:0, y:-19.5});
			var sn1 = d.addSVG('circle');
			var sn2 = d.addSVG('circle');
			var sn3 = d.addSVG('circle');
			var sn4 = d.addSVG('circle');

			fillSVG(sn1, {'fill':'#aaa', 'stroke':'#000', 'stroke-width':'0.7', 'cx':'-20.5', 'cy':'0', 'r':'16'});
			fillSVG(sn2, {'fill':'#111', 'stroke':'#000', 'stroke-width':'0.7', 'cx':'-20.5', 'cy':'0', 'r':'10'});
			fillSVG(sn3, {'fill':'#aaa', 'stroke':'#000', 'stroke-width':'0.7', 'cx':'20.5', 'cy':'0', 'r':'16'});
			fillSVG(sn4, {'fill':'#111', 'stroke':'#000', 'stroke-width':'0.7', 'cx':'20.5', 'cy':'0', 'r':'10'});

			var f = newFormular();
			f.addLabel('Distance :');
			f.addSlidebar(1, 30, 30, function(v) {
				dataUpdate(idx, v);
			});
			f.hide();
			d.attach(function() {
				f.hide();
			});

			addEventClick(d, null, function() {
				// Ajouter un outil pour régler la distance mesuré
				var p = d.position();
				f.move(p.x, p.y);
				f.show();
			});

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove DHT {{{
		function newGroveDHT(idx) {
			var d = makeDevice({board: 'Grove 1 1 u'});
			EnvData.addBubble(d, "Module Digital HT");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'E', x:-8, y:0});
			var btnS = d.addSVG('path');
			var btn = d.addSVG('circle');

			fillSVG(btnS, {'fill':'#aaa', 'stroke':'#000', 'stroke-width':'0.7', 'd':'M1,5 h10 v-10 h-10 z'});
			fillSVG(btn, {'fill':'#666', 'stroke':'#000', 'stroke-width':'0.3', 'cx':'6','cy':'0','r':'3'});

			addEvent(btn, 'mousedown', function(event) {
				event.stopPropagation();

				dataUpdate(idx, 1);
			});

			addEvent(btn, 'mouseup', function(event) {
				event.stopPropagation();

				dataUpdate(idx, 0);
			});

			btn.style.cursor = 'pointer';

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove PIR {{{
		function newGrovePIR(idx) {
			var d = makeDevice({board: 'Grove 2 1 u'});
			EnvData.addBubble(d, "Module PIR Motion");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'E', x:-24, y:0});
			var cap = d.addSVG('circle');
			var PIR = d.addSVG('circle');

			fillSVG(cap, {'fill':'#eee', 'stroke':'#111', 'stroke-width':'0.3', 'cx':'12','cy':'0','r':'9'});
			fillSVG(PIR, {'fill':'#e00', 'stroke':'#300', 'stroke-width':'0.3', 'cx':'12','cy':'0','r':'24','opacity':'0.1'});

			var on = false;
			var PIRset = function() { dataUpdate(idx, 1); setTimeout(function() { dataUpdate(idx,0); }, 1000); };

			var i = null;
			var e = 0;

			EnvData.addMouseMove(function(u) {
				if(on) PIRset();
			});
			addEvent(PIR, 'mouseover', function() {
				PIRset();
				on=true;
				if(i!=null) clearInterval(i);
				i = setInterval(function() {
					e=1-e;
					if(e==1) fillSVG(PIR, {'opacity':'0.3'});
					else fillSVG(PIR, {'opacity':'0.1'});
				}, 500);
			});
			addEvent(PIR, 'mouseout', function() {
				on=false;
				clearInterval(i); i=null;
				fillSVG(PIR, {'opacity':'0.1'});
			});

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove IR Line Finder {{{
		function newGroveButton(idx) {
			var d = makeDevice({board: 'Grove 1 1 u'});
			EnvData.addBubble(d, "Module IR Line Finder");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'D', orient: 'E', x:-8, y:0});
			var btnS = d.addSVG('path');
			var btn = d.addSVG('circle');

			fillSVG(btnS, {'fill':'#aaa', 'stroke':'#000', 'stroke-width':'0.7', 'd':'M1,5 h10 v-10 h-10 z'});
			fillSVG(btn, {'fill':'#666', 'stroke':'#000', 'stroke-width':'0.3', 'cx':'6','cy':'0','r':'3'});

			addEvent(btn, 'mousedown', function(event) {
				event.stopPropagation();

				dataUpdate(idx, 1);
			});

			addEvent(btn, 'mouseup', function(event) {
				event.stopPropagation();

				dataUpdate(idx, 0);
			});

			btn.style.cursor = 'pointer';

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin d'un Grove I2C Hub {{{
		function newGroveI2Chub() {
			var d = makeDevice({board: 'Grove 2 1 d'});
			EnvData.addBubble(d, "Module I2C hub");

			// Connecteur Droit Digital Orienté Droite
			var cons = {
				0: d.addGroveCon({type: 'D', es: 'I', orient: 'W', x:-24, y:0}),
				1: d.addGroveCon({type: 'D', es: 'I', orient: 'W', x:-8, y:0}),
				2: d.addGroveCon({type: 'D', es: 'I', orient: 'W', x:8, y:0}),
				3: d.addGroveCon({type: 'D', es: 'I', orient: 'W', x:24, y:0}),
			};

			return {
				'element': d,
				'connector': cons,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}

		// }}}

		// Dessin du Grove serial GPS {{{
		function newGroveGPS(idx) {
			var lat = 0;
			var lon = 0;
			var sat = 0;
			var d = makeDevice({board: 'Grove 2 1 u'});
			EnvData.addBubble(d, "Module Grove GPS");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'R', orient: 'E', x:-24, y:0});
			var cab = d.addSVG('path');
			var map = d.addSVG('path');

			fillSVG(cab, {'fill':'none', 'stroke':'#000', 'stroke-width':'1', 'd':"m26,-12 q20,0 0,20"});
			fillSVG(map, {'fill':'#ddd', 'stroke':'#000', 'stroke-width':'1', 'd':"m16,2 h20 v20 h-20 z"});

			/*
			var form = newElement('table');
			var r = newElement('tr');
			form.appendChild(r);
			var c = newElement('td');
			r.appendChild(c);
			c.appendChild(newText('Latitude :'));
			c = newElement('td');
			r.appendChild(c);
			var latI = newElement('input');
			c.appendChild(latI);

			r = newElement('tr');
			form.appendChild(r);
			c = newElement('td');
			r.appendChild(c);
			c.appendChild(newText('Longitude :'));
			c = newElement('td');
			r.appendChild(c);
			var lonI = newElement('input');
			c.appendChild(lonI);

			r = newElement('tr');
			form.appendChild(r);
			c = newElement('td');
			r.appendChild(c);
			c = newElement('td');
			r.appendChild(c);
			var btn = newElement('button');
			c.appendChild(btn);
			btn.appendChild(newText('Mettre à jour'));
			addEvent(btn, 'click', function() {
				var i = parseFloat(latI.value);
				if(!isNaN(i)) {
					while(i>180) i-=180;
					while(i<-180) i+=180;
					lat = i;
				}
				i = parseFloat(lonI.value);
				if(!isNaN(i)) {
					while(i>180) i-=180;
					while(i<-180) i+=180;
					lon = i;
				}
				sat = 6;
			});
			*/

			addEvent(map, 'click', function() {
				clear(formular);
				formular.appendChild(form);
			});

			var f = newFormular();
			f.addLabel('Latitude :');
			f.addInput(0, function(v) {
				dataUpdate(idx, v);
			});
			f.addLabel('Longitude :');
			f.addInput(0, function(v) {
				dataUpdate(idx, v);
			});
			f.hide();
			d.attach(function() {
				f.hide();
			});

			addEventClick(d, null, function() {
				// Ajouter un outil pour régler la distance mesuré
				var p = d.position();
				f.move(p.x, p.y);
				f.show();
			});


			// En boucle :
			setInterval(function() {
				if(sat<=0)
					dataUpdate(idx, 'GPS:0:0:0:0');
				else
					dataUpdate(idx, 'GPS:'+(lat-0.0001+0.0002*Math.random())+':'+(lon-0.0001+0.0002*Math.random())+':'+sat+':0');
			}, 1000);

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove I2C oLED Display 128x64 {{{
		var policeOled = {
			  0: [0x00,0x7E,0x42,0x42,0x42,0x42,0x7E,0x00],
			 31: [0x00,0x14,0x3E,0x55,0x55,0x41,0x00,0x00],
			 32: [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
			 33: [0x00,0x00,0x5F,0x00,0x00,0x00,0x00,0x00],
			 34: [0x00,0x00,0x07,0x00,0x07,0x00,0x00,0x00],
			 35: [0x00,0x14,0x7F,0x14,0x7F,0x14,0x00,0x00],
			 36: [0x00,0x24,0x2A,0x7F,0x2A,0x12,0x00,0x00],
			 37: [0x00,0x23,0x13,0x08,0x64,0x62,0x00,0x00],
			 38: [0x00,0x36,0x49,0x55,0x22,0x50,0x00,0x00],
			 39: [0x00,0x00,0x05,0x03,0x00,0x00,0x00,0x00],
			 40: [0x00,0x1C,0x22,0x41,0x00,0x00,0x00,0x00],
			 41: [0x00,0x41,0x22,0x1C,0x00,0x00,0x00,0x00],
			 42: [0x00,0x08,0x2A,0x1C,0x2A,0x08,0x00,0x00],
			 43: [0x00,0x08,0x08,0x3E,0x08,0x08,0x00,0x00],
			 44: [0x00,0xA0,0x60,0x00,0x00,0x00,0x00,0x00],
			 45: [0x00,0x08,0x08,0x08,0x08,0x08,0x00,0x00],
			 46: [0x00,0x60,0x60,0x00,0x00,0x00,0x00,0x00],
			 47: [0x00,0x20,0x10,0x08,0x04,0x02,0x00,0x00],
			 48: [0x00,0x3E,0x51,0x49,0x45,0x3E,0x00,0x00],
			 49: [0x00,0x00,0x42,0x7F,0x40,0x00,0x00,0x00],
			 50: [0x00,0x62,0x51,0x49,0x49,0x46,0x00,0x00],
			 51: [0x00,0x22,0x41,0x49,0x49,0x36,0x00,0x00],
			 52: [0x00,0x18,0x14,0x12,0x7F,0x10,0x00,0x00],
			 53: [0x00,0x27,0x45,0x45,0x45,0x39,0x00,0x00],
			 54: [0x00,0x3C,0x4A,0x49,0x49,0x30,0x00,0x00],
			 55: [0x00,0x01,0x71,0x09,0x05,0x03,0x00,0x00],
			 56: [0x00,0x36,0x49,0x49,0x49,0x36,0x00,0x00],
			 57: [0x00,0x06,0x49,0x49,0x29,0x1E,0x00,0x00],
			 58: [0x00,0x00,0x36,0x36,0x00,0x00,0x00,0x00],
			 59: [0x00,0x00,0xAC,0x6C,0x00,0x00,0x00,0x00],
			 60: [0x00,0x08,0x14,0x22,0x41,0x00,0x00,0x00],
			 61: [0x00,0x14,0x14,0x14,0x14,0x14,0x00,0x00],
			 62: [0x00,0x41,0x22,0x14,0x08,0x00,0x00,0x00],
			 63: [0x00,0x02,0x01,0x51,0x09,0x06,0x00,0x00],
			 64: [0x00,0x32,0x49,0x79,0x41,0x3E,0x00,0x00],
			 65: [0x00,0x7E,0x09,0x09,0x09,0x7E,0x00,0x00],
			 66: [0x00,0x7F,0x49,0x49,0x49,0x36,0x00,0x00],
			 67: [0x00,0x3E,0x41,0x41,0x41,0x22,0x00,0x00],
			 68: [0x00,0x7F,0x41,0x41,0x22,0x1C,0x00,0x00],
			 69: [0x00,0x7F,0x49,0x49,0x49,0x41,0x00,0x00],
			 70: [0x00,0x7F,0x09,0x09,0x09,0x01,0x00,0x00],
			 71: [0x00,0x3E,0x41,0x41,0x51,0x72,0x00,0x00],
			 72: [0x00,0x7F,0x08,0x08,0x08,0x7F,0x00,0x00],
			 73: [0x00,0x41,0x7F,0x41,0x00,0x00,0x00,0x00],
			 74: [0x00,0x20,0x40,0x41,0x3F,0x01,0x00,0x00],
			 75: [0x00,0x7F,0x08,0x14,0x22,0x41,0x00,0x00],
			 76: [0x00,0x7F,0x40,0x40,0x40,0x40,0x00,0x00],
			 77: [0x00,0x7F,0x02,0x0C,0x02,0x7F,0x00,0x00],
			 78: [0x00,0x7F,0x04,0x08,0x10,0x7F,0x00,0x00],
			 79: [0x00,0x3E,0x41,0x41,0x41,0x3E,0x00,0x00],
			 80: [0x00,0x7F,0x09,0x09,0x09,0x06,0x00,0x00],
			 81: [0x00,0x3E,0x41,0x51,0x21,0x5E,0x00,0x00],
			 82: [0x00,0x7F,0x09,0x19,0x29,0x46,0x00,0x00],
			 83: [0x00,0x26,0x49,0x49,0x49,0x32,0x00,0x00],
			 84: [0x00,0x01,0x01,0x7F,0x01,0x01,0x00,0x00],
			 85: [0x00,0x3F,0x40,0x40,0x40,0x3F,0x00,0x00],
			 86: [0x00,0x1F,0x20,0x40,0x20,0x1F,0x00,0x00],
			 87: [0x00,0x3F,0x40,0x38,0x40,0x3F,0x00,0x00],
			 88: [0x00,0x63,0x14,0x08,0x14,0x63,0x00,0x00],
			 89: [0x00,0x03,0x04,0x78,0x04,0x03,0x00,0x00],
			 90: [0x00,0x61,0x51,0x49,0x45,0x43,0x00,0x00],
			 91: [0x00,0x7F,0x41,0x41,0x00,0x00,0x00,0x00],
			 92: [0x00,0x02,0x04,0x08,0x10,0x20,0x00,0x00],
			 93: [0x00,0x41,0x41,0x7F,0x00,0x00,0x00,0x00],
			 94: [0x00,0x04,0x02,0x01,0x02,0x04,0x00,0x00],
			 95: [0x00,0x80,0x80,0x80,0x80,0x80,0x00,0x00],
			 96: [0x00,0x01,0x02,0x04,0x00,0x00,0x00,0x00],
			 97: [0x00,0x20,0x54,0x54,0x54,0x78,0x00,0x00],
			 98: [0x00,0x7F,0x48,0x44,0x44,0x38,0x00,0x00],
			 99: [0x00,0x38,0x44,0x44,0x28,0x00,0x00,0x00],
			100: [0x00,0x38,0x44,0x44,0x48,0x7F,0x00,0x00],
			101: [0x00,0x38,0x54,0x54,0x54,0x18,0x00,0x00],
			102: [0x00,0x08,0x7E,0x09,0x02,0x00,0x00,0x00],
			103: [0x00,0x18,0xA4,0xA4,0xA4,0x7C,0x00,0x00],
			104: [0x00,0x7F,0x08,0x04,0x04,0x78,0x00,0x00],
			105: [0x00,0x00,0x7D,0x00,0x00,0x00,0x00,0x00],
			106: [0x00,0x80,0x84,0x7D,0x00,0x00,0x00,0x00],
			107: [0x00,0x7F,0x10,0x28,0x44,0x00,0x00,0x00],
			108: [0x00,0x41,0x7F,0x40,0x00,0x00,0x00,0x00],
			109: [0x00,0x7C,0x04,0x18,0x04,0x78,0x00,0x00],
			110: [0x00,0x7C,0x08,0x04,0x7C,0x00,0x00,0x00],
			111: [0x00,0x38,0x44,0x44,0x38,0x00,0x00,0x00],
			112: [0x00,0xFC,0x24,0x24,0x18,0x00,0x00,0x00],
			113: [0x00,0x18,0x24,0x24,0xFC,0x00,0x00,0x00],
			114: [0x00,0x00,0x7C,0x08,0x04,0x00,0x00,0x00],
			115: [0x00,0x48,0x54,0x54,0x24,0x00,0x00,0x00],
			116: [0x00,0x04,0x7F,0x44,0x00,0x00,0x00,0x00],
			117: [0x00,0x3C,0x40,0x40,0x7C,0x00,0x00,0x00],
			118: [0x00,0x1C,0x20,0x40,0x20,0x1C,0x00,0x00],
			119: [0x00,0x3C,0x40,0x30,0x40,0x3C,0x00,0x00],
			120: [0x00,0x44,0x28,0x10,0x28,0x44,0x00,0x00],
			121: [0x00,0x1C,0xA0,0xA0,0x7C,0x00,0x00,0x00],
			122: [0x00,0x44,0x64,0x54,0x4C,0x44,0x00,0x00],
			123: [0x00,0x08,0x36,0x41,0x00,0x00,0x00,0x00],
			124: [0x00,0x00,0x7F,0x00,0x00,0x00,0x00,0x00],
			125: [0x00,0x41,0x36,0x08,0x00,0x00,0x00,0x00],
			126: [0x00,0x02,0x01,0x01,0x02,0x01,0x00,0x00],
			127: [0x00,0x02,0x05,0x05,0x02,0x00,0x00,0x00], 
			169: [0x00,0x3C,0x5A,0x66,0x66,0x42,0x3C,0x00], // Copyright
			224: [0x00,0x20,0x55,0x56,0x56,0x78,0x00,0x00], // à
			225: [0x00,0x20,0x56,0x56,0x55,0x78,0x00,0x00],
			226: [0x00,0x20,0x56,0x55,0x56,0x78,0x00,0x00], // â
			227: [0x00,0x20,0x56,0x55,0x56,0x79,0x00,0x00], // ã
			228: [0x00,0x20,0x55,0x54,0x55,0x78,0x00,0x00], // ä
			229: [0x00,0x20,0x54,0x57,0x57,0x78,0x00,0x00], // ä
			230: [0x00,0x24,0x54,0x78,0x54,0x58,0x00,0x00], // ae
			231: [0x00,0x1C,0xA2,0x62,0x14,0x00,0x00,0x00], // ç
			232: [0x00,0x38,0x55,0x56,0x56,0x18,0x00,0x00], // è
			233: [0x00,0x38,0x56,0x56,0x55,0x18,0x00,0x00], // é
			234: [0x00,0x38,0x56,0x55,0x56,0x18,0x00,0x00], // ê
			235: [0x00,0x38,0x55,0x54,0x55,0x18,0x00,0x00], // ë
			236: [0x00,0x01,0x7A,0x04,0x00,0x00,0x00,0x00], // ì
			237: [0x00,0x04,0x7A,0x01,0x00,0x00,0x00,0x00],  
			238: [0x00,0x02,0x79,0x02,0x00,0x00,0x00,0x00], // î
			239: [0x00,0x01,0x7D,0x01,0x00,0x00,0x00,0x00], // ï
			240: [0x00,0x30,0x4C,0x4B,0x4A,0x3D,0x00,0x00],
			241: [0x00,0x7A,0x11,0x0A,0x71,0x00,0x00,0x00], // ñ
			242: [0x00,0x38,0x45,0x46,0x38,0x00,0x00,0x00], // ò
			243: [0x00,0x38,0x46,0x45,0x38,0x00,0x00,0x00],
			244: [0x00,0x3A,0x45,0x46,0x38,0x00,0x00,0x00], // ô
			245: [0x00,0x3A,0x45,0x46,0x39,0x00,0x00,0x00], // õ
			246: [0x00,0x39,0x45,0x45,0x39,0x00,0x00,0x00], // ö
			247: [0x00,0x10,0x10,0x54,0x10,0x10,0x00,0x00], // Divide
			248: [0x00,0x58,0x24,0x54,0x48,0x34,0x00,0x00], // Empty
			249: [0x00,0x38,0x41,0x42,0x78,0x00,0x00,0x00], // ù
			250: [0x00,0x38,0x42,0x41,0x78,0x00,0x00,0x00], // ù
			251: [0x00,0x3A,0x41,0x42,0x78,0x00,0x00,0x00], // û
			252: [0x00,0x3A,0x40,0x42,0x78,0x00,0x00,0x00], // ü
			G0: [0x00,0x00,0x00,0xFF,0x00,0x00,0x00,0x00],
			G1: [0x08,0x08,0x08,0xFF,0x00,0x00,0x00,0x00],
			G2: [0x24,0x24,0x24,0xFF,0x00,0x00,0x00,0x00],
			G3: [0x08,0x08,0xFF,0x00,0x00,0xFF,0x00,0x00],
			G4: [0x08,0x08,0xF8,0x08,0x08,0xF8,0x00,0x00],
			G5: [0x24,0x24,0x24,0xFC,0x00,0x00,0x00,0x00],
			G6: [0x24,0x24,0xE7,0x00,0x00,0xFF,0x00,0x00],
			G7: [0x00,0x00,0xFF,0x00,0x00,0xFF,0x00,0x00],
			G8: [0x00,0x00,0xFF,0x00,0x00,0xFF,0x00,0x00],
			G9: [0x24,0x24,0xE4,0x04,0x04,0xFC,0x00,0x00],
			GA: [0x24,0x24,0x27,0x20,0x20,0x3F,0x00,0x00],
			GB: [0x08,0x08,0x0F,0x08,0x08,0x0F,0x00,0x00],
			GC: [0x24,0x24,0x24,0x08,0x00,0x00,0x00,0x00],
			GD: [0x08,0x08,0x08,0xF8,0x00,0x00,0x00,0x00],
			GE: [0x00,0x00,0x00,0x0F,0x08,0x08,0x08,0x08],
			GF: [0x08,0x08,0x08,0x0F,0x08,0x08,0x08,0x08],
			GG: [0x08,0x08,0x08,0xF8,0x08,0x08,0x08,0x08],
			GH: [0x00,0x00,0x00,0xFF,0x08,0x08,0x08,0x08],
			GI: [0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08],
			GJ: [0x08,0x08,0x08,0xFF,0x08,0x08,0x08,0x08],
			GK: [0x00,0x00,0x00,0xFF,0x24,0x24,0x24,0x24],
			GL: [0x00,0x00,0xFF,0x00,0x00,0xFF,0x08,0x08],
		};

		function newGroveOLEDgeneric(d, w, h) {
			var point = {};

			var screen = d.addSVG('g');

			var back = newSVG('rect');
			fillSVG(back, {'fill': '#111', 'stroke':'#111', 'stroke-width': '1', 'x':'-1', 'y':'-1', 'width':(w+2), 'height':(h+2)});
			screen.appendChild(back);

			for(var x=0;x<w;x++)
				for(var y=0;y<h;y++) {
					var p = newSVG('rect');
					screen.appendChild(p);
					fillSVG(p, {'fill':'#fff', 'stroke':'none', 'x':x, 'y':y, 'width':1, 'height':1, 'opacity':'0.1'});
					point[x+';'+y] = p;
				}

			screen.setBackground = function(c) {
				fillSVG(back, {'fill': c});
			};
			screen.setPoint = function(x, y, a) {
				if(point[x+';'+y]!=undefined)
					fillSVG(point[x+';'+y], {'opacity':a});
			};

			return screen;
		}

		function newGroveOLED128x64() {
			var d = makeDevice({board: 'Grove 2 1 d'});
			EnvData.addBubble(d, "Module oLed display 128x64");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'P', es: 'I', orient: 'W', x:-25, y:0});
			var screen = newGroveOLEDgeneric(d, 128, 64);
			fillSVG(screen, {'transform':'translate(-15, -12) scale(0.35, 0.35)'});
		
			addEvent(screen, 'mouseover', function() {fillSVG(screen, {'transform':'translate(-15, -32) scale(1, 1)'}); resizeCaneva(); });
			addEvent(screen, 'mouseout', function() {fillSVG(screen, {'transform':'translate(-15, -12) scale(0.35, 0.35)'});});
			var cx=0;
			var cy=0;
			return {
				'element': d,
				'connector': con,
				'reinit': function() {
					screen.setBackground('#373');
					this.clear();
				},
				'setBrightness': function(level) {
					if(level<25)
						screen.setBackground('#373');
					else if(level<50)
						screen.setBackground('#494');
					else if(level<75)
						screen.setBackground('#5D5');
					else
						screen.setBackground('#6E6');
				},
				'gotoXY': function(x, y) {
					cx=x; cy=y;
				},
				'clear': function() {
					for(var y=0; y<8; y++) {
						this.gotoXY(0, y);
						for(var x=0; x<16; x++) {
							this.putChar(' ');
						}
					}
				},
				'putChar': function(c) {
					var f=this.font(c);
					for(var i=0;i<8;i++)
						for(var j=0;j<8;j++)
							screen.setPoint((cx*8+i), (cy*8+j), (((f[i]>>j)&0x01)==0x01)?'0.9':'0.1');
					cx++;
				},
				'font': function(c) {
					var code = c.charCodeAt(0);
					if(policeOled[code]==undefined)
						code = 0;
					return policeOled[code];
				},
				'print': function(msg) {
					msg = decodeText(msg);
					console.log('oLED.print('+msg+')');
					for(var i=0; i<msg.length; i++)
						this.putChar(msg[i]);
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}

		function newGroveOLED96x96() {
			var d = makeDevice({board: 'Grove 2 2 d'});
			EnvData.addBubble(d, "Module oLed display 96x96");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'P', es: 'I', orient: 'W', x:-25, y:0});
			var screen = newGroveOLEDgeneric(d, 96, 96);
			fillSVG(screen, {'transform':'translate(-15, -20) scale(0.48, 0.48)'});
		
			addEvent(screen, 'mouseover', function() {fillSVG(screen, {'transform':'translate(-15, -48) scale(1, 1)'}); var l = svg.getBBox(); fillSVG(svg, {width:l.x+l.width+10, height:l.y+l.height+10}); });
			addEvent(screen, 'mouseout', function() {fillSVG(screen, {'transform':'translate(-15, -20) scale(0.48, 0.48)'});});
			var cx=0;
			var cy=0;
			return {
				'element': d,
				'connector': con,
				'reinit': function() {
					screen.setBackground('#373');
					this.clear();
				},
				'setBrightness': function(level) {
					if(level<25)
						screen.setBackground('#373');
					else if(level<50)
						screen.setBackground('#494');
					else if(level<75)
						screen.setBackground('#5D5');
					else
						screen.setBackground('#6E6');
				},
				'gotoXY': function(x, y) {
					cx=x; cy=y;
				},
				'clear': function() {
					for(var y=0; y<8; y++) {
						this.gotoXY(0, y);
						for(var x=0; x<16; x++) {
							this.putChar(' ');
						}
					}
				},
				'putChar': function(c) {
					var f=this.font(c);
					for(var i=0;i<8;i++)
						for(var j=0;j<8;j++)
							screen.setPoint((cx*8+i), (cy*8+j), (((f[i]>>j)&0x01)==0x01)?'0.9':'0.1');
					cx++;
				},
				'font': function(c) {
					var code = c.charCodeAt(0);
					if(policeOled[code]==undefined)
						code = 0;
					return policeOled[code];
				},
				'print': function(msg) {
					msg = decodeText(msg);
					console.log('oLED.print('+msg+')');
					for(var i=0; i<msg.length; i++)
						this.putChar(msg[i]);
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}

		function newGroveOLED128x128() {
			var d = makeDevice({board: 'Grove 2 2 d'});
			EnvData.addBubble(d, "Module oLed display 128x128");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'P', es: 'I', orient: 'W', x:-25, y:0});
			var screen = newGroveOLEDgeneric(d, 128, 128);
			fillSVG(screen, {'transform':'translate(-16, -22) scale(0.36, 0.36)'});
		
			addEvent(screen, 'mouseover', function() {fillSVG(screen, {'transform':'translate(-15, -48) scale(1, 1)'}); var l = svg.getBBox(); fillSVG(svg, {width:l.x+l.width+10, height:l.y+l.height+10}); });
			addEvent(screen, 'mouseout', function() {fillSVG(screen, {'transform':'translate(-16, -22) scale(0.36, 0.36)'});});
			var cx=0;
			var cy=0;
			return {
				'element': d,
				'connector': con,
				'reinit': function() {
					screen.setBackground('#373');
					this.clear();
				},
				'setBrightness': function(level) {
					if(level<25)
						screen.setBackground('#373');
					else if(level<50)
						screen.setBackground('#494');
					else if(level<75)
						screen.setBackground('#5D5');
					else
						screen.setBackground('#6E6');
				},
				'gotoXY': function(x, y) {
					cx=x; cy=y;
				},
				'clear': function() {
					for(var y=0; y<16; y++) {
						this.gotoXY(0, y);
						for(var x=0; x<16; x++) {
							this.putChar(' ');
						}
					}
				},
				'putChar': function(c) {
					var f=this.font(c);
					for(var i=0;i<8;i++)
						for(var j=0;j<8;j++)
							screen.setPoint((cx*8+i), (cy*8+j), (((f[i]>>j)&0x01)==0x01)?'0.9':'0.1');
					cx++;
				},
				'font': function(c) {
					var code = c.charCodeAt(0);
					if(policeOled[code]==undefined)
						code = 0;
					return policeOled[code];
				},
				'print': function(msg) {
					msg = decodeText(msg);
					console.log('oLED.print('+msg+')');
					for(var i=0; i<msg.length; i++)
						this.putChar(msg[i]);
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove I2C LCD RGB Backlight {{{
		function newGroveLCDRGBBacklight() {
			var d = makeDevice({board: 'Grove 4 2 d'});
			EnvData.addBubble(d, "Module LCD RGB Backlight");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'P', es: 'I', orient: 'W', x:-30, y:18});
			var box = d.addSVG('path');
			var screen = d.addSVG('path');
			var light = d.addSVG('path');
			var t1 = d.addSVG('text');
			var t2 = d.addSVG('text');

			fillSVG(box, {'fill':'#111', 'stroke':'#000', 'stroke-width':'1', 'd':"m-58,-27 h116 v32 h-116 z"});
			fillSVG(screen, {'fill':'#363', 'stroke':'none', 'stroke-width':'0', 'd':"m-56,-23 h112 v24 h-112 z"});
			fillSVG(light, {'fill':'#000', 'opacity':'0', 'stroke':'none', 'stroke-width':'0', 'd':"m-56,-23 h112 v24 h-112 z"});
			fillSVG(t1, {'fill': '#000', 'x':'-56', 'y':'-13', 'font-size':'11', 'font-family':'Monospace'});
			fillSVG(t2, {'fill': '#000', 'x':'-56', 'y':'-1', 'font-size':'11', 'font-family':'Monospace'});

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
					this.setColor(0);
					this.clear();
				},
				'setColor': function(color) {
					fillSVG(light, {'fill':intToCol(color), 'opacity': alpha(color)});
				},
				'print': function(txt1, txt2) {
					txt1 = decodeText(txt1);
					txt2 = decodeText(txt2);
					clear(t1);
					clear(t2);
					t1.appendChild(newText(txt1.substr(0, 16)));
					t2.appendChild(newText(txt2.substr(0, 16)));
				},
				'clear': function() {
					clear(t1);
					clear(t2);
				},
				'call': function(msg) {
					switch(msg[0]) {
					case 'print':
						this.print(msg[1], msg[2]);
						break;
					case 'color':
						this.setColor(msg[1]);
						break;
					case 'set':
						switch(msg[1]) {
						case '1': this.clear(); break;
						case '2': break;	// blink cursor
						case '3': break;	// blink led
						case '4': break;	// no blink cursor
						case '5': break;	// no blink led
						}
						break;
					}
				},
				// TODO: Ajouter Call msg
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin du Grove I2C Motor Driver {{{
		function newGroveMotorDriver(adr) {
			var d = makeDevice({board: 'Grove 3 2 d'});
			EnvData.addBubble(d, "Module i2c step motor driver");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addGroveCon({type: 'D', es: 'I', orient: 'W', x:-36, y:0});
			var born = {
				'in': d.addBornCon({orient:'W', x: -35, y:18}),
				'm1': d.addBornCon({orient:'E', x: 35, y:-18}),
				'm2': d.addBornCon({orient:'E', x: 35, y:18}),
			};

			var motor = newStepperMotor();

			newWire({0: '#ee0', 1: '#0e0'}, born.m1, motor.connector[0]);
			newWire({0: '#e00', 1: '#aaa'}, born.m2, motor.connector[1]);

			var ms = d.addMicroSwitch({orient:'S', x:-12, y:-18, count:4});
			ms.set(adr);

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
					motor.placing({x:p.x+90, y:p.y+11, a:0});
				},
			};
		}
		// }}}

		// Dessin du Grove Servo {{{
		function newGroveServo(continus) {
			var d = makeDevice({bgcolor: '#222', board: 'Direct m18,8 h-36 v-16 h36 z'});
			EnvData.addBubble(d, "Module Grove Servo");

			// Connecteur Droit Digital Orienté Droite
			var con = d.addConnector({
				color: 'none',
				path: 'm3,0 h-6 z',
				anchor: {
					0: {x:3, y:0, dx:3, dy:-50},
					1: {x:1, y:0, dx:1, dy:-50},
					2: {x:-1, y:0, dx:-1, dy:-50},
					3: {x:-3, y:0, dx:-3, dy:-50},
				},
				x: -17,
				y: 0,
				orient: 'W',
			});
			var cur = 90;
			var mvt = null;
			var rot = d.addSVG('g');
			newRotorOnce(rot);
			fillSVG(rot, {'transform':'translate(10,0) rotate(180)'});
			return {
				'isServo': true,
				'element': d,
				'connector': con,
				'set': function(cmd) {
					switch(cmd[3]) {
					case 'set':
						var val = parseInt(cmd[4]);
						if(val<0) val=0; else if(val>180) val=180;
						if(mvt!=null) clearInterval(mvt);
						if(continus) {
							if(val!=90) {
								var pad = (val-90)*0.03;
								mvt = setInterval(function() {
									cur+=pad;
									if(cur>360) cur-=360;
									else if(cur<0) cur+=360;
									fillSVG(rot, {'transform':'translate(10,0) rotate('+(90-cur)+')'});
								}, 10);
							} else mvt=null;
						} else {
							mvt = setInterval(function() {
								if(cur>val) cur--;
								else cur++;
								fillSVG(rot, {'transform':'translate(10,0) rotate('+(90-cur)+')'});
								if(cur==val) {
									clearInterval(mvt);
									mvt=null;
								}
							}, 10);
						}
						break;
					}
				},
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
			};
		}
		// }}}

		// Dessin d'une croix sur arbre moteur {{{
		function newRotorCross(g) {
			var plain = newSVG('path');
			fillSVG(plain, {'fill': '#333', 'stroke':'#333', 'stroke-width':'0', 'd':'m3,-3 h4 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 h3 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 h3 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 c6,0 6,6 0,6 h-10 v10 c0,6 -6,6 -6,0 h2 c0,1.5 2,1.5 2,0 c0,-1.5 -2,-1.5 -2,0 h-2 v-3 h2 c0,1.5 2,1.5 2,0 c0,-1.5 -2,-1.5 -2,0 h-2 v-3 h2 c0,1.5 2,1.5 2,0 c0,-1.5 -2,-1.5 -2,0 h-2 v-4 h-10 c-6,0 -6,-6 0,-6 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 h3 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 h3 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 h4 v-4 h2 c0,1.5 2,1.5 2,0 c0,-1.5 -2,-1.5 -2,0 h-2 v-3 h2 c0,1.5 2,1.5 2,0 c0,-1.5 -2,-1.5 -2,0 h-2 v-3 h2 c0,1.5 2,1.5 2,0 c0,-1.5 -2,-1.5 -2,0 h-2 c0,-6 6,-6 6,0 z'});
			g.appendChild(plain);
			var border = newSVG('path');
			fillSVG(border, {'fill': 'none', 'stroke':'#111', 'stroke-width':'1', 'd':'m3,-3 h10 c6,0 6,6 0,6 h-10 v10 c0,6 -6,6 -6,0 v-10  h-10 c-6,0 -6,-6 0,-6 h10 v-10 c0,-6 6,-6 6,0 z'});
			g.appendChild(border);
		}
		// }}}

		// Dessin d'une barre sur arbre moteur {{{
		function newRotorOnce(g) {
			var plain = newSVG('path');
			fillSVG(plain, {'fill': '#aaa', 'stroke':'#aaa', 'stroke-width':'0', 'd':'m3,-3 h4 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 h3 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 h3 v2 c-1.5,0 -1.5,2 0,2 c1.5,0 1.5,-2 0,-2 v-2 c6,0 6,6 0,6 h-13 c-6,0 -6,-6 0,-6 z'});
			g.appendChild(plain);
			var border = newSVG('path');
			fillSVG(border, {'fill': 'none', 'stroke':'#111', 'stroke-width':'1', 'd':'m3,-3 h10 c6,0 6,6 0,6 h-13 c-6,0 -6,-6 0,-6 z'});
			g.appendChild(border);
		}
		// }}}

		// Dessin d'un moteur pas à pas {{{
		function newStepperMotor() {
			// Dessiner le chassis
			var d = makeDevice({bgcolor: '#aaa', board: 'Direct m18,18 h-36 v-36 h36 z'});
			EnvData.addBubble(d, "step motor");

			// Dessiner 2 connecteurs
			var con = {
				0: d.addConnector({
					color: 'none',
					path: 'm3,0 h-6 z',
					anchor: {
						0: {x:3, y:0, dx:3, dy:-50},
						1: {x:1, y:0, dx:1, dy:-50},
					},
					x: 0,
					y: -18,
					orient: 'N',
				}),
				1: d.addConnector({
					color: 'none',
					path: 'm3,0 h-6 z',
					anchor: {
						0: {x:-1, y:0, dx:-1, dy:-50},
						1: {x:-3, y:0, dx:-3, dy:-50},
					},
					x: 0,
					y: -18,
					orient: 'N',
				}),
			};

			// Dessiner le rotor
			var rot = d.addSVG('g');
			newRotorCross(rot);
			fillSVG(rot, {'transform':'rotate(0)'});

			var pad = 0;

			return {
				'element': d,
				'connector': con,
				'reinit': function() {
				},
				'placing': function(p) {
					d.move(p.x, p.y);
					d.rotate(p.a);
				},
				'move': function(m) {
					pad+=m;
					while(pad<0) pad+=400;
					pad = pad%400;
					fillSVG(rot, {'transform':'rotate('+(pad*360/400)+')'});
				},
			};
		}
		// }}}

		// Dessin du shield Grove {{{
		function newGrovePi() {
			var d = makeDevice({board: 'Direct m-72,-50 h145 v100 h-130 q-15,0 -15,-15 z'});
			EnvData.addBubble(d, "Shield GrovePi+");

			var cons = {
				'D2': d.addGroveCon({type: 'P', es: 'D', orient: 'S', x:3, y:44}),
				'D3': d.addGroveCon({type: 'P', es: 'D', orient: 'S', x:36, y:44}),
				'D4': d.addGroveCon({type: 'P', es: 'D', orient: 'S', x:61, y:44}),
				'D5': d.addGroveCon({type: 'D', es: 'D', orient: 'W', x:36, y:-14}),
				'D6': d.addGroveCon({type: 'D', es: 'D', orient: 'W', x:36, y:11}),
				'D7': d.addGroveCon({type: 'P', es: 'D', orient: 'N', x:3, y:-44}),
				'D8': d.addGroveCon({type: 'P', es: 'D', orient: 'N', x:36, y:-44}),
				'A0': d.addGroveCon({type: 'P', es: 'A', orient: 'W', x:-66, y:-28}),
				'A1': d.addGroveCon({type: 'P', es: 'A', orient: 'W', x:-66, y:-3}),
				'A2': d.addGroveCon({type: 'P', es: 'A', orient: 'W', x:-66, y:22}),
				'I1': d.addGroveCon({type: 'P', es: 'I', orient: 'E', x:67, y:-39}),
				'I2': d.addGroveCon({type: 'P', es: 'I', orient: 'E', x:67, y:-14}),
				'I3': d.addGroveCon({type: 'P', es: 'I', orient: 'E', x:67, y:11}),
				'SP': d.addGroveCon({type: 'P', es: 'R', orient: 'S', x:-49, y:44}),
				'SG': d.addGroveCon({type: 'P', es: 'S', orient: 'S', x:-24, y:44}),
			};

			var iPos = {
				'D2': {x:0,y:151,a:90},
				'D3': {x:46,y:151,a:90},
				'D4': {x:92,y:151,a:90},
				'D5': {x:151,y:-80,a:0},
				'D6': {x:151,y:80,a:0},
				'D7': {x:0,y:-141,a:-90},
				'D8': {x:46,y:-141,a:-90},
				'A0': {x:-151,y:-46,a:180},
				'A1': {x:-151,y:0,a:180},
				'A2': {x:-151,y:46,a:180},
				'SP': {x:-92,y:151,a:90},
				'SG': {x:-46,y:151,a:90},
			};

			var i2c = {
				count: 3,
				used: 0,
				0: cons['I1'],
				1: cons['I2'],
				2: cons['I3'],
			};

			function getNextI2C() {
				var c = i2c[i2c.used++];
				if(i2c.used<i2c.count)
					return c;
				var h = newGroveI2Chub();

				h.element.move(450, i2c_y+30);

				newGroveWire(c, h.connector[0]);
				i2c[i2c.count++] = h.connector[3];
				i2c[i2c.count++] = h.connector[2];
				i2c[i2c.count++] = h.connector[1];

				return i2c[i2c.used++];
			}

			var pin = {};

			for(var i=0; i<13; i++)
				for(var j=0; j<2; j++) {
					pin[i*2+j] = d.addSVG('line');
					fillSVG(pin[i*2+j], {'stroke':'#333', 'stroke-width':'1', 'x1':3*i-69, 'y1':3*j-47, 'x2':3*i-68, 'y2':3*j-47});
				}

			d.addCI({type:'4x',c:8,x:-13,y:0,orient:'N',scale:0.5});
			d.addLabel('GrovePi +', {x:-36, y:18, scale:0.9});

			var modules = {};

			function test(name, list) {
				for(var i in list) {
					if(modules[list[i]]!=undefined)
						if(modules[list[i]].name!=name)
							return 2;
						else
							return 1;
				}
				return 0;
			}

			function set(name, list, module) {
				for(var i in list)
					modules[list[i]] = {
						name: name,
						module: module,
					};
			}

			function getByName(name) {
				for(var i in modules)
					if(modules[i].name==name)
						return modules[i].module;
				return undefined;
			}

			function getByAddress(adr) {
				return modules[adr].module;
			}

			function makePosition(addr) {
				var p = d.position();
				if(isSet(iPos[addr])) {
					p.x+=iPos[addr].x;
					p.y+=iPos[addr].y;
					p.a+=iPos[addr].a;
					return p;
					/*
					x += cos(a)*x + sin(a)*y
					y += -sin(a)*x + cos(a)*y
						p.x+= Math.floor(90*Math.cos(p.a*Math.PI/180));
						p.y+= Math.floor(90*Math.sin(p.a*Math.PI/180));
					*/
				}
				return null;
			}

			var i2c_y = -1;

			function normalDeclaration(name, addr, builder) {
				switch(test(name, addr)) {
				case 0:
					trace(2, 'declaration', {'name':name, 'addr':serial(addr)});
					var p = makePosition(addr[0]);
					var m = builder();
					if(p!=null) {
						m.placing(p);
						newGroveWire(cons[addr[0]], m.connector);
					} else {
						var e = m.element;
						var bb = e.getBBox();
						var x = 481+bb.width/2;
						if(i2c_y<0)
							i2c_y = 15+bb.height/2;
						else
							i2c_y+=15+bb.height;
						m.placing({x:x, y:i2c_y, a:0});
						newGroveWire(getNextI2C(), m.connector);
					}
					set(name, addr, m);
					return 0;
				case 1:
					trace(2, 'reinit', {name:name});
					var m = getByAddress(addr[0]);
					m.reinit();
					return 1;
				default:
					error('err_1', {name:name});
				}
				return 2;
			}

			return {
				'connecteurs': cons,
				'element': d,
				'addModule': function(name, option) {
					trace(2, "addModule", {name:name, opt:opt2str(option)});
					switch(name) {
					case 'Grove LED':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveLED(option.color); });
						break;
					case 'Grove Button':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveButton(option.index); });
						break;
					case 'Grove Ultrasonic':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveUltrasonic(option.index); });
						break;
					case 'Grove Buzzer':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveBuzzer(); });
						break;
					case 'Grove Relay':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveRelay(); });
						break;
					case 'Grove cRVB':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveChainableRGBLed(option.cnt); });
						break;
					case 'Grove LED Bar':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveLedBar(); });
						break;
					case 'Grove DHT':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveDHT(option.index); });
						break;
					case 'Grove PIR Motion':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGrovePIR(option.index); });
						break;
					case 'Grove IR Line Finder':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveIRLF(option.index); });
						break;
					case 'Grove 4 digit':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGrove4digit(); });
						break;
					case 'Grove GPS':
						normalDeclaration(name, ['SP'], function() { return newGroveGPS(option.index); });
						break;
					case 'Grove LCD RGB Backlight':
						normalDeclaration(name, ['i2c 0x3e', 'i2c 0x62'], function() { return newGroveLCDRGBBacklight(); });
						break;
					case 'Grove oLED display 128x64':
						normalDeclaration('Grove oLED display', ['i2c 0x3c'], function() { return newGroveOLED128x64(); });
						break;
					case 'Grove oLED display 96x96':
						normalDeclaration('Grove oLED display', ['i2c 0x3c'], function() { return newGroveOLED96x96(); });
						break;
					case 'Grove oLED display 128x128':
						normalDeclaration('Grove oLED display', ['i2c 0x3c'], function() { return newGroveOLED128x128(); });
						break;
					case 'Grove Motor Driver':
						var addr = addr2hex(option.addr);
						normalDeclaration(name, ['i2c '+addr], function() { return newGroveMotorDriver(option.addr); });
						break;
					case 'Grove Servo':
						if(cons['D'+option.addr]!=undefined)
							normalDeclaration(name, ['D'+option.addr], function() { return newGroveServo(option.continus); });
						break;
					}
				},
				'getByAddress': function(addr) {
					try {
						return getByAddress(addr);
					} catch(ex) {
						trace(1, "exception", ex);
						return null;
					}
				},
				'getModule': function(name, option) {
					trace(2, 'getModule', {name:name});
					switch(name) {
					case 'Grove LCD RGB Backlight':
						if(test(name, ['i2c 0x3e', 'i2c 0x62'])==1)
							return getByAddress('i2c 0x3e');
						break;
					case 'Grove oLED display':
						if(test(name, ['i2c 0x3c'])==1)
							return getByAddress('i2c 0x3c');
						break;
					case 'Grove LED':
					case 'Grove Button':
					case 'Grove Ultrasonic':
					case 'Grove Relay':
						if(test(name, ['D'+option.addr])==1)
							return getByAddress('D'+option.addr);
						break;
					case 'Grove GPS':
						if(test(name, ['SP'])==1)
							return getByAddress('SP');
						break;
					}
					return null;
				},
				'reinit': function() {
				},
				'serialize': function() {
					var serMod = '';
					for(var i in modules) {
						serMod+='{'+i+':('+modules[i].module.element.serialize()+')}';
					}
					return 'GrovePi('+d.serialize()+'){'+serMod+'}';
				},
				'unserialize': function(ser) {
					var m;
					if((m=ser.match(/^GrovePi\(([^)]+)\){(({[^}]+})*)}/))!=null) {
						var ok = d.unserialize(m[1]);
						var s = m[2];
						while((m=s.match(/^{([^:]+):\(([^}]+)\)}(.*)/))!=null) {
							if(modules[m[1]]!=undefined)
								ok&= modules[m[1]].module.element.unserialize(m[2]);
							else
								ok = false;
							s = m[3];
						}
						return ok;
					}
					return false;
				},
			};
		}
		// }}}

		// Dessin d'une matrice néoLED {{{
		function newTSmatrixLED(w, h) {
			var d = makeDevice({bgcolor: '#ddd', board: 'Direct m-'+(10+5*w)+',-'+(5*h)+' h'+(20+10*w)+' v'+(10*h)+' h-'+(20+10*w)+' z'});
			var con = d.addLedCon({orient: 'W', x:-10-(5*w), y:10-5*h});
			var light = {};

			var bx = -5*w, by = -5*h, ex = bx+10*w;
			for(var y=0; y<h; y++) {
				var l1 = d.addSVG('line');
				fillSVG(l1, {'stroke': '#333', 'stroke-width': '0.7', 'x1':bx, 'y1':(by+1+y*10), 'x2':ex, 'y2':(by+1+y*10)});
				var l2 = d.addSVG('line');
				fillSVG(l2, {'stroke': '#333', 'stroke-width': '0.7', 'x1':bx, 'y1':(by+9+y*10), 'x2':ex, 'y2':(by+9+y*10)});
				for(var x=0; x<w; x++) {
					var pb = d.addSVG('path');
					fillSVG(pb, {'fill':'#aaa', 'stroke': 'none', 'stroke-width':'0', 'd':'m'+(bx+x*10)+','+(by+y*10+2)+' q2,1 0,2 q2,1 0,2 q2,1 0,2 z'});
					var pe = d.addSVG('path');
					fillSVG(pe, {'fill':'#aaa', 'stroke': 'none', 'stroke-width':'0', 'd':'m'+(bx+x*10+10)+','+(by+y*10+2)+' q-2,1 0,2 q-2,1 0,2 q-2,1 0,2 z'});
					var db = d.addSVG('path');
					fillSVG(db, {'fill':'#eee', 'stroke': '#333', 'stroke-width':'1', 'd':'m'+(bx+x*10+3)+','+(by+y*10+3)+' h4 v4 h-4 z'});
					var dl = d.addSVG('circle');
					fillSVG(dl, {'fill':'#ddd', 'stroke': '#333', 'stroke-width':'0.5', 'cx':(bx+x*10+5), 'cy':(by+y*10+5), 'r':'2'});
					light[y*w+x] = d.addSVG('circle');
					fillSVG(light[y*w+x], {'fill':'#000', 'opacity': '0', 'stroke': 'none', 'stroke-width':'0', 'cx':(bx+x*10+5), 'cy':(by+y*10+5), 'r':'4'});
				}
				var cb = d.addSVG('path');
				fillSVG(cb, {'fill':'#fff', 'stroke': '#222', 'stroke-width':'1', 'd':'m'+(bx-10)+','+(by+y*10+1)+' h12 v8 h-12 z'});
				var ce = d.addSVG('path');
				fillSVG(ce, {'fill':'#fff', 'stroke': '#222', 'stroke-width':'1', 'd':'m'+(ex-2)+','+(by+y*10+1)+' h12 v8 h-12 z'});
			}

			return {
				'element': d,
				'connector': con,
				'set': function(v) {
					var p=0;
					for(var i=3; i<v.length; i++) {
						if(v[i]=='z') {
							var n=parseInt(v[++i],35), c=intToCol(parseInt(v[++i],35));
							var a=alpha(parseInt(v[i],35));
							while(n-->0)
								fillSVG(light[p++], {'fill':c, 'opacity':a});
						} else {
							fillSVG(light[p++], {'fill':intToCol(parseInt(v[i],35)), 'opacity':alpha(parseInt(v[i],35))});
						}
					}
				},
				'reinit': function() {
					for(var i in light)
						fillSVG(light[i], {'fill':'#000', 'opacity':'0'});
				},
			};
		}
		// }}}

		// Dessin du shield TS néoLED {{{
		function newTSneoLED() {
			var d = makeDevice({bgcolor: '#ddd', board: 'Direct m-50,-50 h100 v100 h-100 z'});
			EnvData.addBubble(d, "Shield TS néoLed");

			var pin = {};

			for(var i=0; i<20; i++)
				for(var j=0; j<2; j++) {
					pin[i*2+j] = d.addSVG('line');
					fillSVG(pin[i*2+j], {'stroke':'#333', 'stroke-width':'1', 'x1':3*j-47, 'y1':3*i-47, 'x2':3*j-46, 'y2':3*i-47});
				}
			for(var i=0; i<20; i++)
				for(var j=0; j<2; j++) {
					pin[40+i*2+j] = d.addSVG('line');
					fillSVG(pin[40+i*2+j], {'stroke':'#333', 'stroke-width':'1', 'x1':47-3*j, 'y1':47-3*i, 'x2':48-3*j, 'y2':47-3*i});
				}

			var atx = d.addSVG('path');
			fillSVG(atx, {'fill':'#eee', 'stroke':'#333', 'stroke-width':'1', 'd':'m-46,46 v-10 h20 v-3 h10 v3 h30 v10 z'});
			for(var i=0; i<12; i++)
				for(var j=0; j<2; j++) {
					pin[80+i*2+j] = d.addSVG('circle');
					fillSVG(pin[80+i*2+j], {'fill':'#999', 'stroke':'#111', 'stroke-width':'0.3', 'cx':(i*5-43), 'cy':(43-j*5), 'r':2});
				}

			var bt = d.addSVG('circle');
			fillSVG(bt, {'fill':'#e00', 'stroke':'#111', 'stroke-width':'1.3', 'cx':'-23', 'cy':'13', 'r':'6'});

			var b5v = d.addSVG('path');
			var b12v = d.addSVG('path');
			fillSVG(b5v, {'fill':'#a11', 'stroke':'#000', 'stroke-width':'1', 'd':'m-10,9 h13 v7 h-13 z'});
			d.addLabel('5v', {color:'#a11', x:-15, y:15, scale:0.5});
			fillSVG(b12v, {'fill':'#1a1', 'stroke':'#000', 'stroke-width':'1', 'd':'m9,9 h13 v7 h-13 z'});
			d.addLabel('12v', {color:'#1a1', x:20, y:15, scale:0.5});

			d.addCI({type:'2x',c:7,x:-23,y:-23,orient:'N'});
			d.addLabel('Technologie', {color:'#225', x:-10, y:-35, scale:0.7});
			d.addLabel('Service', {color:'#225', x:12, y:-24, scale:0.7});
			d.addLabel('NéoLED', {color:'#225', x:0, y:0, scale:0.9});

			var cons = {
				'L1': d.addLedCon({orient: 'N', x:0, y:-42}),
				'L2': d.addLedCon({orient: 'N', x:33, y:-42}),
			};

			var matrices = {};

			var g = {
				'element': d,
				'connecteurs': cons,
				'addMatrix': function(con, width, height) {
					trace(2, 'addMatrix', {con:con, width:width, height:height});
					try {
						if(cons['L'+con]!=undefined) {
							var m = newTSmatrixLED(width, height);
							newTSLedWire(cons['L'+con], m.connector);
							matrices['L'+con] = m;
						}
					} catch(ex) {
						trace(1, "exception", ex);
					}
				},
				'sendRequest': function(req) {
					if(matrices['L'+req[2]]!=undefined) {
						switch(req[0]) {
						case 'fixeLED':
							matrices['L'+req[2]].set(req);
							break;
						case 'resetLED':
							matrices['L'+req[2]].reinit();
							break;
						}
					} else {
						error("err_2", {port:req[2]});
					}
				},
				'serialize': function() {
					var serMat = '';
					for(var i in matrices) {
						serMat+='{'+i+':('+matrices[i].element.serialize()+')}';
					}
					return 'TSNeoLed('+d.serialize()+'){'+serMat+'}';
				},
				'unserialize': function(ser) {
					var m;
					if((m=ser.match(/^TSNeoLed\(([^)]+)\){(({[^}]+})*)}/))!=null) {
						var ok = d.unserialize(m[1]);
						var s = m[2];
						while((m=s.match(/^{([^:]+):\(([^}]+)\)}(({[^}]+})*)/))!=null) {
							if(matrices[m[1]]!=undefined)
								ok&= matrices[m[1]].element.unserialize(m[2]);
							else
								ok = false;
							s = m[3];
						}
						return ok;
					}
					return false;
				},
				'reinit': function() {
				},
			};
			return g;
		}
		// }}}

		// Fonctions de procédure récurente {{{
		function addGrovePiModule(module, option) {
			if(priv.GrovePi==null) {
				error("err_3");
			} else {
				priv.GrovePi.addModule(module, option);
			}
		}

		function sendToGrovePiModule(module, option, callback) {
			if(priv.GrovePi==null) {
				error("err_3");
			} else {
				var m = priv.GrovePi.getModule(module, option);
				if(m==null) {
					error("err_4", {module:module});
				} else {
					callback(m);
				}
			}
		}
		// }}}

		var actionneurs = [];	// Liste des actionneurs définit
		var capteurs = [];		// Liste des capteurs définit

		function breakError(error, errno, pin) {
			connectionSend(error + '/' + errno + '/' + pin);
			return false;
		}

		/* portage en mode service ??? {{{
		function addActionneur(pin, type, port, builder) {
			var p = port+pin;
			if(port=='i')
				p = 'i'+pin.toString(16);
			trace(1, 'addActionneur '+type+' sur '+p);
			if(capteurs[port+pin]!=undefined)
				return breakError('invalidSetMode', 10, pin);
			if(actionneurs[port+pin]!=undefined) {
				trace(3, "- Stopper "+actionneurs[port+pin].type+" sur "+p);
				actionneurs[port+pin].con.closer(actionneurs[port+pin]);
			}
			try {
				actionneurs[port+pin] = {
					pin: pin,
					type: type,
					con: builder(),
				};
			} catch(ex) {
				trace(0, "Erreur lors de la génération de l'actionneur "+type+" sur "+p);
				trace(1, ex);
			}
		}

		function callActionneur(cmd, pin, arg, type, errno) {
			pin = parseInt(pin);
			trace(3, cmd+" recherche "+type+" sur la pin "+pin);
			for(var i in actionneurs) {
				if(actionneurs[i].pin === pin && actionneurs[i].type === type) {
					trace(3, " - trouvé");
					actionneurs[i].con.caller(actionneurs[i], arg);
					return true;
				}
			}
			trace(3, " - introuvable");
			return breakError('invalidPinCommand', errno, pin);
		}

		function addCapteur(pin, type, port, id, builder) {
			var p = port+pin;
			if(port=='i')
				p = 'i'+pin.toString(16);
			trace(1, 'addCapteur '+type+' sur '+p+' -> '+id);
			if(actionneurs[port+pin]!=undefined)
				return breakError('invalidSetMode', 10, pin);
			if(capteurs[port+pin]!=undefined) {
				trace(3, "- Stopper l'écoute de "+capteurs[port+pin].type+' sur '+p);
				capteurs[port+pin].con.closer();
			}
			try {
				capteurs[port+pin] = {
					pin: pin,
					type: type,
					con: builder(),
				};
			} catch(ex) {
				trace(0, "Erreur lors de la génération du capteur "+type+" sur "+p);
				trace(1, ex);
			}
		}
		// }}} */

		// Retourner l'objet Module {{{
		var Simulateur = {};
		// Supprimer la ligne dessous (juste pour le debugage)
		Simulateur.priv = priv;
		Simulateur.init = function(tools, boardID) {
			document.body.style.backgroundColor = '#e84';
			board_name.appendChild(newText('Carte '+boardID));
			priv.ext_tools = tools;
		};
		Simulateur.sendOrder = function(message) {
			try {
				var msg = message.split('/');
				trace(2, 'order', {order:msg[0], message:message});
				switch(msg[0]) {
				// Ajout d'un shield [addShield] {{{
				case 'addShield':
					switch(msg[2]) {
					case '1':	// GrovePi
						if(priv.GrovePi==null) {
							priv.GrovePi = newGrovePi();
							priv.GrovePi.element.move(200, 300);
						} else
							priv.GrovePi.reinit();
						break;
					case '2':	// ServoHat
						var addr = parseInt(msg[1]);
						if(isSet(priv.ServoHat[addr]))
							priv.ServoHat[addr].reinit();
						else
							priv.ServoHat[addr] = newServoHat(addr);
						break;
					case '3':	// TSNeoLed
						if(priv.TSNeoLed==null) {
							priv.TSNeoLed = newTSneoLED();
							priv.TSNeoLed.element.move(200, 300);
						} else
							priv.TSNeoLed.reinit();
						break;
					}
					break; // }}}
				// Ajout d'un module numérique [setDigit] {{{
				case 'setDigit':
					var addr = parseInt(msg[2]);
					switch(msg[3]) {
					case '1': // Module LED par défaut (rouge) (si opt = couleur)
						var c=0xff0000;
						if(msg[4].length>0 && parseInt(msg[4])>0)
							c = parseInt(msg[4]);
						addGrovePiModule('Grove LED', {addr:addr, color:c});
						break;
					case '2': // Module Relais
						addGrovePiModule('Grove Relay', {addr:addr});
						break;
					case '3': // Module Button
						addGrovePiModule('Grove Button', {addr:addr, index:parseInt(msg[4])});
						break;
					case '4': // Buzzer
						addGrovePiModule('Grove Buzzer', {addr:addr});
						break;
					case '5': // Chainable RGB LED
						addGrovePiModule('Grove cRVB', {addr:addr, cnt:parseInt(msg[4])});
						break;
					case '6': // LED Bar
						addGrovePiModule('Grove LED Bar', {addr:addr});
						break;
					case '7': // 4 digit display
						addGrovePiModule('Grove 4 digit', {addr:addr});
						break;
					case '8': // Ultrasonic
						addGrovePiModule('Grove Ultrasonic', {addr:addr, index:parseInt(msg[4])});
						break;
					case '9': // DHT
						addGrovePiModule('Grove DHT', {addr:addr, index:parseInt(msg[4])});
						break;
					case '10': // PIR Motion
						addGrovePiModule('Grove PIR Motion', {addr:addr, index:parseInt(msg[4])});
						break;
					case '11': // IR Line Finder
						addGrovePiModule('Grove IR Line Finder', {addr:addr, index:parseInt(msg[4])});
						break;
					case '12': // Servo motor
						addGrovePiModule('Grove Servo', {addr:addr, continus:(msg[4]=='c')});
						break;
					}
					break; // }}}
				// Gestion des ordres numérique Grove {{{
				case 'digitWrite':
					if(priv.GrovePi==null) {
						error("err_3");
					} else {
						var m = priv.GrovePi.getByAddress('D'+msg[2]);
						if(m==null) {
							error("err_5", {addr:msg[2]});
						} else {
							m.set(msg[3]=='1');
						}
					}
					break;
				case 'CLED':
					if(priv.GrovePi==null) {
						error("err_3");
					} else {
						var m = priv.GrovePi.getByAddress('D'+msg[2]);
						if(m==null) {
							error("err_5", {addr:msg[2]});
						} else if(m.isChainable) {
							if(msg[3]=="set")
								m.set(parseInt(msg[4]), msg[5]);
						}
					}
					break;
				case 'LBar':
					if(priv.GrovePi==null) {
						error("err_3");
					} else {
						var m = priv.GrovePi.getByAddress('D'+msg[2]);
						if(m==null) {
							error("err_5", {addr:msg[2]});
						} else if(m.isLedBar) {
							switch(msg[3]) {
							case 'set':
								m.set(parseInt(msg[4]), parseInt(msg[5]));
								break;
							default:
								m.conf(msg[3]);
							}
						}
					}
					break;
				case '4DD':
					if(priv.GrovePi==null) {
						error("err_3");
					} else {
						var m = priv.GrovePi.getByAddress('D'+msg[2]);
						if(m==null) {
							error("err_5", {addr:msg[2]});
						} else if(m.isDigitDisp) {
							m.aff(msg[4]);
						}
					}
					break;
				case 'PWM':
					if(priv.GrovePi==null) {
						error("err_3");
					} else {
						var m = priv.GrovePi.getByAddress('D'+msg[2]);
						if(m==null) {
							error("err_5", {addr:msg[2]});
						} else if(m.isServo) {
							m.set(msg);
						}
					}
					break; // }}}
				// Ajout d'un module analogique [setAnalog] {{{
				case 'setAnalog':
					var addr = parseInt(msg[2]);
					var c = 0;
					switch(msg[3]) {
					case '1':	// Rotor Position
						break;
					case '2':	// Light Sensor
						break;
					case '3':	// Temperature Sensor
						break;
					case '4':	// Joystick
						break;
					}
					break; // }}}
				// Ajout d'un module spécifique setModule {{{
				case 'setModule':
					switch(msg[2]) {
					case '1': // écran LCD RGB Backlight
						addGrovePiModule('Grove LCD RGB Backlight');
						break;
					case '2': // écran oLED 128x64
						addGrovePiModule('Grove oLED display 128x64');
						break;
					case '3': // écran oLED 96x96
						addGrovePiModule('Grove oLED display 96x96');
						break;
					case '4': // écran oLED 128x128
						addGrovePiModule('Grove oLED display 128x128');
						break;
					case '5': // GPS
						addGrovePiModule('Grove GPS', {index:parseInt(msg[3])});
						break;
					case '6': // Pilote moteur pas à pas
						addGrovePiModule('Grove Motor Driver', {addr:parseInt(msg[3])});
						break;
					case '7': // miniTrackBall
						addGrovePiModule('Grove miniTrackBall', {index:parseInt(msg[3])});
						break;
					}
					break; // }}}
				// Gestion de l'écran LCD {{{
				case 'LCD':
					sendToGrovePiModule('Grove LCD RGB Backlight', {}, function(m) {
						switch(msg[2]) {
						case 'print':
							m.print(msg[3], msg[4]);
							break;
						case 'color':
							m.setColor(msg[3]);
							break;
						case 'set':
							switch(msg[3]) {
							case '1': m.clear(); break;
							case '2': break;	// blink cursor
							case '3': break;	// blink led
							case '4': break;	// no blink cursor
							case '5': break;	// no blink led
							}
							break;
						}
					});
					break; // }}}
				// Gestion des écrans oLed {{{
				case 'oLED':
					sendToGrovePiModule('Grove oLED display', {}, function(m) {
						switch(msg[2]) {
						case 'print':
							m.print(msg[3]);
							break;
						case 'move':
							m.gotoXY(parseInt(msg[3]), parseInt(msg[4]));
							break;
						}
					});
					break; // }}}
				// Gestion des panneaux de LEDs ws2812b {{{
				case 'initLED': // TSNeoLed matrix LED
					if(priv.TSNeoLed==null) {
						error("err_6");
					} else {
						// Connecteur, Largeur, Hauteur
						priv.TSNeoLed.addMatrix(msg[2], msg[3], msg[4]);
					}
					break;
				case 'fixeLED': // TSNeoLed afficher une image
				case 'resetLED': // TSNeoLed effacer la matrice
					if(priv.TSNeoLed==null) {
						error("err_6");
					} else {
						// Gestion intégré au module
						priv.TSNeoLed.sendRequest(msg);
					}
					break;
				// }}}
				}
			} catch(ex) {
				trace(1, "exception", ex);
			}
		};

		return Simulateur;
		// }}}
	}

	var Modules = makeModule();
	if(!window.Modules)
		window.Modules = Modules;
})(window);
