<?php
// GET:    { authenticated, configured } for the admin pages.
// POST:   sign in with { password }. 5 wrong passwords per IP lock sign-in for 10 minutes.
// DELETE: sign out.
define('KAIZEN', true);
require __DIR__ . '/_lib.php';

kz_only_methods(['GET', 'POST', 'DELETE']);
$site = kz_config()['site'];

if (kz_method() === 'GET') {
    $authenticated = kz_is_admin();
    session_write_close();
    kz_send_json(['authenticated' => $authenticated, 'configured' => kz_config()['password_hash'] !== '']);
}

if (kz_method() === 'DELETE') {
    kz_start_session();
    unset($_SESSION['kaizen_admin'][$site]);
    kz_send_json(['ok' => true]);
}

if (kz_rate_hits('login', false) >= 5) {
    kz_fail('Too many wrong passwords. Wait 10 minutes and try again.', 429);
}
$body = kz_json_body(10 * 1024);
if (!kz_check_password($body['password'] ?? null)) {
    kz_rate_hits('login', true);
    usleep(500000);
    kz_fail('Incorrect password.', 401);
}
kz_start_session();
session_regenerate_id(true);
$_SESSION['kaizen_admin'][$site] = time() + KZ_SESSION_SECONDS;
kz_send_json(['ok' => true]);
