FormController = o.Class({
	extend: DOMController,

	close: function () {
		this.el().removeClass('opened');
		this._setStatus('');
		this._disableFieldsTabIndex();
	},

	open: function () {
		this.el().addClass('opened');
		this._focus();
		this._enableFieldsTabIndex();
	},

	toggle: function () {
		if (this.el().is('.opened')) {
			this.close();
		} else {
			this.open();
		}
	},

	// private

	_blockSubmit: function ( enable ) {
		var type = (enable?'button':'submit');

		this.el().find('button').attr('type', type);
	},
	
	_disableFieldsTabIndex: function () {
		this.el().find(':input').attr('tabindex', '-1' );	
	},

	_enableFieldsTabIndex: function () {
		this.el().find(':input').removeAttr('tabindex');
	},

	_focus: function () {
		this.el().find(':input:first').get(0).focus(); 
	},

	_getUpdater: function () {
		return chrome.extension.getBackgroundPage().Updater;
	},

  _setStatus: function (msg) {
    this.el().find('span.status').html(msg);
	}
});


FormUsersController = o.Class({
	extend: FormController,
	dom: 'section#form-user form',

	boot: function () {
		this._addListeners();
	  this._disableFieldsTabIndex();	
	},

	close: function () {
		$('header button#open-users').focus();

		this._super();
	},
	
	// private
	
	_addListeners: function () {
		var that = this;

		this.el().on('submit', function ( evt ) {
			var users, Updater = that._getUpdater();
			
			evt.preventDefault();

			Updater.stop();

			Prefs.addUser(this.user.value);

			that._showOverlay();
			that._blockSubmit(true);
			that._setStatus('<img src="../imgs/loading.gif">');

			TravisAPI.get(Prefs.getUsers(), function () {
				that._clear();
				that._hideOverlay();
				that._blockSubmit(false);
				that._setStatus('saved');

				Updater.restart();

				setTimeout(function () {
					that.close();
				}, 1000);
			});
		});
	},

	_clear: function () {
		this.el().find(':input[name=user]').val('');
	},

	_hideOverlay: function () {
		$('section#list div#overlay').hide();
	},

	_showOverlay: function () {
		$('section#list div#overlay').show();
	}
});

formUsersController = new FormUsersController();


FormPrefsController = o.Class({
	extend: FormController,
	dom: 'section#form-prefs form',

	boot: function() {
		this._addListeners();
		this._restoreData();
		this._disableFieldsTabIndex();
	},

	_close: function () {
		$('header button#open-prefs').focus();

		this._super();
	},
	

	// private
	
	_addListeners: function () {
		var that = this;

		this.el().on('submit', function (evt) {
			var Updater = that._getUpdater();

			evt.preventDefault();

			Prefs.set('interval', this.interval.value || 60);
			Prefs.set('notifications', this.notifications.checked || false);

			that._setStatus('saved');

			Updater.restart();

			setTimeout(function () {
				that.close();
			}, 1000);
		});
	},

	_restoreData: function () {
		var prefs = Prefs.get();
		
		this.el().find(':input[name=interval]').val(prefs.interval || '');
		this.el().find(':input[name=notifications]').attr('checked', prefs.notifications || false);
	}
});

formPrefsController = new FormPrefsController();
