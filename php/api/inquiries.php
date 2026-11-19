<?php
// Contact form inquiries, one JSON file each in <data>/inquiries.
// POST:   public contact-form submission. Saved, then emailed. Honeypot field "website"; 5 per IP per 10 minutes.
// GET:    list (admin).
// PATCH:  { id, status } (admin).
// DELETE: ?id=<id> (admin).
define('KAIZEN', true);
require __DIR__ . '/_lib.php';

kz_only_methods(['GET', 'POST', 'PATCH', 'DELETE']);

if (kz_method() === 'POST') {
    $body = kz_json_body(64 * 1024);
    // Real visitors never see or fill the "website" field; bots often do. Pretend success.
    if (!empty($body['website'])) kz_send_json(['ok' => true]);
    if (kz_rate_hits('inquiry', true) > 5) {
        kz_fail('Too many submissions. Please try again later or call us directly.', 429);
    }

    $limits = ['name' => 120, 'email' => 200, 'phone' => 40, 'businessInterest' => 120, 'message' => 5000];
    $clean = [];
    foreach ($limits as $key => $max) {
        $value = is_string($body[$key] ?? null) ? trim($body[$key]) : '';
        if (kz_str_len($value) > $max) kz_fail("$key is too long");
        $clean[$key] = $value;
    }
    if ($clean['name'] === '' || $clean['message'] === '') kz_fail('Name and message are required');
    if (!filter_var($clean['email'], FILTER_VALIDATE_EMAIL)) kz_fail('A valid email address is required');

    $inquiry = ['id' => round(microtime(true) * 1000) . '-' . bin2hex(random_bytes(3))] + $clean
        + ['status' => 'new', 'createdAt' => kz_now_iso()];
    kz_write_file(kz_inquiry_file($inquiry['id']), kz_encode($inquiry));
    kz_mail_inquiry($inquiry);
    kz_send_json(['ok' => true], 201);
}

kz_require_admin();

if (kz_method() === 'GET') {
    $list = [];
    foreach (glob(kz_inquiries_dir() . '/*.json') ?: [] as $file) {
        $item = kz_read_json($file);
        if ($item) $list[] = $item;
    }
    usort($list, function ($a, $b) {
        return strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? ''));
    });
    kz_send_json($list);
}

if (kz_method() === 'PATCH') {
    $body = kz_json_body(10 * 1024);
    $status = $body['status'] ?? null;
    if (!in_array($status, KZ_INQUIRY_STATUSES, true)) kz_fail('Invalid status');
    $file = kz_inquiry_file($body['id'] ?? null);
    $inquiry = kz_read_json($file);
    if (!$inquiry) kz_fail('Inquiry not found', 404);
    $inquiry['status'] = $status;
    $inquiry['updatedAt'] = kz_now_iso();
    kz_write_file($file, kz_encode($inquiry));
    kz_send_json($inquiry);
}

// DELETE
$file = kz_inquiry_file($_GET['id'] ?? null);
if (!is_file($file)) kz_fail('Inquiry not found', 404);
if (!unlink($file)) kz_fail('The server could not delete the inquiry', 500);
kz_send_json(['ok' => true]);
