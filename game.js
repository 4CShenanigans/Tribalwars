/** ** game/ajax.js *** */
/* 42f1690d4146cdb9208a98a1fd2b0658 */
function ajaxHTMLRequest(source_url, target_id, isPost, handler_function,
		synchronous, supress_throbber, source_element, supress_script_reload) {
	var request = HTMLRequest;
	request.init(source_url, target_id, isPost, handler_function, synchronous,
			null, null, false, supress_throbber, supress_script_reload);
	request.set_source(source_element);
	request.execute();
	$('#' + target_id).css('display', 'block');
}
function ajaxJSONRequest(source_url, target_id, isPost, handler_function,
		following_request, synchronous, json_data, save_target, source_element) {
	var request = JSONRequest;
	request.init(source_url, target_id, isPost, handler_function, synchronous,
			following_request, json_data, save_target);
	request.set_source(source_element);
	request.execute();
}
function ajaxHTMLFormRequest(form_id, target_id, handler_function) {
	var request = HTMLFormRequest;
	request.init(null, target_id, false, handler_function);
	request.set_source(form_id);
	request.execute();
}
function addJSONFormEvent(form_id, target_id, handler_function) {
	$(form_id).unbind();
	$(form_id).submit(function() {
		$(this).ajaxSubmit({
			dataType : 'json',
			success : function(msg) {
				handler_function.call(this, msg, target_id);
			}
		});
		return false;
	});
	return false;
}
function addHTMLFormEvent(form_id, target_id, handler_function) {
	$(form_id).unbind();
	$(form_id).submit(function() {
		$(this).ajaxSubmit({
			dataType : 'html',
			success : function(msg) {
				handler_function.call(this, msg, target_id);
			}
		});
		return false;
	});
	return false;
}
function ajaxRequest(url, data, type, callback, dataType) {
	if (!dataType)
		dataType = 'json';
	$.ajax({
		type : type,
		url : url,
		data : data,
		dataType : dataType,
		success : function(msg) {
			callback.call(this, msg);
		}
	});
}
function ajaxSimple(url, target, data, defaultText) {
	$.ajax({
		url : url,
		data : data,
		dataType : 'html',
		success : function(msg) {
			if (0 == msg.length)
				msg = defaultText;
			$('#' + target).html(msg);
		}
	});
}
/** ** game/observer.js *** */
/* 8f92120837cff4a154117d12a3d8c18e */
var RequestQueue = {
	observers : [],
	requests : [],
	ready_state : true,
	initialize : function() {
	},
	register_observer : function(observer) {
		RequestQueue.observers.push(observer);
	},
	remove_observer : function(observer) {
		for ( var i = 0; i < RequestQueue.observers.length; i++)
			if (RequestQueue.observers[i] === observer)
				RequestQueue.observers.splice(i, 1);
	},
	add_request : function(request) {
		RequestQueue.requests.push(request);
		RequestQueue.inform_observers();
	},
	set_ready_state : function(state) {
		RequestQueue.ready_state = state;
		RequestQueue.inform_observers();
	},
	inform_observers : function() {
		for ( var i = 0; i < this.observers.length; i++)
			RequestQueue.observers[i].update(RequestQueue.requests,RequestQueue.ready_state);
	}
},
RequestQueueObserver = {
	initialize : function(request_queue) {
		RequestQueueObserver.queue = request_queue;
	},
	update : function(requests, ready_state) {
		if (ready_state)
			if (requests != null && requests.length > 0) {
				var request = requests.shift();
				RequestQueueObserver.queue.set_ready_state(false);
				request.execute();
			}
	}
},
AbstractRequest = {
	init : function(source_url, target_id, isPost, handler_function,
			synchronous, following_request, json_data, save_target,
			supress_throbber, supress_script_reload) {
		this.source_url = source_url;
		this.target_id = target_id;
		this.isPost = isPost;
		this.handler_function = handler_function;
		this.synchronous = synchronous;
		this.following_request = following_request;
		this.json_data = json_data;
		this.save_target = save_target;
		this.supress_throbber = supress_throbber;
		this.supress_script_reload = supress_script_reload;
	},
	set_source : function(source_element) {
		this.source_element = source_element;
	},
	execute : function() {
		alert("RequestData.execute() needs to be implemented!");
	},
	validate_request : function() {
		if ($(this.target_id) == null) {
			RequestQueue.set_ready_state(true);
			return false;
		}
		;
		return true;
	}
},
HTMLRequest = {
	execute : function() {
		var asynch = true;
		if (HTMLRequest.synchronous)
			asynch = false;
		var target_id = HTMLRequest.target_id, 
			handler_function = HTMLRequest.handler_function, 
			supress_throbber = HTMLRequest.supress_throbber, 
			source_element = HTMLRequest.source_element, 
			supress_script_reload = HTMLRequest.supress_script_reload;
		$.ajax({
			url : HTMLRequest.source_url,
			request : null,
			async : asynch,
			success : function(msg) {
				if ($('#' + target_id) != null) {
					$('#' + target_id).empty();
					$('#' + target_id).html(msg);
				}
			}
		});
	}
}, 
HTMLRequest = $.extend({}, AbstractRequest, HTMLRequest), JSONRequest = {
	execute : function() {
		var asynch = true;
		if (this.synchronous)
			asynch = false;
		if (typeof (this.handler_function) == "undefined") {
			$('#' + this.target_id).empty();
			$('#' + this.target_id).html("No handler for request defined!");
		}
		;
		var target_id = this.target_id, handler_function = this.handler_function, following_request = this.following_request, save_target = this.save_target, source_element = this.source_element;
		$.ajax({
			type : JSONRequest.isPost ? 'post' : 'get',
			url : JSONRequest.source_url,
			dataType : 'json',
			request : function() {
				if ($('#' + target_id) != null)
					if (asynch)
						if (!save_target) {
							$('#' + target_id).empty();
							$('#' + target_id).append( $("<img>").attr('src', 'graphic/throbber.gif').attr('alt', 'Loading...'));
						}
			},
			success : function(response_data) {
				if (response_data != null) {
					if ($('#' + target_id) != null && !save_target)
						$('#' + target_id).empty();
					if (response_data.error != null) {
						showError(response_data.error, target_id);
					} else {
						if ($("#error_div"))
							$("#error_div").empty();
						handler_function(response_data, target_id, source_element);
						if (following_request != null)
							ajaxHTMLRequest(following_request[0], following_request[1], following_request[2], following_request[3], false, false, false, true);
					}
				}
				;
				RequestQueue.set_ready_state(true);
			}
		})
	}
}, 
JSONRequest = $.extend({}, AbstractRequest, JSONRequest), HTMLFormRequest = {
	execute : function() {
		var source_element = HTMLFormRequest.source_element, target_id = HTMLFormRequest.target_id, handler_function = HTMLFormRequest.handler_function;
		$('#' + source_element).submit(function(e) {
			if (e)
				e.stop();
		});
	}
},
HTMLFormRequest = $.extend({}, AbstractRequest, HTMLFormRequest), JSONFormRequest = {
	execute : function() {
		var source_element = JSONFormRequest.source_element, target_id = JSONFormRequest.target_id, save_state = JSONFormRequest.save_target, following_request = JSONFormRequest.following_request, handler_function = JSONFormRequest.handler_function;
		$(document).ready(function() {
			$('#' + source_element).submit(function(e) {
				var save;
				$.ajax({
					url : $('#' + source_element).attr("action"),
					datatype : 'json',
					type : $('#'+ source_element).attr("method"),
					request : function() {
						if ($('#'+ target_id) != null) {
							$('#' + target_id).empty();
							$('#' + target_id).append($("<img>").attr('src','graphic/throbber.gif').attr("alt",'Loading...'));
						}
					},
					success : function(response) {
						if ($('#' + target_id) != null)
							$('#' + target_id).empty();
						if (save_state)
							for ( var i = 0; i < save.length; i++)
								$('#' + target_id).appendChild(save[i]);
						if (response != null)
							if (response.error != null) {
								showError(response.error, target_id);
							} else {
								if ($('#error_div'))
									$('#error_div').empty();
								if (handler_function != null)
									handler_function();
							}
					}
				});
			});
		});
		return false;
	}
}, 
JSONFormRequest = $.extend({}, AbstractRequest, JSONFormRequest);
function copyNodes(childs) {
	var result = new Array(childs.length);
	for ( var i = 0; i < childs.length; i++)
		result[i] = childs[i].cloneNode(5);
	return result;
}

var timeDiff = null, timeStart = null, mx = 0, my = 0, resis = [], timers = [];
function setImageTitles() {
	$('img').each(function() {
		var alt = $(this).attr('alt');
		if (!$(this).attr('title') && alt != '')
			$(this).attr('title', alt);
	});
}
function setCookie(name, value) {
	document.cookie = name + "=" + value;
}
function popup(url, width, height) {
	var wnd = window.open(url, "popup", "width=" + width + ",height=" + height + ",left=150,top=150,resizable=yes");
	wnd.focus();
}
function popup_scroll(url, width, height) {
	var wnd = window.open(url, "popup", "width=" + width + ",height=" + height + ",left=150,top=100,resizable=yes,scrollbars=yes");
	wnd.focus();
}
function addTimer(element, endTime, reload) {
	var timer = [];
	timer.element = element;
	timer.endTime = endTime;
	timer.reload = reload;
	timers.push(timer);
}
function startResTicker(resName) {
	var element = $('#' + resName), start = parseInt(element.data('amount'), 10);
	if (!start)
		start = parseInt(element.html(), 10);
	var max = parseInt($("#storage").html(), 10), prod = element.attr("title") / 3600, res = {};
	res.name = resName;
	res.start = start;
	res.max = max;
	res.prod = prod;
	resis[resName] = res;
}
function getTime(element) {
	if (!element.html() || element.html().length == 0)
		return -1;
	if (element.html().indexOf('<a ') != -1)
		return -1;
	var part = element.html().split(":");
	for ( var j = 1; j < 3; j++)
		if (part[j].charAt(0) == "0")
			part[j] = part[j].substring(1, part[j].length);
	var hours, days;
	if (isNaN(part[0])) {
		var day_part = part[0].split((/[a-z\s]+/i));
		hours = parseInt(day_part[1], 10);
		days = parseInt(day_part[0], 10);
	} else {
		hours = parseInt(part[0], 10);
		days = 0;
	}
	;
	var minutes = parseInt(part[1], 10), seconds = parseInt(part[2], 10), time = days * 3600 * 24 + hours * 60 * 60 + minutes * 60 + seconds;
	return time;
}
function getLocalTime() {
	var now = new Date();
	return Math.floor(now.getTime() / 1000);
}
function startTimer() {
	var serverTime = getTime($("#serverTime"));
	timeDiff = serverTime - getLocalTime();
	timeStart = serverTime;
	$('span.timer,span.timer_replace').each(
			function() {
				startTime = getTime($(this));
				if (startTime != -1)
					addTimer($(this), serverTime + startTime, ($(this).hasClass("timer")));
			});
	startResTicker('wood');
	startResTicker('stone');
	startResTicker('iron');
	if (typeof window.ticker == 'undefined') {
		window.ticker = window.setInterval("tick()", 1000);
		tick();
	}
}
function setRes(type, amount) {
	$('#' + type).data('amount', amount);
	$('#' + type).html(amount);
	window.resis[type].start = amount;
}
function tickRes(res) {
	var resName = res.name, start = res.start, max = res.max, prod = res.prod, now = new Date(), time = (now
			.getTime() / 1000 + timeDiff)
			- timeStart, current = Math.min(Math.floor(start + prod * time),
			max), element = $('#' + resName);
	if ((current >= (max * 0.9)) && (current < max)) {
		changeResStyle(element, 'warn_90');
	} else if (current < max) {
		changeResStyle(element, 'res');
	} else
		changeResStyle(element, 'warn');
	index = 0;
	if (resName == 'stone')
		index = 2;
	if (resName == 'iron')
		index = 4;
	game_data.village.res[index] = current;
	if (mobile)
		if (current > 99999) {
			current = Math.floor(current / 1000) + 'K';
		} else if (current > 9999)
			current = Math.floor(current / 100) / 10 + 'K';
	element.html(current);
}
function changeResStyle(element, style) {
	if (!element.hasClass(style))
		element.removeClass('res').removeClass('warn').removeClass('warn_90').addClass(style);
}
function number_format(number, thousands_sep) {
	var sNumber = number.toString(), length = (number > 0) ? 3 : 4;
	if (sNumber.length <= length)
		return sNumber;
	var split = new Array();
	do {
		var index = sNumber.length - 3;
		split.push(sNumber.slice(index, sNumber.length));
		sNumber = sNumber.substring(0, index);
	} while (sNumber.length > 3);
	split.reverse();
	for (index in split)
		if (split.hasOwnProperty(index))
			sNumber += thousands_sep + split[index];
	return sNumber;
}
function incrementDate() {
	currentDate = $('#serverDate').html();
	splitDate = currentDate.split('/');
	date = splitDate[0];
	month = splitDate[1] - 1;
	year = splitDate[2];
	dateObject = new Date(year, month, date);
	dateObject.setDate(dateObject.getDate() + 1);
	dateString = '';
	date = dateObject.getDate();
	month = dateObject.getMonth() + 1;
	year = dateObject.getFullYear();
	if (date < 10)
		dateString += "0";
	dateString += date + "/";
	if (month < 10)
		dateString += "0";
	dateString += month + "/";
	dateString += year;
	$('#serverDate').html(dateString);
}
function formatTime(element, time, clamp) {
	var hours = Math.floor(time / 3600);
	if (clamp)
		hours = hours % 24;
	var minutes = Math.floor(time / 60) % 60, seconds = time % 60, timeString = hours
			+ ":";
	if (minutes < 10)
		timeString += "0";
	timeString += minutes + ":";
	if (seconds < 10)
		timeString += "0";
	timeString += seconds;
	$(element).html(timeString);
	if ($(element).attr('id') == 'serverTime' && timeString == '0:00:00')
		incrementDate();
}
function tickTime() {
	var serverTime = $("#serverTime");
	if (serverTime !== null) {
		var time = getLocalTime() + timeDiff;
		formatTime(serverTime, time, true);
	}
}
function tickTimer(timer) {
	var time = timer.endTime - (getLocalTime() + timeDiff);
	if (timer.reload && time < 0) {
		formatTime(timer.element, 0, false);
		var popup_list = $('.popup_style:visible'), hide_reload = false;
		for ( var i = 0; i < popup_list.length; i++) {
			hide_reload = true;
			break;
		}
		;
		if (!hide_reload) {
			document.location.href = document.location.href.replace(/action=\w*/, '').replace(/#.*$/, '');
			return true;
		} else
			return false;
	}
	;
	if (!timer.reload && time <= 0) {
		var parent = timer.element.parent(), next = parent.next();
		if (next.length == 0)
			return false;
		next.css('display', 'inline');
		parent.remove();
		return true;
	}
	;
	formatTime(timer.element, time, false);
	return false;
}
function tick() {
	tickTime();
	for ( var res in resis)
		if (resis.hasOwnProperty(res) && resis[res])
			tickRes(resis[res]);
	for ( var timer = 0; timer < timers.length; timer++) {
		var remove = tickTimer(timers[timer]);
		if (remove)
			timers.splice(timer, 1);
	}
}
function selectAll(form, checked) {
	for ( var i = 0; i < form.length; i++)
		form.elements[i].checked = checked;
}
function setText(element, text) {
	element.html(text);
}
function changeBunches(form) {
	var sum = 0;
	for ( var i = 0; i < form.length; i++) {
		var select = form.elements[i];
		if (select.className == 'select_all')
			continue;
		if (select.selectedIndex != null)
			sum += parseInt(select.value, 10);
	};
	$('#selectedBunches_bottom').text(sum);
	$('#selectedBunches_top').text(sum);
};
var max = true;
function selectAllMax(form, textMax, textNothing) {
	for ( var i = 0; i < form.length; i++) {
		var select = form.elements[i];
		if (select.selectedIndex != null)
			if (max) {
				select.selectedIndex = select.length - 2;
			} else
				select.value = 0;
	}
	;
	max = max ? false : true;
	anchor = document.getElementById('select_anchor_top');
	anchor.firstChild.nodeValue = max ? textMax : textNothing;
	anchor = document.getElementById('select_anchor_bottom');
	anchor.firstChild.nodeValue = max ? textMax : textNothing;
	changeBunches(form);
}
function delete_village_group(confirmMsg, deletionURL) {
	var handleDelete = function() {
		window.location.href = deletionURL;
	}, buttons = [ {
		text : "OK",
		callback : handleDelete,
		confirm : true
	} ];
	UI.ConfirmationBox(confirmMsg, buttons);
}
function insertCoord(form, element, prefix) {
	var part = element.value.split("|");
	if (part.length != 2)
		return;
	var x = parseInt(part[0], 10), y = parseInt(part[1], 10);
	prefix = prefix || '';
	form[prefix + 'x'].value = x;
	form[prefix + 'y'].value = y;
}
function insertUnit(input, count, all_units) {
	input = $(input);
	if (count != input.val() || all_units) {
		input.val(count);
	} else
		input.val('');
}
function insertNumber(input, count) {
	var val = parseInt($(input).val(), 10);
	if (isNaN(val))
		val = 0;
	if (typeof count == 'object')
		count = parseInt($(count).text().replace("(", ''), 10);
	if (input.value != count) {
		if (count > 0) {
			$(input).val(count + val);
		} else
			$(input).val(0);
	} else
		$(input).val('');
	$(input).trigger('change');
	return false;
}
function insertBBcode(textareaID, startTag, endTag) {
	BBCodes.insert(startTag, endTag);
	return false;
}
function inlinePopupClose() {
	if ($('#inline_popup') !== null)
		$('#inline_popup').hide();
}
function selectTarget(x, y, prefix) {
	prefix = prefix || '';
	var elements = $('form[name="units"], form[name="market"]')[0];
	elements[prefix + 'x'].value = x;
	elements[prefix + 'y'].value = y;
	inlinePopupClose();
	$("div[id$='_cont']").hide();
}
function insertAdresses(to, check) {
	window.opener.document.forms.header.to.value += to;
	if (check) {
		var mass_mail = window.opener.document.forms.header.mass_mail;
		if (mass_mail)
			mass_mail.checked = 'checked';
	}
}
function overviewGetLabels() {
	labels = [];
	labels.push($("#l_main"));
	labels.push($("#l_place"));
	labels.push($("#l_wood"));
	labels.push($("#l_stone"));
	labels.push($("#l_iron"));
	labels.push($("#l_statue"));
	labels.push($("#l_wall"));
	labels.push($("#l_farm"));
	labels.push($("#l_hide"));
	labels.push($("#l_storage"));
	labels.push($("#l_market"));
	labels.push($("#l_barracks"));
	labels.push($("#l_stable"));
	labels.push($("#l_garage"));
	labels.push($("#l_church"));
	labels.push($("#l_church_f"));
	labels.push($("#l_snob"));
	labels.push($("#l_smith"));
	return labels;
}
function overviewShowLevel() {
	labels = overviewGetLabels();
	for ( var i = 0, len = labels.length; i < len; i++) {
		var label = labels[i];
		if (!label)
			continue;
		label.css('display', 'inline');
	}
}
function overviewHideLevel() {
	labels = overviewGetLabels();
	for ( var i = 0, len = labels.length; i < len; i++) {
		var label = labels[i];
		if (!label)
			continue;
		label.hide();
	}
}
function insertMoral(moral) {
	window.opener.document.getElementById('moral').value = moral;
}
function resetAttackerPoints(points) {
	document.getElementById('attacker_points').value = points;
}
function resetDefenderPoints(points) {
	document.getElementById('defender_points').value = points;
}
function resetDaysPlayed(days) {
	document.getElementById('days_played').value = days;
}
function editGroup(group_id) {
	var href = window.opener.location.href;
	href = href.replace(/&action=edit_group&edit_group=\d+&h=([a-z0-9]+)/, '');
	href = href.replace(/&edit_group=\d+/, '');
	overview = window.opener.document.getElementById('overview');
	if (overview
			&& overview.value.search(/(combined|prod|units|buildings|tech)/) != -1)
		window.opener.location.href = encodeURI(href + '&edit_group='
				+ group_id);
	window.close();
}
function toggleExtended() {
	var extended = document.getElementById('extended');
	if (extended.style.display == 'block') {
		extended.style.display = 'none';
		document.getElementsByName('extended')[0].value = 0;
	} else {
		extended.style.display = 'block';
		document.getElementsByName('extended')[0].value = 1;
	}
}
function resizeIGMField(type) {
	field = document.getElementsByName('text')[0];
	old_size = parseInt(field.getAttribute('rows'), 10);
	if (type == 'bigger') {
		field.setAttribute('rows', old_size + 3);
	} else if (type == 'smaller')
		if (old_size >= 4)
			field.setAttribute('rows', old_size - 3);
}
function escape_id(myid) {
	return '#' + myid.replace('^#', '').replace('[', '\\[').replace(']', '\\]');
}
function editToggle(label, edit) {
	$(escape_id(edit)).toggle();
	$(escape_id(label)).toggle();
	var inputs = $(escape_id(edit)).find("input");
	inputs
			.each(function() {
				var input = $(this), inputType = input.attr("type"), isTextInput = ((typeof inputType === 'undefined') || inputType == "text");
				if (isTextInput) {
					input.focus();
					input.select();
				}
			});
}
function createVillageEdit(village_id) {
	var edit_span = $('#edit_' + village_id), label = $('#label_' + village_id), village_name = $(
			'#label_text_' + village_id).text().trim();
	village_name = village_name.substring(0, village_name.lastIndexOf('('))
			.trim();
	if (edit_span.length > 0) {
		$('edit_input_' + village_id).attr('value', village_name);
		edit_span.toggle();
	} else {
		var parent = label.parent();
		edit_span = $('<span></span').attr('id', 'edit_' + village_id);
		var edit_input = $('<input type="text" />').attr('id',
				'edit_input_' + village_id).attr('value', village_name).attr(
				'class', 'edit-input'), edit_submit = $(
				'<input type="button" />').attr('value', 'OK').attr('class',
				'edit-input-submit');
		edit_span.append(edit_input);
		edit_span.append(edit_submit);
		parent.append(edit_span);
	};
	label.toggle();
}
function toggle_element(id) {
	if (id.substring(0, 1) !== '#')
		id = '#' + id;
	$(id).toggle();
}
function toggle_button(element_id, target) {
	var elem = $(element_id);
	if (!target)
		target = this;
	target = $(target);
	if (elem.css('display') == 'none') {
		target.addClass('active');
		elem.show();
	} else {
		target.removeClass('active');
		elem.hide();
	}
}
function toggle_visibility(id) {
	return toggle_element(id);
}
function toggle_visibility_by_class(classname, display) {
	if (display == 'table-row')
		display = '';
	$("." + classname).each(function() {
		if ($(this).css('display') == 'none') {
			$(this).css('display', display);
		} else
			$(this).css('display', 'none');
	});
}
function urlEncode(string) {
	return encodeURIComponent(string);
}
function escapeHtml(string) {
	return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function unescapeHtml(string) {
	return string.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g,'>').replace(/&quot;/g, '"');
}
function renameAttack(new_attack_name, default_name, attack_name) {
	var name = $('#' + new_attack_name).val();
	if (name.length > 0) {
		$('#' + default_name).html(escapeHtml(name));
		$('#' + attack_name).val(name);
	}
}
function editSubmit(label, labelText, edit, editInput, url) {
	var data = $.trim($(escape_id(editInput)).val());
	if (data.length > 0) {
		data = urlEncode(data);
		$.post(url, 'text=' + data, function(response) {
			$(escape_id(labelText)).html(escapeHtml(response));
			$(escape_id(editInput)).val(response);
		});
	} else {
		var oldLabel = unescapeHtml($(escape_id(labelText)).html());
		$(escape_id(editInput)).val(oldLabel);
	};
	$(escape_id(edit)).hide();
	$(escape_id(label)).show();
}
function editSubmitNew(label, labelText, edit, editInput, url) {
	var data = $('#' + editInput).val();
	$.ajax({
		url : url,
		dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.error) {
				UI.ErrorMessage(data.error, null, true);
			} else {
				$('#' + edit).hide();
				setText($('#' + labelText), data.text);
				$('#' + label).show();
			}
		},
		data : {
			text : data
		}
	});
}
function inlinePopupReload(name, url, options) {
	$.ajax({
		url : url,
		cache : false,
		onRequest : function() {
			if (options.empty_errors)
				$('#error').empty();
			$('#inline_popup_content').empty();
			$('#inline_popup_content').append(
					$("<img>").attr('src', image_base + '/throbber.gif').attr('alt', 'Loading...'));
		},
		success : function(reponseText) {
			$('#inline_popup_content').empty();
			$('#inline_popup_content').html(reponseText);
		}
	});
}
function inlinePopup(event, name, url, options, text) {
	var mx, my;
	if (event) {
		mx = event.clientX;
		my = event.clientY;
	} else {
		mx = window.event.clientX;
		my = window.event.clientY;
	}
	;
	var popup = $('#inline_popup'), doc = $(document), constraints = {
		min : {
			x : 0,
			y : 60
		},
		max : {
			x : doc.width() - options.offset_x,
			y : doc.height() - options.offset_y
		}
	}, pos = {
		x : mx + options.offset_x,
		y : my + options.offset_y
	};
	pos.x = (pos.x < constraints.min.x) ? constraints.min.x : pos.x;
	pos.x = (pos.x > constraints.max.x) ? constraints.max.x : pos.x;
	pos.y = (pos.y < constraints.min.y) ? constraints.min.y : pos.y;
	pos.y = (pos.y > constraints.max.y) ? constraints.max.y : pos.y;
	if (typeof mobile !== "undefined" && mobile) {
		pos.x = 0;
		pos.y = doc.scrollTop();
		popup.css('width', '100%');
		popup.css('border-left', '0px');
		popup.css('border-right', '0px');
	}
	;
	popup.css('display', 'block');
	popup.css('left', pos.x + 'px');
	popup.css('top', pos.y + 'px');
	if (url) {
		inlinePopupReload(name, url, options);
	} else if (text) {
		$('#inline_popup_content').html(text);
		$('#inline_popup').show();
	}
	;
	return false;
}
function add_forum_share(edit_input, forum_id, url) {
	$.ajax({
		url : url,
		type : 'POST',
		dataType : 'json',
		data : {
			ally_tag : $('#' + edit_input).val(),
			forum_id : forum_id
		},
		success : function(data) {
			if (data.error) {
				$('#error').empty();
				$('#error').html(data.error);
				$('#error').css('display', '');
			} else {
				$('#shared_' + forum_id).empty();
				$('#shared_' + forum_id).html(data.new_shares);
				$('#add_shares_link_' + forum_id).css('display', 'none');
				$('#edit_shares_link_' + forum_id).css('display', '');
			}
		}
	});
}
function remove_forum_shares(label_text, forum_id, url) {
	var remove = [];
	$('#checkboxes input').each(function(i, box) {
		if ($(box).is(':checked'))
			remove.push($(box).val());
	});
	$.ajax({
		url : url,
		type : 'POST',
		dataType : 'json',
		data : {
			remove : $.makeArray(remove),
			forum_id : forum_id
		},
		success : function(data) {
			if (data.error) {
				$('#error').empty();
				$('#error').html(data.error);
				$('#error').css('display', '');
			} else {
				$('#' + label_text).empty();
				if (data.new_shares) {
					$('#' + label_text).html(data.new_shares);
				} else {
					$('#add_shares_link_' + forum_id).css('display', '');
					$('#edit_shares_link_' + forum_id).css('display', 'none');
				}
				;
				inlinePopupClose();
			}
		}
	});
}
function bb_color_picker_gencaller(fn, arg) {
	var f = function() {
		fn(arg);
	};
	return f;
}
function bb_color_set_color(col) {
	var g = $("#bb_color_picker_preview"), inp = $("#bb_color_picker_tx");
	g.css('color', "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")");
	var rr = col[0].toString(16), gg = col[1].toString(16), bb = col[2]
			.toString(16);
	rr = rr.length < 2 ? "0" + rr : rr;
	gg = gg.length < 2 ? "0" + gg : gg;
	bb = bb.length < 2 ? "0" + bb : bb;
	inp.val("#" + rr + gg + bb);
}
function bb_color_pick_color(colordiv) {
	var col = colordiv.data('rgb');
	for ( var l = 0; l < 6; l++)
		for ( var h = 1; h < 6; h++) {
			var cell = $("#bb_color_picker_" + h + l);
			if (!cell)
				alert("bb_color_picker_" + h + l);
			var ll = l / 3.0, hh = h / 4.5;
			hh = Math.pow(hh, 0.5);
			var light = Math.max(0, (255 * ll - 255)), r = Math.floor(Math.max(
					0, Math.min(255, (col[0] * ll * hh + 255 * (1 - hh))
							+ light))), g = Math.floor(Math.max(0, Math.min(
					255, (col[1] * ll * hh + 255 * (1 - hh)) + light))), b = Math
					.floor(Math.max(0, Math.min(255,
							(col[2] * ll * hh + 255 * (1 - hh)) + light)));
			cell.css('background-color', "rgb(" + r + "," + g + "," + b + ")");
			cell.data('rgb', [ r, g, b ]);
			cell.unbind('click').click(
					function() {
						bb_color_picker_gencaller(bb_color_set_color, $(this)
								.data('rgb'));
					});
		}
}
function bb_color_picker_textchange() {
	var inp = $("#bb_color_picker_tx"), g = $("#bb_color_picker_preview");
	try {
		g.css('color', inp.val());
	} catch (e) {
	}
}
function bb_color_picker_toggle(assign) {
	var inp = $("#bb_color_picker_tx");
	inp.unbind('keyup').keyup(function() {
		bb_color_picker_textchange();
	});
	if (assign) {
		insertBBcode('message', '[color=' + inp.val() + ']', '[/color]');
		toggle_element('bb_color_picker');
		return
	}
	;
	var colors = [ $("#bb_color_picker_c0"), $("#bb_color_picker_c1"),
			$("#bb_color_picker_c2"), $("#bb_color_picker_c3"),
			$("#bb_color_picker_c4"), $("#bb_color_picker_c5") ];
	colors[0].data('rgb', [ 255, 0, 0 ]);
	colors[1].data('rgb', [ 255, 255, 0 ]);
	colors[2].data('rgb', [ 0, 255, 0 ]);
	colors[3].data('rgb', [ 0, 255, 255 ]);
	colors[4].data('rgb', [ 0, 0, 255 ]);
	colors[5].data('rgb', [ 255, 0, 255 ]);
	for (var i = 0; i <= 5; i++)
		colors[i].unbind('click').click(function() {
			bb_color_picker_gencaller(bb_color_pick_color, $(this));
		});
	bb_color_pick_color(colors[0]);
	toggle_element('bb_color_picker');
}
function get_sitter_player() {
	var t_regexp = /(\?|&)t=(\d+)/, matches = t_regexp.exec(location.href + "");
	if (matches) {
		return parseInt(matches[2], 10);
	} else
		return false;
}
function igm_to_show(url){
	$.get(url,function(data){
		var popup=$('#igm_to_content');
		popup.html(data);
		UI.Draggable(popup.parent(),{savepos:false});
	});
	$('#igm_to').css('display','inline');
}
function igm_to_hide(){
	$('#igm_to').hide();
}
function igm_to_insert_adresses(list){
	$('#to').val($('#to').val()+list);
}
function igm_to_insert_group(id,url){
	var val=$('#to').val();
	$.ajax({
		url:url,data:{group_id:id},dataType:'json',
		success:function(data){
			if(data.code){
				var players='';
				$(data.data).each(function(index){players+=this.member_name+';';});
				$('#to').val(val+players);
			}
		},
		type:'get'
	});
}

function igm_to_addresses_clear(){
	$('#to').val("");
}

function xProcess(xelement,yelement){
	xelement=$("#"+xelement);
	yelement=$("#"+yelement);
	var xvalue=xelement.val(),yvalue=yelement.val(),x,y;
	if(xvalue.indexOf("|")!=-1){
		var xypart=xvalue.split("|");
		x=parseInt(xypart[0],10);
		if(xypart[1].length!==0)
			y=parseInt(xypart[1],10);
		xelement.val(x);
		yelement.val(y).focus();
		return;
	}
	if(xvalue.length===3&&yvalue.length===0){
		yelement.focus();
	}else if(xvalue.length>3){
		x=xvalue.substr(0,3);
		y=xvalue.substring(3);
		xelement.val(x);
		yelement.val(y).focus();
	}
}

function _(t){
	if(lang[t]){
		return lang[t];
	} else return t;
}

function textCounter(field, countfield, charlimit) {
	if (field.value.length > charlimit)
		field.value = field.value.substring(0, charlimit);
	try {
		document.getElementById(countfield).innerHTML = '%1/%2'.replace(/%2/,
				charlimit).replace(/%1/, field.value.length);
	} catch (e) {
	}
}

function selectAllUnits(opposite) {
	var true2false = $("#selectAllUnits").attr('href'), bool = (true2false
			.indexOf('true', 0) < 0);
	$("#selectAllUnits")
			.attr('href', "javascript:selectAllUnits(" + bool + ")");
	$('.unitsInput').each(function(i, e) {
		var maxUnits = $(this).next('a').html();
		maxUnits = maxUnits.substr(1).substr(0, maxUnits.length - 2);
		if (maxUnits > 0 && opposite) {
			insertUnit(e, maxUnits, opposite);
		} else
			insertUnit(e, '', opposite);
	});
}
function toggle_spoiler(ref) {
	var display_value = ref.parentNode.getElementsByTagName('div')[0]
			.getElementsByTagName('span')[0].style.display;
	if (display_value == 'none') {
		ref.parentNode.getElementsByTagName('div')[0].getElementsByTagName('span')[0].style.display = 'block';
	} else
		ref.parentNode.getElementsByTagName('div')[0].getElementsByTagName('span')[0].style.display = 'none';
}
function center_target(x, y, target_id) {
	var height = $(target_id).getStyle("height");
	height = height.replace(/px/g, "");
	height = height / 2;
	y -= height;
	var width = $(target_id).getStyle("width");
	width = width.replace(/px/g, "");
	width = width / 2;
	x -= width;
	if (x < 0)
		x = 0;
	if (y < 0)
		y = 0;
	$(target_id).setStyle("left", x + "px");
	$(target_id).setStyle("top", y + "px");
}
function s(text) {
	for ( var i = 1; i < arguments.length; i++)
		text = text.split('%' + i).join(arguments[i]);
	return text;
}
function autoresize_textarea(selector, max_rows) {
	var textarea = $(selector);
	if (!textarea.length)
		return;
	max_rows = max_rows || 40;
	var current_rows = textarea[0].rows;
	textarea.keydown(function() {
		var rows = this.value.split('\n'), row_count = rows.length;
		for ( var x = 0; x < rows.length; x++)
			if (rows[x].length >= textarea[0].cols)
				row_count += Math.floor(rows[x].length / textarea[0].cols);
		row_count += 2;
		row_count = Math.min(row_count, max_rows);
		if (row_count > current_rows)
			this.rows = row_count;
	});
}

function load_append(link, to) {
	if (typeof to == 'undefined')
		to = document.body;
	$.ajax({
		url : link,
		dataType : 'json',
		success : function(data) {
			if (data.error) {
				UI.ErrorMessage(data.error);
			} else
				$(to).append(data);
		}
	});
}

function load_into(link, to) {
	if (typeof to == 'undefined')
		to = document.body;
	$.ajax({
		url : link,
		dataType : 'json',
		success : function(data) {
			if (data.error) {
				UI.ErrorMessage(data.error);
			} else {
				$(to).html(data);
				$(to).show();
			}
		}
	});
};
var villageDock = {
	saveLink : false,
	loadLink : null,
	docked : null,
	bindClose : function() {
		$('#closelink_group_popup').click(function() {
			villageDock.saveDockMode(0);
		});
	},
	saveDockMode : function(onoff) {
		if (!villageDock.saveLink)
			return;
		var data = {
			dock : onoff
		};
		ajaxSimple(villageDock.saveLink, null, data);
		villageDock.docked = onoff;
	},
	open : function(event) {
		if (villageDock.docked == 0)
			villageDock.saveDockMode(1);
		UI.AjaxPopup(event, 'group_popup', villageDock.loadLink, $(
				'#popup_close').val(), villageDock.callback, null, 320, 380,
				null, null, [ '#open_groups', '#close_groups' ]);
		$('#close_groups, #open_groups').toggle();
		return false;
	},
	close : function(event) {
		if (villageDock.docked == 1)
			villageDock.saveDockMode(0);
		$('#close_groups, #open_groups').toggle();
		$('#group_popup').toggle();
		return false;
	},
	callback : function(response, target) {
		Callback.group_membership(response, target);
		if (villageDock.saveLink)
			villageDock.bindClose();
	}
};

function show_ajax_inline_popup(popup_id, content_url, content_existing,
		target, close_text, x, y, width, height, global, display_handler,
		html_request) {
	var width_css = width !== null ? "width: " + width + ";" : "", height_css = height !== null ? "height: "
			+ height + ";"
			: "";
	height_css += ' max-height:95%;';
	target = $("#" + target);
	if (!x)
		x = 100;
	if (!y)
		y = 100;
	if (popup_id !== null) {
		var popup = $("<div>").addClass('popup_style').attr(
				"style",
				"overflow:auto; top:" + y + ";left:" + x + ";" + width_css
						+ height_css).attr("id", "" + popup_id), menu = $(
				"<div>").addClass('popup_menu').attr("id", popup_id + "_menu")
				.attr(
						"style",
						"position:relative;z-index: 9999; top:'" + y
								+ "';left:'" + x + "';'" + width_css
								+ "'margin-top: -17px;"), href = "javascript:toggle_element('#"
				+ popup_id + "');";
		if (global)
			href += "closePopup();";
		menu.append($("<a>").attr('href', href).attr('style',
				'float: right; padding-right: 3px; padding-left:3px;').html(
				close_text));
		var content = $("<div>").attr("id", popup_id + '_content').addClass(
				"popup_content");
		popup.append(menu).append(content);
		target.append(popup);
		var offset = popup.offset();
		popup.draggable({
			handle : menu,
			stop : function(event, ui) {
				if (global)
					$.cookie("global_popups", {
						popup_id : popup_id,
						content_url : content_url,
						content_existing : content_existing,
						target : target,
						close_text : close_text,
						x : offset.left,
						y : offset.top,
						width : width,
						height : height,
						global : true,
						display_handler : display_handler,
						mode : "overview",
						html_request : html_request
					})
			}
		});
		if (global)
			$.cookie("global_popups", {
				popup_id : popup_id,
				content_url : content_url,
				content_existing : content_existing,
				target : target,
				close_text : close_text,
				x : offset.left,
				y : offset.top,
				width : width,
				height : height,
				global : true,
				display_handler : display_handler,
				mode : "overview",
				html_request : html_request
			})
	}
	;
	if (content_existing !== null) {
		var content = $("#" + content_existing).clone();
		content.attr("id", null);
		$("#" + popup_id + '_content').empty();
		content.css('display', 'block');
		$("#" + popup_id + '_content').append(content)
	}
	;
	$.ajax({
		type : 'GET',
		url : content_url,
		dataType : 'json',
		success : display_handler
	});
	$("#" + popup_id + "_menu").show();
	$("#" + popup_id + "_content").show();
	$("#" + popup_id).show()
}

function add_slider(elements, target, source_element) {
	var slide = new Fx.Slide($(target), {
		mode : 'vertical'
	});
	source_element.setProperty('onclick', '');
	source_element.addEvent('click', function() {
		slide.toggle();
		return false
	})
}

function handle_village_to_group_from_overview_mobile(data, target,
		source_element) {
	display_village_to_groups_assigments(data, target, true,
			"handle_village_overview_reload_mobile")
}

function handle_village_overview_reload_mobile(data, target, form_id) {
	show_assigned_groups(data, target);
	toggle_element(target)
}

function handle_group_list(data, target) {
	$.cookie("group_popup_content_data", data);
	display_group_selection(data, target)
}

function handle_delete_response(data, target) {
	toggle_group_select("show_group0");
	$('#' + target).remove()
}

function handle_group_membership(data, target, form_id) {
	$(target).innerHTML = data
}

function handle_reload_popups(popups, target) {
	var popup_list = popups;
	if (!popup_list)
		return;
	show_ajax_inline_popup(popup_list.popup_id, popup_list.content_url,
			popup_list.content_existing, popup_list.target,
			popup_list.close_text, popup_list.x, popup_list.y,
			popup_list.width, popup_list.height, popup_list.global,
			popup_list.display_handler, popup_list.html_request)
};
var last_toggle_source = null, current_toggle_source = null

function set_toggle_source(source) {
	last_toggle_source = current_toggle_source;
	current_toggle_source = source
}

function toggle_group_toggle(element_id) {
	var slide = new Fx.Slide(element_id, {
		mode : 'vertical',
		onComplete : function() {
		}
	});
	if (last_toggle_source == current_toggle_source) {
		slide.toggle()
	} else
		slide.slideIn()
}

function toggle_names(name) {
	var elements = document.getElementsByName(name);
	for ( var i = 0; i < elements.length; i++)
		if (elements[i].getStyle('display') != 'none') {
			elements[i].setStyle('display', 'none')
		} else
			elements[i].setStyle('display', 'block')
}

function showError(json_error, target) {
	$("error_div").empty();
	var to_display = new Element("table", {
		'class' : 'error'
	}), table_row = new Element('tr'), table_col = new Element('td', {
		html : json_error
	});
	table_col.inject(table_row).inject(to_display);
	to_display.inject($("error_div"));
}

function closePopup() {
	$.cookie("global_popups", "");
	$.cookie("group_popup_content_data", "");
}

function selectVillage(id, group_id) {
	closePopup();
	var href = window.location.href;
	if (href.search(/village=\w*/) != -1) {
		href = href.replace(/village=\w*/, 'village=' + id);
	} else
		href += '&village=' + id;
	href = href.replace(/action=\w*/, '');
	if (href.search(/group=\w*/) != -1) {
		href = href.replace(/group=\w*/, 'group=' + group_id);
	} else
		href += '&group=' + group_id;
	window.location.href = encodeURI(href);
}

function resize_popup(target) {
	var popup_menu = target + "_menu";
	if ($(popup_menu).getStyle("width") === null) {
		var width = $(target).getScrollSize().x;
		$(popup_menu).setStyle("width", width + "px");
	}
}

var UI = {
	AutoComplete : {
		url : null,
		source : function(request, response) {
			var autoType = (this.element).data('type');
			if (request.term.indexOf(';') != -1)
				return [];
			$.post(UI.AutoComplete.url, {
				type : autoType,
				text : request.term
			}, function(data) {
				response(data);
			}, 'json');
		}
	},
	Throbber : $('<img alt="Loading..." title="Loading..." />').attr("src",
			"/graphic/throbber.gif"),
	init : function() {
		$('.evt-confirm').click(UI.getConfirmHandler());
		if (typeof mobile != 'undefined' && !mobile)
			$('.autocomplete').autocomplete({
				minLength : 2,
				source : UI.AutoComplete.source
			})
	},
	ToolTip : function(el, UserOptions) {
		var defaults = {
			showURL : false,
			track : true,
			fade : 100,
			delay : 0,
			showBody : ' :: ',
			extraClass : 'tooltip-style'
		};
		$(el).tooltip($.extend(defaults, UserOptions))
	},
	DatePicker : function(el, UserOptions) {
		var defaults = {
			showButtonPanel : true,
			dateFormat : 'yy-mm-dd',
			showAnim : 'fold',
			showOtherMonths : true,
			selectOtherMonths : true
		};
		$(el).datepicker($.extend(defaults, UserOptions))
	},
	Draggable : function(el, UserOptions) {
		var defaults = {
			savepos : true,
			cursor : 'move',
			handle : $(el).find("div:first"),
			appendTo : 'body',
			containment : [ 0, 60 ]
		}, options = $.extend(defaults, UserOptions);
		$(el).draggable(options);
		if (options.savepos)
			$(el).bind(
					'dragstop',
					function(event, ui) {
						var doc = $(document), x = $(el).offset().left
								- doc.scrollLeft(), y = $(el).offset().top
								- doc.scrollTop();
						$.cookie('popup_pos_' + $(el).attr('id'), x + 'x' + y)
					})
	},
	Sortable : function(el, UserOptions) {
		var defaults = {
			cursor : 'move',
			handle : $(el).find("div:first"),
			opacity : 0.6,
			helper : function(e, ui) {
				ui.children().each(function() {
					$(this).width($(this).width())
				});
				return ui
			}
		};
		$(el).sortable($.extend(defaults, UserOptions))
	},
	ErrorMessage : function(message, fade_out_time, container) {
		return UI.InfoMessage(message, fade_out_time, 'error', container)
	},
	SuccessMessage : function(message, fade_out_time, container) {
		return UI.InfoMessage(message, fade_out_time, 'success', container)
	},
	InfoMessage : function(message, fade_out_time, additional_class, container) {
		$('.autoHideBox').remove();
		fade_out_time = fade_out_time || 2000;
		container = container || $('body');
		if (additional_class === true)
			additional_class = 'error';
		$(
				"<div/>",
				{
					"class" : additional_class ? "autoHideBox "
							+ additional_class : "autoHideBox",
					click : function() {
						$(this).remove()
					},
					html : "<p>" + message + "</p>"
				}).appendTo(container).delay(fade_out_time).fadeOut('slow',
				function() {
					$(this).remove()
				})
	},
	ConfirmationBox : function(msg, buttons, id) {
		var clickEvent = mobile ? 'vclick' : 'click';
		id = id || "confirmation-box";
		if ($('#' + id).length !== 0)
			return false;
		buttons.push({
			text : 'Cancel',
			callback : function() {
			},
			cancel : true
		});
		$(
				"<div id='fader'><div class='confirmation-box' id='"
						+ id
						+ "' role='dialog' aria-labelledby='confirmation-msg'><p id='confirmation-msg' class='confirmation-msg'>"
						+ msg
						+ "</p><div class='confirmation-buttons'></div></div></div>")
				.appendTo("body").css('z-index', '14999');
		var confirmationBox = $('#' + id), buttonContainer = confirmationBox
				.find('.confirmation-buttons');
		$('#mNotifyContainer').hide();
		var callbackWrapper = function(callback) {
			return function() {
				$('#fader > .confirmation-box').parent().remove();
				$('#mNotifyContainer').show();
				callback();
				return false
			}
		};
		$(buttons).each(
				function(index, button) {
					var el = $(
							"<button class='btn-default' aria-label'"
									+ button.text + "'>" + button.text
									+ "</button>").bind(clickEvent,
							callbackWrapper(button.callback)).appendTo(
							buttonContainer);
					if (index == 0)
						el.focus();
					if (button.confirm === true)
						el.addClass("evt-confirm-btn");
					if (button.cancel === true)
						el.addClass("evt-cancel-btn")
				});
		var keyPressHandler = function(e) {
			if (e.keyCode == 13)
				$('.evt-confirm-btn').trigger(clickEvent);
			if (e.keyCode == 9)
				return;
			$('#fader').remove();
			$(document).unbind("keyup", keyPressHandler)
		};
		$(document).bind("keyup", keyPressHandler)
	},
	getConfirmHandler : function(msg) {
		return function(event) {
			event.preventDefault();
			var el = $(event.target);
			if (!el.hasClass('evt-confirm'))
				el = el.parents('.evt-confirm');
			var message = msg || el.data('confirm-msg');
			if (el.is('input, button'))
				UI.confirmSubmit(event, message);
			if (el.is('a'))
				UI.confirmLink(event, message);
			return false
		}
	},
	confirmLink : function(event, msg) {
		var handleOk = function() {
			var href = $(event.target).attr("href");
			if (typeof href === "undefined")
				href = $(event.target).closest("a").attr("href");
			window.location = href
		};
		UI.addConfirmBox(msg, handleOk)
	},
	confirmSubmit : function(event, msg) {
		var submitButton = $(event.target), buttonName = submitButton
				.attr("name"), buttonValue = submitButton.attr("value");
		if (buttonName && buttonValue) {
			$('submit-value-container').remove();
			submitButton
					.before("<input id='submit-value-container' type='hidden' name='"
							+ buttonName + "' value='" + buttonValue + "' />")
		}
		;
		var handleOk = function() {
			$(event.target).closest("form").submit()
		};
		UI.addConfirmBox(msg, handleOk)
	},
	addConfirmBox : function(msg, callback) {
		var buttons = [ {
			text : "OK",
			callback : callback,
			confirm : true
		} ];
		UI.ConfirmationBox(msg, buttons)
	},
	AjaxPopup : function(event, target, url, closeText, handler, UserOptions,
			width, height, x, y, toToggle) {
		var topmenu_height = $(".top_bar").height(), defaults = {
			dataType : 'json'
		}, options = $.extend(defaults, UserOptions);
		if (options.reload || ($('#' + target).length == 0)) {
			var button = null;
			if (event && (!x || !y)) {
				if (event.srcElement) {
					button = event.srcElement
				} else
					button = event.target;
				var offset = $(button).offset();
				if (!x)
					x = offset.left;
				if (!y)
					y = offset.top + $(button).height() + 1
			}
			;
			if (!height)
				height = 'auto';
			if (!width)
				width = 'auto';
			var toggleSelector = '#' + target;
			if (typeof (toToggle) != 'undefined')
				if (toToggle.length > 0) {
					var key;
					for (key in toToggle)
						if (toToggle.hasOwnProperty(key))
							toggleSelector = toggleSelector + ', '
									+ toToggle[key]
				}
			;
			$
					.ajax({
						url : url,
						dataType : options.dataType,
						success : function(msg) {
							var container = null;
							if ($('#' + target).length == 0) {
								container = $('<div>').attr('id', target)
										.addClass('popup_style').css({
											width : width,
											position : 'fixed'
										});
								var menu = $('<div>').attr('id',
										target + '_menu')
										.addClass('popup_menu').html(
												$('<a>').attr("id",
														"closelink_" + target)
														.attr('href', '#')
														.html(closeText)), content = $(
										'<div>')
										.attr('id', target + '_content')
										.addClass('popup_content').css(
												'height', height).css(
												'overflow-y', 'auto');
								container.append(menu).append(content);
								UI.Draggable(container);
								container.bind("dragstart", function() {
									document.onselectstart = function(event) {
										event.preventDefault()
									}
								});
								container.bind("dragstop", function() {
									document.onselectstart = function(event) {
										$(event.target).trigger('select')
									}
								});
								$('#ds_body').append(container);
								$("#closelink_" + target).click(
										function(event) {
											event.preventDefault();
											$(toggleSelector).toggle()
										})
							} else
								container = $('#' + target);
							if (handler) {
								handler.call(this, msg, $('#' + target
										+ '_content'))
							} else
								$('#' + target + '_content').html(msg);
							if ($.cookie('popup_pos_' + target)) {
								var pos = $.cookie('popup_pos_' + target)
										.split('x');
								x = parseInt(pos[0], 10);
								y = parseInt(pos[1], 10)
							} else
								$.cookie('popup_pos_' + target, x + 'x' + y);
							if (!mobile) {
								var popup_height = container.outerHeight(), popup_width = container
										.outerWidth(), window_width = $(window)
										.width(), window_height = $(window)
										.height();
								if (y + popup_height > window_height)
									y = window_height - popup_height;
								if (x + popup_width > window_width)
									x = window_width - popup_width;
								if (x < 0)
									x = 0;
								if (y < topmenu_height)
									y = topmenu_height;
								container.css('top', y).css('left', x);
								var recalcConstraints = function(container,
										topmenu_height) {
									var min_y = topmenu_height, min_x = 0, max_y = $(
											document).height()
											- $(container).outerHeight(), max_x = $(
											document).width()
											- $(container).outerWidth(), contain_in = [
											min_x, min_y, max_x, max_y ];
									container.draggable("option",
											"containment", contain_in)
								};
								recalcConstraints(container, topmenu_height);
								$(window).resize(
										function() {
											recalcConstraints(container,
													topmenu_height)
										})
							}
							;
							if (mobile) {
								var mobile_styles = {
									position : 'absolute',
									top : $(window).scrollTop() + 'px',
									left : '0px',
									height : 'auto',
									width : 'auto',
									overflow : 'auto'
								};
								container.css(mobile_styles);
								$('#' + target + '_content').css({
									height : 'auto'
								})
							}
							;
							container.show()
						}
					})
		} else
			$('#' + target).show()
	}
};
$(document).ready(function() {
	UI.init()
})

var Callback = {
	mobile : false,
	group_membership : function(response, target) {
		json_groups = response;
		if (typeof target != 'object')
			target = $("#" + target);
		var form = $("<form>").attr("id", "select_group_box").attr("action",
				$('#show_groups_villages_link').val()).attr("method", "POST"), par = $(
				"<p>").attr("style", "margin: 0 0 10px 0; font-weight: bold;")
				.html($("#group_popup_select_title").val()), select = $(
				"<select>").attr("id", "group_id").attr("name", "group_id")
				.css("margin-left", "3px"), hidden = $("<input>").attr("type",
				"hidden").attr("name", "mode").attr("value",
				$('#group_popup_mode').val());
		form.append(hidden);
		var selected = false;
		for ( var i = 0; i < json_groups.result.length; i++) {
			var option = $("<option>").attr("value",
					json_groups.result[i].group_id).html(
					escapeHtml(json_groups.result[i].name));
			if (json_groups.group_id
					&& json_groups.result[i].group_id == json_groups.group_id) {
				option.attr("selected", true);
				selected = true
			}
			;
			select.append(option)
		}
		;
		var content = $("<div>").attr("id", "group_list_content").css(
				'overflow', 'auto');
		if (!mobile)
			content.css('height', '340px');
		par.append(select);
		form.append(par);
		target.empty();
		target.append(form).append(content);
		addHTMLFormEvent(form, "group_list_content",
				Callback.group_membership_villages_list, false);
		form.submit();
		$('#group_id').change(function() {
			$('#group_list_content').html(UI.Throbber);
			form.submit();
		});
	},
	group_membership_villages_list : function(html_table, target) {
		$('#' + target).html(html_table);
		$('th.group_label').html($('#group_popup_villages_select').val());
		var selected = $('#selected_popup_village');
		if (selected.length)
			$('#group_list_content').scrollTo(selected);
	},
	handle_village_to_group_assigment : function(data, target, form_id) {
		Callback.display_village_to_groups_assigments(data, "group_assigment",true);
	},
	handle_village_to_group_list : function(data, target, form_id) {
		Callback.display_village_to_groups_assigments(data, "group_assigment",false);
	},
	display_village_to_groups_assigments : function(json_groups, target, use_form) {
		$('#' + target).empty();
		var to_display = $("<table>").attr('id', 'group_table').attr('width',
				'100%').addClass('vis'), tbody = $("<tbody>");
		to_display.append(tbody);
		$('#group_assigment > tr:not(id=header)').remove();
		tbody.append($("<img>").attr('src', "graphic/throbber.gif").attr('alt',
				"Loading...").attr('id', 'throbber'));
		var form;
		if (use_form)
			form = $("<form>").attr('id',
					"reassign_village_to_groups_form_" + target).attr('action',
					$("#group_assign_action").val()).attr('method', 'POST');
		for ( var i = 0; i < json_groups.result.length; i++)
			if (use_form || json_groups.result[i].in_group) {
				var table_row = $("<tr>"), table_col = $("<td>"), name = json_groups.result[i].name, label = null;
				if (use_form) {
					var checkbox = $("<input>").attr("type", "checkbox").attr(
							"id", "checkbox_" + name).attr("name", "groups[]")
							.attr("value", json_groups.result[i].id).addClass(
									"check");
					table_col.append(checkbox);
					if (json_groups.result[i].in_group)
						checkbox.attr("checked", "checked");
					label = $("<label>").attr('for', 'checkbox_' + name).html(
							name)
				}
				;
				var para = $("<p>").addClass("p_groups");
				if (label) {
					para.append(label)
				} else
					para.html(name);
				table_col.append(para);
				table_row.append(table_col);
				tbody.append(table_row)
			}
		;
		if (use_form) {
			to_display.appendTo(form);
			form.append($("<input>").attr('name', 'village_id').attr('type',
					'hidden').val(json_groups.village_id));
			form.append($("<input>").attr('name', 'mode')
					.attr('type', 'hidden').val("village"));
			form.append($("<input>").attr('type', 'submit').val(
					$("#group_submit_text").val()));
			$('#' + target).append(form)
		} else
			$('#' + target).append(to_display);
		$('#throbber').remove();
		if (use_form) {
			addJSONFormEvent($("#reassign_village_to_groups_form_" + target),
					target, Callback.handle_village_to_group_list)
		} else {
			var bottom_body = $("<tbody>"), bottom_table = $("<table>").attr(
					'width', "100%").addClass('vis').css("margin-top", "-2px")
					.append(bottom_body), bottom_row = $("<tr>"), bottom_col = $("<td>"), el = $(
					"<a>")
					.attr(
							'href',
							"javascript:ajaxRequest('"
									+ $("#group_edit_reload").val()
									+ "', '', 'POST', Callback.handle_village_to_group_assigment);")
					.html($("#group_edit_village").val());
			bottom_col.append(el);
			bottom_row.append(bottom_col);
			bottom_body.append(bottom_row);
			$('#' + target).append(bottom_table)
		}
		;
		JToggler.init('#' + target + ' input[type="checkbox"]')
	},
	group_assigment_ajax_event : null,
	group_assignment_toggle : function(village, mobile) {
		var trgt = $('#group_edit_div_' + village.id);
		trgt.toggle();
		if (trgt.is(':visible'))
			ajaxJSONRequest(village.edit_link, 'group_edit_div_' + village.id,
					true, Callback.handle_village_to_group_from_overview)
	},
	handle_village_to_group_from_overview : function(data, target) {
		Callback.display_village_to_groups_assigments(data, target, true);
		addJSONFormEvent($("#reassign_village_to_groups_form_" + target),
				target, Callback.handle_village_overview_reload)
	},
	handle_village_overview_reload : function(data, target) {
		Callback.show_assigned_groups(data, target);
		if (!Callback.mobile) {
			$('#group_edit_tr_' + data.village_id).hide()
		} else
			$('#group_edit_div_' + data.village_id).hide()
	},
	reload_group_screen : function() {
		var group_param = location.href.match(/group=[0-9]*/), url = $(
				'#start_edit_group_link').val().replace('group=0', group_param);
		$.ajax({
			url : url,
			dataType : 'html',
			success : function(msg) {
				$('#paged_view_content').html(msg)
			}
		})
	},
	show_assigned_groups : function(data, target) {
		var groups = "", count = 0;
		if (data.result != null && data.result.length > 0) {
			for ( var i = 0; i < data.result.length; i++)
				if (data.result[i].in_group) {
					groups += data.result[i].name + "; ";
					count++
				}
			;
			groups = groups.substring(0, groups.lastIndexOf(";"));
			$("#assigned_groups_" + data.village_id + "_names").html(groups)
		} else {
			$("#assigned_groups_" + data.village_id + "_names").empty();
			var element = $('<span class="grey" style="font-style:italic"></span>');
			element.html($('#group_undefined').val());
			$("#assigned_groups_" + data.village_id + "_names").append(element)
		}
		;
		$("#assigned_groups_" + data.village_id + "_count").html(count)
	},
	handle_group_assignment : function() {
		if ($("#group_list") != null) {
			addJSONFormEvent($("#edit_group_membership_form"), "group_list",
					Callback.handle_reload_response)
		} else {
			var url = $("#edit_group_membership_form").attr(
					'action',
					$("#edit_group_membership_form").attr('action')
							+ "&reload=1");
			url = url.replace(/&partial=1/g, "");
			$("#edit_group_membership_form").attr('action', url);
			$("#edit_group_href").remove();
			$("#edit_group_membership_form").removeEvents()
		}
	},
	handle_reload_response : function(data, target, form_id) {
		if (form_id != null)
			$('#' + form_id).reset();
		Callback.display_group_configuration(data, target)
	},
	get_group_id : function(event) {
		var source = null;
		if (event.srcElement) {
			source = event.srcElement
		} else
			source = event.target;
		var row_id = $(source).parents('tr').first().attr('id');
		return parseInt(row_id.substr(8))
	},
	display_group_configuration : function(json_groups, target) {
		$('#' + target).empty();
		var throb = $("<img>").attr('src', '/graphic/throbber.gif');
		$('#' + target).append(throb);
		var to_display = $('<table>').addClass('vis').attr('id', 'group_table')
				.width('100%'), tbody = $('<tbody>');
		to_display.append(tbody);
		var header = $('<tr>');
		tbody.append(header);
		var headline = $('<th>').addClass('group_label').width('100%').html(
				$('#group_config_headline').val());
		header.append(headline);
		var form_events = new Array();
		for ( var i = 0; i < json_groups.result.length; i++) {
			var group_id = json_groups.result[i].group_id, group_name = json_groups.result[i].name, table_row = $(
					'<tr>').attr('id', 'tr_group' + group_id), table_col = $(
					'<td>').attr('id', 'show_group' + group_id), edit_link = json_groups.result[i].membership_link
					.replace(/&partial=1/g, ""), link_edit_group = $('<a>')
					.attr('href', edit_link).html(escapeHtml(group_name));
			if (json_groups.last_selected != null
					&& group_id == json_groups.last_selected)
				table_col.addClass('selected');
			table_col.append(link_edit_group);
			table_row.append(table_col);
			var table_col2 = $('<td>').attr('id', 'rename_group' + group_id)
					.css('display', 'none'), rename_form = $('<form>').attr(
					'id', 'rename_group_form' + group_id).attr('action',
					$('#rename_group_link').val() + "&old_name=" + group_name)
					.attr('method', 'post'), inp = $('<input>').attr('type',
					'hidden').attr('name', 'group_id').attr('value', group_id);
			rename_form.append(inp);
			inp = $('<input>').attr('type', 'hidden').attr('name', 'mode')
					.attr('value', $('#group_mode').val());
			rename_form.append(inp);
			inp = $('<input>').attr('type', 'text').attr('name', 'group_name')
					.attr('value', group_name);
			rename_form.append(inp);
			inp = $('<input>').attr('type', 'submit').attr('value',
					$('#group_submit_text').val());
			rename_form.append(inp);
			table_col2.append(rename_form);
			table_row.append(table_col2);
			if (group_id != 0) {
				var table_col3 = $('<td>').addClass('group_edit').width('10px'), rename_href = $(
						'<a>').attr('href', '#'), img = $('<img>').attr('src',
						'/graphic/rename.png').attr('alt',
						$('#group_title_rename').val());
				rename_href.append(img);
				table_col3.append(rename_href);
				var rename_handler = function(event) {
					var group_id = Callback.get_group_id(event);
					toggle_element('#show_group' + group_id);
					toggle_element('#rename_group' + group_id);
					return false
				};
				rename_href.click(rename_handler);
				var table_col4 = $('<td>').addClass('group_edit').width('10px'), delete_href = $(
						'<a>').attr('href', '#');
				img = $('<img>').attr('src', '/graphic/delete.png').attr('alt',
						$('#group_title_delete').val());
				delete_href.append(img);
				table_col4.append(delete_href);
				var deleteHandler = function(event) {
					var handleConfirmDelete = function() {
						var group_id = Callback.get_group_id(event);
						ajaxJSONRequest(encodeURI($('#delete_group_link').val()
								+ '&group_id=' + group_id + '&mode='
								+ $('#group_mode').val()), 'tr_group'
								+ group_id, false,
								Callback.handle_delete_response)
					}, msg = 'Do you really want to delete this group?', buttons = [ {
						text : "OK",
						callback : handleConfirmDelete,
						confirm : true
					} ];
					UI.ConfirmationBox(msg, buttons);
					return false
				};
				delete_href.click(deleteHandler);
				table_row.append(table_col3).append(table_col4);
				form_events[i] = new Array();
				form_events[i]["membership_link"] = json_groups.result[i].membership_link;
				form_events[i]["group_id"] = group_id
			}
			;
			tbody.append(table_row)
		}
		;
		$('#' + target).empty().append(to_display);
		for ( var j = 0; j < form_events.length; j++)
			addJSONFormEvent($("#rename_group_form"
					+ form_events[j]["group_id"]), "show_group"
					+ form_events[j]["group_id"],
					Callback.handle_rename_response, true)
	},
	handle_add_response : function(data) {
		if (data.error) {
			alert(data.error);
			return false
		}
		;
		$('#add_new_group_name').val('');
		Callback.handle_reload_response(data, 'group_list');
		Callback.reload_group_screen()
	},
	handle_rename_response : function(data, target, form_id) {
		var showgroup_row = $('#' + target), renamegroup_row = showgroup_row
				.closest('tr').find('td:nth-child(2)'), new_name = data.result;
		if (form_id) {
			var form_el = $('#' + form_id), old_name = form_el.find("a")[0].innerHTML, old_action = form_el
					.attr('action'), new_action = old_action.replace(
					"&old_name=" + old_name, "&old_name=" + new_name);
			form_el.attr('action', new_action).toggle()
		}
		;
		showgroup_row.find("a").html(escapeHtml(new_name));
		showgroup_row.toggle();
		renamegroup_row.toggle();
		Callback.toggle_group_select(showgroup_row);
		Callback.reload_group_screen()
	},
	handle_delete_response : function(data, target, form_id) {
		$("#" + target).hide();
		Callback.reload_group_screen()
	},
	toggle_group_select : function(target) {
		if (target != null && target.parentNode != null
				&& target.parentNode.parentNode != null
				&& target.parentNode.parentNode.childNodes != null) {
			for ( var i = 0; i < target.parentNode.parentNode.childNodes.length; i++) {
				if (target.parentNode.parentNode.childNodes[i].childNodes[0] != null
						&& target.parentNode.parentNode.childNodes[i].childNodes[0].className == "selected")
					target.parentNode.parentNode.childNodes[i].childNodes[0]
							.erase("class");
				if (target.parentNode.parentNode.childNodes[i].childNodes[1] != null
						&& target.parentNode.parentNode.childNodes[i].childNodes[1]
								.getStyle("display") == "block") {
					toggle_element(target.parentNode.parentNode.childNodes[i].childNodes[0].id);
					toggle_element(target.parentNode.parentNode.childNodes[i].childNodes[1].id)
				}
			}
			;
			target.addClass('selected')
		}
	}
}

var BBCodes = {
	target : null,
	ajax_unit_url : null,
	ajax_building_url : null,
	init : function(options) {
		BBCodes.target = $(options.target);
		BBCodes.ajax_unit_url = options.ajax_unit_url;
		BBCodes.ajax_building_url = options.ajax_building_url
	},
	insert : function(start_tag, end_tag, force_place_outside) {
		var input = BBCodes.target[0];
		input.focus();
		if (typeof document.selection != 'undefined') {
			var range = document.selection.createRange(), ins_text = range.text;
			range.text = start_tag + ins_text + end_tag;
			range = document.selection.createRange();
			if (ins_text.length > 0 || true == force_place_outside) {
				range.moveStart('character', start_tag.length + ins_text.length
						+ end_tag.length)
			} else
				range.move('character', -end_tag.length);
			range.select()
		} else if (typeof input.selectionStart != 'undefined') {
			var start = input.selectionStart, end = input.selectionEnd, ins_text = input.value
					.substring(start, end), scroll_pos = input.scrollTop;
			input.value = input.value.substr(0, start) + start_tag + ins_text
					+ end_tag + input.value.substr(end);
			var pos;
			if (ins_text.length > 0 || true === force_place_outside) {
				pos = start + start_tag.length + ins_text.length
						+ end_tag.length
			} else
				pos = start + start_tag.length;
			input.setSelectionRange(start + start_tag.length, end
					+ start_tag.length);
			input.scrollTop = scroll_pos
		}
		;
		return false
	},
	colorPickerToggle : function(assign) {
		var inp = $('#bb_color_picker_tx').first();
		inp.unbind('keyup').keyup(
				function() {
					var inp = $('#bb_color_picker_tx').first(), g = $(
							'#bb_color_picker_preview').first();
					try {
						g.css('color', inp.val())
					} catch (e) {
					}
				});
		if (assign) {
			BBCodes.insert('[color=' + $(inp).val() + ']', '[/color]');
			$('#bb_color_picker').toggle();
			return false
		}
		;
		var colors = [ $('#bb_color_picker_c0').first(),
				$('#bb_color_picker_c1').first(),
				$('#bb_color_picker_c2').first(),
				$('#bb_color_picker_c3').first(),
				$('#bb_color_picker_c4').first(),
				$('#bb_color_picker_c5').first() ];
		colors[0].data('rgb', [ 255, 0, 0 ]);
		colors[1].data('rgb', [ 255, 255, 0 ]);
		colors[2].data('rgb', [ 0, 255, 0 ]);
		colors[3].data('rgb', [ 0, 255, 255 ]);
		colors[4].data('rgb', [ 0, 0, 255 ]);
		colors[5].data('rgb', [ 255, 0, 255 ]);
		for ( var i = 0; i <= 5; i++)
			colors[i].unbind('click').click(function() {
				BBCodes.colorPickColor($(this).data('rgb'))
			});
		BBCodes.colorPickColor(colors[0].data('rgb'));
		$('#bb_color_picker').toggle();
		return false
	},
	colorPickColor : function(col) {
		for ( var l = 0; l < 6; l++)
			for ( var h = 1; h < 6; h++) {
				var cell = $('#bb_color_picker_' + h + l).first();
				if (!cell)
					alert('bb_color_picker_' + h + l);
				var ll = l / 3.0, hh = h / 4.5;
				hh = Math.pow(hh, 0.5);
				var light = Math.max(0, 255 * ll - 255), r = Math.floor(Math
						.max(0, Math.min(255,
								(col[0] * ll * hh + 255 * (1 - hh)) + light))), g = Math
						.floor(Math.max(0, Math.min(255,
								(col[1] * ll * hh + 255 * (1 - hh)) + light))), b = Math
						.floor(Math.max(0, Math.min(255,
								(col[2] * ll * hh + 255 * (1 - hh)) + light)));
				cell.css('background-color', 'rgb(' + r + ',' + g + ',' + b
						+ ')');
				cell.data('rgb', [ r, g, b ]);
				cell.unbind('click').click(function() {
					BBCodes.colorSetColor($(this).data('rgb'))
				})
			}
	},
	colorSetColor : function(color) {
		var g = $('#bb_color_picker_preview').first(), inp = $(
				'#bb_color_picker_tx').first();
		g.css('color', 'rgb(' + color[0] + ',' + color[1] + ',' + color[2]
				+ ')');
		var rr = color[0].toString(16), gg = color[1].toString(16), bb = color[2]
				.toString(16);
		rr = rr.length < 2 ? '0' + rr : rr;
		gg = gg.length < 2 ? '0' + gg : gg;
		bb = bb.length < 2 ? '0' + bb : bb;
		inp.val('#' + rr + gg + bb)
	},
	placePopups : function() {
		var sizeButton = $('#bb_button_size > span'), colorButton = $('#bb_button_color > span'), sizePopup = $('#bb_sizes'), colorPopup = $('#bb_color_picker'), window_width = $(
				document).width();
		if (!window_width)
			window_width = document.body.clientWidth;
		if (sizeButton.length > 0)
			sizePopup.offset({
				left : sizeButton.offset().left,
				top : sizeButton.offset().top + sizeButton.height() + 2
			});
		if (colorButton.length > 0) {
			var x = colorButton.offset().left + colorButton.width()
					- colorPopup.width();
			if (/MSIE 7/.test(navigator.userAgent))
				x = x - 200;
			colorPopup.offset({
				left : x,
				top : colorButton.offset().top + colorButton.height() + 2
			})
		}
	},
	closePopups : function() {
		$('#bb_sizes').hide();
		$('#bb_color_picker').hide()
	},
	setTarget : function(target) {
		BBCodes.target = target
	},
	ajaxPopupToggle : function(event, popupId, url) {
		var picker = $('#' + popupId);
		if (picker && picker.is(':visible')) {
			picker.hide()
		} else
			UI.AjaxPopup(event, popupId, url, 'close', null, null, 200)
	},
	unitPickerToggle : function(event) {
		BBCodes.ajaxPopupToggle(event, 'unit_picker', BBCodes.ajax_unit_url)
	},
	buildingPickerToggle : function(event) {
		BBCodes.ajaxPopupToggle(event, 'building_picker',
				BBCodes.ajax_building_url)
	}
}

var ScriptAPI = {
	active : [],
	url : '',
	version : null,
	register : function(scriptname, version, author, email) {
		var checkParam = function(key, value) {
			if (!value)
				throw 'ScriptAPI: parameter (\'' + key
						+ '\') requires a value.'
		};
		if (ScriptAPI.url == '')
			return;
		checkParam('scriptname', scriptname);
		checkParam('version', version);
		checkParam('author', author);
		checkParam('email', email);
		if (typeof version == 'number')
			version = [ version ];
		var script = {
			scriptname : scriptname,
			version : version,
			author : author,
			email : email,
			broken : false
		}, existing = false, incomatibel = true;
		for ( var i in ScriptAPI.active)
			if (ScriptAPI.active[i].scriptname == scriptname) {
				existing = true;
				script = ScriptAPI.active[i]
			}
		;
		if (!existing) {
			ScriptAPI.active.push(script);
			ScriptAPI.save(script)
		}
		;
		$.each(version, function(i, v) {
			if (v == ScriptAPI.version)
				incomatibel = false
		});
		if (!script.broken && incomatibel && ScriptAPI.version != 8.1) {
			script.broken = true;
			ScriptAPI.notify(script);
			throw 'Version incompatible!'
		}
	},
	notify : function(script) {
		var scriptlink = $('<li>').text(escapeHtml(script.scriptname) + ' ');
		scriptlink.append($('<a>').attr('href',
				escapeHtml('mailto:' + script.email)).text(
				'(Author:' + escapeHtml(script.author) + ')'));
		$('#script_list').append(scriptlink);
		$('#script_warning').show()
	},
	save : function(script) {
		$.post(ScriptAPI.url, script)
	}
}

var Premium = {
	checkPP : function(link) {
		var data = $.parseJSON($.ajax({
			url : link,
			async : false
		}).responseText);
		if (!data)
			return true;
		if (data.error) {
			UI.ErrorMessage(data.error, 4000);
			$('#error').text(data.error)
		}
		;
		$(document.body).append(data);
		return false
	}
}

var Quests = {
	el : null,
	init : function() {
		Quests.el = $('.quest_attention');
		if (Quests.el.length) {
			Quests.bounce();
			Quests.fade()
		}
	},
	bounce : function() {
		Quests.el.effect('bounce', {
			times : 2,
			distance : 5
		}, 250, function() {
			setTimeout('Quests.bounce();', 1500)
		})
	},
	fade : function() {
		var opacity = Quests.el.css('opacity') != 1 ? 1 : 0.6;
		Quests.el.animate({
			opacity : opacity
		}, {
			queue : false,
			duration : 1000,
			complete : function() {
				Quests.fade()
			}
		})
	},
	markAsCompleted : function(id) {
		$el = $('#quest_' + id);
		if ($el.length)
			$el.addClass('finished').find('img').show()
	}
}