<?php
// Shared helpers for the PHP backend. The website and admin pages are static HTML (Next.js static export);
// everything that has to be saved on the server goes through the small scripts in this folder:
//   content.php    site content (public read, admin write)
//   session.php    admin sign-in / sign-out
//   uploads.php    admin media library
//   inquiries.php  contact form (public submit, admin list/update/delete)
// Written for PHP 7.4+ so it runs on ordinary cPanel shared hosting.

if (!defined('KAIZEN')) {
    http_response_code(404);
    exit;
}

const KZ_UPLOAD_TYPES = [
    'image/jpeg' => '.jpg',
    'image/png' => '.png',
    'image/webp' => '.webp',
    'image/gif' => '.gif',
    'image/avif' => '.avif',
    'application/pdf' => '.pdf',
];
const KZ_EXT_TYPES = [
    '.jpg' => 'image/jpeg',
    '.jpeg' => 'image/jpeg',
    '.png' => 'image/png',
    '.webp' => 'image/webp',
    '.gif' => 'image/gif',
    '.avif' => 'image/avif',
    '.pdf' => 'application/pdf',
];
const KZ_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const KZ_SESSION_SECONDS = 12 * 60 * 60;
const KZ_RATE_WINDOW = 10 * 60;
const KZ_INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];

// Settings: api/config.php (written by `npm run package:<site>`), or $GLOBALS['KAIZEN_CONFIG'] from the dev router.
function kz_config(): array
{
    static $config = null;
    if ($config === null) {
        $loaded = $GLOBALS['KAIZEN_CONFIG'] ?? (is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : []);
        $root = dirname(__DIR__);
        $config = (is_array($loaded) ? $loaded : []) + [
            'site' => 'site',
            'site_name' => 'Kaizen',
            'password_hash' => '',
            'inquiry_email' => '',
            // Private data (content.json, inquiries/). The packaged _data/.htaccess blocks web access to it;
            // set an absolute path outside public_html in config.php to keep it out of the web root entirely.
            'data_dir' => $root . '/_data',
            // Public uploads folder, served directly by the web server at /uploads/<name>.
            'uploads_dir' => $root . '/uploads',
            // Original photos that ship with the site (cannot be deleted from the admin).
            'seed_files' => [],
            // Development only: a folder of seed photos listed alongside the uploads.
            'seed_dir' => '',
        ];
    }
    return $config;
}

function kz_send_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function kz_fail(string $message, int $status = 400): void
{
    kz_send_json(['error' => $message], $status);
}

function kz_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function kz_only_methods(array $allowed): void
{
    if (!in_array(kz_method(), $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        kz_fail('Method not allowed', 405);
    }
}

function kz_json_body(int $maxBytes = 2 * 1024 * 1024): array
{
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) > $maxBytes) {
        kz_fail('Request is too large', 413);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        kz_fail('Body must be valid JSON');
    }
    return $data;
}

function kz_str_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function kz_client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

function kz_now_iso(): string
{
    return gmdate('Y-m-d\TH:i:s.000\Z');
}

function kz_mkdir(string $dir): void
{
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        kz_fail('The server could not create a storage folder. Check folder permissions.', 500);
    }
}

// Writes via a temp file + rename so readers never see a half-written file.
function kz_write_file(string $file, string $contents): void
{
    kz_mkdir(dirname($file));
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, $contents, LOCK_EX) === false || !rename($tmp, $file)) {
        @unlink($tmp);
        kz_fail('The server could not save the file. Check folder permissions.', 500);
    }
}

function kz_read_json(string $file)
{
    if (!is_file($file)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($file), true);
    return is_array($data) ? $data : null;
}

function kz_encode(array $data): string
{
    return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

// ---- Rate limiting (per IP, stored in the data folder) ----

// Counts this IP's hits in a bucket over the last 10 minutes, optionally recording a new one first.
function kz_rate_hits(string $bucket, bool $record): int
{
    $dir = kz_config()['data_dir'];
    kz_mkdir($dir);
    $fp = @fopen($dir . '/ratelimit.json', 'c+');
    if (!$fp) {
        return 0;
    }
    flock($fp, LOCK_EX);
    $data = json_decode((string) stream_get_contents($fp), true);
    $data = is_array($data) ? $data : [];
    $now = time();
    foreach ($data as $key => $hits) {
        $data[$key] = array_values(array_filter((array) $hits, function ($t) use ($now) {
            return $now - (int) $t < KZ_RATE_WINDOW;
        }));
        if (!$data[$key]) {
            unset($data[$key]);
        }
    }
    $key = $bucket . ':' . kz_client_ip();
    if ($record) {
        $data[$key][] = $now;
    }
    $count = count($data[$key] ?? []);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    flock($fp, LOCK_UN);
    fclose($fp);
    return $count;
}

// ---- Admin session ----

function kz_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    session_name('kaizen_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

// Sessions are per site, so signing in to one site's admin never unlocks another's (they can share a server).
function kz_is_admin(): bool
{
    kz_start_session();
    $expires = $_SESSION['kaizen_admin'][kz_config()['site']] ?? 0;
    return (int) $expires > time();
}

// Every admin endpoint calls this. Writes must also carry the X-Kaizen-Admin header, which a cross-site
// form cannot send, on top of the SameSite=Lax cookie.
function kz_require_admin(): void
{
    $ok = kz_is_admin();
    session_write_close();
    if (!$ok) {
        kz_fail('Unauthorized', 401);
    }
    if (kz_method() !== 'GET' && ($_SERVER['HTTP_X_KAIZEN_ADMIN'] ?? '') !== '1') {
        kz_fail('Missing admin request header', 403);
    }
}

// The stored hash looks like pbkdf2_sha256$<iterations>$<salt hex>$<hash hex> (see scripts/package.mjs).
function kz_check_password($password): bool
{
    $stored = (string) kz_config()['password_hash'];
    if (!is_string($password) || $password === '' || $stored === '') {
        return false;
    }
    $parts = explode('$', $stored);
    if (count($parts) !== 4 || $parts[0] !== 'pbkdf2_sha256') {
        return false;
    }
    $salt = @hex2bin($parts[2]);
    if ($salt === false) {
        return false;
    }
    $hash = hash_pbkdf2('sha256', $password, $salt, (int) $parts[1], 32, true);
    return hash_equals($parts[3], bin2hex($hash));
}

// ---- Content ----

function kz_content_file(): string
{
    return kz_config()['data_dir'] . '/content.json';
}

function kz_validate_content($c): array
{
    $problems = [];
    if (!is_array($c)) {
        $problems[] = 'content must be an object';
    } else {
        if (empty($c['meta']) || !is_array($c['meta'])) $problems[] = 'meta is required';
        if (empty($c['umbrella']) || !is_array($c['umbrella'])) $problems[] = 'umbrella is required';
        if (!isset($c['contacts']['phones']) || !is_array($c['contacts']['phones'])) $problems[] = 'contacts.phones must be an array';
        if (!isset($c['businesses']) || !is_array($c['businesses'])) $problems[] = 'businesses must be an array';
    }
    return $problems;
}

// ---- Uploads ----

function kz_seed_names(): array
{
    $config = kz_config();
    $names = (array) $config['seed_files'];
    if ($config['seed_dir'] && is_dir($config['seed_dir'])) {
        foreach (scandir($config['seed_dir']) ?: [] as $name) {
            if (is_file($config['seed_dir'] . '/' . $name)) $names[] = $name;
        }
    }
    return array_values(array_unique($names));
}

function kz_ext(string $name): string
{
    $dot = strrpos($name, '.');
    return $dot === false ? '' : strtolower(substr($name, $dot));
}

// A plain file name we serve (no folders, known extension).
function kz_safe_upload_name($name): bool
{
    return is_string($name) && $name !== '' && basename($name) === $name && $name[0] !== '.'
        && isset(KZ_EXT_TYPES[kz_ext($name)]);
}

// ---- Inquiries ----

function kz_inquiries_dir(): string
{
    return kz_config()['data_dir'] . '/inquiries';
}

function kz_inquiry_file($id): string
{
    if (!is_string($id) || !preg_match('/^[a-z0-9-]+$/', $id)) {
        kz_fail('Invalid inquiry id');
    }
    return kz_inquiries_dir() . '/' . $id . '.json';
}

function kz_header_text(string $value): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $value));
}

// Emails a new inquiry to the configured address, or to the contact email saved in the site content.
// Returns false if no address is known or the server could not send; the inquiry is saved either way.
function kz_mail_inquiry(array $q): bool
{
    $to = (string) kz_config()['inquiry_email'];
    if ($to === '') {
        $content = kz_read_json(kz_content_file());
        $to = (string) ($content['contacts']['primaryEmail'] ?? $content['meta']['contactEmail'] ?? '');
    }
    if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !function_exists('mail')) {
        return false;
    }
    $host = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost')));
    $host = preg_replace('/^www\./', '', preg_replace('/[^a-z0-9.-]/', '', $host));
    $site = kz_header_text((string) kz_config()['site_name']);
    $subject = '=?UTF-8?B?' . base64_encode('New website inquiry from ' . kz_header_text($q['name']) . ' — ' . $site) . '?=';
    $headers = implode("\r\n", [
        'From: ' . $site . ' Website <noreply@' . ($host ?: 'localhost') . '>',
        'Reply-To: ' . $q['email'],
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $body = "A new message was sent through the {$site} website contact form.\n\n"
        . "Name:     {$q['name']}\n"
        . "Email:    {$q['email']}\n"
        . "Phone:    " . ($q['phone'] !== '' ? $q['phone'] : '-') . "\n"
        . "Interest: " . ($q['businessInterest'] !== '' ? $q['businessInterest'] : '-') . "\n"
        . "Sent:     " . gmdate('j M Y, H:i') . " UTC\n\n"
        . "Message:\n{$q['message']}\n\n"
        . "Reply to this email to answer them. All inquiries are also listed in the website admin under Inquiries.\n";
    return @mail($to, $subject, $body, $headers);
}
