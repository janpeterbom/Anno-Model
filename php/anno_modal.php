<?php
/**
 * [is_url_exist description]
 * @param  [type]  $url [description]
 * @return boolean      [description]
 */

function is_url_exist($url) {

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($code == 200) {
        $status = true;
    }
    else {
        $status = false;
    }
    curl_close($ch);
    return $status;
}

/**
 * [getGetPost description]
 * @param  [type] $thevariable  [description]
 * @param  [type] $defaultvalue [description]
 * @return [type]               [description]
 */

function getGetPost($thevariable, $defaultvalue) {
    if (isset($_GET[$thevariable])) {
        $thevalue = @$_GET[$thevariable];
    }
    else {
        $thevalue = $defaultvalue;
    }
    if ($thevalue == $defaultvalue && isset($_POST[$thevariable])) {
            $thevalue = @$_POST[$thevariable];
    }
    return $thevalue;
}

$destdir     = getGetPost('destdir','');
$filename    = getGetPost('filename','');
$check       = getGetPost('check','false');
$img         = getGetPost('img','');
$dodownload  = getGetPost('download','');
$file_name   = getGetPost('path','');
$downloadimg = getGetPost('downloadimg','');
$signatureid = getGetPost('si','');
$annoid      = getGetPost('ai','');

define('UPLOAD_DIR', $destdir);

if (file_exists(UPLOAD_DIR . $filename) && $check == 'true') {
    echo "true";
    exit();
}
elseif ($check == 'true') {
    echo "false";
    exit();
}

$noExt = preg_replace('/\\.[^.\\s]{3,4}$/', '', basename($filename));
$img   = str_replace('data:image/png;base64,', '', $img);
$img   = str_replace(' ', '+', $img);
$data  = base64_decode($img);
$file  = UPLOAD_DIR . $noExt . $annoid . $signatureid. '_anno.png';

if ($dodownload == 'true') {

    if (is_url_exist($file_name)) {
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=" . basename($file_name));
        readfile($file_name);
    }

    exit();
}

$success = file_put_contents($file, $data);
print $success ? $noExt . '_anno.png' : 'Unable to save the file.';
?>
