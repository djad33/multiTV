var $j = jQuery.noConflict();

var lastImageCtrl;
var lastFileCtrl;

function OpenServerBrowser(url, width, height) {
	var iLeft = (screen.width - width) / 2;
	var iTop = (screen.height - height) / 2;

	var sOptions = 'toolbar=no,status=no,resizable=yes,dependent=yes';
	sOptions  += ',width=' + width;
	sOptions += ',height=' + height;
	sOptions += ',left=' + iLeft;
	sOptions += ',top=' + iTop;

	var oWindow = window.open(url, 'FCKBrowseWindow', sOptions);
}

function multiBrowseServer(ctrl, basepath) {
	lastImageCtrl = ctrl;
	var w = screen.width * 0.7;
	var h = screen.height * 0.7;
	OpenServerBrowser(basepath+'manager/media/browser/mcpuk/browser.html?Type=images&Connector='+basepath+'manager/media/browser/mcpuk/connectors/php/connector.php&ServerPath='+basepath, w, h);
}

function multiBrowseFileServer(ctrl, basepath) {
	lastFileCtrl = ctrl;
	var w = screen.width * 0.7;
	var h = screen.height * 0.7;
	OpenServerBrowser(basepath+'manager/media/browser/mcpuk/browser.html?Type=files&Connector='+basepath+'manager/media/browser/mcpuk/connectors/php/connector.php&ServerPath='+basepath, w, h);
}

function SetUrl(url, width, height, alt) {
	if(lastFileCtrl) {
		$j('#' + lastFileCtrl).val(url);
		$j('#' + lastFileCtrl).trigger('change');
		lastFileCtrl = '';
	} else if(lastImageCtrl) {
		$j('#' + lastImageCtrl).val(url);
		$j('#' + lastImageCtrl).trigger('change');
		lastImageCtrl = '';
	} else {
		return;
	}
}

function TransformField(tvid, tvfields, tvlanguage) {
	var field = $j('#' + tvid);
	var fieldValue = [];
	var fieldHeading = $j('#' + tvid + 'heading');
	var fieldNames = tvfields['fieldnames'];
	var fieldTypes = tvfields['fieldtypes'];
	var fieldList = $j('#' + tvid + 'list');
	var fieldListElement = fieldList.find('li:first');
	var fieldListElementEmpty = fieldListElement.clone();
	var fieldListCopyButton = $j('<a href="#" class="copy" title="'+tvlanguage.add+'">'+tvlanguage.add+'</a>');
	var fieldEdit = $j('#' + tvid + 'edit');
	var fieldClear = $j('#' + tvid + 'clear');
	var fieldPasteWord = $j('#' + tvid + 'pasteword');
	var fieldPasteForm = $j('#' + tvid + 'pasteform');
	var fieldPasteArea = $j('#' + tvid + 'pastearea');
	var fieldListCounter = 1;
	var pasteBox;
	
	function DuplicateElement(element, elementCount) {
		var clone = element.clone(true).hide();
		var elementId;
		clone.find('[id]').each(function() {
			elementId = $j(this).attr('id');
			$j(this).attr('id', elementId + (elementCount));
		});
		clone.find('[name]').each(function() {
			$j(this).attr('name', $j(this).attr('name') + (elementCount));
		});
		AddElementEvents(clone);

		// clear inputs/textarea
		var inputs = clone.find(':input');
		inputs.each(function() {
			var type = $j(this).attr('type');
			switch(type) {
				case 'button':
					break;
				case 'reset':
					break;
				case 'submit':
					break;
				case 'checkbox':
				case 'radio':
					$j(this).attr('checked', '');
					break;
				default:
					$j(this).val('');
			}
		});
		return clone;
	}

	function AddElementEvents(element) {
		// datepicker
		element.find('.DatePicker').datetimepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: 'dd-mm-yy',
			timeFormat: 'h:mm:ss'
		});
		// file field browser
		element.find('.browsefile').click(function() {
			var field = $j(this).prev('input').attr('id');
			var path = $j(this).attr('rel');
			multiBrowseFileServer(field, path);
			return false;
		});

		// image field browser
		element.find('.browseimage').click(function() {
			var field = $j(this).prev('input').attr('id');
			var path = $j(this).attr('rel');
			multiBrowseServer(field, path);
			return false;
		});
		// remove element
		element.find('.remove').click(function() {
			if(fieldList.find('.element').length > 1) {
				$j(this).parents('.element').remove();
			} else {
				// clear inputs/textarea
				var inputs = $j(this).parent().find('[name]');
				inputs.each(function() {
					var type = $j(this).attr('type');
					switch(type) {
						case 'button':
							break;
						case 'reset':
							break;
						case 'submit':
							break;
						case 'checkbox':
							$j(this).attr('checked', '');
							break;
						default:
							$j(this).val('');
					}
				});
			}
			fieldList.find('li:first input:first').trigger('change');
			return false;
		});
		// change field
		element.find('[name]').bind('change keyup mouseup', function() {
			var multiElements = fieldList.children('li');
			var values = [];
			multiElements.each(function() {
				var multiElement = $j(this);
				var fieldValues = [];
				$j.each(fieldNames, function() {
					var fieldInput = multiElement.find('[name^="'+tvid+this+'_mtv"][type!="hidden"]');
					var fieldValue = fieldInput.getValue();
					fieldValues.push(fieldValue);
					if (fieldInput.hasClass('image')) {
						setThumbnail(fieldValue, fieldInput.attr('name'), multiElement);
					}
				});
				values.push(fieldValues);
			});
			field.val(Json.toString(values));
			return false;
		});

	}

	function setThumbnail(fieldValue, fieldName, listElement) {
		var thumbPath = fieldValue.split('/');
		var thumbName = thumbPath.pop();
		var thumbId = fieldName.replace(/^(.*?)(\d*)$/, '#$1preview$2');
		if (thumbName != '') {
			listElement.find(thumbId).html('<img src="../'+thumbPath.join("/")+'/.thumb_'+thumbName+'" />');
		} else {
			listElement.find(thumbId).html('');
		}
	}
	
	function prefillInputs(fieldValue) {
		$j.each(fieldValue, function() {
			var values = this;
			if (fieldListCounter == 1) {
				var i = 0;
				$j.each(values, function() {
					var fieldInput = fieldListElement.find('[name^="'+tvid+fieldNames[i]+'"][type!="hidden"]');
					fieldInput.setValue(values[i]);
					if (fieldInput.hasClass('image')) {
						setThumbnail(values[i], fieldInput.attr('name'), fieldListElement);
					}
					i++;
				}) 
			} else {
				var clone = DuplicateElement(fieldListElementEmpty, fieldListCounter);
				clone.show();
				fieldList.append(clone);
				var i = 0;
				$j.each(values, function() {
					var fieldInput = clone.find('[name^="'+tvid+fieldNames[i]+'"][type!="hidden"]');
					fieldInput.setValue(values[i]);
					if (fieldInput.hasClass('image')) {
						setThumbnail(values[i], fieldInput.attr('name'), clone);
					}
					i++;
				}) 
			//AddElementEvents(clone);
			}
			fieldListCounter++;
		});
		field.addClass('transformed');

	}
	
	// reset all event
	fieldClear.find('a').click(function() {
		var answer = confirm(tvlanguage.confirmclear);
		if (answer) {
			fieldList.children('li').remove();
			field.val('');
			fieldClear.hide();
			fieldHeading.hide();
			fieldEdit.show();
			fieldListCopyButton.hide();
		}
		return false;
	});

	// start edit event
	fieldEdit.find('a').click(function() {
		var clone = fieldListElementEmpty.clone(true);
		fieldList.append(clone);
		field.val('[]');
		fieldList.show();
		fieldClear.show();
		fieldHeading.show();
		fieldEdit.hide();
		fieldListCopyButton.show();
		AddElementEvents(clone);
		return false;
	});
	
	// paste box
	pasteBox = fieldPasteWord.find('a').colorbox({
		inline:true, 
		width:"500px", 
		height:"350px",
		onClosed:function() {
			fieldPasteArea.html('');
		},
		close:''
	});
	
	// close paste box
	fieldPasteForm.find('.close').click(function() {
		pasteBox.colorbox.close();
		return false;
	});

	// save pasted form
	fieldPasteForm.find('.save').click(function() {
		var pastedArray = [];
		var clean = fieldPasteArea.htmlClean({
			allowedTags:['table','tbody','tr','td']
		}).html();
		clean = clean.replace(/\n/mg, '').replace(/.*<table>/mg,'<table>').replace(/<\/table>.*/mg,'</table>');
		$j(clean).find('tr').each(function() {
			var pastedRow = [];
			var tableData = $j(this).find('td');
			if (tableData.length > 0) {
				var i = 0;
				tableData.each(function() {
					if (fieldTypes[i] == 'thumb') {
						pastedRow.push('');
						i++;
					}
					pastedRow.push($j(this).text());
					i++;
				});
				pastedArray.push(pastedRow);
			}
		});
		console.log (pastedArray);
		fieldList.find('li:gt(0)').remove();
		fieldListCounter = 1;
		prefillInputs(pastedArray);
		fieldList.find('li:first input:first').trigger('change');
		pasteBox.colorbox.close();
		return false;
	});

	// copy element event
	fieldListCopyButton.click(function() {
		var clone = DuplicateElement(fieldListElementEmpty, fieldListCounter);
		fieldList.find('li:last').after(clone);
		clone.show('fast', function() {
			$j(this).removeAttr('style');
		});
		fieldListCounter++;
		fieldList.find('li:first input:first').trigger('change');
		return false;
	});
			
	// transform the input		
	if (field.val() != '@INHERIT') { 
		fieldValue = $j.parseJSON(field.val());
		fieldValue = (fieldValue.constructor == Array) ? fieldValue : [];

		field.hide();
		fieldEdit.hide();
		AddElementEvents(fieldListElement);

		// sortable
		fieldList.sortable({
			stop : function() {
				fieldList.find('li:first input:first').trigger('change');
			},
			axis: 'y',
			helper: 'clone'
		});
		if (!field.hasClass('transformed')) {
			fieldList.before(fieldListCopyButton);
			prefillInputs(fieldValue);
		}
	} else {
		fieldHeading.hide();
		fieldList.hide();
		field.hide();
		fieldClear.hide();
		fieldList.before(fieldListCopyButton);
		fieldListCopyButton.hide();
	}
}
