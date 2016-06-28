//webmap, view, tokenUser, grupo
function generarConsulta(capaId, grupo){
  var consultaCapa = "";
  var query = new Query();
  query.outFields = ["*"];
  query.returnGeometry = true;
  for(var j in configuracionInicial[capaId][0]){
    var campo = String(configuracionInicial[capaId][0][j].name);
    var consultaCampo = "";
    for(var k in configuracionInicial[grupo].estados){
      var valor = String(configuracionInicial[grupo].estados[k]);
      consultaCampo += campo+" LIKE '"+valor+"' OR ";
    }
    consultaCapa += consultaCampo;
  }
  query.where = consultaCapa.substring(consultaCapa.length-4,0);
}
function generarTablas(grupo, urls, position){
    var query = generarConsulta(capaId,grupo);
    var capaId = urls[position].id;
    var capaItemId = urls[position].itemId;
    queryLayerTask.execute(query).then(function(result){
      if(result.features.length > 0){
        var divRow = document.createElement("DIV");
        divRow.setAttribute("class", "row");
          var divCol = document.createElement("DIV");
          divCol.setAttribute("class", "col-sm-12");
            var divTabla = document.createElement("DIV");
            divTabla.setAttribute('class','table-responsive');
            divTabla.setAttribute("id", "informacion_feature_"+capaId);
              var tabla   = document.createElement("table");
              tabla.setAttribute('class','table');
                var cabecera = document.createElement("thead");
                  var filaCabecera = document.createElement("tr");
                    for(var l in configuracionInicial[capaId][0]){
                      var celdaCabecera = document.createElement("th");
                      celdaCabecera.innerHTML = configuracionInicial[capaId][0][l].label;
                      filaCabecera.appendChild(celdaCabecera);
                    }
                cabecera.appendChild(filaCabecera);
                var tblBody = document.createElement("tbody");
                var capaVisible = new GraphicsLayer();//Capa que se crea para mostrar solo los items a modificar
                  for(var m in result.features){
                    //console.log(result.features[m]);
                    var filaBody = document.createElement("tr");
                      for(var n in configuracionInicial[capaId][0]){
                        var celdaBody = document.createElement("td");
                        var enlace = document.createElement("a");
                        enlace.setAttribute('href',"index.html?id="+result.features[m].attributes["OBJECTID"]+"&capa="+capaItemId)
                        var fecha = configuracionInicial[capaId][0][n].name.toLowerCase().indexOf("date");//result.fields
                        if(fecha != -1){
                          enlace.innerHTML = new Date(result.features[m].attributes[configuracionInicial[capaId][0][n].name]).toLocaleDateString();
                        }
                        else{
                          enlace.innerHTML = result.features[m].attributes[configuracionInicial[capaId][0][n].name];
                        }
                        result.features[m].attributes[configuracionInicial[capaId][0][n].name];
                        celdaBody.appendChild(enlace);
                        filaBody.appendChild(celdaBody);
                      }
                    tblBody.appendChild(filaBody);
                  }
                  tabla.appendChild(cabecera);
                  tabla.appendChild(tblBody);
                divTabla.appendChild(tabla);
              divCol.appendChild(divTabla);
            divRow.appendChild(divCol);
          document.getElementById("dashboard_panel").appendChild(divRow);
          var newPosition = position -1;
          if(newPosition > -1){
            capaId = urls[position-1].id;
            capaItemId = urls[position-1].itemId;
            generarTablas(capaId, capaItemId, grupo, urls, urls.length);
          }
        }
     });
}
