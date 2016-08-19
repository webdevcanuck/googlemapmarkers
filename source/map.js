$(document).ready(function () {

    markers = [], locations = [], singlePtsAR = [];
    var marker, i, catTrigger;
    mainPin = initSwitch = true;
    infowindow = new google.maps.InfoWindow();

    // JSON FILE, PIN FOLDER
    jsonMapInfo = [
        ["../../source/mainpin.json", "pin4.png"],
        ["../../source/shopping.json", "pin1.png", "Shopping + Dining"],
        ["../../source/parks.json", "pin2.png", "Parks + Recreation"],
        ["../../source/services.json", "pin3.png", "Schools + Services"]
    ];

    // POINT VARIABLES
    map = new google.maps.Map(document.getElementById("googleMap"), {
        zoom: 12,
        center: {lat: 43.7742, lng: -79.57983},
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#e9e9e9"}, {"lightness": 17}]}, {"featureType": "landscape", "elementType": "geometry", "stylers": [{"color": "#f5f5f5"}, {"lightness": 20}]}, {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"color": "#ffffff"}, {"lightness": 17}]}, {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{"color": "#ffffff"}, {"lightness": 29}, {"weight": 0.2}]}, {"featureType": "road.arterial", "elementType": "geometry", "stylers": [{"color": "#ffffff"}, {"lightness": 18}]}, {"featureType": "road.local", "elementType": "geometry", "stylers": [{"color": "#ffffff"}, {"lightness": 16}]}, {"featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#f5f5f5"}, {"lightness": 21}]}, {"featureType": "poi.park", "elementType": "geometry", "stylers": [{"color": "#dedede"}, {"lightness": 21}]}, {"elementType": "labels.text.stroke", "stylers": [{"visibility": "on"}, {"color": "#ffffff"}, {"lightness": 16}]}, {"elementType": "labels.text.fill", "stylers": [{"saturation": 36}, {"color": "#333333"}, {"lightness": 40}]}, {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]}, {"featureType": "transit", "elementType": "geometry", "stylers": [{"color": "#f2f2f2"}, {"lightness": 19}]}, {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [{"color": "#fefefe"}, {"lightness": 20}]}, {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{"color": "#fefefe"}, {"lightness": 17}, {"weight": 1.2}]}],
        mapTypeControl: false,
        streetViewControl: false,
        scrollwheel: false,
        zoomControl: false
    });

    $(document).on("click", ".filterpoints", function () {
        init_func();
        clearMarkers();
        markers = [], locations = [], singlePtsAR = [];
        jsonPts(jsonMapInfo, "", $(this).attr("data-id"));
    });

    function init_func() {
        pointsOutput = "";
        pinpoints = mapCount = 0;
    }
    init_func();

    function checkFilter(inFilter) {
        if (inFilter >= 0) {
            return true;
        } else {
            return false;
        }
    }

    function jsonPts(inFile, inFolder, filterIt) {
        mapFile = inFile[mapCount][0];
        var points = $.getJSON("js/" + mapFile, function () {
        }).done(function (data) {
            pointsOutput = pointsOutput + '<h2 class="filterpoints" data-id="' + mapCount + '">' + inFile[mapCount][2] + '</h2>';
            $.each(data, function (key, val) {
                latlon = val.Point.coordinates.split(",");
                singlePtAR = [val.name, latlon[0], latlon[1], inFile[mapCount][1]];
                singlePtsAR.push(singlePtAR);
                pointsOutput = pointsOutput + '<div class="pinfilter" data-val="' + pinpoints + '">' + val.name + '</div>';
                pinpoints++;
            });
            locations.push(singlePtsAR);
            mapCount++;

            if (checkFilter(filterIt)) {
                catTrigger = true;
                mapCount = filterIt;
                jsonPts(jsonMapInfo);
            } else if (catTrigger) {
                catTrigger = false;
                allPoints();
            } else if (mapCount !== jsonMapInfo.length) {
                jsonPts(jsonMapInfo);
            } else {
                allPoints();
            }
        }).fail(function () {
            console.log("error");
        }).always(function () {
        });
    }
    jsonPts(jsonMapInfo);

    function allPoints() {
        markerCount = 0; // RESET MARKER COUNT
        for (a = 0; a < singlePtsAR.length; a++) { // ROLL THROUGHT ALL MARKERS
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(singlePtsAR[a][2], singlePtsAR[a][1]),
                map: map,
                icon: {
                    url: "../source/" + singlePtsAR[a][3],
                    scaledSize: new google.maps.Size(10, 10)
                }
            });
            markers.push(marker); // PUSH SINGLE MARKER TO MARKERS ARRAY
            google.maps.event.addListener(marker, 'click', (function (marker, a) {
                return function () {
                    infowindow.setContent(singlePtsAR[a][0]);
                    infowindow.open(map, marker);
                }
            })(marker, a));
        }
        $("#allpoints").html(pointsOutput);
        AutoCenter(); // CENTRE POINTS
    }

    function AutoCenter() {
        var bounds = new google.maps.LatLngBounds();
        $.each(markers, function (index, marker) {
            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);
    }

    // Sets the map on all markers in the array.
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        setMapOnAll(null);
    }

    $(document).on("click", ".pinfilter", function () {
        infowindow.close();
        pin = $(this).attr("data-val");
        google.maps.event.trigger(markers[pin], 'click');
    });

    $(window).resize(AutoCenter);

    //add custom buttons for the zoom-in/zoom-out on the map
    function CustomZoomControl(controlDiv, map) {
        //grap the zoom elements from the DOM and insert them in the map 
        var
                controlUIzoomIn = document.getElementById('cd-zoom-in'),
                controlUIzoomOut = document.getElementById('cd-zoom-out');

        // Setup the click event listeners and zoom-in or out according to the clicked element
        google.maps.event.addDomListener(controlUIzoomIn, 'click', function () {
            map.setZoom(map.getZoom() + 1)
        });
        google.maps.event.addDomListener(controlUIzoomOut, 'click', function () {
            map.setZoom(map.getZoom() - 1)
        });
    }

    //var zoomControlDiv = document.createElement('div');
    //var zoomControl = new CustomZoomControl(zoomControlDiv, map);
});
