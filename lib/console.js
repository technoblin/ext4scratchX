/*
 console.js
(c) 2017, ethernety.net
 *	TODO: Ajouter un menu pour vider la console, faire une copie...
 *	TODO: Créer un objet pour que la trace soit restreinte avec une partie deployable
 */
(function(window) {
	'use strict';

	function makeConsole() {
		function isSet(elem) {
			if(elem==false || elem==undefined || elem==null)
				return false;
			return true;
		}

		function newElement(name) {
			return document.createElement(name);
		}

		function newText(text) {
			return document.createTextNode(text);
		}

		function fillStyle(elem, fill) {
			if(isSet(elem))
				for(var i in fill)
					elem.style[i] = fill[i];
		}

		function makeStack(stack) {
			var pile = {length:0};
			stack = stack.split('\n');
			for(var i in stack) {
				var m = stack[i].match(/(.*\/)?(.*)@(.*)simulateur.js:([0-9]+):([0-9]+)/);
				if(m!=null) {
					pile[pile.length++] = {
						context: 'simulateur.js '+m[2],
						line: m[4]
					};
				} else {
					m = stack[i].match(/anonymous\/<\/(.*\/)?(.*)@(.*) line ([0-9]+).*:([0-9]+):([0-9]+)/);
					if(m==null)
						m = stack[i].match(/(.*\/)?(.*)@(.*) line ([0-9]+).*:([0-9]+):([0-9]+)/);
					if(m!=null) {
						pile[pile.length++] = {
							context: 'ext4scratchx.js '+m[2],
							line: m[5]-2
						};
					}
				}
			}
			return pile;
		}

		function makeTrace(code) {
			var div = newElement('div');
			div.appendChild(newText(code.message));
			switch(code.type) {
			case 'log':
				div.style.color = '#e90';
				break;
			default:
				div.style.color = '#e00';
			}
			div.style.weight = 'bolder';
			var pile = makeStack(code.stack.stack);
			var et = 0;
			for(var i=0; i<pile.length; i++) {
				switch(pile[i].context) {
				case 'ext4scratchx.js xi_tools.trace':
				case 'ext4scratchx.js xi_tools.error':
				case 'simulateur.js error':
				case 'ext4scratchx.js error': case 'ext4scratchx.js log':
					if(et<2) {
						et=1;
						continue;
					}
				default:
					if(et>0) {
						et = 2;
						var stack = newElement('div');
						stack.appendChild(newText('Dans '+pile[i].context+' à la ligne '+pile[i].line));
						stack.style.marginLeft = '5cm';
						stack.style.color = '#000';
						stack.style.weight = 'default';
						div.appendChild(stack);
					}
				}
			}
			document.body.insertBefore(div, document.body.firstChild);
		}

		return {
			clear: function() {
				while(document.body.firstChild!=null)
					document.body.removeChild(document.body.firstChild);
			},
			append: function(code) {
				makeTrace(code);
				console.log(code);
				window.focus();
			}
		};
	}

	var Console = makeConsole();
	if(!window.Console)
		window.Console = Console;
})(window);
