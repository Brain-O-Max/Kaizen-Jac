<?php
// Admin media library.
// GET:    list uploads (and the built-in photos).
// POST:   upload one or more files as multipart field "file[]" (images or PDF, max 10 MB each).
// DELETE: ?name=<file> removes an upload. Built-in photos cannot be deleted.
define('KAIZEN', true);
require __DIR__ . '/_lib.php';

kz_only_methods(['GET', 'POST', 'DELETE']);
kz_require_admin();
$config = kz_config();
$dir = $config['uploads_dir'];
$seeds = kz_seed_names();

if (kz_method() === 'GET') {
    $entries = [];
    $sources = [$dir];
    if ($config['seed_dir']) $sources[] = $config['seed_dir'];
    foreach ($sources as $source) {
        foreach (is_dir($source) ? (scandir($source) ?: []) : [] as $name) {
            $path = $source . '/' . $name;
            if (!kz_safe_upload_name($name) || isset($entries[$name]) || !is_file($path)) continue;
            $entries[$name] = [
                'name' => $name,
                'url' => '/uploads/' . rawurlencode($name),
                'size' => filesize($path),
                'modifiedAt' => gmdate('Y-m-d\TH:i:s.000\Z', filemtime($path)),
                'seeded' => in_array($name, $seeds, true),
            ];
        }
    }
    $list = array_values($entries);
    usort($list, function ($a, $b) {
        return strcmp($b['modifiedAt'], $a['modifiedAt']);
    });
    kz_send_json($list);
}

if (kz_method() === 'DELETE') {
    $name = $_GET['name'] ?? '';
    if (!kz_safe_upload_name($name)) kz_fail('Invalid file name');
    if (in_array($name, $seeds, true)) kz_fail('Built-in photos cannot be deleted');
    if (!is_file($dir . '/' . $name)) kz_fail('File not found', 404);
    if (!unlink($dir . '/' . $name)) kz_fail('The server could not delete the file', 500);
    kz_send_json(['ok' => true]);
}

// POST: PHP drops the whole request when it is bigger than post_max_size, so explain that case.
$files = $_FILES['file'] ?? null;
if (!$files) {
    $tooBig = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0;
    kz_fail($tooBig ? 'The upload is larger than the server allows (see api/.user.ini).' : 'No file provided');
}
// Normalise single ("file") and multiple ("file[]") uploads to lists.
foreach (['name', 'type', 'tmp_name', 'error', 'size'] as $key) {
    $files[$key] = (array) $files[$key];
}

$finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
$saved = [];
foreach ($files['tmp_name'] as $i => $tmp) {
    $original = (string) $files['name'][$i];
    $error = (int) $files['error'][$i];
    if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) kz_fail("$original is larger than the server allows");
    if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($tmp)) kz_fail("Upload of $original failed (error $error)");
    if ((int) $files['size'][$i] > KZ_MAX_UPLOAD_BYTES) kz_fail("$original is larger than 10 MB");

    // Trust the file's actual bytes, not the type the browser claimed.
    $type = $finfo ? (string) finfo_file($finfo, $tmp) : (string) $files['type'][$i];
    $ext = KZ_UPLOAD_TYPES[$type] ?? null;
    if (!$ext) kz_fail("Unsupported file type for $original: " . ($type ?: 'unknown'));

    $base = strtolower(pathinfo($original, PATHINFO_FILENAME));
    $base = substr(trim(preg_replace('/[^a-z0-9]+/', '-', $base), '-'), 0, 40) ?: 'upload';
    $name = $base . '-' . bin2hex(random_bytes(4)) . $ext;

    kz_mkdir($dir);
    if (!move_uploaded_file($tmp, $dir . '/' . $name)) kz_fail('The server could not save the upload. Check folder permissions.', 500);
    @chmod($dir . '/' . $name, 0644);
    $saved[] = ['name' => $name, 'url' => '/uploads/' . $name, 'size' => (int) $files['size'][$i], 'type' => $type];
}
kz_send_json($saved, 201);
