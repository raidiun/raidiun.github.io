var fdk = fdk || {};

fdk['assets'] = fdk['assets'] || {};

fdk['assets']['cardBase'] = function() {
	var size = fdk['settings']['cardSize'];
	var returnString = '<svg width="100%" height="100%" viewBox="0 0 100 150">\
						<rect class="cardShadow" x="2" y="2" width="98" height="148" rx="10" ry="10"/>\
						<rect class="cardBase" x="1" y="1" width="98" height="148" rx="10" ry="10"/>';
	return(returnString);
	}

fdk['assets']['suitMark'] = function(suit,value) {
	return('<g class="suitMark">'+fdk['assets'][suit+'Mark'](12,15,false)+fdk['assets'][suit+'Mark'](88,135,true)+'</g>');
	}

fdk['assets']['getGroup'] = function(x,y,invert) {
	var returnString = '<g transform="translate('+String(x)+','+String(y)+')';
	if(invert) {
		returnString += ' rotate(180)">';
		}
	else {
		returnString += '">';
		}
	return(returnString);
	}

fdk['assets']['heartMark'] = function(x,y,invert) {
	var returnString = fdk['assets']['getGroup'](x,y,invert);
	
	returnString += '<path class="redSuit" d="M0,-3 C0,-7 -9,-6 -3.75,0 L0,5 L3.75,0 C9,-6 0,-7 0,-3 z" />'
	
	returnString += '</g>';
	return(returnString);
	}

fdk['assets']['diamondMark'] = function(x,y,invert) {
	var returnString = fdk['assets']['getGroup'](x,y,invert);
	
	returnString += '<path class="redSuit" d="M0,-7 L-5,0 0,7 5,0 z" />'
	
	returnString += '</g>';
	return(returnString);
	}

fdk['assets']['clubMark'] = function(x,y,invert) {
	var returnString = fdk['assets']['getGroup'](x,y,invert);
	
	returnString += '<path class="blackSuit" d="M0,3 C0,7 -9,6 -3.75,0 C-6,-8 6,-8 3.75,0 C9,6 0,7 0,3 L0.5,8 -0.5,8 z" />'
	
	returnString += '</g>';
	return(returnString);
	}

fdk['assets']['spadeMark'] = function(x,y,invert) {
	var returnString = fdk['assets']['getGroup'](x,y,invert);
	
	returnString += '<path class="blackSuit" d="M0,3 C0,7 -9,6 -3.75,0 L0,-5 L3.75,0 C9,6 0,7 0,3 L0.5,8 -0.5,8 z" />'
	
	returnString += '</g>';
	return(returnString);
	}

fdk['assets']['valueMark'] = function(suit,value) {
	var colour;
	switch(suit) {
		case('heart'):
		case('diamond'):
			colour = 'redSuit';
			break;
		case('spade'):
		case('club'):
			colour = 'blackSuit';
			break;
		}
	return('<g class="valueMark '+String(colour)+'">'+
		   fdk['assets']['getGroup'](12,40,false)+'<text text-anchor="middle">'+String(value)+'</text>'+'</g>'+
		   fdk['assets']['getGroup'](88,110,true)+'<text text-anchor="middle">'+String(value)+'</text>'+'</g>'+
		   '</g>');
	}

fdk['settings'] = fdk['setings'] || {};

fdk['settings']['cardSize'] = 200;

fdk['assets']['generator'] = function(suit,value) {
	elem = document.createElement("div");
	var returnString = fdk['assets']['cardBase']();
	returnString += fdk['assets']['suitMark'](suit,value);
	returnString += fdk['assets']['valueMark'](suit,value);
	returnString += '</svg>';
	elem.innerHTML = returnString;
	
	var size = fdk['settings']['cardSize'];
	elem.style.width= size;
	elem.style.height = 1.5*size;
	elem.className += ' playingCard';
	elem.id = String(value) + suit;
	elem.addEventListener('mousedown',fdk['onMouseDown']);
	elem.addEventListener('mouseup',fdk['onMouseUp']);
	elem.addEventListener('touchstart',fdk['onMouseDown']);
	elem.addEventListener('touchend',fdk['onMouseUp']);
	return(elem);
	}

fdk['onMouseDown'] = function(event) {
	var card = event.currentTarget;
	var offset = {};
	var bounds = card.getBoundingClientRect();
	if(event.type != 'mousedown') {
		offset.x = bounds.left - event.touches[0].clientX;
		offset.y = bounds.top - event.touches[0].clientY;
		}
	else {
		offset.x = bounds.left - event.clientX;
		offset.y = bounds.top - event.clientY;
		}
	card.setAttribute('data-fdkOffset',JSON.stringify(offset));
	fdk['physics']['makeActive'](card,bounds.left,bounds.top);
	fdk['indexer']['bringToTop'](card);
	card.addEventListener('mousemove',fdk['onMouseMove']);
	card.addEventListener('touchmove',fdk['onTouchMove']);
	}

fdk['onMouseUp'] = function(event) {
	var card = event.currentTarget;
	card.removeEventListener('mousemove',fdk['onMouseMove']);
	card.removeEventListener('touchmove',fdk['onTouchMove']);
	fdk['physics']['end'](card);
	card.removeAttribute('data-fdkPActive');
	}

fdk['onMouseMove'] = function(event) {
	var card = event.currentTarget;
	var offset = JSON.parse(card.getAttribute('data-fdkOffset'));
	card.style.left = event.clientX + offset.x;
	card.style.top = event.clientY + offset.y;
	fdk['physics']['simulate'](card);
	}

fdk['onTouchMove'] = function(event) {
	var card = event.currentTarget;
	var offset = JSON.parse(card.getAttribute('data-fdkOffset'));
	card.style.left = event.touches[0].clientX + offset.x;
	card.style.top = event.touches[0].clientY + offset.y;
	fdk['physics']['simulate'](card);
	}

fdk['indexer'] = fdk['indexer'] || {};

fdk['indexer']['index'] = [];

fdk['indexer']['register'] = function(element) {
	fdk['indexer']['index'].push(element);
	}

fdk['indexer']['bringToTop'] = function(element) {
	var index = fdk['indexer']['index'];
	index.splice(index.indexOf(element),1);
	index.push(element);
	fdk['indexer']['index'] = index;
	fdk['indexer']['updateZIndicies']();
	}

fdk['indexer']['updateZIndicies'] = function() {
	var index = fdk['indexer']['index'];
	var len = index.length;
	for(var idx=0;idx<len;idx++) {
		index[idx].style.zIndex = idx;
		}
	}

fdk['physics'] = fdk['physics'] || {};

fdk['physics']['makeActive'] = function(card,cx,cy) {
	card.setAttribute('data-fdkPActive',JSON.stringify({'left':cx,'top':cy,'vx':0,'vy':0,'rotate':0,'time':(new Date()).getTime()}));
	}

fdk['physics']['simulate'] = function(card) {
	//CoA is at left+0.5*size,top+0.75*size
	var offset = JSON.parse(card.getAttribute('data-fdkOffset'));
	var physData = JSON.parse(card.getAttribute('data-fdkPActive'));
	var bounds = card.getBoundingClientRect();
	bounds = {'top':card.offsetTop,'left':card.offsetLeft};
	
	var gravity = 0.025;
	
	var dt = (new Date()).getTime()-physData.time
	
	var dr = {};
	dr.x = bounds.left - physData.left;
	dr.y = bounds.top - physData.top;
	
	var dv = {};
	dv.x = dr.x/(dt);
	dv.y = dr.y/(dt);
	
	var a = {};
	a.x = (dv.x-physData.vx)/(dt);
	a.y = (dv.y-physData.vy)/(dt) + gravity;
	
	var theta = Math.atan(a.x/a.y)*180/Math.PI;
	if(Math.abs(theta-physData.rotate)/dt>0.1) {
		theta += 10*Math.abs(theta)/theta;
		}
	
	card.firstChild.style['-webkit-transform-origin'] = String(-offset.x)+' '+String(-offset.y);
	card.firstChild.style['-webkit-transform'] = 'rotate('+String(theta)+'deg)';
	
	card.setAttribute('data-fdkPActive',JSON.stringify({'left':bounds.left,'top':bounds.top,'vx':dv.x,'vy':dv.y,'rotate':theta,'time':(new Date()).getTime()}));
	}

fdk['physics']['end'] = function(card) {
	card.firstChild.style['-webkit-transform'] = 'rotate(0deg)';
	}