var fdk = fdk || {};

fdk['assets'] = fdk['assets'] || {};

fdk['assets']['cardBase'] = function() {
	var size = fdk['settings']['cardSize'];
	var returnString = '<svg width="'+String(size)+'" height="'+String(1.5*size)+'" viewBox="0 0 100 150">\
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
	if(event.constructor == TouchEventConstructor) {
		offset.x = bounds.left - event.touches[0].clientX;
		offset.y = bounds.top - event.touches[0].clientY;
		}
	else {
		offset.x = bounds.left - event.clientX;
		offset.y = bounds.top - event.clientY;
		}
	card.style.zIndex = 1;
	card.setAttribute('data-offset',JSON.stringify(offset));
	card.addEventListener('mousemove',fdk['onMouseMove']);
	card.addEventListener('touchmove',fdk['onTouchMove']);
	}

fdk['onMouseUp'] = function(event) {
	event.currentTarget.style.zIndex = 0;
	event.currentTarget.removeEventListener('mousemove',fdk['onMouseMove']);
	event.currentTarget.removeEventListener('touchmove',fdk['onTouchMove']);
	}

fdk['onMouseMove'] = function(event) {
	var card = event.currentTarget;
	var offset = JSON.parse(card.getAttribute('data-offset'));
	card.style.left = event.clientX + offset.x;
	card.style.top = event.clientY + offset.y;
	}

fdk['onTouchMove'] = function(event) {
	var card = event.currentTarget;
	var offset = JSON.parse(card.getAttribute('data-offset'));
	card.style.left = event.touches[0].clientX + offset.x;
	card.style.top = event.touches[0].clientY + offset.y;
	}