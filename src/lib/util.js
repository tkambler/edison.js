define([], function() {

	return {

		/**
		 * Returns true / false as to whether the browser supports the HTML5 History API
		 */
		'supportsHistoryAPI': function() {
			return !!(window.history && history.pushState);
		}

	};

});
