// Description
//   Informa la disponibilidad de recorridos y el tiempo de llegada de un determinado paradero
//
// Commands:
//   hubot tstop [codigo_paradero] <devuelve los recorridos cercanos>
//
// Author:
//   Fabian General <fabianwgl@gmail.com>

var tsapi = require("transantiago-client");

module.exports = function(robot) {

  robot.hear(/tstop (.*)/, function(res){
    var paradero = escape(res.match[1]);
    if(paradero!="" || paradero!=null){
      tsapi(paradero).then(function(r) {

      var json = JSON.stringify(r);
      var respuesta = "";

      for(var i in r.avail){

        respuesta += "Servicio: "+r.avail[i].service;
        for(var j in r.avail[i].buses){

          respuesta += "\n";
          respuesta += "BUS: "+r.avail[i].buses[j].bus+" ";
          respuesta += "LLEGADA: "+r.avail[i].buses[j].arrivaltime+" ";
          respuesta += "DISTANCIA: "+r.avail[i].buses[j].dist+" ";
        }
        respuesta += " \n";
      }

        return res.send(respuesta);
      }).catch(function(err) {
        return res.send(err);
      });
    }
  });
}
