<?php
// GET: { content } — the saved site content (public; the static pages load it so admin edits show without a
//      rebuild). content is null until the admin saves for the first time; the pages then keep the content
//      they were built with.
// PUT: replace the content (admin).
define('KAIZEN', true);
require __DIR__ . '/_lib.php';

kz_only_methods(['GET', 'PUT']);

if (kz_method() === 'GET') {
    kz_send_json(['content' => kz_read_json(kz_content_file())]);
}

kz_require_admin();
$content = kz_json_body();
$problems = kz_validate_content($content);
if ($problems) {
    kz_fail('Invalid content: ' . implode('; ', $problems));
}
kz_write_file(kz_content_file(), kz_encode($content));
kz_send_json(['ok' => true]);
