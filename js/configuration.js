'use strict';
var filtroGlobal = "Test";
$.getJSON( "js/webmap.json").done(function(data){
  var detalles = JSON.parse(data);
  console.log(detalles);
  if(detalles[0].featureservices != undefined){
    console.log("FeatureServices");
    if(detalles.fields != undefined && detalles.fields.length > 0 ){
      var divRow = document.createElement("DIV");
      divRow.setAttribute("class", "row");
      var labelCampo = document.createElement("LABEL");
      labelCampo.setAttribute("class", "control-label col-sm-8");
      labelCampo.innerHTML = "Capa: "+detalles.name;
      var selectMultiple = document.createElement("SELECT");
      selectMultiple.multiple = "multiple";
      selectMultiple.size = detalles.fields.length-1;
      selectMultiple.setAttribute("class","form-control");
      selectMultiple.setAttribute("id","selector_"+detalles.name);
      for(var j in detalles.fields){
        var opcion = document.createElement("option");
        opcion.setAttribute("value", detalles.fields[j].name);
        var opcionTexto = document.createTextNode(detalles.fields[j].alias);
        opcion.appendChild(opcionTexto);
        selectMultiple.appendChild(opcion);
      }
      divRow.appendChild(labelCampo);
      divRow.appendChild(selectMultiple);
      document.getElementById("datos_inicio").appendChild(divRow);
      //formHTML.appendChild(divRow);
    }
  }
  else {
    console.log("webmap");
    for(var i in detalles.operationalLayers){
      if(detalles.operationalLayers[i].popupInfo != undefined){
        var divRow = document.createElement("DIV");
        divRow.setAttribute("class", "row");
        var labelCampo = document.createElement("LABEL");
        labelCampo.setAttribute("class", "control-label col-sm-8");
        labelCampo.innerHTML = "Capa: "+detalles.operationalLayers[i].title;
        var selectMultiple = document.createElement("SELECT");
        selectMultiple.multiple = "multiple";
        selectMultiple.size = detalles.operationalLayers[i].popupInfo.fieldInfos.length-1;
        selectMultiple.setAttribute("class","form-control");
        selectMultiple.setAttribute("id","selector_"+detalles.operationalLayers[i].id);
        for(var j in detalles.operationalLayers[i].popupInfo.fieldInfos){
          var opcion = document.createElement("option");
          opcion.setAttribute("value", detalles.operationalLayers[i].popupInfo.fieldInfos[j].fieldName);
          var opcionTexto = document.createTextNode(detalles.operationalLayers[i].popupInfo.fieldInfos[j].label);
          opcion.appendChild(opcionTexto);
          selectMultiple.appendChild(opcion);
        }
        divRow.appendChild(labelCampo);
        divRow.appendChild(selectMultiple);
        document.getElementById("datos_inicio").appendChild(divRow);
        //formHTML.appendChild(divRow);
      }
    }
  }
  //console.log(detalles);
  //var formHTML = document.createElement("FORM");
  //formHTML.setAttribute("class","form-horizontal");
  //formHTML.setAttribute("role","form");
  //formHTML.setAttribute("method","post");
  var boton = document.createElement("INPUT");
  boton.setAttribute("class","btn btn-success btn-block btn-lg");
  boton.setAttribute("name","submit");
  boton.setAttribute("value","Crear Fichero");
  boton.setAttribute("id","enviar");
  var divClearFix = document.createElement("DIV");
  divClearFix.setAttribute("class","clearfix");
  //formHTML.appendChild(boton);
  var divRow = document.createElement("DIV");
  divRow.setAttribute("class", "row");
  divRow.setAttribute("style","margin: 10px 0 0 0");
  divRow.appendChild(boton);
  document.getElementById("form_principal").appendChild(divClearFix);
  document.getElementById("form_principal").appendChild(divRow);
//==//==//==//==//==//==//==//==//==//==//==//==
/*$('#enviar2').click(function(){
    var capas = [];
    var roles = [];
    for(var j=0; j<document.getElementById("selectorGrupos").length; j++){//ROL
      var selector = document.getElementById("selectorGrupos");
      if (selector.options[j].selected) {
        roles.push(selector.options[j].text);
      }
    }
    for(var i in detalles.operationalLayers){//CAPA
      if(detalles.operationalLayers[i].popupInfo != undefined){
        capas.push(detalles.operationalLayers[i].id);
      }
    }
    for(var l in roles){
      jsonFinal[roles[l]] = {};
      for(var m in capas){
        jsonFinal[roles[l]][capas[m]]={};
        for(var k = 0; k<document.getElementById("selector_"+capas[m]).length; k++){//CAMPO
          if(document.getElementById("selector_"+capas[m]).options[k].selected){
            var identificador = roles[l]+";"+capas[m]+";"+document.getElementById("selector_"+capas[m]).options[k].value;
            var elemento_check = document.getElementById(identificador);
            if(elemento_check.checked){
              jsonFinal[roles[l]][capas[m]][document.getElementById("selector_"+capas[m]).options[k].value] = {'editable': true};
            }
            else{
              jsonFinal[roles[l]][capas[m]][document.getElementById("selector_"+capas[m]).options[k].value] = {'editable': false};
            }
            }
          }
        }
      }
      console.log(jsonFinal);
  });*/
//==//==//==//==//==//==//==//==//==//==//==//==
  $('#enviar').click(function(){
    var arregloCapas = [];
    var arrayGrupos = [];
    var verificacion = true;
    var json_capas = {};
    var jsonFinal = {};
    json_capas["webmapid"] = detalles[0].webmapid;
    json_capas["clientid"] = detalles[0].clientid;
    json_capas["Grupos"] = [];
    json_capas["operationalLayers"] = [];
    for(var i in detalles.operationalLayers){
      if(detalles.operationalLayers[i].popupInfo != undefined){
        var json_arrays = [];
        json_capas["operationalLayers"].push(detalles.operationalLayers[i]);
        arregloCapas.push(detalles.operationalLayers[i]);
        var selector = document.getElementById("selector_"+detalles.operationalLayers[i].id);
        json_capas[String(detalles.operationalLayers[i].itemId)]= String(detalles.operationalLayers[i].id);
        json_capas[String(detalles.operationalLayers[i].id)] = String(detalles.operationalLayers[i].itemId);
        json_capas[String(detalles.operationalLayers[i].id)]=[];
        //console.log(detalles.operationalLayers[i].title,":");
        for (var j=0, iLen=selector.length; j<iLen; j++){
            var opt = selector.options[j];
            if (opt.selected) {
              var json_fields={};
              json_fields["label"] = opt.value;
              json_fields["name"] = opt.text;
              json_arrays.push(json_fields);
          }
        }
        if(json_arrays.length > 0){
          json_capas[String(detalles.operationalLayers[i].id)].push(json_arrays)
        }
        else {
          alert("Almenos debe seleccionar un campo de las capas activas del webmap");
          verificacion = false;
        }
      }
      else {
        verificacion = false;
      }
    }

    if(document.getElementById("selectorGrupos")){
      var valores = [];
      var selector = document.getElementById("selectorGrupos");
      for (var j=0, iLen=selector.length; j<iLen; j++){
        var opt = selector.options[j];
        if (opt.selected) {
          json_capas["Grupos"].push(opt.text);
          arrayGrupos.push(opt.text);
          if(json_capas["Grupos"].length > 0){
            var estados = $("#"+opt.value).val();
            if(estados == undefined || estados == ""){
              alert("Debe seleccionar al menos un grupo y agregar un estado para vincularlo al webmap");
              verificacion = false;
            }
            else{
              var arrayEstados = estados.split(',');
              if(arrayEstados.length > 0){
                for(var y in json_capas["operationalLayers"]){

                  json_capas[opt.text] = {"estados":arrayEstados,
                                          [json_capas["operationalLayers"][y].id]:{"prueba":"json"}
                                          };
                }
                verificacion = true;
              }
              else {
                alert("Debe agregar un estado vinculado al grupo del webmap");
                verificacion = false;
              }
            }
          }
        }
      }
    }
    else{
      alert("Se debe vincular grupos de usuarios a esta aplicacion");
      verificacion = false;
    }

    for(var l in arrayGrupos){
      var nombres = String(arrayGrupos[l]);
      nombres = nombres.toLowerCase();
      console.log(nombres);
      jsonFinal[nombres] = {};
      for(var m in arregloCapas){
        jsonFinal[nombres][arregloCapas[m].id]={};
        for(var k = 0; k<document.getElementById("selector_"+arregloCapas[m].id).length; k++){//CAMPO
          if(document.getElementById("selector_"+arregloCapas[m].id).options[k].selected){
            var identificador = arrayGrupos[l]+";"+arregloCapas[m].id+";"+document.getElementById("selector_"+arregloCapas[m].id).options[k].value;
            var elemento_check = document.getElementById(identificador);
            if(elemento_check.checked){
              jsonFinal[nombres][arregloCapas[m].id][document.getElementById("selector_"+arregloCapas[m].id).options[k].value] = {'editable': true};
            }
            else{
              jsonFinal[nombres][arregloCapas[m].id][document.getElementById("selector_"+arregloCapas[m].id).options[k].value] = {'editable': false};
            }
            }
          }
        }
      }
      json_capas['editables'] = jsonFinal;

    if(verificacion && json_capas["Grupos"].length > 0){
      var ajaxurl = './configuration.php',
      data =  {'action': JSON.stringify(json_capas)};
      $.post(ajaxurl, data, function (response) {
        alert("Se ha generado el archivo de configuracion para esta aplicacion");
        document.location = "./";
      });
    }
  });

  $('#buscar').click(function(){

    var urlGrupos = "http://www.arcgis.com/sharing/rest/community/groups?q="+$('#grupo').val()+"&f=pjson";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", urlGrupos, false);
    xhr.send();
    var respuesta = JSON.parse(xhr.response);
    if(respuesta.error != undefined){
      alert("Es necesario vincular Grupos y Estados");
    }
    else {
      if(document.getElementById('selectorGrupos')){
        document.getElementById('selectorGrupos').remove();
        var selectMultiple = document.createElement("SELECT");
        selectMultiple.multiple = "multiple";
        selectMultiple.size = respuesta.total;
        selectMultiple.setAttribute("class","form-control");
        selectMultiple.setAttribute("id","selectorGrupos");
        selectMultiple.setAttribute("onchange","seleccionGrupo()");
        for(var j in respuesta.results){
          var opcion = document.createElement("option");
          opcion.setAttribute("value", respuesta.results[j].id);//tittle
          var opcionTexto = document.createTextNode(respuesta.results[j].title);
          opcion.appendChild(opcionTexto);
          selectMultiple.appendChild(opcion);
        }
        document.getElementById('datos_webmap').appendChild(selectMultiple);
      }
      else {
        var selectMultiple = document.createElement("SELECT");
        selectMultiple.multiple = "multiple";
        selectMultiple.size = respuesta.total;
        selectMultiple.setAttribute("class","form-control");
        selectMultiple.setAttribute("id","selectorGrupos");
        selectMultiple.setAttribute("onchange","seleccionGrupo()");
        for(var j in respuesta.results){
          var opcion = document.createElement("option");
          opcion.setAttribute("value", respuesta.results[j].id);//tittle
          var opcionTexto = document.createTextNode(respuesta.results[j].title);
          opcion.appendChild(opcionTexto);
          selectMultiple.appendChild(opcion);
        }
        document.getElementById('datos_webmap').appendChild(selectMultiple);
      }
    }
  });
}).fail(function(error) {
    if(error.status===404){
      //alert("Es necesario instalar y crear el archivo de configuracion");
      document.location = "./setup.php"
  }
});
function myFunction(datos,filtroGlobal){
  console.log(datos, filtroGlobal);
}

function subfiltros(){

}

function crearfiltro(idBoton){
  $.getJSON( "js/webmap.json").done(function(data){
    var detalles = JSON.parse(data);
    var datos = idBoton.split(';');
    datos[0]//rol
    datos[1]//Capa
    datos[2]//url
    if(datos[2].indexOf("http://") != -1){
      datos[2] = datos[2].substring(7);
    }
    var data = null;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        var dominios = JSON.parse(this.response);
        filtroGlobal = JSON.parse(this.response);
        var divPanel = document.getElementById(datos[0]+";"+datos[1]);
        var select = document.createElement("SELECT");
        select.setAttribute("class","form-control");
        select.setAttribute("id","selector_"+datos[0]+";"+datos[1]);
        select.setAttribute("onchange","myFunction(this.id, filtroGlobal)")
        var option0 = document.createElement("OPTION")
        var opcionTexto0 = document.createTextNode("Selecciona un campo.");
        option0.appendChild(opcionTexto0);
        select.appendChild(option0);
        //console.log(dominios);
        for(var i in dominios.fields){
          var option = document.createElement("OPTION")
          option.setAttribute("value",dominios.fields[i].name);
          var opcionTexto = document.createTextNode(dominios.fields[i].name);
          option.appendChild(opcionTexto);
          select.appendChild(option);
          if(dominios.fields[i].domain != null){
            for(var j in dominios.fields[i].domain.codedValues){
              dominios.fields[i].domain.name;//Nombre del Campo que contiene el dominio
              //console.log(dominios.fields[i].domain.codedValues[j].name);
            }
          }
          else{//Campos sin dominio

          }
        }
        divPanel.appendChild(select);
      }
    });
    var urlGrupos = "https://"+datos[2]+"?f=pjson&token="+detalles[0].token;
    xhr.open("POST", urlGrupos);
    xhr.send(data);

  });
}

function seleccionGrupo() {
  $.getJSON( "js/webmap.json").done(function(data){
    var detalles = JSON.parse(data);
  var valores = [];
  var selector = document.getElementById("selectorGrupos");
  for (var j=0, iLen=selector.length; j<iLen; j++){
      var opt = selector.options[j];
      if (opt.selected) {
        valores.push({'text':opt.text, 'id':opt.value});//text
    }
  }
  console.log(valores);
  if(document.getElementById("vincular_estados")){
    document.getElementById("vincular_estados").remove();
    seleccionGrupo();
  }
  else{

    var divEstados = document.createElement("DIV");
    divEstados.setAttribute("id","vincular_estados");
    for(var i in valores){
      var divCampo = document.createElement("DIV");
        divCampo.setAttribute("class","form-group col-sm-12");
        //divCampo.setAttribute("id",valores[i]);
      var labelCampo = document.createElement("LABEL");
        labelCampo.setAttribute("class", "control-label col-sm-12");
        labelCampo.innerHTML = valores[i].text;//result.fields[i].alias
        labelCampo.setAttribute("onclick","showHide()");
      var divText = document.createElement("DIV");
      divText.setAttribute("class","col-sm-12");
      //Aqui va el bucle de cada capa

      var rol = valores[i].text;
      for(var z in detalles.operationalLayers){
      if(detalles.operationalLayers[z].popupInfo != undefined){
          var divPanelCheckBox = document.createElement("DIV");
          divPanelCheckBox.setAttribute("class","panel-body col-sm-12");
          var labelPanelCheckBox = document.createElement("LABEL");
          labelPanelCheckBox.setAttribute("class", "control-label col-sm-12");
          labelPanelCheckBox.innerHTML = detalles.operationalLayers[z].id;
          //divPanelCheckBox.appendChild(labelPanelCheckBox);
          var selector = document.getElementById("selector_"+detalles.operationalLayers[z].id);
          var groupCheckBox = document.createElement("DIV");
          groupCheckBox.setAttribute("class","form-group");
            var divGroupCheck = document.createElement("DIV");
            divGroupCheck.setAttribute("class","col-sm-offset-2 col-sm-10");
                    var divSubPanelCheckBox1 = document.createElement("DIV");
                    divSubPanelCheckBox1.setAttribute("class","panel-body col-sm-4");
                    var divSubPanelCheckBox2 = document.createElement("DIV");
                    divSubPanelCheckBox2.setAttribute("class","panel-body col-sm-8");
                    divSubPanelCheckBox2.setAttribute("id",rol+";"+detalles.operationalLayers[z].id);
          for (var j=0, iLen=selector.length; j<iLen; j++){
            var opt = selector.options[j];
            if (opt.selected){
              var divCheckBox = document.createElement("DIV");
              divCheckBox.setAttribute("class","checkbox");
              var labelCheckBox = document.createElement("LABEL");
              var checkboxField = document.createElement("INPUT");
              checkboxField.setAttribute("type", "checkbox");
              checkboxField.setAttribute("value",opt.value);
              checkboxField.setAttribute("id",rol+";"+detalles.operationalLayers[z].id+";"+opt.value);
              checkboxField.setAttribute("class","checkbox");
              labelCheckBox.innerHTML = opt.text;
              labelCheckBox.appendChild(checkboxField);
              divCheckBox.appendChild(labelCheckBox);
              divSubPanelCheckBox1.appendChild(divCheckBox);//divPanelCheckBox
            }
          }

          var filterButton = document.createElement("BUTTON");
          filterButton.setAttribute("class","btn btn-info");
          filterButton.setAttribute("id",rol+";"+detalles.operationalLayers[z].id+";"+detalles.operationalLayers[z].url+";boton");
          filterButton.innerHTML =  "Filtros";
          filterButton.setAttribute("type","button");
          filterButton.setAttribute("onclick","crearfiltro(this.id)");
          divSubPanelCheckBox2.appendChild(filterButton);


          divPanelCheckBox.appendChild(divSubPanelCheckBox1);
          divPanelCheckBox.appendChild(divSubPanelCheckBox2);


          divCampo.appendChild(labelPanelCheckBox);
          divCampo.appendChild(divPanelCheckBox);
        }
      }///Final de bucle de capas
      var textField = document.createElement("INPUT");
      textField.setAttribute("type", "text");
      textField.setAttribute("class","form-control");
      textField.setAttribute("id",valores[i].id);//result.fields
      textField.setAttribute("placeholder","Ej: Estado 1,Estado 2...etc - Separar cada estado por una coma sin espacio");
      divText.appendChild(textField);//textField
      divCampo.appendChild(divText);
      divEstados.appendChild(labelCampo);
      divEstados.appendChild(divCampo);
    }
    document.getElementById("datos_webmap").appendChild(divEstados);
  }
});
};
