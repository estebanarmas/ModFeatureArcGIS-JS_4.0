<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Credenciales de Instalación</title>

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
	<body>
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
		<?php
		$name = $password = $token= $webmap = $clientid ="";
		$nameErr = $passwordErr = "";

		function get_token($username, $pass) {
      $curl = curl_init();
			curl_setopt_array($curl, array(
			CURLOPT_URL => "https://www.arcgis.com/sharing/rest/generateToken",
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => "",
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_CUSTOMREQUEST => "POST",
			CURLOPT_POSTFIELDS => "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"f\"\r\n\r\njson\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"username\"\r\n\r\n{$username}\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"password\"\r\n\r\n{$pass}\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"referer\"\r\n\r\narcgis.com\r\n-----011000010111000001101001--",
			CURLOPT_HTTPHEADER => array(
			  "cache-control: no-cache",
			  "content-type: multipart/form-data; boundary=---011000010111000001101001",
			  "postman-token: 0710716e-5072-300d-c710-bc51b4c39595"
			),
		  ));
		  $response = curl_exec($curl);
		  $err = curl_error($curl);

		  curl_close($curl);

		  if ($err) {
			echo "cURL Error #:" . $err;
		  } else {
        $obj = json_decode($response);
        return $obj->{'token'};
      }
		}

    function get_data($username, $pass, $webmap, $clienid){

      $token = get_token($username, $pass);

      $curl = curl_init();

      $verificacion = strpos($webmap, "http://");

      if($verificacion  !== false){
        curl_setopt_array($curl, array(
          CURLOPT_URL => "{$webmap}?f=pjson&token={$token}",
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => "",
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 30,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_SSL_VERIFYPEER => false,
          CURLOPT_CUSTOMREQUEST => "GET",
          CURLOPT_HTTPHEADER => array(
            "cache-control: no-cache",
            "postman-token: 67d0fdf6-c7da-bb83-9e68-cb5ee16324fc"
          ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
          echo "cURL Error #:" . $err;
        } else {
          $elementos = ['webmapid' => $webmap, 'clientid' => $clienid, 'featureservices' => true];
          $array_json = json_decode($response,true);
          array_push($array_json,$elementos);
          $myfile = fopen("js/webmap.json", "w") or die("Unable to open file!");
          fwrite($myfile, json_encode(json_encode($array_json,true),true));
          fclose($myfile);
          header ("Location: ./configuration.php");
        }
      }
      else{
        curl_setopt_array($curl, array(
          CURLOPT_URL => "https://www.arcgis.com/sharing/rest/content/items/{$webmap}/data?f=pjson&token={$token}",
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => "",
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 30,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => "POST",
          CURLOPT_HTTPHEADER => array(
            "accept: */*",
            "accept-encoding: gzip, deflate, sdch, br",
            "accept-language: es-ES,es;q=0.8",
            "cache-control: no-cache",
            "connection: keep-alive",
            "content-type: application/x-www-form-urlencoded",
            "if-none-match: 1555351fcd0--gzip",
            "origin: http://localhost",
          ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
          echo "cURL Error #:" . $err;
        } else {
          $elementos = ['webmapid' => $webmap, 'clientid' => $clienid];
          $array_json = json_decode($response,true);
          array_push($array_json,$elementos);
          $myfile = fopen("js/webmap.json", "w") or die("Unable to open file!");
          fwrite($myfile, json_encode(json_encode($array_json,true),true));
          fclose($myfile);
          header ("Location: ./configuration.php");
        }
      }
    }

    function create_configuration_file(){
      echo "hola";
    }

		if ($_SERVER["REQUEST_METHOD"] == "POST") {
			if (empty($_POST["name"]) || empty($_POST["password"]) || empty($_POST["webmap"]) || empty($_POST["clientid"])) {
				echo "Ingrese todos los parametros por favor";
			}
			else{
				get_data($_POST["name"],$_POST["password"], $_POST["webmap"], $_POST["clientid"]);
			}
		}
?>
<!-- HTML Code -->

    <div class="container">
      <div class="col-md-2 col-lg-2 col-lg-offset">
      </div>
      <div class="col-md-8 col-lg-8 col-lg-offset">
        <div class="row panel-heading" id="datos_inicio">
    			<h3 style="text-align:center">
    				Formulario de Instalación
    			</h3>
    			<form method="post" action="" role ="form">
            <div class="form-group">
      				<label for="usr">Nombre de Usuario de ArcGIS Online:</label>
      				<input type="text" name="name" placeholder="Nombre de Usuario" value="<?php echo $name;?>" class="form-control">
      				<span class="error">* <?php echo $nameErr;?></span>
            </div>
    				<br>
            <div class="form-group">
      				<label for="pwd">Contraseña:</label>
      				<input type="password" name="password" placeholder="Contraseña de Usuario" value="<?php echo $password;?>" class="form-control" id="pwd">
      				<span class="error">* <?php echo $passwordErr;?></span>
            </div>
            <div class="form-group">
      				<label for="webmap">ID de WebMap:</label>
      				<input type="text" name="webmap" value="<?php echo $webmap;?>" placeholder="XXXXXXXXX" class="form-control" id="webmap">
            </div>
            <div class="form-group">
      				<label for="clientid">ID Aplicación en ArcGIS Developers:</label>
      				<input type="text" name="clientid" value="<?php echo $clientid;?>" placeholder="XXXXXXXXX" class="form-control" id="clientid">
            </div>
    				<br>
    				<br>
    				<input type="submit" class="btn btn-primary btn-block btn-lg" name="submit" value="Enviar">
			     </form>
		    </div>
        <div class= "row" id="datos_webmap">
        </div>
      </div>
    </div>
	</body>
</html>
