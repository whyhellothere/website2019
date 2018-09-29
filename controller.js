window.onload = function () {

	/*
		Window Manager
	*/
	numWindows = document.querySelectorAll('.framed').length;
	windowZs = []

	function updateZ(evt, manual) {
		if (evt.data) {
			elm = evt.data.sourceContainer;
		}
		else {
			elm = evt.path[evt.path.length - 6];
		}
		for (i = 0; i < numWindows; i++) {
			l = windowZs[i]
			if (l == elm) {
				windowZs.splice(i, 1)
				windowZs.push(l)
			}
		}
		for (i = numWindows - 1; i >= 0; i--) {
			windowZs[i].style.zIndex = i.toString()
		}
	}

	function MakeFrame(list_of_frames) {
		var out = {}
		for (l of list_of_frames) {
			out[l] = {}

			l.addEventListener('click', updateZ)
			windowZs.push(l)
		}
		return out
	}

	frames_set = MakeFrame(document.querySelectorAll('.framed'));

	const draggable = new Draggable.Draggable(document.querySelectorAll('.framed'), {
		draggable: '.title_bar'
	});

	draggable.on('drag:start', (evt) => {
		updateZ(evt)

		relative_x = evt.data.sensorEvent.data.clientX - evt.data.sourceContainer.offsetLeft;
		relative_y = evt.data.sensorEvent.data.clientY - evt.data.sourceContainer.offsetTop;
		frames_set[evt.data.sourceContainer]['init_mouse_start'] = [relative_x, relative_y];

		if (relative_x > evt.data.sourceContainer.offsetWidth - 20) {
			evt.data.sourceContainer.classList.remove("active");
		}
	});
	draggable.on('drag:move', (evt) => {
		frame = evt.data.sourceContainer;

		x = evt.data.sensorEvent.data.clientX;
		y = evt.data.sensorEvent.data.clientY;

		x_ = frames_set[frame]['init_mouse_start'][0];
		y_ = frames_set[frame]['init_mouse_start'][1];

		bound_x = x + frame.offsetWidth - x_;
		bound_y = y + frame.offsetHeight - y_;

		anchor_x = x - x_;
		anchor_y = y - y_;

		frame.style.left = x - x_;
		if (y - y_ > 32) {
			frame.style.top = y - y_;
		}
	});
	draggable.on('drag:stop', (evt) => {
		frame = evt.data.sourceContainer;
		w = frame.offsetWidth;
		h = frame.offsetHeight;
		l = frame.offsetLeft;
		t = frame.offsetTop;

		if (l < 0) {
			frame.style.left = 1;
		}
		else if (l + w > window.innerWidth) {
			frame.style.left = window.innerWidth - w - 1;
		}
		if (t < 32) {
			frame.style.top = 32;
		}
		else if (t + h > window.innerHeight) {
			frame.style.top = window.innerHeight - h - 1;
		}
	});

	/* 
		Desktop Icons
	*/
	dicons = document.getElementsByClassName("d-icon");
	for (d of dicons) {
		d.addEventListener('click', (evt) => {
			dicons = document.getElementsByClassName("d-icon");
			for (d of dicons) {
				d.classList.remove("focused");
			}
			evt.currentTarget.classList.add("focused");

			// Fix map size
			map.resize();

			// Fix z ordering of frames
			updateZ({'data': {'sourceContainer': document.getElementsByClassName(evt.currentTarget.dataset.linkedFrame)[0]}})

			evt.stopPropagation();
		});
		d.addEventListener('dblclick', (evt) => {
			evt.currentTarget.classList.remove("focused");
			linked_frame = document.getElementsByClassName(evt.currentTarget.dataset.linkedFrame)[0];
			linked_frame.classList.add("active");
			evt.stopPropagation();
		});
	}


	/* 
		Menu Clock
	*/
	function startTime() {
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		dayornight = isItTheMorning(h);
		m = formatMinutes(m);
		h = formatHours(h);


		document.getElementById('time').innerHTML =
			h + ":" + m + dayornight;
		var t = setTimeout(startTime, 500);
	}

	function formatMinutes(minutes, h) {
		if (minutes < 10) { minutes = "0" + minutes };  // add zero in front of numbers < 10
		return minutes;
	}

	function formatHours(hours) {
		if (hours === 0) {
			return 12
		}
		else if (hours > 12) {
			return hours - 12
		}
		else {
			return hours
		}
	}

	function isItTheMorning(hours) {
		if (hours < 12) {
			return ' AM'
		}
		else {
			return ' PM'
		}
	}
	startTime();

	/*
		Nav bar
	*/
	document.addEventListener('click', () => {
		ddowns = document.getElementsByClassName("dropdown-content");
		for (d of ddowns) {
			d.classList.remove("show");
		}

		dicons = document.getElementsByClassName("d-icon");
		for (d of dicons) {
			d.classList.remove("focused");
		}
	})

	/*
		Map
	*/
	mapboxgl.accessToken = "pk.eyJ1IjoiY29ubm9yc3RhbXBlciIsImEiOiJjamFpeDM1bXMyMXdrMnFsZTh0dmJmanVxIn0.v2IUgOKPxfRDTlAhaswe0w";

	/* Map: This represents the map on the page. */
	var map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/connorstamper/cjmh7cpqx9tgg2ro6qj0ocstn",
		zoom: 15,
		center: [-89.40331, 43.07108]
	});

	var geojson = {
		type: 'FeatureCollection',
		features: [{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-89.40355468309329, 43.071904256933436]
			},
			properties: {
				title: 'MadHacks',
				description: '1025 W Johnson St',
				description2: 'Madison, WI 53706'
			}
		}]
	}
	// add markers to map
	geojson.features.forEach(function (marker) {

		// create a HTML element for each feature
		var el = document.createElement('div');
		el.className = 'marker';

		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el)
			.setLngLat(marker.geometry.coordinates)
			.setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
			.setHTML('<h3>' + marker.properties.title + '</h3><p>' + 
				marker.properties.description + '</p>' + '<p>' + marker.properties.description2 + '</p>'))
			.addTo(map);
	});

	map.addControl(new mapboxgl.NavigationControl());

	/*
		FAQ
	*/
	var acc = document.getElementsByClassName("accordion");
	var i;

	for (i = 0; i < acc.length; i++) {
		acc[i].addEventListener("click", function () {
			/* Toggle between adding and removing the "active" class,
			to highlight the button that controls the panel */
			this.classList.toggle("activate");

			/* Toggle between hiding and showing the active panel */
			var panel = this.nextElementSibling;
			if (panel.style.display === "block") {
				panel.style.display = "none";
			} else {
				panel.style.display = "block";
			}
		});
	}
}

/*
	Navbar dropdown functionality
	Needs to be outside window.onload for function scoping reasons
		this is ugly -- fix later
*/
function ddownFunction(id, evt) {
	ddowns = document.getElementsByClassName("dropdown-content");
	for (d of ddowns) {
		if (d != document.getElementById(id)) {
			d.classList.remove("show");
		}
	}
	document.getElementById(id).classList.toggle("show");
	evt.stopPropagation();
}