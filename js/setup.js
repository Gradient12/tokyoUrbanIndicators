// Leaflet map setup
var map = L.map('map', {
  center: [35.67, 139.65],
  zoom: 12
});

var basemap =
L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  minZoom: 9,
  maxZoom: 14,
  ext: 'png'
});

map.addLayer(basemap);

// my map on cartodb
var layerUrl = 'https://gradient.cartodb.com/api/v2/viz/558b58be-0b6f-11e6-8c4d-0e5db1731f59/viz.json';

var sqlClient = new cartodb.SQL({
  user: 'gradient',
});


var numStations=null;

// Use of CartoDB.js
cartodb.createLayer(map, layerUrl)
  .addTo(map)
  .on('done', function(layer) {
    updateInfoForTokyo(layer);

    // test(layer);

    layer.on('featureClick', function(e, latlng, pos, data) {
    //   console.log(e,data);
      if(data.hasOwnProperty('nl_name_2')){ // this is a town, not a station
          console.log('User clicked a town in Tokyo.');
          selectStationsInTown(layer,data.nl_name_2);
          updateNumberOfStationsInTown(data.nl_name_2);
          updatePlaceCheckbox(data.name_2);
      }
      else{
          console.log('User clicked something (a station), not a town in Tokyo. Show Tokyo\'s statistics.');
          updateInfoForTokyo(layer);
      }
    });

  }).on('error', function(err) {
      console.log(err);
  });

function updateInfoForTokyo(layer){
    selectStationsInTokyo(layer);
    updateNumberOfStationsInTokyo();
    updatePlaceCheckbox('Tokyo');
}


function updateNumberOfStationsInTown(townName){
    // console.log('getting number');
    sql = generateCountSql('japan_sub_jr_pr', 'jpn_adm_town', 'nl_name_2', townName);
    sqlClient.execute(sql)
      .done(function(data) {
          try{
              var n = data.rows[0].count;

              numStations = n;

              $('#num-stations').empty();
              $('#num-stations').append('<p class="number"> '+ n +'<span class="facility-label">stations</span></p>');

              plotTownStationDistribution();
          }
          catch(err){}
      })
      .error(function(errors) {
          console.log("errors:" + errors);
      });

}

function updateNumberOfStationsInTokyo(){
    sql = generateCountSql('japan_sub_jr_pr', 'jpn_adm_prefecture', 'name_1', 'Tokyo');
    console.log(sql);
    sqlClient.execute(sql)
      .done(function(data) {
          try{
            //   console.log(data);
              var n = data.rows[0].count;

              numStations = n;

              $('#num-stations').empty();
              $('#num-stations').append('<p class="number"> '+ n +'<span class="facility-label">stations</span></p>');
          }
          catch(err){}
      })
      .error(function(errors) {
          console.log("errors:" + errors);
      });
}

function updatePlaceCheckbox(name){
    $('#place').empty();
    $('#place').append(
    '<label class="btn btn-success active"> <input id="chk-' + name + '" type="checkbox" checked autocomplete="off">'+
     name + '</label>');
}
