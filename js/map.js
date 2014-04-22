var map; // the map object
var layers = {};
var drawControl;

var wfsPath = '/wfs/featuretypes/nchendersonpoint';

function initMap(){
    // create a map in the "map" div, set the view to a given place and zoom
    map = L.map('map').setView([35.2456445184592, -82.3494501800126], 14);

    layers.BlackAndWhite = L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);

    // Initialize GeoJSON layer
    $.getJSON(wfsPath + '?outputFormat=text/json&outputSrs=epsg:4326', function( data ) {
        layers.geoJson = new L.GeoJSON(data).addTo(map);
        // Initialize the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw({
            draw: false,
            edit: {
                featureGroup: layers.geoJson,
                remove: false
            }
        });

        map.addControl(drawControl);

        map.on('draw:edited', function (e) {
            var layers = e.layers;
            layers.eachLayer(function (layer) {
                if (layer instanceof L.Marker){
                    var newLL = layer.getLatLng();
                    var id = layer.feature._id.substring(layer.feature._id.indexOf('.') + 1);
                    layer.feature.geometry.coordinates = [newLL.lng, newLL.lat];
                    $.ajax({
                        url: wfsPath + '/' + id,
                        type: 'PUT',
                        contentType: "application/json",
                        data: JSON.stringify(layer.feature),
                        success: function(result) {
                            console.log(result);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr.status);
                            console.log(thrownError);
                          }
                    });
                }
            });
        });

    });
}
