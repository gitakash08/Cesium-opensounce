
let viewer = new Cesium.Viewer('cesiumContainer', {
    selectionIndicator: true,
    baseLayerPicker: true,
    geocoder: true,
    homeButton: false,
    navigationHelpButton: false,
    sceneModePicker: true,
    timeline: false,
    animation: false,
    infoBox: true,
    // baseLayer: new Cesium.ImageryLayer(
    //     new Cesium.TileMapServiceImageryProvider({
    //         url: Cesium.buildModuleUrl("../Cesium/Assets/Textures/NaturalEarthII") + '/{z}/{x}/{reverseY}.jpg',
    //         tilingScheme: new Cesium.GeographicTilingScheme(),
    //         maximumLevel: 2
    //     }))
});
//Tab Switching logic starts from here
// Function to open a specific tab
function openTab(evt, tabName) {
    if (tabName == 'tab2') {
        $('#example-table').css('display', 'block');
        //$('#customInfoBox').css('display','block');
        
    }
    if (tabName == 'tab1') {
        //$('#example-table').css('display', 'block')
        $('#customInfoBox').css('display','none');
    }
    if (tabName == 'tab3') {
        //$('#example-table').css('display', 'block')
        $('#customInfoBox').css('display','none');
    }
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.className += " active";
}
document.getElementsByClassName("tablinks")[0].click();

//Tab Switching logic ends here 
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
var selectionRectangle = document.getElementById('selectionRectangle');
let PincodeLayer;
let pincodeLayerVector;
let dataSourceVect;
var selectedFeature;
let vectorFeatures = null;
let tabledata = [];
var isDragging = false;
var startPosition;
var endPosition;
var enableDraw = false;
let builtUpArealayer = null;
let roadLayer = null;
let waterBodiesLayer = null;
let heightLayer = null;
let AOI_SELECTION = null;
var selectedValues = [];
let vecSourceObject;

function handleCheckboxChange(checkbox) {
    if (checkbox.checked) {
        selectedValues.push(checkbox.value);
    } else {
        var index = selectedValues.indexOf(checkbox.value);
        if (index !== -1) {
            selectedValues.splice(index, 1);
        }
    }
    // console.log("Selected values: " + selectedValues);
}
addImageryLayer = (url, layers, cqlQuery) => {
    console.log(cqlQuery)
    return viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapServiceImageryProvider({
            url: url,
            layers: layers,
            parameters: {
                transparent: true,
                format: "image/png",
                CQL_FILTER: cqlQuery
            },
        })
    );
}
addWfsVectorLayer = (wfsUrl, typeName, maxFeatures, username, password, dataSource) => {
    const dataUrl = `${wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${typeName}&
                       maxFeatures=${maxFeatures}&outputFormat=application%2Fjson`;
    const credentials = btoa(`${username}:${password}`);
    const geoJsonPromise = Cesium.Resource.fetchJson({
        url: dataUrl,
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });
    return geoJsonPromise.then(function (geoJson) {
        let _promise = Cesium.GeoJsonDataSource.load(geoJson, {
            sourceUri: dataUrl,
        });
        _promise.then(function (_dataSourceVect) {
            vectorFeatures = _dataSourceVect._entityCollection._entities._array;
            dataSourceVect = _dataSourceVect;
            //  viewer.dataSources.add(_dataSourceVect);
            // console.log(_dataSourceVect._entityCollection._entities._array[0].id)
            // if (_dataSourceVect._entityCollection._entities._array[0].id.includes("ROAD"))
            //     roadLayer = _dataSourceVect;
            // if (_dataSourceVect._entityCollection._entities._array[0].id.includes("Urban_BuildingBlock"))
            //     builtUpArealayer = _dataSourceVect;
            // if (_dataSourceVect._entityCollection._entities._array[0].id.includes("Urban_Water"))
            //     waterBodiesLayer = _dataSourceVect;
            // if (_dataSourceVect._entityCollection._entities._array[0].id.includes("Contour_pt")) {
            //     heightLayer = _dataSourceVect;
            //     vecSourceObject = {
            //         'builtUpArea': builtUpArealayer,
            //         'road': roadLayer,
            //         'waterbodies': waterBodiesLayer,
            //         'height': heightLayer

            //     }
            //     console.log(vecSourceObject)
            // }
            AOI_SELECTION = dataSourceVect
        });
        if (dataSourceVect != undefined)
            return dataSourceVect;
    });
}
addImageLayerOnMap = () => {
    viewer.dataSources.removeAll();
    if (!PincodeLayer)
        PincodeLayer = addImageryLayer("http://localhost:8080/geoserver/AKB/wms", "PINCODE_CITY_NAME", "1=1");
}
addVectorLayer = async () => {
    const wfsUrl = 'http://localhost:8080/geoserver/M13/ows';
    const maxFeatures = 1000;
    const username = 'admin';
    const password = 'geoserver';
    await addWfsVectorLayer(wfsUrl, 'M13:AOI_SELECTION', maxFeatures, username, password);
    // await addWfsVectorLayer(wfsUrl, 'M13:ROAD', maxFeatures, username, password);
    // await addWfsVectorLayer(wfsUrl, 'M13:Urban_BuildingBlock', maxFeatures, username, password);
    // await addWfsVectorLayer(wfsUrl, 'M13:Urban_Water', maxFeatures, username, password);
    // await addWfsVectorLayer(wfsUrl, 'M13:Contour_pt', maxFeatures, username, password);

}
addWfsVectorLayerFilter = (wfsUrl, typeName, maxFeatures, username, password) => {
    const dataUrl = `${wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${typeName}&maxFeatures=${maxFeatures}&outputFormat=application%2Fjson`;
    const credentials = btoa(`${username}:${password}`);
    const geoJsonPromise = Cesium.Resource.fetchJson({
        url: dataUrl,
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });
    return geoJsonPromise.then(function (geoJson) {
        const dataSourceVect = Cesium.GeoJsonDataSource.load(geoJson, {
            sourceUri: dataUrl,
        });
        dataSourceVect.then(function (dataSourceVect) {
            dataSourceVect._entityCollection._entities._array =
                dataSourceVect._entityCollection._entities._array.filter(_en => parseInt(_en._properties._POP_21.getValue()) >= 2000000)
            vectorFeatures = dataSourceVect._entityCollection._entities._array;
            viewer.dataSources.add(dataSourceVect);
            tabledata = dataSourceVect._entityCollection._entities._array.map(en => en.properties.getValue(dataSourceVect._entityCollection._entities._array[0].properties._propertyNames))
            tableshow(tabledata);
        });
        return dataSourceVect;
    });
};
tableshow = (data) => {
    $('#example-table').css('display', 'block');
    table = new Tabulator("#example-table", {
        data: data,
        height:"250px",
        layout:"fitColumns",
        autoColumns: true,
        movableColumns: true,
        pagination:"local",
        paginationSize:20,  
    });
    
}
// viewer.camera.flyTo({
//     destination: Cesium.Cartesian3.fromDegrees(
//         parseFloat(77.27566416562647),
//         parseFloat(28.70174765788683),
//         3000000
//     ),
// });
updateCqlFilterAndImageryLayer = (column, value, logicalOperator, _extent) => {
    let cqlFilter = buildCqlFilterImageLayer(column, value, logicalOperator, _extent);
    console.log(cqlFilter);
    viewer.imageryLayers.remove(PincodeLayer);
    PincodeLayer = addImageryLayer("http://localhost:8080/geoserver/AKB/wms", "PINCODE_CITY_NAME", cqlFilter);
}
filterVectorDataByExtent = (dataSource, extent) => {
    viewer.dataSources.removeAll();
    const _dataSource = new Cesium.CustomDataSource();
    let _entites = []
    var bboxPolygon = turf.bboxPolygon(extent);
    let features = dataSource._entityCollection._entities._array;
    features.forEach(_entity => {
        if (selectedValues.includes(_entity.properties._NAME._value ) || _entity.properties._NAME._value === 'Roads') {
        let _positionsLatLng = []
        let _positions = []
        try {
            if (_entity._polygon != undefined)
                _positions = _entity._polygon._hierarchy._value.positions;
            if (_entity._polyline != undefined)
                _positions = _entity._polyline._positions._value;
            if (_entity._point != undefined)
                _positions = _entity._point.positions._value;
           // console.log(_positions)
            if (_positions.length > 0)
             {
                _entity._polygon._hierarchy._value.positions.forEach(_pos => {
                    let _latlng = cartesianToLatlng(_pos);
                    _positionsLatLng.push([_latlng[0], _latlng[1]])
                });
                var entityPoly = turf.polygon([
                    _positionsLatLng
                ]);
                if (turf.booleanIntersects(bboxPolygon, entityPoly)) {
                    _entites.push(_entity)
                    _dataSource.entities.add(_entity);
                }
            }
        } catch (error) {
            //   console.log(_entity)  
        }
    }
    });
    // tabledata = dataSourceVect._entityCollection._entities._array.map(en => en.properties.getValue(dataSourceVect._entityCollection._entities._array[0].properties._propertyNames))
    viewer.dataSources.add(_dataSource);
    return _dataSource
}

filterVectorLayer = () => {
    if (pincodeLayerVector) {
        viewer.dataSources.removeAll();
        const wfsUrl = 'http://localhost:8080/geoserver/AKB/ows';
        const typeName = 'AKB:India_District';
        const maxFeatures = 1000;
        const username = 'admin';
        const password = 'geoserver';
        addWfsVectorLayerFilter(wfsUrl, typeName, maxFeatures, username, password)
    } else {
        alert('No vector Layer on Map!!');
    }
    return
}
buildCqlFilterImageLayer = (column, value, logicalOperator, _extent) => {
    if (column && value !== undefined && logicalOperator && _extent == '') {
        return `${column} ${logicalOperator} ${value}`;
    } else if (column && value !== undefined && logicalOperator && _extent) {
        return _extent;
    }
    return "1=1";
}
buildFilterVectorLayer = () => {
}
filterDataClick = () => {
    if (PincodeLayer) {
        updateCqlFilterAndImageryLayer("TOT_POP", 300000, ">", '');
    } else {
        alert('No layers on the Map!!');
    }
    return
}
ResetFilter = () => {
    viewer.dataSources.removeAll();
    //dataSourceVect = null;
    viewer.dataSources.remove(dataSourceVect);
    //viewer.imageryLayers.remove(PincodeLayer);
    //PincodeLayer = null;
    $('#example-table').css('display', 'none');
    $('#customInfoBox').css('display', 'none');

}
cartesianToLatlng = (cartesian) => {
    var latlng = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    var lat = Cesium.Math.toDegrees(latlng.latitude);
    var lng = Cesium.Math.toDegrees(latlng.longitude);
    var alt = latlng.height;
    return [lng, lat, alt];
}
StartDrawing = () => {
    $('#button_Tool').css('background-color', 'green');
    // $('#customInfoBox').css('display', 'none');
    
        enableDraw = true;
        $('#button_Tool').html('Tool Enabled');
    // else {
    //     alert('No layer on the map to filter!!');
    //     enableDraw = false;
    //     $('#button_Tool').css('background-color', '#071952');
    // }
    //enableDraw = false;
}
disableMapMovement = () => {
    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.scene.screenSpaceCameraController.enableTranslate = false;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;
}
enableMapMovement = () => {
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableLook = true;
}
collapseSidePanel = () => {
    $('.expandButton').css('display', 'flex');
    $('.collapseButton').css('display', 'none');
    $('#SidePanel').css('display', 'none');
    $('#SidePanel').addClass('col-lg-1 col-md-5 col-sm-6 p-0');
    $('#map1').removeClass('col-lg-9 col-md-7 col-sm-6 p-0');
    $('#map1').addClass('col-lg-12 col-md-7 col-sm-6 p-0');
}
expandSidePanel = () => {
    $('#SidePanel').css('display', 'block');
    $('.collapseButton').css('display', 'flex');
    $('.expandButton').css('display', 'none');
    $('#map1').removeClass('col-lg-12 col-md-7 col-sm-6 p-0');
    $('#SidePanel').addClass('col-lg-3 col-md-5 col-sm-6 p-0');
    $('#map1').addClass('col-lg-9 col-md-7 col-sm-6 p-0');
}

let highlightedFeature = null;
resetHighlight = (feature) => {
    if (highlightedFeature && highlightedFeature.polygon) {
        highlightedFeature.polygon.material = Cesium.Color.YELLOW;
    }

    if (feature.polygon) {
        feature.polygon.material = Cesium.Color.BLUE;
        highlightedFeature = feature;
    }
};

updateAttribute = (feature) => {
    const wfsUrl = 'http://localhost:8080/geoserver/M13/ows';
    const typeName = 'M13:AOI_SELECTION';
    const maxFeatures = 1000;
    const username = 'admin';
    const password = 'geoserver';
    const credentials = btoa(`${username}:${password}`);
    
    var fid = feature._id;
    var xmlData = `<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        version="1.1.0"
        service="WFS"
        xsi:schemaLocation="http://www.opengis.net/wfs ${wfsUrl}">
        <wfs:Update typeName="${typeName}">
            <wfs:Property>
                <wfs:Name>id</wfs:Name>
                <wfs:Value>${id_}</wfs:Value>
            </wfs:Property>

            <wfs:Property>
                <wfs:Name>NAME</wfs:Name>
                <wfs:Value>${name_}</wfs:Value>
            </wfs:Property>

            <ogc:Filter>
                <ogc:FeatureId fid="${fid}"/>
            </ogc:Filter>
        </wfs:Update>
    </wfs:Transaction>`;

    $.ajax({
        url: wfsUrl,
        type: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
        },
        dataType: 'xml',
        data: xmlData,
        contentType: 'text/xml',
        success: function (data) {
            alert('Attribute updated successfully:', data);
            viewer.dataSources.removeAll();
            addVectorLayer();
            $('#customInfoBox').css("display", "none");
        },
        error: function (error) {
            console.error('Error updating attribute:', error);
        }
    });
}
let originalContent = '';
editContent = () => {
    originalContent = document.getElementById('editableTable').innerHTML;
    let editableElements = document.getElementsByClassName('editable');
    for (let i = 0; i < editableElements.length; i++) {
        let element = editableElements[i];
        element.contentEditable = true;
        element.setAttribute('data-original-value', element.innerText);
    }
}
let id_ = null, name_ = null;
saveChanges = () => {
    let editableElements = document.getElementsByClassName('editable');
    for (let i = 0; i < editableElements.length; i++) {
        editableElements[i].contentEditable = false;
    }
    for (let i = 0; i < editableElements.length; i++) {
        
        let currentValue = editableElements[i].innerText.trim();
        if (editableElements[i].getAttribute('data-key') == '_ID') {
            id_ = currentValue;
        } else if (editableElements[i].getAttribute('data-key') == '_Name') {
            name_ = currentValue;
        }
    }
    //resetHighlight()
    if(name_ == 'Road' || name_ == 'Water Body' || name_ == 'Rail Track' || name_ =='BUILTUP'){
        updateAttribute(selectedFeature);
    }else{
        alert(`You can updated value such as Water Body or Rail Track or BUILTUP or Roads`);
        return false;
    }
    
}

handler.setInputAction(function (click) {
    if (enableDraw) {
        startPosition = new Cesium.Cartesian2(click.position.x, click.position.y);
        isDragging = true;
    }
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
handler.setInputAction(function (movement) {
    if (enableDraw) {
        if (isDragging) {
            disableMapMovement();
            endPosition = new Cesium.Cartesian2(movement.endPosition.x, movement.endPosition.y);
            var top = Math.min(startPosition.y, endPosition.y);
            var left = Math.min(startPosition.x, endPosition.x);
            var width = Math.abs(startPosition.x - endPosition.x);
            var height = Math.abs(startPosition.y - endPosition.y);
            selectionRectangle.style.top = top + 'px';
            selectionRectangle.style.left = left + 'px';
            selectionRectangle.style.width = width + 'px';
            selectionRectangle.style.height = height + 'px';
            selectionRectangle.style.display = 'block';
        }
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
handler.setInputAction(function () {
    if (isDragging) {
        isDragging = false;
        selectionRectangle.style.display = 'none';
        var startWorld = cartesianToLatlng(viewer.camera.pickEllipsoid(new Cesium.Cartesian2(startPosition.x, startPosition.y), viewer.scene.globe.ellipsoid));
        var endWorld = cartesianToLatlng(viewer.camera.pickEllipsoid(new Cesium.Cartesian2(endPosition.x, endPosition.y), viewer.scene.globe.ellipsoid));
        if (startWorld && endWorld) {
            var west = (Math.min(startWorld[0], endWorld[0])); //min x
            var east = (Math.max(startWorld[0], endWorld[0])); //max x
            var south = (Math.min(startWorld[1], endWorld[1])); // min y
            var north = (Math.max(startWorld[1], endWorld[1])); //max y
            _extent = [west, south, east, north];
        }
        let CQL_FILTER = "BBOX(the_geom, " + _extent.join(',') + ")"
        if (PincodeLayer) {
            updateCqlFilterAndImageryLayer("TOT_POP", 300000, ">", CQL_FILTER);
            enableDraw = false;
            $('#button_Tool').css('background-color', '#071952');
            $('#button_Tool').html('Start Drag');
            enableMapMovement();
            return false
        } else {
            if(selectedValues.length !=0){
                console.log(AOI_SELECTION)
                // viewer.dataSources.removeAll();
                // selectedValues.forEach(_val => {
                //     let selectedSource = vecSourceObject[_val]
                //     let data = filterVectorDataByExtent(selectedSource, _extent);
                //     console.log(selectedSource)
                //     console.log(data)
                // })
                tabledata = []
                let data = filterVectorDataByExtent(AOI_SELECTION, _extent);
                // console.log(data)
                
                tabledata = data._entityCollection._entities._array.map(en => en.properties.getValue(dataSourceVect._entityCollection._entities._array[0].properties._propertyNames))
                tableshow(tabledata);
                $('#example-table').css('display', 'block');
                enableDraw = false;
                $('#button_Tool').css('background-color', '#071952');
                $('#button_Tool').html('Start Drag');
                enableMapMovement();
            }else{
                viewer.dataSources.removeAll();
                //$('#example-table').css('display', 'none');
                alert('Please select atleast one layer')
            }
            enableMapMovement();
        }
    }
}, Cesium.ScreenSpaceEventType.LEFT_UP);
addVectorLayer()
var extent = new Cesium.Rectangle.fromDegrees(75.11893066178315, 32.76590973991226, 75.17265046526505, 32.80429521681051);
viewer.camera.flyTo({
    destination: extent,
    duration: 2
});

var movableDiv = document.getElementById('example-table');
var offsetX, offsetY;
var isDragging = false;
movableDiv.addEventListener('mousedown', function(e) {
  isDragging = true;
  offsetX = e.clientX - movableDiv.getBoundingClientRect().left;
  offsetY = e.clientY - movableDiv.getBoundingClientRect().top;
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
});
function dragMove(e) {
  if (isDragging) {
    var x = e.clientX - offsetX;
    var y = e.clientY - offsetY;
    movableDiv.style.left = x + 'px';
    movableDiv.style.top = y + 'px';
  }
}
function dragEnd() {
  isDragging = false;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
}

viewer.screenSpaceEventHandler.setInputAction(function (movement) {
   
    var pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        selectedFeature = pickedObject.id;
        resetHighlight(selectedFeature);
        $('#customInfoBox').css('display', 'block');
        let content = '';
        content += '<div id="editableContent" style="max-width: 600px; margin: 0 auto;">' +
            '<table id="editableTable" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;font-style: normal; font-weight: 600; font-size: 12px;">' +
            '<tr>' +
            '<td style="padding: 10px; border: 1px solid #ddd;">ID</td>' +
            '<td style="padding: 10px; border: 1px solid #ddd; cursor: pointer;" class="editable" data-key="_ID" contenteditable="true">' + selectedFeature._properties._id._value + ' </td>' +
            '</tr>' +
            '<tr>' +
            '<td style="padding: 10px; border: 1px solid #ddd;">Name</td>' +
            '<td id="hierarchy" style="padding: 10px; border: 1px solid #ddd; cursor: pointer;" class="editable" data-key="_Name" contenteditable="true">' + selectedFeature._properties._NAME._value + ' </td>' +
            '</tr>' +
            '</table>' +
            '<button class="btn btn-primary" style="padding: 4px 78px;" id="saveButton" onclick="saveChanges()">Save</button>' +
            '</div>';
        $('#customInfoBox').html(content);
        //$('#example-table').css('display', 'none');
    }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

var handler;
handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (movement) {
    const cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        viewer.scene.globe.ellipsoid
    );

    if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(
            cartesian
        );

        const longitudeString = Cesium.Math.toDegrees(
            cartographic.longitude
        ).toFixed(5);
        const latitudeString = Cesium.Math.toDegrees(
            cartographic.latitude
        ).toFixed(5);

        const heightString = Cesium.Math.toRadians(
            cartesian.z
        ).toFixed(5);
        
        // Update the label with the clicked coordinates and altitude
        

        // Update the details in an HTML element
        document.getElementById("CartesianDetails").innerHTML =
            `Lon: ${longitudeString}` +
            `&nbsp \n Lat: ${latitudeString}` +
            `&nbsp \nAltitude: ${heightString}`;
    } else {
        // entity.show = false;
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// addVectorLayer();


