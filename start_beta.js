// REMOVE THIS LINE BEFORE RELEASING AND CHANGE THE URL FOR THE HTMLSNIPPETS (LINE 6)!!!!!!!!!!!!
var c;
// $(function() {
/*
 * $.ajax({ type:'GET', url:
 * 'https://raw.github.com/tribalCarigan/Tribalwars/master/htmlsnippets/contentContainerBeta.html',
 * data: 'callback=c', success: function(data){c(data);}, dataType:'jsonp' });
 */
var outPut, hiddenFrame, attackButton, sAttackButton, rAttackButton, cAttackButton, popup, messages, spinner, villagearr, targets, attackId, templAttackId, villages, continuousAttack, attackList;

var position = loadVal('position') || 0;
var attacking = false;
var continueAttack = true;
var attackTemplates = {};
var unitPerAttack = [];
var unitTypes = {
	'unit_input_spear' : 'Spears',
	'unit_input_sword' : 'Swords',
	'unit_input_axe' : 'Olafs',
	'unit_input_spy' : 'Scouts',
	'unit_input_light' : 'LC',
	'unit_input_heavy' : 'HC',
	'unit_input_ram' : 'Rams',
	'unit_input_catapult' : 'Catas',
	'unit_input_knight' : 'Palas',
	'unit_input_snob' : 'Nobles'
};
/*
 * for(unitType in unitTypes) { unitPerAttack[unitType] = loadVal(unitType) || 0; }
 */
c = function(data) {
	$(data.htmlSnippet).insertBefore('#contentContainer');
	popup = $(data.popup).appendTo('body').hide();
	outPut = $('#newContent').css({'position':'relative'});
	hiddenFrame = $('<iframe src="/game.php?village=' + game_data.village.id + '&screen=place" />').load(frameLoaded).attr('width', '0px').attr('height', '0px').appendTo(outPut).hide();
	attackButton = $('#attackButton').click(attack);
	sAttackButton = $('#sAttackButton').click(stopAttack).hide();
	rAttackButton = $('#resetAttack').click(resetAttack);
	cAttackButton = $('#cAttackButton').click(function(){showAttackTemplate();});
	attackTemplateSaveLink = $('#saveTemplate').click(templateFinished);
	templAttackId = $('#template_attackId');
	// css isn't loaded in chrome when served from github because of faulty headers
	//$('<link rel="stylesheet" type="text/css" href="https://raw.github.com/tribalCarigan/Tribalwars/master/htmlsnippets/contentContainer.css" />').appendTo('body');
	spinner = $('#loading').css({
		'position' : 'absolute',
		'right' : '0',
		'bottom' : '0'
	});
	continuousAttack = $('#continuousAttack').css({
		
	});
	attackList = $('#attackList').css({
		'list-style' : 'none',
		'width' : '120px',
		'height' : '90px',
		'overflow' : 'auto',
		'float' : 'right'
	});
	$('#attackName').css({
		'margin' : '0',
		'margin-left' : '300px'
	});
	$('#buttons').css({
		'width' : '130px',
		'float' : 'right'
	});
	$('#buttons button').css({
		'width': '100px'
	});
	$('#unitTable').css({
		'margin-left' : '300px'
	});
	messages = $('#messages').css({
		'list-style' : 'none',
		'float' : 'left',
		'width' : '250px',
		'height' : '90px',
		'overflow' : 'auto'
	});
	loadAttacks();
};

function sendUnits(unitType) {
	if (unitPerAttack[unitType] == 0)
		return true;
	var unitAmount = hiddenFrame.contents().find('#' + unitType).siblings().last().html();
	if (parseInt(unitAmount.substr(1, unitAmount.length - 2)) >= parseInt(unitPerAttack[unitType])) {
		hiddenFrame.contents().find('#' + unitType).val(unitPerAttack[unitType]);
		return true;
	}
	UI.ErrorMessage(('Not enough units of type: ' + unitTypes[unitType]), 3000);
	stopAttack();
	return false;
}
function writeOut(message) {
	messages.append('<li>' + message + '</li>');
	messages.scrollTop(messages[0].scrollHeight);
}
function storeVal(name, value) {
	localStorage.setItem(game_data.village.id + '_' + name, value);
}
function loadVal(name) {
	return localStorage.getItem(game_data.village.id + '_' + name);
}
function deleteVal(name) {
	localStorage.removeItem(game_data.village.id + '_' + name);
}

function frameLoaded() {
	spinner.fadeOut();
	var submitAttack = hiddenFrame.contents().find('#troop_confirm_go');
	var botProtection = hiddenFrame.contents().find('#bot_check');
	if (botProtection.size() != 0) {
		UI.ErrorMessage('Bot Protection! you need to enter a captcha somewhere... not sure yet what to do', 3000);
	}
	if (submitAttack.size() == 0) {
		loadAttack(attackId);
		showAttack();
		if (attacking && continueAttack) {
			attack();
		}
	} else {
		position++;
		storeVal('position', position);
		spinner.show();
		submitAttack.click();
	}
}
function attack() {
	attackButton.hide();
	sAttackButton.show();
	coordData = villagearr[position];
	getCoords = coordData.split("|");
	continueAttack = true;
	for (unitType in unitPerAttack) {
		if (continueAttack) {
			continueAttack = sendUnits(unitType);
		}
	}
	if (continueAttack) {
		hiddenFrame.contents().find('#inputx').val(getCoords[0]);
		hiddenFrame.contents().find('#inputy').val(getCoords[1]);
		hiddenFrame.contents().find('#target_attack').click();
		attacking = true;
		spinner.show();
		writeOut('Attacking: [' + coordData + ']');
		if (position >= targets - 1) {
			if(continuousAttack.is(':checked')) {
				resetAttack(true);
			} else {
				stopAttack();
			}
		}
	}
}
function stopAttack() {
	attackButton.show();
	sAttackButton.hide();
	attacking = false;
	continueAttack = false;
	if (position >= targets - 1) {
		UI.SuccessMessage("Cycle complete, stopping attack and resetting to first Coords.", 3000);
		resetAttack(true);
	}
}
function resetAttack(fullCycle) {
	if (!fullCycle) UI.SuccessMessage("Resetting to first Coords.", 3000);
	position = 0;
	$('#attackedVillages').val(position);
	storeVal('position', 0);
}
function showAttackTemplate(id) {
	console.log(arguments);
	if (id) {
		templAttackId.val(id);
		$('#template_name').val(attackTemplates[id].name);
		$('#template_coords').val(attackTemplates[id].coords);
		for (unitType in unitTypes) {
			$('#template_' + unitType).val(attackTemplates[id].unitsPerAttack[unitType]);
		}
	} else {
		templAttackId.val();
		$('#template_name').val();
		$('#template_coords').val();
		for (unitType in unitTypes) {
			$('#template_' + unitType).val(0);
		}
	}
	popup.show();
}

function templateFinished() {
	if (templAttackId.val()) {
		saveAttack(templAttackId.val());
	} else {
		createAttack();
	}
	if(templAttackId.val() == attackId) {
		loadAttack(attackId);
	}
	populateAttackList();
	popup.hide();
}

function createAttack() {
	var newId = '_' + new Date().getTime(); // attackTemplates.length; what happens if an entry gets removed?
	saveAttack(newId);
	populateAttackList();
}

function saveAttack(id) {
	var templateUnits = {};
	for (unitType in unitTypes) {
		templateUnits[unitType] = $('#template_' + unitType).val();
	}

	var attack = {
		name : $('#template_name').val().trim(),
		unitsPerAttack : templateUnits,
		coords : $('#template_coords').val().trim()
	};
	attackTemplates[id] = attack;
	storeVal('attacktemplates', JSON.stringify(attackTemplates));
}

function loadAttacks() {
	attackTemplates = JSON.parse(loadVal('attacktemplates'));
	populateAttackList();
}

function showAttack() {
	for (unitType in unitPerAttack) {
		$('#' + unitType).val(unitPerAttack[unitType]).change(function(e) {
			/*
			 * // not feasible with the attacktemplates anymore
			 * unitPerAttack[e.target.id] = $(e.target).val();
			 * storeVal(e.target.id, unitPerAttack[e.target.id]);
			 * writeOut('Updated amount for ' + unitTypes[e.target.id] + ' to: ' +
			 * unitPerAttack[e.target.id]);
			 */
		}).focus(function(e) {
			$(this).blur();
			showAttackTemplate(attackId);
			$('#template_' + unitPerAttack[e.target.id]).focus().select();
		});
		var unitAmount = hiddenFrame.contents().find('#' + unitType).siblings().last().html();
		$('#amount_of_' + unitType).html(unitAmount.substr(1, unitAmount.length - 2));
	}
}

function loadAttack(id) {
	if (!id) {
		for (id in attackTemplates)
			break;
		if (!id) {
			// new user.. show templates
			attackTemplates = {};
			showAttackTemplate();
			return;
		}
	}
	attackId = id;
	var attack = attackTemplates[id];
	$('#attackName').html(attack.name);

	for (unitType in unitTypes) {
		unitPerAttack[unitType] = attack.unitsPerAttack[unitType];
	}
	villages = attack.coords;
	villagearr = villages.split(" ");
	targets = villagearr.length;
	$('#attackedVillages').val(position);
	$('#amount_of_attackedVillages').html(targets);
	showAttack();
	return attack;
}

function removeAttack(id) {
	delete attackTemplates[id];
	populateAttackList();
}

function populateAttackList() {
	// reset the list just to be sure
	attackList.children().remove();
	for(var templId in attackTemplates) {
		var item = $('<li>' + attackTemplates[templId].name + ' <a href="javascript:loadAttack(\'' + templId + '\');" title="Load this template">L</a> <a href="javascript:removeAttack(\'' + templId + '\');" title="Remove this template">X</a> </li>').appendTo(attackList);
	}
	// some "styling"
	$('#attackList li:odd').css({
		'background-color' : '#c0c0c0'
	});
}

// });

c({htmlSnippet: '<table align="center" id="contentContainer" width="100%">\
	<tr>\
		<td>\
			<table class="content-border" width="100%" cellspacing="0">\
				<tr>\
					<td id="inner-border">\
						<div id="newContent">\
							<div id="loading">\
								<img src="graphic/throbber.gif" title="Loading something please wait..." alt="Loading something please wait..." />\
							</div>\
							<ul id="messages">\
								<li>Initialized layout</li>\
								<li>Loading available troops</li>\
							</ul>\
							<ul id="attackList">\
							</ul>\
							<h3 id="attackName"></h3>\
							<div id="buttons">\
								<button id="attackButton">Attack</button>\
								<button id="sAttackButton">Stop attacking</button>\
								<input type="checkbox" id="continuousAttack" title="if checked the pause at the end of a cycle is omitted"/>\
								<button id="cAttackButton">New Attack</button>\
								<button id="resetAttack" title="Reset attackcounter to the first village">reset</button>\
							</div>\
							<table id="unitTable">\
								<tbody>\
									<tr>\
										<td valign="top">\
											<table class="vis" width="100%">\
												<tbody>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_spear.png?48b3b" title="Spear fighter" alt="Spear fighter" class="" />\
															<input id="unit_input_spear" name="spear" type="text" style="width: 40px" tabindex="1" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_spear">fetching...</i>&nbsp;\
														</td>\
													</tr>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_sword.png?b389d" title="Swordsman" alt="Swordsman" class="" />\
															<input id="unit_input_sword" name="sword" type="text" style="width: 40px" tabindex="2" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_sword">fetching...</i>&nbsp;\
														</td>\
													</tr>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_axe.png?51d94" title="Axeman" alt="Axeman" class="" />\
															<input id="unit_input_axe" name="axe" type="text" style="width: 40px" tabindex="3" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_axe">fetching...</i>&nbsp;\
														</td>\
													</tr>\
												</tbody>\
											</table>\
										</td>\
										<td valign="top">\
											<table class="vis" width="100%">\
												<tbody>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_spy.png?eb866" title="Scout" alt="Scout" class="" />\
															<input id="unit_input_spy" name="spy" type="text" style="width: 40px" tabindex="4" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_spy">fetching...</i>&nbsp;\
														</td>\
													</tr>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_light.png?2d86d" title="Light cavalry" alt="Light cavalry" class="" />\
															<input id="unit_input_light" name="light" type="text" style="width: 40px" tabindex="5" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_light">fetching...</i>&nbsp;\
														</td>\
													</tr>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_heavy.png?a83c9" title="Heavy cavalry" alt="Heavy cavalry" class="" />\
															<input id="unit_input_heavy" name="heavy" type="text" style="width: 40px" tabindex="6" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_heavy">fetching...</i>&nbsp;\
														</td>\
													</tr>\
												</tbody>\
											</table>\
										</td>\
										<td valign="top">\
											<table class="vis" width="100%">\
												<tbody>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_ram.png?2003e" title="Ram" alt="Ram" class="" />\
															<input id="unit_input_ram" name="ram" type="text" style="width: 40px" tabindex="7" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_ram">fetching...</i>&nbsp;\
														</td>\
													</tr>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_catapult.png?5659c" title="Catapult" alt="Catapult" class="" />\
															<input id="unit_input_catapult" name="catapult" type="text" style="width: 40px" tabindex="8" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_catapult">fetching...</i>&nbsp;\
														</td>\
													</tr>\
												</tbody>\
											</table>\
										</td>\
										<td valign="top">\
											<table class="vis" width="100%">\
												<tbody>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_knight.png?58dd0" title="Paladin" alt="Paladin" class="" />\
															<input id="unit_input_knight" name="knight" type="text" style="width: 40px" tabindex="9" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_knight">fetching...</i>&nbsp;\
														</td>\
													</tr>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/unit/unit_snob.png?0019c" title="Nobleman" alt="Nobleman" class="" />\
															<input id="unit_input_snob" name="snob" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" />\
															<i id="amount_of_unit_input_snob">fetching...</i>&nbsp;\
														</td>\
													</tr>\
													<tr>\
														<td class="nowrap">\
															<img src="http://cdn2.tribalwars.net/graphic/command/attack.png?0019c" title="Attacked villages" alt="Attacked villages" class="" />\
															<input id="attackedVillages" name="attackedVillages" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" disabled="disabled" />\
															<i id="amount_of_attackedVillages">fetching...</i>&nbsp;\
														</td>\
													</tr>\
												</tbody>\
											</table>\
										</td>\
									</tr>\
								</tbody>\
							</table>\
						</div>\
					</td>\
				</tr>\
			</table>\
		</td>\
	</tr>\
</table>',
popup: '<div id="popup_container">\
	<div id="popup_box_bg"></div>\
	<div id="fader" onclick="popup.hide();"></div>\
	<table style="width: 700px; margin-left: -350px" id="popup_box" cellspacing="0">\
		<tr>\
			<td class="popup_box_top_left"></td>\
			<td class="popup_box_top"></td>\
			<td class="popup_box_top_right"></td>\
		</tr>\
		<tr>\
			<td class="popup_box_left"></td>\
			<td class="popup_box_content">\
				<a id="popup_box_close" href="#" onclick="popup.hide();; return false;">&nbsp;</a>\
				<div style="background: no-repeat url(\'/graphic/paladin_new.png\');">\
				<h3 style="margin: 0 3px 5px 120px;">Create new attack plan</h3>\
				<table align="right" style="margin-bottom: 5px;">\
					<tr>\
						<td class="quest-summary" width="200">\
							<h5>Give it a name:</h5>\
							<p style="padding: 5px"><input type="text" id="template_name" /></p>\
						</td>\
						<td class="quest-summary" width="310">\
							Enter here the new coordinates for this attack\
							<p style="padding: 5px"><input type="text" id="template_coords" /></p>\
						</td>\
					</tr>\
				</table>\
				<div class="quest-goal">\
					<table id="unitTableTemplate">\
						<tbody>\
							<tr>\
								<td valign="top">\
									<table class="vis" width="100%">\
										<tbody>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_spear.png?48b3b" title="Spear fighter" alt="Spear fighter" class="" />\
													<input id="template_unit_input_spear" name="spear" type="text" style="width: 40px" tabindex="1" value="" class="unitsInput" />\
												</td>\
											</tr>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_sword.png?b389d" title="Swordsman" alt="Swordsman" class="" />\
													<input id="template_unit_input_sword" name="sword" type="text" style="width: 40px" tabindex="2" value="" class="unitsInput" />\
												</td>\
											</tr>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_axe.png?51d94" title="Axeman" alt="Axeman" class="" />\
													<input id="template_unit_input_axe" name="axe" type="text" style="width: 40px" tabindex="3" value="" class="unitsInput" />\
												</td>\
											</tr>\
										</tbody>\
									</table>\
								</td>\
								<td valign="top">\
									<table class="vis" width="100%">\
										<tbody>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_spy.png?eb866" title="Scout" alt="Scout" class="" />\
													<input id="template_unit_input_spy" name="spy" type="text" style="width: 40px" tabindex="4" value="" class="unitsInput" />\
												</td>\
											</tr>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_light.png?2d86d" title="Light cavalry" alt="Light cavalry" class="" />\
													<input id="template_unit_input_light" name="light" type="text" style="width: 40px" tabindex="5" value="" class="unitsInput" />\
												</td>\
											</tr>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_heavy.png?a83c9" title="Heavy cavalry" alt="Heavy cavalry" class="" />\
													<input id="template_unit_input_heavy" name="heavy" type="text" style="width: 40px" tabindex="6" value="" class="unitsInput" />\
												</td>\
											</tr>\
										</tbody>\
									</table>\
								</td>\
								<td valign="top">\
									<table class="vis" width="100%">\
										<tbody>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_ram.png?2003e" title="Ram" alt="Ram" class="" />\
													<input id="template_unit_input_ram" name="ram" type="text" style="width: 40px" tabindex="7" value="" class="unitsInput" />\
												</td>\
											</tr>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_catapult.png?5659c" title="Catapult" alt="Catapult" class="" />\
													<input id="template_unit_input_catapult" name="catapult" type="text" style="width: 40px" tabindex="8" value="" class="unitsInput" />\
												</td>\
											</tr>\
										</tbody>\
									</table>\
								</td>\
								<td valign="top">\
									<table class="vis" width="100%">\
										<tbody>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_knight.png?58dd0" title="Paladin" alt="Paladin" class="" />\
													<input id="template_unit_input_knight" name="knight" type="text" style="width: 40px" tabindex="9" value="" class="unitsInput" />\
												</td>\
											</tr>\
											<tr>\
												<td class="nowrap">\
													<img src="http://cdn2.tribalwars.net/graphic/unit/unit_snob.png?0019c" title="Nobleman" alt="Nobleman" class="" />\
													<input id="template_unit_input_snob" name="snob" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" />\
												</td>\
											</tr>\
										</tbody>\
									</table>\
								</td>\
							</tr>\
						</tbody>\
					</table>\
				</div>\
				<div align="center" style="padding: 10px;">\
					<b class="red" id="saveTemplate">&raquo; Complete</b>\
					<input type="hidden" id="template_attackId" value="" />\
					<input type="hidden" id="template_position" value="" />\
				</div>\
			</td>\
			<td class="popup_box_right"></td>\
		</tr>\
		<tr>\
			<td class="popup_box_bottom_left"></td>\
			<td class="popup_box_bottom"></td>\
			<td class="popup_box_bottom_right"></td>\
		</tr>\
	</table>\
</div>'});