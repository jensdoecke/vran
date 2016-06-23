// var daten = require('./misc/daten');
// var de = require('./misc/dummy');
// var filename = './misc/daten.json';

var world = require('./misc/jquery.vmap.world.old.js');
// var jsonfile = require('jsonfile')

console.log(world);
for(c in world)
{

  console.log(c.id);
}

// map english names to german names
// for(country in daten){
//   if(de[country.toUpperCase()]){
//     console.log(country);
//
//     daten[country].name = de[country.toUpperCase()].name;
//   }
// }
//
// jsonfile.writeFile(filename, daten, function (err) {
//   if(err) return console.error(err);
//
// })
