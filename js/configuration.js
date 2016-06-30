'use strict';
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

  $('#enviar').click(function(){
    var verificacion = true;
    var json_capas = {};
    json_capas["webmapid"] = detalles[0].webmapid;
    json_capas["clientid"] = detalles[0].clientid;
    json_capas["Grupos"] = [];
    json_capas["operationalLayers"] = [];
    for(var i in detalles.operationalLayers){
      if(detalles.operationalLayers[i].popupInfo != undefined){
        var json_arrays = [];
        json_capas["operationalLayers"].push(detalles.operationalLayers[i]);
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
          if(json_capas["Grupos"].length > 0){
            var estados = $("#"+opt.text).val();
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
          opcion.setAttribute("value", respuesta.results[j].title);
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
          opcion.setAttribute("value", respuesta.results[j].title);
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
function seleccionGrupo() {
  $.getJSON( "js/webmap.json").done(function(data){
    var detalles = JSON.parse(data);
  var valores = [];
  var selector = document.getElementById("selectorGrupos");
  for (var j=0, iLen=selector.length; j<iLen; j++){
      var opt = selector.options[j];
      if (opt.selected) {
        valores.push(opt.text);
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
        divCampo.setAttribute("id",valores[i]);
      var labelCampo = document.createElement("LABEL");
        labelCampo.setAttribute("class", "control-label col-sm-12");
        labelCampo.innerHTML = valores[i];//result.fields[i].alias
        labelCampo.setAttribute("onclick","showHide()");
      var divText = document.createElement("DIV");
      divText.setAttribute("class","col-sm-12");
      //Aqui va el bucle de cada capa
      /*
      var rol = valores[i];
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
                    divSubPanelCheckBox1.setAttribute("class","panel-body col-sm-6");
                    var divSubPanelCheckBox2 = document.createElement("DIV");
                    divSubPanelCheckBox2.setAttribute("class","panel-body col-sm-6");
          for (var j=0, iLen=selector.length; j<iLen; j++){
            var opt = selector.options[j];
            if (opt.selected){
              var divCheckBox = document.createElement("DIV");
              divCheckBox.setAttribute("class","checkbox");
              var labelCheckBox = document.createElement("LABEL");
              var checkboxField = document.createElement("INPUT");
              checkboxField.setAttribute("type", "checkbox");
              checkboxField.setAttribute("value",opt.value);
              checkboxField.setAttribute("id",detalles.operationalLayers[z].id+"_"+opt.value+"_"+rol);
              checkboxField.setAttribute("class","checkbox");
              labelCheckBox.innerHTML = opt.text;
              labelCheckBox.appendChild(checkboxField);
              divCheckBox.appendChild(labelCheckBox);
              divSubPanelCheckBox1.appendChild(divCheckBox);//divPanelCheckBox
            }
          }

          var filterButton = document.createElement("BUTTON");
          filterButton.setAttribute("class","btn btn-info");
          filterButton.setAttribute("id","boton_"+valores[i]);
          filterButton.innerHTML =  "Filtros";
          filterButton.setAttribute("type","button");
          divSubPanelCheckBox2.appendChild(filterButton);


          divPanelCheckBox.appendChild(divSubPanelCheckBox1);
          divPanelCheckBox.appendChild(divSubPanelCheckBox2);


          divCampo.appendChild(labelPanelCheckBox);
          divCampo.appendChild(divPanelCheckBox);
        }
      }*///Final de bucle de capas
      var textField = document.createElement("INPUT");
      textField.setAttribute("type", "text");
      textField.setAttribute("class","form-control");
      textField.setAttribute("id",valores[i]);//result.fields
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
