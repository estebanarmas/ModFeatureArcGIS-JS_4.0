'use strict';
$.getJSON( "js/configuracion.json").done(function(result){
var configuracionInicial = JSON.parse(result);
console.log(configuracionInicial);
//"8c7ca46cf5aa4394b4d0c2c91114b14d";--NO--//"5570a2274686402ead7181946840fc8c";//
//"xGpqODyZZMlrMnmU";
//===============================================================
var showDetails = true;
require([
  "esri/identity/OAuthInfo",
  "esri/identity/IdentityManager",
  "esri/portal/Portal",
  "esri/portal/PortalQueryParams",
  "esri/portal/PortalQueryResult",
  "esri/core/urlUtils",
  "esri/core/Collection",
  "esri/layers/FeatureLayer",
  "esri/tasks/QueryTask",
  "esri/symbols/PictureMarkerSymbol",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/tasks/support/Query",
  "esri/views/MapView",
  "esri/WebMap",
  "dojo/promise/all",
  "dojo/domReady!"],function(OAuthInfo, esriId, Portal, PortalQueryParams,PortalQueryResult, urlUtils, Collection, FeatureLayer, QueryTask, PictureMarkerSymbol, GraphicsLayer, Graphic, Query, MapView, WebMap, all){

  var info = new OAuthInfo({
    appId: configuracionInicial.clientid,
    popup: false
  });
  esriId.registerOAuthInfos([info]);

  $('#login').click(function (){
    esriId.destroyCredentials();
    esriId.getCredential(info.portalUrl + '/sharing');
  });

  esriId.checkSignInStatus(info.portalUrl + '/sharing').then(function(portalUser){
    var urlUserGroups = "https://www.arcgis.com/sharing/rest/community/users/"+portalUser.userId+"?f=json&token="+portalUser.token;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", urlUserGroups, false);
    xhr.send();
    var respuesta = new Collection(JSON.parse(xhr.responseText).groups);
    var portal = new Portal();
    portal.authMode = "immediate";
    portal.load().then(function(){

      var webmap = new WebMap({
        portalItem: {
          id: configuracionInicial.webmapid
        }
      });
      var view = new MapView({
        container: "viewDiv",
        map: webmap
      });


      var url = urlUtils.urlToObject(window.location.href);
      webmap.load().then(function(webmap){
        var tokenUser = esriId.credentials[0].token;
        if(window.location.href.indexOf("capa") != -1 && window.location.href.indexOf("id") != -1){
          //AQUI VA LA FUNCION DE FORMULARIO PARA MODIFICAR
          for(var i in configuracionInicial.Grupos){
            respuesta.find(function(rolUsuario){
              if(rolUsuario.title.toLowerCase() === configuracionInicial.Grupos[i].toLowerCase()){
                var grupo = rolUsuario.title.toLowerCase();
                modficarFeature(webmap, url, view, tokenUser, grupo);//Funcionalidad que carga el formulario del Feature para modificarlo.
              }
            });
          }
        }
        else {
          //AQUI VA LA FUNCION DE DASHBOARD
          for(var i in configuracionInicial.Grupos){
            respuesta.find(function(rolUsuario){
              if(rolUsuario.title.toLowerCase() === configuracionInicial.Grupos[i].toLowerCase()){
                var grupo = configuracionInicial.Grupos[i];
                dashboardFeatures(webmap, view, tokenUser, grupo);//Funcionalidad que carga el formulario del Feature para modificarlo.
              }
            });
          }
        }
      }).otherwise(function(error) {alert(error);});
    });
  });
//Acciones a tomar a traves de los botones//
//=======================================//
  $('#logout').click(function (){
    esriId.destroyCredentials();
    window.location.reload();
  });

  $('#dashboard').click(function(){
    document.location = "./";
    console.log("hola");
  });

  $('#detalles').click(function (){
    if(!showDetails){
      $('#formulario').hide()
      $('#detalles').html('Mostrar Detalles');
      showDetails = true;
    }
    else {
      $('#formulario').show()
      $('#detalles').html('Ocultar Detalles');
      showDetails = false;
    }
  });

  $('#procede').click(function(){
  });
//==============================================================================//
function modficarFeature(webmap, url, view, tokenUser, grupo){
  loadHTML("edicion", grupo);

  for(var i = 0; i < webmap.layers.items.length; i++){
    //if(webmap.layers.items[i].id != url.query.capa){
      webmap.layers.items[i].visible = false;
    //}
  }
  var visibleLayer = webmap.findLayerById(configuracionInicial[String(url.query.capa)]);

  var fl = new FeatureLayer({
    url: visibleLayer.url+"/"+visibleLayer.layerId,
    popupTemplate: visibleLayer.popupTemplate,
    popupEnabled: false
  });
  fl.load().then(function(){
    var queryFeatureTask  = new QueryTask({
      url: visibleLayer.url+"/"+visibleLayer.layerId
    });
    var query = new Query();
    query.where = "OBJECTID = " + url.query.id;
    query.outSpatialReference = { wkid: 102100 };
    query.outFields = ['*'];
    query.returnGeometry = true;
    queryFeatureTask.execute(query).then(function(result){
      if(result.features.length > 0){
        var feature = result.features[0];
        var imagenesURL = [];
        var simbolo;

        if(fl.renderer.type == "simple"){
          simbolo = fl.renderer.symbol;
        }
        if(fl.renderer.type == "uniqueValue"){
          simbolo = fl.renderer.getUniqueValueInfo(feature).symbol;
        }

        var featureVisible = new Graphic({
          geometry: feature.geometry,
          symbol: simbolo
        });
        var capaVisible = new GraphicsLayer({
          graphics: [featureVisible]
        });
        webmap.add(capaVisible);
//=============================================================================//
//==============================================================================//
        //Verificacion de que exista o no un adjunto en el feature
        var xhr = new XMLHttpRequest();
        xhr.open("GET", visibleLayer.url+"/"+visibleLayer.layerId+"/"+url.query.id+"/attachments?f=pjson&token="+esriId.credentials[0].token, false);
        xhr.send();
        var respuesta = JSON.parse(xhr.responseText);
        if(xhr.responseText.toLowerCase().indexOf('error') != -1){
          console.log(respuesta.error.details[0]);
        }
        else {
          if(respuesta.attachmentInfos.length > 0){
            for(var i = 0; i < respuesta.attachmentInfos.length; i++){
              var adjuntos = visibleLayer.url+"/"+visibleLayer.layerId+"/"+url.query.id+"/attachments/"+respuesta.attachmentInfos[i].id+"?token="+esriId.credentials[0].token;
              imagenesURL.push({adjuntos});
            }
            console.log(imagenesURL);
          }
        }

//===============Creacion de formulario para edicion de feature================//
  loadFormHTML(result,feature, imagenesURL, configuracionInicial[String(url.query.capa)]);
//==============================================================================//
      if(fl.geometryType != "point"){
        view.extent = result.features[0].geometry.extent;
        console.log(result.features[0]);
        view.zoom = 20;
      }
      else{
        view.goTo(feature.geometry);//result.features[0].geometry);
      }
//==============================================================================//
  $('#subsanado').click(function () {
  var output = document.getElementById("output");
  var data = new FormData(document.getElementById("fileinfo"));

  data.append("f", "pjson");
  data.append("token", esriId.credentials[0].token);
  console.log(data);
  console.log($("#fileinfo"));/*
  var xhr = new XMLHttpRequest();
  xhr.open("POST", visibleLayer.url+"/"+visibleLayer.layerId+"/"+url.query.id+"/addAttachment", false)
  xhr.send(data);
  if (xhr.status == 200) {
    //output.innerHTML += "Uploaded!<br />";
    console.log("Exito");
  } else {
    output.innerHTML += "Error " + xhr.status + " occurred uploading your file.<br />";
  }*/
  });
//==============================================================================//
  $('#procede').click(function () {
  feature.attributes.ESTADO = "SUBSANADO";
  var featureArray = "?f=pjson&features="+JSON.stringify(feature.toJSON())+"&token="+esriId.credentials[0].token;
  var urlTest = visibleLayer.url+"/"+visibleLayer.layerId+"/updateFeatures";
  var data = null;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });
  xhr.open("POST", urlTest+featureArray);
  xhr.send(data);
  });
//==============================================================================//
      }
     });
  });
}

//==============================================================================//
//==============================================================================//
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
  return query;
}
function generarTablas(features, grupoFeat, item){
  var divRow = document.createElement("DIV");
  divRow.setAttribute("class", "row");
    var divCol = document.createElement("DIV");
    divCol.setAttribute("class", "col-sm-12");
      var divTabla = document.createElement("DIV");
      divTabla.setAttribute('class','table-responsive');
      divTabla.setAttribute("id", "informacion_feature_"+grupoFeat);
        var tabla   = document.createElement("table");
        tabla.setAttribute('class','table');
          var cabecera = document.createElement("thead");
            var filaCabecera = document.createElement("tr");
              for(var l in configuracionInicial[grupoFeat][0]){
                var celdaCabecera = document.createElement("th");
                celdaCabecera.innerHTML = configuracionInicial[grupoFeat][0][l].label;
                filaCabecera.appendChild(celdaCabecera);
              }
          cabecera.appendChild(filaCabecera);
          var tblBody = document.createElement("tbody");
          var capaVisible = new GraphicsLayer();//Capa que se crea para mostrar solo los items a modificar
            for(var m in features.features){
              //console.log(result.features[m]);
              var filaBody = document.createElement("tr");
                for(var n in configuracionInicial[grupoFeat][0]){
                  var celdaBody = document.createElement("td");
                  var enlace = document.createElement("a");
                  enlace.setAttribute('href',"index.html?id="+features.features[m].attributes["OBJECTID"]+"&capa="+item)
                  var fecha = configuracionInicial[grupoFeat][0][n].name.toLowerCase().indexOf("date");//result.fields
                  if(fecha != -1){
                    enlace.innerHTML = new Date(features.features[m].attributes[configuracionInicial[grupoFeat][0][n].name]).toLocaleDateString();
                  }
                  else{
                    enlace.innerHTML = features.features[m].attributes[configuracionInicial[grupoFeat][0][n].name];
                  }
                  features.features[m].attributes[configuracionInicial[grupoFeat][0][n].name];
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
}
//==============================================================================//
//==============================================================================//
function dashboardFeatures(webmap, view, tokenUser, grupo){
  console.log(grupo);
  var urls=[]
  var tareas = []
  for(var x in configuracionInicial.operationalLayers){
    urls.push({'url':configuracionInicial.operationalLayers[x].url,
                'id': configuracionInicial.operationalLayers[x].id,
            'itemId': configuracionInicial.operationalLayers[x].itemId
          }
        );
    }
  for(var i in urls){
    var fl = urls[i].url;
    var queryLayerTask  = new QueryTask({
      url: fl
    });
    tareas.push(queryLayerTask.execute(generarConsulta(urls[i].id,grupo)));
  }
  var promesas = new all(tareas);
  promesas.then(function(resultados){
    if(resultados.length > 0){
      for(var j in resultados){
        if(resultados[j].features.length > 0){
          generarTablas(resultados[j],urls[j].id, urls[j].itemId);//, j
        }
      }
    }
  });
 loadHTML("dashboard", grupo);
}
//==============================================================================//
//==============================================================================//
});
//==============================================================================//
//FUNCIONALIDADES HTML UNICAMENTE//
//==============================================================================//
  function loadHTML(estado, grupo){
  	if(estado == "dashboard"){
  		$('#dashboard_panel').show();
  		$('#acceso').hide();
  		$('#formulario').show();
  		$('#login-status').show();
  		$('#logo').removeClass("col-sm-12");
  		$('#logo').addClass("col-sm-9");
  		$('#informacion_feature').hide();
  		$('#detalles_panel').hide();
  		$('#mantenimiento').hide();
  		$('#policia').hide();
  		$('#oitr').hide();
      $('#mapa').show();
  	}
  	else if(estado == "edicion"){
  		$('#detalles_panel').show();
  		$('#dashboard_panel').hide();
  		$('#acceso').hide();
  		$('#formulario').hide();
  		$('#login-status').show();
  		$('#logo').removeClass("col-sm-12");
  		$('#logo').addClass("col-sm-9");
      $('#mapa').show();
      if(grupo === "rivas_mantenimiento"){
        $('#mantenimiento').show();
        $('#policia').hide();
        $('#oitr').hide();
      }
      else if(grupo==="rivas_unidad_trafico"){
        $('#policia').show();
        $('#oitr').hide();
        $('#mantenimiento').hide();

      }
      else if(grupo==="rivas_oitr"){
        $('#oitr').show();
        $('#mantenimiento').hide();
        $('#policia').hide();
      }
  	}
  }

  function loadFormHTML(result,feature, imagenesURL, capa){
    var divRow = document.createElement("DIV");
    divRow.setAttribute("class", "row");
    var divCol = document.createElement("DIV");
    divCol.setAttribute("class", "col-sm-12");
    divCol.setAttribute("id", "informacion_feature");
    var formHTML = document.createElement("FORM");
    formHTML.setAttribute("class","form-horizontal");
    formHTML.setAttribute("role","form");
    //=============================================================================//
    //CREACION DE LOS CAMPOS DEL FORMULARIO PARA EL FEATURE ENCONTRADO.//
    for(var i = 0; i < configuracionInicial[capa][0].length; i++){  //result.fields.length
      var divCampo = document.createElement("DIV");
      divCampo.setAttribute("class","form-group");
      var labelCampo = document.createElement("LABEL");
      labelCampo.setAttribute("class", "control-label col-sm-2");
      labelCampo.innerHTML = configuracionInicial[capa][0][i].label;//result.fields[i].alias
      var divText = document.createElement("DIV");
      divText.setAttribute("class","col-sm-10");
      var textField = document.createElement("INPUT");
      textField.setAttribute("type", "text");
      textField.setAttribute("class","form-control");
      textField.setAttribute("id",configuracionInicial[capa][0][i].name);//result.fields
      var fecha = configuracionInicial[capa][0][i].name.toLowerCase().indexOf("date");//result.fields
      if(fecha != -1){
        textField.setAttribute("value",new Date(feature.attributes[configuracionInicial[capa][0][i].name]).toLocaleDateString());
      }
      else{
        textField.setAttribute("value",feature.attributes[configuracionInicial[capa][0][i].name]);
      }
      textField.disabled = true;
      divText.appendChild(textField);
      divCampo.appendChild(labelCampo);
      divCampo.appendChild(divText);
      formHTML.appendChild(divCampo);
    }
//=============================================================================//
//CREAR EL INPUT PARA IMAGENES EN HTML//
    var divCampoInput = document.createElement("DIV");
    divCampoInput.setAttribute("class","form-group");
    var formImagen = document.createElement("FORM");
      formImagen.setAttribute("class","form-horizontal");
      formImagen.setAttribute("role","form");
      formImagen.setAttribute("enctype","multipart/form-data");
      formImagen.setAttribute("method","post");
      formImagen.setAttribute("name","fileinfo");
      formImagen.setAttribute("id","fileinfo");
    var labelImagen = document.createElement("LABEL");
      labelImagen.setAttribute("class", "control-label col-sm-2");
      labelImagen.innerHTML = "Adjuntar Imagen";
    var divInput = document.createElement("DIV");
      divInput.setAttribute("class","col-sm-10");
    var inputImagen = document.createElement("INPUT");
      inputImagen.setAttribute("type","file");
      inputImagen.setAttribute("type","file");
      inputImagen.setAttribute("name","file");
      inputImagen.setAttribute("class","form-control");
      inputImagen.required = true;
    divInput.appendChild(inputImagen);
    divCampoInput.appendChild(labelImagen);
    divCampoInput.appendChild(divInput);
//=============================================================================//
    if(imagenesURL.length > 0){
      var divCampoAdjuntos = document.createElement("DIV");
      divCampoAdjuntos.setAttribute("class","form-group");
      var formAdjuntos = document.createElement("FORM");
      formAdjuntos.setAttribute("class","form-horizontal");
      formAdjuntos.setAttribute("role","form");
      var labelCampo = document.createElement("LABEL");
      labelCampo.setAttribute("class", "control-label col-sm-2");
      labelCampo.innerHTML = "Imagenes Adjuntas";//result.fields[i].alias
      var divText = document.createElement("DIV");
      divText.setAttribute("class","col-sm-10");
      for(var i in imagenesURL){
        var spanURL = document.createElement("SPAN");
        var url = document.createElement("a");
        url.setAttribute('href',imagenesURL[i].adjuntos);
        url.setAttribute('target','_blank');
        url.innerHTML = "Imagen_"+i+" || ";
        spanURL.appendChild(url);
        divText.appendChild(spanURL);
      }
      divCampoAdjuntos.appendChild(labelCampo);
      divCampoAdjuntos.appendChild(divText);
      formAdjuntos.appendChild(divCampoAdjuntos);
      divCol.appendChild(formAdjuntos);
    }
//=============================================================================//
//ENVIO DEL OBJETO HTML COMPLETO//
    formImagen.appendChild(divCampoInput);
    divCol.appendChild(formHTML);
    divCol.appendChild(formImagen);
    divRow.appendChild(divCol);
    document.getElementById("formulario").appendChild(divRow);
  }
//==============================================================================//
}).fail(function(error) {
  console.log(error);
    if(error.status===404){
      alert("Es necesario instalar y crear el archivo de configuracion");
      document.location = "./setup.php"
    }
  });
