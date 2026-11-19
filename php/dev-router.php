<?php
// Local development only (`npm run php`): one PHP server for all three sites. The Next.js dev servers forward
// /api/* and /uploads/* here as /<site>/api/* and /<site>/uploads/* (see next.config.ts), and each site
// keeps its data in ./storage/<site>, exactly like the old Node version did.
// The admin password comes from ADMIN_PASSWORD in .env.local (or the environment).

$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
if (!preg_match('#^/(enterprise|design|training)/(api|uploads)/([^/]+)$#', $path, $m)) {
    http_response_code(404);
    echo 'Not found';
    return true;
}
[, $site, $area, $file] = $m;
$root = dirname(__DIR__);
$storage = $root . '/storage/' . $site;

if ($area === 'uploads') {
    $types = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp',
        'gif' => 'image/gif', 'avif' => 'image/avif', 'pdf' => 'application/pdf'];
    $type = $types[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? null;
    foreach ([$storage . '/uploads', $root . '/seed-uploads'] as $dir) {
        if ($type && basename($file) === $file && is_file("$dir/$file")) {
            header("Content-Type: $type");
            header('X-Content-Type-Options: nosniff');
            readfile("$dir/$file");
            return true;
        }
    }
    http_response_code(404);
    echo 'Not found';
    return true;
}

$script = __DIR__ . '/api/' . $file;
if (!preg_match('/^[a-z]+\.php$/', $file) || !is_file($script)) {
    http_response_code(404);
    echo 'Not found';
    return true;
}

// Minimal .env reader: KEY=value lines, later files win, real environment variables win over files.
$env = [];
foreach (['.env', '.env.local', '.env.development.local'] as $name) {
    foreach (is_file("$root/$name") ? file("$root/$name", FILE_IGNORE_NEW_LINES) : [] as $line) {
        if (preg_match('/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/', $line, $kv)) {
            $env[$kv[1]] = trim($kv[2], " \t\"'");
        }
    }
}
$setting = function (string $key) use ($env): string {
    $value = getenv($key);
    return $value !== false && $value !== '' ? $value : ($env[$key] ?? '');
};

$password = $setting('ADMIN_PASSWORD_' . strtoupper($site)) ?: $setting('ADMIN_PASSWORD');
$salt = 'kaizen-dev-salt';
$GLOBALS['KAIZEN_CONFIG'] = [
    'site' => $site,
    'site_name' => ['enterprise' => 'Kaizen Enterprise', 'design' => 'Kaizen Design & Development', 'training' => 'Kaizen Training Center'][$site],
    'password_hash' => $password === '' ? '' : 'pbkdf2_sha256$1000$' . bin2hex($salt) . '$' . hash_pbkdf2('sha256', $password, $salt, 1000, 64),
    'inquiry_email' => $setting('INQUIRY_EMAIL_' . strtoupper($site)) ?: $setting('INQUIRY_EMAIL'),
    'data_dir' => $storage,
    'uploads_dir' => $storage . '/uploads',
    'seed_dir' => $root . '/seed-uploads',
];
require $script;
return true;
