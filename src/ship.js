var SHIP_TRADER='trader';
var SHIP_PIRATE='pirate';
var SHIP_HUNTER='hunter';

var	cargoList = ["food", "rocks", "tech", "metal"];

var random_cargo = function() {
	return cargoList[Math.floor(Math.random()*cargoList.length)];
}

function Ship(st, cargopref) {
	this.type = st;
	this.cargo = [];
	this.cargopref = cargopref ? cargopref : random_cargo();
	this.location = Math.floor(Math.random()*11); // 0-10
	if (st == SHIP_TRADER && this.location < 10 && this.location > 0) {
		this.loadCargo();
	}

	this.hull = OPTIONS.hull(this.type);
	this.shields = OPTIONS.shields(this.type);
	this.profit = 0;
	this.skill = 1;
	this.fine = 0;
	this.bounty = 0;
	this.evaded = false;
}

Ship.prototype.loadCargo = function() {
	var ctype = this.cargopref;
	for (var i=0; i<OPTIONS.cargo(this.type); i++) {
		this.cargo.push(ctype);
		this.profit -= OPTIONS.tradePrice(ctype, "buy");
	}
}

Ship.prototype.unloadCargo = function() {
	var self = this;
	var factor = 1;
	if (this.type == SHIP_PIRATE) {
		factor = OPTIONS.opt("piracy_fence")/100;
	}
	this.cargo.forEach(function(ctype) {
		self.profit += OPTIONS.tradePrice(ctype, "sell") * factor;
	})
	this.cargo = [];
}

Ship.prototype.repair = function() {
	var damage = 1 - (this.hull / OPTIONS.hull(this.type));
	var cost = (OPTIONS.opt("damage_per")/100)*OPTIONS.cost(this.type);
	this.profit -= damage * cost;
	this.hull = OPTIONS.hull(this.type);
	this.profit -= OPTIONS.running(this.type);
	if (Math.random() < 1/(this.skill*this.skill*this.skill)) {
		this.skill++;
	}
}

Ship.prototype.die = function() {
	this.hull = OPTIONS.hull(this.type);
	this.location = 0;
	if (OPTIONS.flag("death_bounty")) {
		this.bounty = 0;
	}
	if (OPTIONS.flag("death_fine")) {
		this.profit -= this.fine;
		this.fine = 0;
	}
	if (OPTIONS.flag("death_cargo")) {
		this.cargo = [];
	}
	this.profit -= OPTIONS.opt("death_cost");
	this.profit -= (OPTIONS.opt("death_per")/100)*OPTIONS.cost(this.type);
}

Ship.prototype.recharge = function() {
	this.shields = OPTIONS.shields(this.type);
}

Ship.prototype.isDamaged = function() {
	return (this.hull < OPTIONS.hull(this.type));
}

Ship.prototype.hasFreeSpace = function() {
	return (this.cargo.length < OPTIONS.cargo(this.type));
}

Ship.prototype.takeDamage = function(aggressor) {
	var damage = Math.floor(Math.random()*OPTIONS.weapons(aggressor.type))+1;
	this.shields -= damage;
	if (this.shields < 0) {
		this.hull += this.shields;
		this.shields = 0;
	}
	if (aggressor.type == SHIP_PIRATE && this.cargo.length > 0 && aggressor.hasFreeSpace()) {
		var steal = false;
		if (OPTIONS.flag("piracy_hack")) {
			steal = Math.random() > this.shields / OPTIONS.shields(this.type);
		} else if (this.shields == 0) {
			if (OPTIONS.flag("piracy_break")) {
				steal = Math.random() > this.hull / OPTIONS.hull(this.type);
			}
		}
		if (steal) {
			aggressor.cargo.push(this.cargo.pop());
			return true;
		}
	}
	return false;
}

Ship.prototype.offend = function(crime) {
	this.bounty += OPTIONS.bounty(crime);
	this.fine += OPTIONS.fine(crime);
}

/* Combat scores */
Ship.prototype.interceptScore = function() {
	return Math.floor(Math.random()*OPTIONS.speed(this.type)) +
		Math.floor(Math.random()*OPTIONS.turn(this.type)) +
		this.skill;
}

Ship.prototype.evadeScore = function() {
	return Math.floor(Math.random()*OPTIONS.speed(this.type)) +
		Math.floor(Math.random()*OPTIONS.turn(this.type)) +
		this.skill;
}

Ship.prototype.attackScore = function() {
	return Math.floor(Math.random()*OPTIONS.weapons(this.type)) +
		Math.floor(Math.random()*OPTIONS.turn(this.type)) +
		this.skill;
}

Ship.prototype.fleeScore = function() {
	return Math.floor(Math.random()*OPTIONS.speed(this.type)) +
		Math.floor(Math.random()*OPTIONS.speed(this.type)) +
		this.skill;
}

