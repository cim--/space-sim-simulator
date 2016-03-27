function Options() {
	
}

/* Ship property options */
Options.prototype.shipProp = function(type, prop) {
	return parseInt($('[name='+type+'_'+prop+']').val());
}

Options.prototype.speed = function(type) {
	return this.shipProp(type,"speed");
}
Options.prototype.hull = function(type) {
	return this.shipProp(type,"hull");
}
Options.prototype.shields = function(type) {
	return this.shipProp(type,"shields");
}
Options.prototype.weapons = function(type) {
	return this.shipProp(type,"weapons");
}
Options.prototype.turn = function(type) {
	return this.shipProp(type,"turn");
}
Options.prototype.cargo = function(type) {
	return this.shipProp(type,"cargo");
}
Options.prototype.cost = function(type) {
	return this.shipProp(type,"cost");
}
Options.prototype.running = function(type) {
	return this.shipProp(type,"running");
}

/* Trade prices */
Options.prototype.tradePrice = function(good, station) {
	return parseInt($('[name='+good+'_'+station+']').val());
}

/* Fines */
Options.prototype.fine = function(crime) {
	return parseInt($('[name='+crime+'_fine]').val());
}
Options.prototype.bounty = function(crime) {
	return parseInt($('[name='+crime+'_bounty]').val());
}

/* Settings */
Options.prototype.flag = function(flag) {
	return $('[name='+flag+']').is(':checked');
}
Options.prototype.opt = function(opt) {
	return $('[name='+opt+']').val();
}



var OPTIONS = new Options();
