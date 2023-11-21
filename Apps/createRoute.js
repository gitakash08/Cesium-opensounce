getMatchCords = (feature, data) => {
    let matchCoords = null, nextMatchFeature = null;
    try {
        data.forEach(feat => {
            let _coords1 = feature.geometry.coordinates;
            let _coords2 = feat.geometry.coordinates;
            for (let index = 0; index < _coords1.length; index++) {
                const element = _coords1[index];
                if (_coords2.join().includes(element.join()) && matchCoords == null) {
                    matchCoords = element;
                    nextMatchFeature = feat;
                    break;
                };
            }
        });
    } catch (error) {
        console.log(error)
        console.log(feature)
    }
    if (matchCoords == null)
        matchCoords = feature.geometry.coordinates;
    return { matchedCoords: matchCoords, nextObj: nextMatchFeature }
}
let polyline = null;
let focusedInput;
createRoute = async (source_lat, source_long, dest_lat, dest_long) => {
    // Show loader
    document.getElementById('loader').style.display = 'flex';

    const response = await fetch(`http://localhost:5000/leastCostPath?sLat=${source_lat}&sLong=${source_long}&dLat=${dest_lat}&dLong=${dest_long}`);
    const data = await response.json();
    console.log(data);
    const d = data;
    let _cords = []
    let data_copy = [...d.features];
    let feature = null, match = null;
    for (let index = 0; index < d.features.length - 1; index++) {
        if (index == 0) {
            feature = d.features[index];
            data_copy.splice(0, 1);
            match = this.getMatchCords(feature, data_copy)
        }
        else {
            feature = match.nextObj;
            const indexCopy = data_copy.indexOf(feature);
            if (indexCopy > -1) { // only splice array when item is found
                data_copy.splice(indexCopy, 1); // 2nd parameter means remove one item only
            }
            match = this.getMatchCords(feature, data_copy)
            // console.log(data_copy.length)
        }
        _cords.push(match.matchedCoords)
    }
    // Define an array of coordinates (latitude, longitude)
    let coordinates = [];
    _cords = _cords.filter(x => x != null)
    _cords.forEach(lnglat => {
        coordinates.push(Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1]));
    });
    // var coordinates = [
    //     Cesium.Cartesian3.fromDegrees(-75, 40),
    //     Cesium.Cartesian3.fromDegrees(-80, 35),
    //     Cesium.Cartesian3.fromDegrees(-85, 30)
    // ];

    // Create a Polyline entity
    if (polyline != null) {
        //remove
        viewer.entities.remove(polyline)
    }
    polyline = viewer.entities.add({
        polyline: {
            positions: coordinates,
            width: 5,
            material: Cesium.Color.RED
        }
    });
    // debugger
    // Hide Loader
    document.getElementById('loader').style.display = 'none';
    // Fly to the extent of the line
    viewer.zoomTo(polyline);
    var polylineLength = calculatePolylineLength(coordinates);
    let time = calculateTime(polylineLength)
    document.getElementById('Distance').innerHTML = `${polylineLength.toFixed(2)} Km`
    document.getElementById('Time').innerHTML = `${time.hrs} h ${time.min} min ${time.sec} sec`
    document.getElementById('Speed').innerHTML = `5 Km/h`
    // console.log('Distance:', polylineLength.toFixed(2), 'KM');
    // console.log( time.hrs,'hrs',time.min,'min', time.sec,'sec');

}
let btnCreateRouteOnMap = document.getElementById('routeData');

btnCreateRouteOnMap.addEventListener('click', function () {
    let source = document.getElementById('source').value
    let destination = document.getElementById('destination').value
    let sourceCoords = source.split(',')
    let destinationCoords = destination.split(',')
    let source_lat = sourceCoords[0];
    let source_long = sourceCoords[1];
    let dest_lat = destinationCoords[0];
    let dest_long = destinationCoords[1];
    // console.log(source_lat,source_long,dest_lat,dest_long)
    createRoute(source_lat, source_long, dest_lat, dest_long);
});



// Function to calculate the length of a polyline
calculatePolylineLength = (positions) => {
    var totalDistance = 0;
    for (var i = 0; i < positions.length - 1; i++) {
        var startCartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        var endCartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);

        var start = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(startCartographic.longitude), Cesium.Math.toDegrees(startCartographic.latitude), startCartographic.height);
        var end = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(endCartographic.longitude), Cesium.Math.toDegrees(endCartographic.latitude), endCartographic.height);

        totalDistance += Cesium.Cartesian3.distance(start, end) / 1000;
    }
    return totalDistance;
}

calculateTime = (distance) => {
    let time = distance / 5
    let hours = Math.floor(time);
    let minDeci = (time % 1) * 60
    let minutes = Math.floor((time % 1) * 60);
    let seconds = Math.floor((minDeci % 1) * 60);
    return {
        hrs: hours,
        min: minutes,
        sec: seconds
    };
}
viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapServiceImageryProvider({
        url: "http://localhost:8080/geoserver/M13/wms",
        layers: "JK_AOI",
        parameters: {
            transparent: true,
            format: "image/png"
        },
    })
);

handler.setInputAction(function (clickEvent) {
    var position = clickEvent.position;
    var cartesian = viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid);
    if (Cesium.defined(cartesian)) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        long = Cesium.Math.toDegrees(cartographic.longitude);
        lat = Cesium.Math.toDegrees(cartographic.latitude);
        console.log('Latitude:', lat, 'Longitude:', long);
        if (focusedInput) {
            // Insert lat and long into the focused input
            focusedInput.value = lat + ', ' + long;
        }
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

const inputBoxes = document.querySelectorAll('input[type="text"]');
inputBoxes.forEach(function (input) {
    input.addEventListener('focus', function () {
        // Set the focused input
        focusedInput = this;
    });
});