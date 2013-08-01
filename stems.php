<?php

$files = array();
for ($i = 1; $i<1025;$i++) {
  $filename = $i."";
  if (strlen($filename) < 2) {
    $filename = "00".$filename;
  }
  else if (strlen($filename) < 3) {
    $filename = "0".$filename;
  }

  $filename = $filename.".mp3";
  //$files[$i] = $filename;

  $k = ($i-1) % 32;
  $j = floor(($i-1)/32);

  if (!isset($files[$j.""])) $files[$j.""] = array();

  $files[$j.""][$k.""] = $filename;
}

$str = "var stems = ".json_encode($files);

file_put_contents("stems.js", $str);
?>
