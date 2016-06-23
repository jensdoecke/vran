var world = require('./jquery.vmap.world.de');
var de = require('./dummy');
var filename = 'jquery.vmap.world.de.json';
var jsonfile = require('jsonfile')

// map english names to german names
for(country in world){
  if(de[country.toUpperCase()]){
    world[country].name = de[country.toUpperCase()].name;
  }
}

jsonfile.writeFile(filename, world, function (err) {
  if(err) return console.error(err);

})
