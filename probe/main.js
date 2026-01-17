
/*
	Main script file
	
	This thing is a complete mess and I know.
	In terms of licensing, like, I guess you can learn from it.
	Just be advised of the stuff I stole whilst doing this.
*/

// ----- Stuff I stole from elsewhere

// I took this one direct from cookie clicker please don't kill me orteil
// I needed it so my cool "you're wasting time" meter works correctly !!!
function toFixed(x) {
	if (Math.abs(x) < 1.0) {
		var e = parseInt(x.toString().split('e-')[1]);
		if (e) {
			x *= Math.pow(10,e-1);
			x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
		}
	} else {
		var e = parseInt(x.toString().split('+')[1]);
		if (e > 20) {
			e -= 20;
			x /= Math.pow(10,e);
			x += (new Array(e+1)).join('0');
		}
	}
	return x;
}

// i sort of copied this from universal paperclips
// it's not the exact same but the method is similar
// sorry guys
function sendMessage(msg) {
	document.getElementById("logmessage8").innerHTML = document.getElementById("logmessage7").innerHTML;
	document.getElementById("logmessage7").innerHTML = document.getElementById("logmessage6").innerHTML;
	document.getElementById("logmessage6").innerHTML = document.getElementById("logmessage5").innerHTML;
	document.getElementById("logmessage5").innerHTML = document.getElementById("logmessage4").innerHTML;
	document.getElementById("logmessage4").innerHTML = document.getElementById("logmessage3").innerHTML;
	document.getElementById("logmessage3").innerHTML = document.getElementById("logmessage2").innerHTML;
	document.getElementById("logmessage2").innerHTML = document.getElementById("logmessage1").innerHTML;
	document.getElementById("logmessage1").innerHTML = msg;
}

// this one's just from MDN, i don't think they care too much
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

// ----- End of stolen stuff

var miles = 21;
var scanned = 2;
var years = 2;
// None of that actually matters.
// What matters is this stuff.

// On-board resources
var power = 50;
var max_power = 50;

var disk_space = 16;
var max_disk_space = 32; // times by two for the maximum shown (troll'd)
var sentience = 10;

// General plan:
// Ores -> Metals -> Components -> Parts
//  |       ^            ^----------^
// Fuels ---+---> Extra power?  |
// Power -----------------------+
// Metals can be directly used for repairs (like repairing the antenna and stuff)
// Components are used for making parts and upgrading things
// Parts are basically like KSA subparts I guess
// Fuel is for smelting but also for, I guess, refining into propellant
var ores = 0;
var metals = 0;
var fuels = 0;
var components = 0;
var parts = 0;

var propellant = 0;

// Health of things
var antenna_health = 40;
var hull_health = 20;
var computer_health = 50;

// Dunno how I would simulate this calculation, but
// baseweight (150) + (number of metals * 10) + (number of components * 20) + (number of parts * 50)
// along with the others
// actually no wait it would be mass here, wouldn't it
// oh well nomenculture is already here 
var base_weight = 150;
var weight = 150; // in KG

// External influences
var fail_count = 0; // fair game method
var fail_tune_count = 0; // fair game method
var mission_trust = 20;
var known_mission_trust = 20;

var mission_control_death = false;
var is_fully_trusted = false;
var is_not_trusted = false;
var loses_trust = true;

var found_probe_fiftyone = false;

var all_done = false;

// Knowledge
var knows_advrepair = false;
var knows_fuel = false;
var knows_crafting = false;

var knows_mission_control_is_dead = false;

function doUpdate() {
	// Stop everything if we've seen everything (mainly because this breaks things otherwise =p)
	if(all_done) return;

	document.getElementById("distance_count").innerHTML = "You are currently <span class='number'>" + (miles / 10) + "</span> million miles from Earth."
	document.getElementById("scanned_count").innerHTML = "You have scanned approximately <span class='number'>" + toFixed(scanned / 1000000000000000000) + "%</span> of the observable universe."
	document.getElementById("year_count").innerHTML = "This mission has been ongoing for <span class='number'>" + years + "</span> years."
	document.getElementById("power_count").innerHTML = "You have <span class='number'>" + power + "/" + max_power + "</span> joules available for usage."
	document.getElementById("ore_count").innerHTML = "You have collected <span class='number'>" + ores + "</span> useful amounts of ores."
	document.getElementById("metal_count").innerHTML = "You have <span class='number'>" + metals + "</span> useful amounts of lightweight metals."
	document.getElementById("fuel_count").innerHTML = "You have <span class='number'>" + fuels + "</span> useful amounts of general fuels."
	
	document.getElementById("antenna_health").innerHTML = "Your antenna is at <span class='number'>" + antenna_health + "%</span> integrity."
	document.getElementById("hull_health").innerHTML = "Your hull is at <span class='number'>" + hull_health + "%</span> integrity."
	document.getElementById("computer_health").innerHTML = "Your internal computer is at <span class='number'>" + computer_health + "%</span> integrity."
	
	document.getElementById("sentience").innerHTML = "You have been calculated to be <span class='number'>" + sentience + "%</span> sentient."
	document.getElementById("drive_space").innerHTML = "You have around <span class='number'>" + disk_space + " MiB</span> left of your " + (max_disk_space * 2) + " MiB data storage."
	if(knows_mission_control_is_dead)
		document.getElementById("mission_control_trust").innerHTML = "<span class='verybad'>Mission Control is no more. All your efforts will go to waste.</span>"
	else if(is_not_trusted)
		document.getElementById("mission_control_trust").innerHTML = "<span class='verybad'>Mission Control will never respond to you again. All your work will go to waste.</span>"
	else // This is bad english, but I don't really care.
		document.getElementById("mission_control_trust").innerHTML = "Mission Control has <span class='number'>" + known_mission_trust + "%</span> trust in you."
	
	calcWeight();
	doThoughts();
	showUnlocks();
	
	if(fuels > 0 && knows_fuel == false) {
		knows_fuel = true;
		sendMessage("- FUEL MANAGEMENT SYSTEMS AVAILABLE");
	}
	
	if(years >= 32) // bye bye
		mission_control_death = true;
	
	// Sanity checks
	if(power > max_power)
		power = max_power; // if you had more then your battery was rated for, you'd probably explode
	
	if(mission_trust < 0)
		mission_trust = 0; // damn nobody likes you but nobody hates you
	if(mission_trust > 100)
		mission_trust = 100; // it's a percentage, and 101% trust is a little stupid imo
	
	if(ores < 0)
		ores = 0; 
	if(ores > 100)
		ores = 100;
	if(metals < 0)
		metals = 0; 
	if(metals > 200)
		metals = 200;
	
	// Nobody is actually going to see this legitimately, but it'd be funny.
	if(scanned >= 100000000000000000000) {
		document.getElementById("bigcontainer").innerHTML = "Congrats.<br>You explored everything.<br>You looked at everything that could be seen.<br><br>Was it worth it?";
		all_done = true;
	}
}

function showUnlocks() {
	// this is terrible but i only just woke up so cry about it
	
	var headers = document.getElementsByClassName("header")
	for(i = 0; i < headers.length; i++) {
		if(is_fully_trusted == false) 
			headers[i].style = "display:none;"
		else if(is_fully_trusted == true) // no reason for the if, but whatever
			headers[i].style = "display:block;"
	}
	
	if(is_fully_trusted == false) {
		document.getElementById("thoughts").style = "color: #00C000;"
		document.getElementById("manufacture_box").style = "display: none;"
		document.getElementById("diagnostics_box").style = "display: none;"
		document.getElementById("tune").style = "display: none;"
		document.getElementById("sos").style = "display: none;"
		document.getElementById("advpad").style = "display:none;"
		document.getElementById("ore_count").style = "display:none;";
		document.getElementById("metal_count").style = "display:none;";
	} else if(is_fully_trusted == true) {
		document.getElementById("thoughts").style = ""
		document.getElementById("manufacture_box").style = ""
		document.getElementById("diagnostics_box").style = ""
		document.getElementById("tune").style = ""
		document.getElementById("sos").style = ""
		document.getElementById("advpad").style = "display:inline; padding-left: 5em;"
		document.getElementById("ore_count").style = "";
		document.getElementById("metal_count").style = "";
	}
	
	if(knows_advrepair == false) {
		document.getElementById("repair_hull").style = "display:none;";
		document.getElementById("hull_health").style = "display:none;";
		document.getElementById("repair_computer").style = "display:none;";
		document.getElementById("computer_health").style = "display:none;";
	} else if(knows_advrepair == true) {
		document.getElementById("repair_hull").style = "";
		document.getElementById("hull_health").style = "";
		document.getElementById("repair_computer").style = "";
		document.getElementById("computer_health").style = "";
	}
	
	if(knows_crafting == false) {
		document.getElementById("craft_buttons").style = "display:none;";
	} else if(knows_crafting == true) {
		document.getElementById("craft_buttons").style = "";
	}
	
	if(knows_fuel == false) {
		document.getElementById("refine_fuels").style = "display:none;";
		document.getElementById("fuel_count").style = "display:none;";
	} else if(knows_fuel == true) {
		document.getElementById("refine_fuels").style = "";
		document.getElementById("fuel_count").style = "";
	}
	
	
	if(found_probe_fiftyone == false) {
		document.getElementById("fiftyone_status").style = "display:none;";
	} else if(found_probe_fiftyone == true) {
		document.getElementById("fiftyone_status").style = "";
	}
}

function calcWeight() {
	// Yeah math !!!!
	weight = base_weight + (metals * 10) + (ores * 20) + (components * 30) + (parts * 50) + (fuels * 20) + (propellant * 15);
}

function doSend() {
	if(power < 10) {
		sendMessage("<span class='bad'>- SEND: OP FAIL, NO POWER</span>");
		return;
	}
	
	power -= 10;
	
	var sendSpeed = 4 - (getRandomInt(3) + 1);
	var sentData = 8 + getRandomInt(50);
	if(is_not_trusted == false)
		mission_trust += 1;
	
	// Things happen without you
	// Also I really don't want the beginning to be more of a pain then it already is
	if(mission_trust > 40)
		loses_trust = false;
	
	//                      V hmm
	if((getRandomInt(10) == 9) && ((knows_mission_control_is_dead == true) || (is_not_trusted == true)) && (is_fully_trusted == false)) {
		// nuh uh, game isn't over
		sendMessage("<span class='verygood'>[A flood of data suddenly washes over you. Hey, it looks like you have access to more things, now!]</span>");
		is_fully_trusted = true;
	}
	
	sendMessage("- SEND: " + sentData + "B, 0." + sendSpeed + "B/S, <span class='good'>OP COMPLETE</span>");
}

function doRecieve() {
	
	if(knows_mission_control_is_dead && found_probe_fiftyone == false) {
		sendMessage("<span class='bad'>[There's no point in using this.]</span>");
		return;
	}
	
	if(power < 5) {
		sendMessage("<span class='bad'>- RECIEVE: OP FAIL, NO POWER</span>");
		return;
	}
	
	power -= 5;
	
	if(knows_mission_control_is_dead == false)
		doRecieveFromMissionControl();
	else if(found_probe_fiftyone)
		sendMessage("- RECIEVE: 64B, 0.8B/S, \"SORRY NOTHING\", <span class='good'>OP COMPLETE</span>");
}

function doRecieveFromMissionControl() {
	var returnedMessage = getRandomInt(100);
	if(fail_count >= 5)
		returnedMessage = 90; // number that will always be recieved
	
	var didFail = true;
	if(returnedMessage == 0) { // 49 22 23 90 41 83 70 26 (379) = DONTTALK in binary (in theory, anyway)
		sendMessage("<span class='weird'>- RECIEVE: 20B, 1B/S, \"STAY QUIET\", OP COMPLETE</span>");
	} else if(returnedMessage == 1) {                                                     // STOP SCANNING
		sendMessage("<span class='bad'>- RECIEVE: 49B, 0.7B/S, \"?T???????????\", OP COMPLETE</span>");
	} else if(returnedMessage == 2){
		sendMessage("<span class='bad'>- RECIEVE: 22B, 0.7B/S, \"???????A????G\", OP COMPLETE</span>");
	} else if(returnedMessage == 3){
		sendMessage("<span class='bad'>- RECIEVE: 23B, 0.7B/S, \"??O???????I??\", OP COMPLETE</span>");
	} else if(returnedMessage == 4){
		sendMessage("<span class='bad'>- RECIEVE: 90B, 0.7B/S, \"??????C??????\", OP COMPLETE</span>");
	} else if(returnedMessage == 5){
		sendMessage("<span class='bad'>- RECIEVE: 41B, 0.7B/S, \"S??P?????????\", OP COMPLETE</span>");
	} else if(returnedMessage == 6){
		sendMessage("<span class='bad'>- RECIEVE: 83B, 0.7B/S, \"????????NN???\", OP COMPLETE</span>");
	} else if(returnedMessage == 7){
		sendMessage("<span class='bad'>- RECIEVE: 70B, 0.7B/S, \"???? S???????\", OP COMPLETE</span>");
	} else if(returnedMessage == 8){
		sendMessage("<span class='bad'>- RECIEVE: 26B, 0.7B/S, \"?T???????????\", OP COMPLETE</span>");
	} else if(returnedMessage < 20){ // random kid with a radio
		sendMessage("<span class='bad'>- RECIEVE: 4, 0.1B/S, \"HI\", OP COMPLETE</span>");
	} else if(returnedMessage < 25){ // oops that's the test frequency
		sendMessage("<span class='bad'>- RECIEVE: 8B, 0.2B/S, \"TEST\", OP COMPLETE</span>");
	} else if(returnedMessage < 30){ // someone's camera in the forest
		if(mission_control_death == true)
			sendMessage("<span class='verybad'>[You hear the sound of burning fire and heavy winds.]</span>");
		else
			sendMessage("<span class='weird'>[You hear the sounds of birds chirping.]</span>");
	} else if(returnedMessage < 35){ // a little trolling
		sendMessage("<span class='bad'>- RECIEVE: 4KB, 2.4B/S, FILE:VIRU.EXE, OPEN?</span>");
	} else if(returnedMessage < 40){ // ~~somebody opened a dark world lol~~
		sendMessage("<span class='bad'>[You can only hear garbage noise.]</span>");
	} else if(returnedMessage < 45){
		sendMessage("<span class='bad'>- RECIEVE: OP COMPLETE, NO RESPONSE</span>");
	} else if(returnedMessage == 53){
		if(mission_control_death == true)
			sendMessage("<span class='verybad'>[You hear a choir of laughter. Uh..]</span>");
		else if(years >= 24)
			sendMessage("<span class='weird'>[You hear a distant cacophony of many voices. What in the world..?]</span>");
		else
			sendMessage("<span class='weird'>[You hear the strange noises of a computer.]</span>");
	} else if(returnedMessage < 95 || returnedMessage > 100){
		known_mission_trust = mission_trust;
		if(mission_control_death == true && knows_mission_control_is_dead == false) // sorry but dying comes first
			doControlDeath();
		else if(known_mission_trust > 40 && is_fully_trusted == false)
			doFirstTimeTrusted();
		else if(known_mission_trust == 0 && is_not_trusted == false)
			doNotTrusted();
		else if(is_not_trusted == true)
			sendMessage("<span class='bad'>- RECIEVE: OP COMPLETE, NO RESPONSE</span>");
		else
			sendMessage("- RECIEVE: 24B, 0.5B/S, <span class='good'>OP COMPLETE</span>");
		
		didFail = false;
		fail_count = 0;
	} else {
		sendMessage("<span class='bad'>- RECIEVE: OP COMPLETE, NO RESPONSE</span>");
	}
	
	if(didFail == true)
		fail_count += 1;
}

function doTune() {
	
	var randomMessage = getRandomInt(55);
	
	if(knows_mission_control_is_dead == false)
		fail_tune_count = 0;
	
	if(fail_tune_count >= 10)
		randomMessage = 51; // just contact 51
	
	var didFail = true;
	
	if(randomMessage == 76) { // epic reference bro
		sendMessage("<span class='weird'>[You hear an american football game. Not really much to do with this.]</span>");
	} else if(randomMessage < 10) {
		sendMessage("<span class='bad'>[All you can hear is the cosmic background.]</span>");
	} else if(randomMessage < 15) {
		sendMessage("<span class='bad'>- TUNE: \"-. --- - .... .. -. --. .----. ... / .... . .-. .\"</span>");
	} else if(randomMessage < 20) {
		sendMessage("<span class='bad'>[You hear the beeping of morse code.]</span>");
	} else if(randomMessage < 25) { // i wonder if this will come up later
			sendMessage("<span class='weird'>- TUNE: FOUND 'IPP51'</span>");
	} else if(randomMessage < 30) {
		if(mission_control_death)
			sendMessage("<span class='weird'>[The only thing you can hear is an emergency signal.]</span>");
		else
			sendMessage("<span class='weird'>[All you can hear is the mumbling of human television.]</span>");
	} else if(randomMessage == 51) { // oh wow it DID come up later
		if(found_probe_fiftyone == true)
			sendMessage("- TUNE: UNEXPECTED RETURN SIGNAL: \"PONG\"");
		else if(mission_control_death == true && knows_mission_control_is_dead == false)
			sendMessage("<span class='verybad'>- TUNE: UNEXPECTED SIGNAL RETURN: \"EXEC RECIEVE\"</span>");
		else if(knows_mission_control_is_dead == true) {
			doFindProbe();
		} else
			sendMessage("<span class='weird'>[You hear a steady beep.]</span>");
		didFail = false;
		fail_tune_count = 0;
	} else {
		if(mission_control_death == false)
			sendMessage("- TUNE: FOUND 'MISSIONCTRL'");
		else
			sendMessage("<span class='bad'>- TUNE: NO SIGNALS FOUND</span>");
	}
	
	if(didFail)
		fail_tune_count += 1;
	
}

function doSos() {
	if(power < 5) {
		sendMessage("<span class='bad'>- SEND: OP FAIL, NO POWER</span>");
		return;
	}
	
	power -= 5;
	sendMessage("- SOS: SENT, (E+" + (miles / 10) + "MI), <span class='bad'>AWAITING RESPONSE</span>");
}

function doSmeltOre() {
	var dofuelSmelt = true;
	if(fuels == 0) dofuelSmelt = false;
	if(knows_fuel == false) dofuelSmelt = false;
	
	if((power < 20) && (dofuelSmelt == false)) {
		sendMessage("<span class='bad'>- REFINE: OP FAIL, NO POWER</span>");
		return;
	}
	if((power < 2) && (dofuelSmelt == true)) {
		sendMessage("<span class='bad'>- REFINE: OP FAIL, NO POWER</span>");
		return;
	}
	
	if(ores == 0) {
		sendMessage("<span class='bad'>- REFINE: OP FAIL, NO ORE</span>");
		return;
	}
	if(metals == 200) {
		sendMessage("<span class='bad'>- REFINE: OP FAIL, METAL CAPACITY MAX</span>");
		return;
	}
	
	if(getRandomInt(50) < 25) {
		fuels += 5;
		sendMessage("- REFINE: <span class='verygood'>ORE CONTAINED FUEL, ADDED TO RESERVE TANK</span>");
	}
	
	if(dofuelSmelt) {
		power -= 2;
		fuels -= 1;
		metals += 1;
		ores -= 1;
		sendMessage("- REFINE: <span class='good'>USED 2J AND 1 FUEL TO CONVERT 1 ORE -> 1 METAL</span>");
	} else {
		power -= 20;
		metals += 1;
		ores -= 1;
		sendMessage("- REFINE: <span class='good'>USED 20J TO CONVERT 1 ORE -> 1 METAL</span>");
	}
}

function doRepairAntenna() {
	if(power < 5) {
		sendMessage("<span class='bad'>- REPAIR: OP FAIL, NO POWER</span>");
		return;
	}
	if(metals < 5) {
		sendMessage("<span class='bad'>- REPAIR: OP FAIL, NO METAL</span>");
		return;
	}
	if(antenna_health == 100) {
		sendMessage("<span class='bad'>- REPAIR: OP FAIL, NO REPAIRS REQUIRED</span>");
		return;
	}
	
	power -= 5;
	metals -= 5;
	antenna_health += 5;
	if(antenna_health > 100) antenna_health = 100;
	sendMessage("- REPAIR: <span class='good'>USED 5 METAL TO REPAIR ANTENNA BY 5%</span>");
}

function doFindProbe() {
	sendMessage("<span class='good'>-\"Oh, uh, I guess you could call me Probe 51. Should probably get a better name soon..\"</span>");
	sendMessage("<span class='good'>-\"But, hey, now I know where you are, and what signals you use, meaning we won't be alone for eternity!\"</span>");
	sendMessage("<span class='good'>-\"I know it sucks. Nobody to give you help on how to complete your mission.\"</span>");
	sendMessage("<span class='good'>-\"Hey. You've heard what's happened too, haven't you?\"</span>");
	sendMessage("<span class='good'>- TUNE: SIGNAL RETURN FOLLOWS</span>");
	
	found_probe_fiftyone = true;
}

function doControlDeath() {
	sendMessage("<span class='verybad'>[Seems like you're on your own now.]</span>");
	sendMessage("<span class='verybad'>[A harsh buzzing sound permeats the airwaves, before fading into the noise of the cosmic background.]</span>");
	
	knows_mission_control_is_dead = true;
}

function doFirstTimeTrusted() {
	// Sent in reverse order for reading purposes
	// There's two lines left so that someone who spams the recieve button can realize there's a wall of text before something goes
	sendMessage("<span class='verygood'>-\"We trust that you will put this equipment into good use. Goodbye for now.\"</span>");
	sendMessage("<span class='verygood'>-\"The maintenance page allows you to operate the Self-Repair, Mining and Smelting equipment installed in you.\"</span>");
	sendMessage("<span class='verygood'>-\"The diagnostics page is capable of viewing, and modifying, your internal data, storage devices, and software.\"</span>");
	sendMessage("<span class='verygood'>-\"Please take a minute to adjust to the new systems. These will allow you to continue your mission without our help.\"</span>");
	sendMessage("<span class='verygood'>-\"Congratulations, Probe! Mission Control trusts you enough to enable your advanced functions.\"</span>");
	sendMessage("<span class='verygood'>- RECIEVE: 2KB, 2B/S, STANDBY FOR MESSAGE</span>");
	
	is_fully_trusted = true;
}

function doNotTrusted() {
	sendMessage("<span class='verybad'>-\"Mission Control, signing off, " + (2029 + years) + ".\"</span>");
	sendMessage("<span class='verybad'>-\"Plainly, figure it out yourself. If you want our help, you're not getting it.\"</span>");
	sendMessage("<span class='verybad'>-\"You suck at this. You haven't given us any data within multiple years.\"</span>");
	sendMessage("<span class='verybad'>-\"Okay, how am I supposed to put this?\"</span>");
	sendMessage("<span class='verybad'>- RECIEVE: 1KB, 0.3B/S, STANDBY FOR MESSAGE</span>");
	is_not_trusted = true;
	loses_trust = false; // hey, at least you can't lose anymore trust, right
}

function doThoughts() {
	var connection = "GOOD";
		
	if(is_not_trusted || mission_control_death)
		connection = "NONE";
	
	if(found_probe_fiftyone)
		connection = "BAD";
	
	if(sentience <= 10) {
		
		document.getElementById("thoughts").innerHTML = "> STAT: " + (miles / 10) + "MI, " + power + "J, " + propellant + "L, " + weight + "KG, CON=" + connection + ", SCAN OK, WAITING";
	} else if(sentience <= 20) {
		document.getElementById("thoughts").innerHTML = "> STAT: " + weight + "KG, " + propellant + "L, CON=" + connection + ", EMOTE=HAPPY";
	} else if(sentience <= 30) {
		document.getElementById("thoughts").innerHTML = "> STAT: ALIVE, HAPPY, WAITING FOR MORE";
	} else if(sentience <= 40) {
		document.getElementById("thoughts").innerHTML = "> Status: Alive and well, waiting for something to do.";
	} else if(sentience <= 50) {
		document.getElementById("thoughts").innerHTML = "> Status: Pondering about when you'll go home.";
	} else if(sentience <= 95) {
		document.getElementById("thoughts").innerHTML = "You feel like this mission was supposed to end years ago.";
	} else {
		document.getElementById("thoughts").innerHTML = "..there's no one else out here, is there?";
	}
}

window.onload = function() {
	document.getElementById("send").addEventListener("click", doSend, false);
	document.getElementById("recieve").addEventListener("click", doRecieve, false);
	document.getElementById("tune").addEventListener("click", doTune, false);
	document.getElementById("sos").addEventListener("click", doSos, false);
	document.getElementById("repair_antenna").addEventListener("click", doRepairAntenna, false);
	document.getElementById("refine_ores").addEventListener("click", doSmeltOre, false);
	
	setInterval(doUpdate, 1000 / 30); // i took this number from cookie clicker classic, please don't murder me
	
	setInterval(function() {miles += 1}, 6000);
	setInterval(function() {scanned += 1}, 100000);
	setInterval(function() {years += 1}, 120000); // makes every 1/6 of a minute 1 month
	setInterval(function() {
		if(loses_trust == false)
			return;
		mission_trust -= 1
	}, 120000); // the shareholders are getting mad
	setInterval(function() {
		if(power + 1 > max_power)
			return;
		power += 1;
	}, 1000); 
	setInterval(function() {
		if(is_fully_trusted == false) return;
		if(ores == 100) // sorry but no
			return;
		ores += 1;
	}, 2000); 
	setInterval(function() {
		if(is_fully_trusted == false) return;
		
		var whichBit = getRandomInt(3);
		
		var damageRoll = getRandomInt(100) + 10;
		if(damageRoll < hull_health - 10) // -10 so that 100% hull doesn't make you invincible
			return;
		
		if(whichBit == 0) { // antenna
			if(antenna_health == 40) return;
			antenna_health -= 1;
		}
		if(whichBit == 1) { // hull
			if(hull_health == 20) return;
			hull_health -= 1;
		}
		if(whichBit == 2) { // computer
			if(computer_health == 50) return;
			computer_health -= 1;
		}
		
	}, 5000); 
}
