function add_ImageryLayer(url, layers) {
    return viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapServiceImageryProvider({
            url: url,
            layers: layers,
            parameters: {
                transparent: true,
                format: "image/png",
            },
        })
    );
}
//Add tiff image
let unpublished_layers = [
    {
        "Value": "None",
        "Text": "Select Image",
        "Image": "No_Image"
    },
    {
        "Value": "Cona.tif",
        "Text": "Cona",
        "Image": "image_layer1"
    },
    {
        "Value": "Nyingchi.tif",
        "Text": "Nyingchi",
        "Image": "image_layer2"
    },
    {
        "Value": "Quxu.tif",
        "Text": "Quxu",
        "Image": "image_layer3"
    },
    {
        "Value": "Zhongbo.tif",
        "Text": "Zhongbo",
        "Image": "image_layer4"
    },
    {
        "Value": "BuildingFootprint.shp",
        "Text": "BuildingFootprint",
        "Image": "shape_layer1"
    },
    {
        "Value": "espana.shp",
        "Text": "espana",
        "Image": "shape_layer3"
    },
    {
        "Value": "francia.shp",
        "Text": "francia",
        "Image": "shape_layer3"
    },
    {
        "Value": "gibraltar.shp",
        "Text": "gibraltar",
        "Image": "shape_layer3"
    }
];
let published_layers = [
    {
        "Value": "None",
        "Text": "Select Layer",
    }
];
base_url = "http://localhost:8080/geoserver/M13/wms";
layers_name = new Array(4);
layers_name[0] = 'M13:Cona';
var options = ["Cona", "Nyingchi", "Quxu", "Zhongbo",];
var all_list = ["", "espana", "BuildingFootprint", "portugal", "gibraltar", "Cona", "Nyingchi", "Quxu", "Zhongbo",];
tiff_extent = [];
tiff_extent.push({ layer: 'BUILTUP', extent: [75.12923572284986, 32.768692326161656, 75.16410834810661, 32.8014197027598] });
tiff_extent.push({ layer: 'RAILWAYS', extent: [75.13081401670453, 32.768749924804375, 75.15471049840816, 32.801194786190855] });
tiff_extent.push({ layer: 'ROAD', extent: [75.12915040966848, 32.768658148503256, 75.16320458788465, 32.80143133637544] });
tiff_extent.push({ layer: 'WATER', extent: [75.12918789576324, 32.774058189839316, 75.15741932020538,32.80143366100094] });
tiff_extent.push({ layer: 'DEM', extent: [75.129027778, 32.76875, 75.164583333, 32.801527778] });
tiff_extent.push({ layer: 'JK_AOI', extent: [75.12917497, 32.768674903, 75.164747981, 32.801430093] });

layer_list = [];
let selectUploadTiffFile = document.getElementById('myDropdown');
let selectUploadShpFile = document.getElementById('myDropdown2');
let ddlPublishedLayers = document.getElementById('tiffImage');
let btnAddLayerOnMap = document.getElementById('tiffdata');
let fileUploader = document.getElementById('browseFile');
let btnAddLayer = document.getElementById('addLayer');

//Publish tiff image
let apiUrl = "http://localhost:3000/PublishLayer";
let apiUrl2 = "http://localhost:3000/GetNameOfPublishLayer";
let shpapiUrl = "http://localhost:3000/PublishShpLayer";
function CreateStoreAndPublishTiffImage(workspace, datastore, layerName, filePath) {
    console.log(`${apiUrl}?workspace=${workspace}&datastore=${datastore}&layername=${layerName}&filePath=${filePath}`);
    return (`${apiUrl}?workspace=${workspace}&datastore=${datastore}&layername=${layerName}&filePath=${filePath}`);
}
function GetPublishedLayers(workspace) {
    console.log(`${apiUrl2}?workspaceName=${workspace}`);
    return (`${apiUrl2}?workspaceName=${workspace}`);
}
var lyr_workspace = 'M13';
getPublishedLayers=()=>{
    fetch(GetPublishedLayers(lyr_workspace))
    .then(function (response) {
        return response.json();
    })
    .then(function (data_layer) {
        console.log("Data Layer", data_layer)
        data_layer.data.forEach((element) => {
            layer_list.push(element);
            published_layers.push({
                "Value": unpublished_layers.filter(x => x['Text'] == element)[0],
                "Text": element
            });
        });
        for (var i = 0; i < layer_list.length; i++) {
            var option = document.createElement("option");
            option.text = layer_list[i];
            option.value = i;
            ddlPublishedLayers.appendChild(option);
        }
    })
    .catch(function (error) {
        console.error('Failed to get GetPublishedLayers:', error);
    });
// add Options list in select 
for (var i = 0; i < options.length; i++) {
    var option = document.createElement("option");
    option.text = options[i];
    option.value = i;   //options[i];
    selectUploadTiffFile.appendChild(option);
}
}
let file_name;
let datastoreName;
let workspace = 'M13';
selectUploadTiffFile.addEventListener('change', function () {
    for (var i = 0; i < options.length; i++) {
        if (this.value == i) {
            file_name = options[i] + ".tif";
            break;
        }
    }
    // datastoreName =options.selectedOptions[0].innerHTML;
    const file = file_name;
    datastoreName = file.split('.')[0];
    let filePath = `C:/Users/Admin/Documents/Akash/tiff_images/${file}`;
    // debugger
    if (selectUploadTiffFile.selectedOptions[0].innerHTML == 'Select') {
        alert('please select the layer');
    }
    else if (published_layers.filter(x => x['Text'] == datastoreName).length > 0) {
        alert('"' + file_name + '"' + '  Layer already published on server!');
    }
    else {
        fetch(CreateStoreAndPublishTiffImage(workspace, datastoreName, datastoreName, filePath))
            .then(function (response) {
                return response.json();
            })
            .then(function (data_layer) {
                alert('"' + file_name + '"' + 'Layer publish  on GeoServer');
                console.log("Data", data_layer)
            })
            .catch(function (error) {
                console.error('Failed to get Name:', error);
            });
    }
}, false);
//Publish Shpae Layer
// let unpublishedShap_layers = [
//     {
//         "Value": "None",
//         "Text": "Select Image",
//         "Image": "No_Image"
//     },
//     {
//         "Value": "BuildingFootprint.shp",
//         "Text": "BuildingFootprint",
//         "Image": "shape_layer1"
//     },
//     {
//         "Value": "espana.shp",
//         "Text": "espana",
//         "Image": "shape_layer3"
//     },
//     {
//         "Value": "francia.shp",
//         "Text": "francia",
//         "Image": "shape_layer3"
//     },
//     {
//         "Value": "gibraltar.shp",
//         "Text": "gibraltar",
//         "Image": "shape_layer3"
//     }
// ];
// let publishedShp_layers = [
//     {
//         "Value": "None",
//         "Text": "Select Layer",
//     }
// ];
var shape_name = ["espana", "gibraltar", "BuildingFootprint", "portugal"];
for (var i = 0; i < shape_name.length; i++) {
    var option = document.createElement("option");
    option.text = shape_name[i];
    option.value = i;     //shape_name[i];
    selectUploadShpFile.appendChild(option);
}
let file_name1;
let datastoreName1;
selectUploadShpFile.addEventListener('change', function () {
    for (var i = 0; i < shape_name.length; i++) {
        if (this.value == i) {
            file_name1 = shape_name[i];
            break;
        }
    }
    console.log(file_name1);
    datastoreName1 = file_name1.split('.')[0];
    //const file = event.target.value;
    const file = file_name1;
    //  debugger;  
    // let filePath = `D:/shepimages/${file}`;  
    if (selectUploadShpFile.value == 'Select') {
        alert('please select the layer');
    }
    else if (published_layers.filter(x => x['Text'] == datastoreName1).length > 0) {
        alert('"' + file + '"' + '  Layer already published on server!');
    }
    else {
        let apiUrl3 = `http://localhost:3000/PublishShpLayer?workspace=${workspace}&datastore=${datastoreName1}&layername=${file}`;
        fetch(apiUrl3)
            .then(function (response) {
                if (response.status === 200) {
                    return response.json();  // Assuming the response is in JSON format
                } else {
                    throw new Error('Request failed with status: ' + response.status);
                }
            })
            .then(function (data_layer) {
                console.log("Data Layer", data_layer);
                alert('"' + file + '"' + ' Layer published on GeoServer');
            })
            .catch(function (error) {
                console.error('Failed to get data:', error);
            });
    }
}, false);
let published_layer;
btnAddLayerOnMap.addEventListener('click', function () {
    // viewer.dataSources.removeAll(); 
    // debugger
    published_layer = ddlPublishedLayers.selectedOptions[0].innerHTML
    let layerExtent = tiff_extent.filter(ext => ext.layer == published_layer)[0].extent
    console.log(published_layer);
    var rectangle = Cesium.Rectangle.fromDegrees(layerExtent[0], layerExtent[1], layerExtent[2], layerExtent[3]);
    viewer.camera.flyTo({
        destination: rectangle
    });
    add_ImageryLayer("http://localhost:8080/geoserver/M13/wms", published_layer, "1=1");
}, false);

// fileGetFromLocal   btnAaddLayerFromLocal;
publisShpOnGeoserver = (apiUrl) => {
    debugger
    fetch(apiUrl)
        .then(function (response) {
            if (response.status === 200) {
                return response.json();  // Assuming the response is in JSON format
            } else {
                throw new Error('Request failed with status: ' + response.status);
            }
        })
        .then(function (data_layer) {
            console.log("Data Layer", data_layer);
            alert('"' + fileName + '"' + ' Layer published on GeoServer');
        })
        .catch(function (error) {
            console.error('Failed to get data:', error);
        });
}
publishTiffOnGeoserver = (workspace, datastoreName, layerName, filePath) => {
    fetch(CreateStoreAndPublishTiffImage(workspace, datastoreName, layerName, filePath))
        .then(function (response) {
            return response.json();
        })
        .then(function (data_layer) {
            alert('"' + fileName + '"' + 'Layer publish  on GeoServer');
            console.log("Data", data_layer)
        })
        .catch(function (error) {
            // alert('Please publish Layer on GeoServer');
            console.error('Failed to get Name:', error);
        });

}
let fileName = null;
fileUploader.addEventListener('change', function (event) {
    const selectedFile = event.target.files[0];
    fileName = selectedFile ? selectedFile.name : 'No file selected';
    let datastoreName = fileName.split('.')[0];
    if (fileName.split('.')[1].includes("zip")) {
        let apiUrl = `http://localhost:3000/PublishShpLayer?workspace=${workspace}&datastore=${datastoreName}&layername=${datastoreName}`;
        publisShpOnGeoserver(apiUrl)
    }
    else if (fileName.split('.')[1].includes("tif")) {
        let filePath = `C:/Users/Admin/Documents/Akash/tiff_images/${fileName}`;
        publishTiffOnGeoserver(workspace, datastoreName, datastoreName, filePath)
    }

});

btnAddLayer.addEventListener('click', function () {
    if (fileName != null) {
        let layerName = fileName.split('.')[0];
        let layerExtent = tiff_extent.filter(ext => ext.layer == layerName)[0].extent;
        var rectangle = Cesium.Rectangle.fromDegrees(layerExtent[0], layerExtent[1], layerExtent[2], layerExtent[3]);
        viewer.camera.flyTo({
            destination: rectangle
        });
        add_ImageryLayer("http://localhost:8080/geoserver/M13/wms", layerName, "1=1");
    } else {
        //show msg please upload file first
    }
});



