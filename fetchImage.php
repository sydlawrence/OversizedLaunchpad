<?php

$data = file_get_contents($argv[1]);

$filename = $argv[1];
$filename = explode("/", $filename);


file_put_contents("public/images/".$filename[count($filename)-1], $data);

?>