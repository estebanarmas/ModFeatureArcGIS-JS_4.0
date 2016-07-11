<!DOCTYPE html PUBLIC>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Configuración de Parámetros</title>
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <!-- Latest compiled JavaScript -->
    <link rel="stylesheet" href="https://js.arcgis.com/4.0/esri/css/main.css">
    <script src="https://js.arcgis.com/4.0/"></script>
    <script src="js/configuration.js"></script>
  </head>
	<body>
		<?php
    if (isset($_POST['action'])) {
        $myfile = fopen("js/configuracion.json", "w") or die("Unable to open file!");
        fwrite($myfile, json_encode($_POST['action']));
        fclose($myfile);
        header ("Location: ./");
      }

      function select() {
          echo "The select function is called.";
          exit;
      }

      function insert() {
          echo "The insert function is called.";
          exit;
      }
    ?>
<!-- HTML Code -->

    <div class="container" class="col-md-12 col-lg-12 col-lg-offset">
      <h3 style="text-align:center">
        Selección de Detalles y Configuraciones
      </h3>
        <div class="row panel-heading">
          <form class="form-horizontal" method="post" role ="form" id="form_principal">

            <div class="col-md-6 col-lg-6 col-lg-offset" id="datos_inicio">
            </div>

            <div class="col-md-6 col-lg-6 col-lg-offset">
              <div class="row">
              <!--  <form class="form-horizontal" method="post" role ="form" > -->
                  <div class="col-md-12 col-lg-12 col-sm-12 col-lg-offset" id="datos_webmap">
                    <div class="form-group">
                      <label for="webmap" class="control-label col-sm-8" >Buscar grupo vinculado</label>
                      <div class="col-sm-10">
                				<input type="text" name="grupo" placeholder="Ej: ESRI" class="form-control" id="grupo">
                      </div>
                      <div class="col-sm-1">
                        <a href="#" id="buscar" class="btn btn-primary">Buscar</a>
                      </div>
                    </div>
                  </div>
              <!---  </form> -->
              </div>
            </div>

          </form>
		    </div>
    </div>
	</body>
</html>
