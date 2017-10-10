require([
    "esri/tasks/Locator",
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/TileLayer",
    "dojo/dom",  // require dojo/dom for getting the DOM element
    "dojo/on",   // require dojo/on for listening to events on the DOM
    "dojo/domReady!",
   
], function (Locator, Map, SceneView, TileLayer, dom, on) {

     //Create a locator task using the world geocoding service
    var locatorTask = new Locator({
        url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
    });

    //Execute a reverse geocode using the clicked location
    locatorTask.locationToAddress(event.mapPoint).then(function (response) {
        //If an address is successfully found, show it in the popup's content
        view.popup.content = response.address;
    }).otherwise(function (err) {
        //If the promise fails and no result is found, show a generic message
        view.popup.content = "No address was found for this location";
    })

    var streetsLyrToggle = dom.byId("streetsLyr");

    on(streetsLyrToggle, "change", function () {
        // When the checkbox is checked (true), set the layer's visibility to true
        transportationLyr.visible = streetsLyrToggle.checked;
    });

    var transportationLyr = new TileLayer({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
        id: "streets",
        opacity: 0.7
    });

    var housingLyr = new TileLayer({
        url: "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Housing_Density/MapServer",
        id: "ny-housing"
    });

    housingLyr.then(function () {
        view.goTo(housingLyr.fullExtent);
    })

    var map = new Map({
        basemap: "streets",
        layers: [housingLyr]
    });

    var view = new SceneView({
        container: "viewDiv",  // Reference to the DOM node that will contain the view
        map: map,               // References the map object created in step 3
        scale: 50000000,
        center: [-116.3031, 43.6088],
        zoom: 12,
    });

    view.on("click", function (event) {
        event.stopPropagation();

        //Get the coordinates of the click on teh view
        //Round to 3 decimals
        var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
        var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

        view.popup.open({
            //Set the popup's title to the coordinates of the clicked location
            title: "Reverse geocode: [" + lon + ", " + lat + "]",
            location: event.mapPoint // Set the location of the popup to the clicked location
        });
    });


    map.layers.add(transportationLyr);

    view.on("layerview-create", function (event) {
        if (event.layer.id === "ny-housing") {
            //Explore the properties of the housing layer's layer view here
            console.log('LayerView for New York housing density created!', event.layerView);
        }
        if (event.layer.id === "streets") {
            //Explore the properties of the housing layer's layer view here
            console.log("LayerView for streets created!", event.layerView);

        }
    })

});