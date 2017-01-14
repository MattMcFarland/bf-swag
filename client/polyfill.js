
function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

if (storageAvailable('localStorage')) {
	// Yippee! We can use localStorage awesomeness
}
else {
	window.localStorage = {
	  setItem: function () {},
	  getItem: function () {}
	};
}