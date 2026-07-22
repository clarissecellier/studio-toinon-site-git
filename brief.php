<?php
/**
 * brief.php — Réception d'un questionnaire de brief client et envoi par email.
 * Hébergé sur OVH (PHP). Reçoit un POST, envoie un mail à clarisse@studio-toinon.fr,
 * répond en JSON { ok: true } ou { ok: false, error: "..." }.
 *
 * Générique : le formulaire assemble lui-même les réponses formatées dans le champ
 * "message". Ici on valide, on sécurise, et on envoie.
 *
 * Champs attendus (POST) : client (nom du client/projet), nom, email, tel (optionnel),
 * message (bloc de réponses déjà formaté), website (honeypot anti-spam, doit rester vide).
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Méthode non autorisée.']);
    exit;
}

// Honeypot : un bot remplit ce champ caché. On simule un succès et on n'envoie rien.
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

function champ($cle) {
    return isset($_POST[$cle]) ? trim($_POST[$cle]) : '';
}

$client  = champ('client');
$nom     = champ('nom');
$email   = champ('email');
$tel     = champ('tel');
$message = champ('message');

// Validation : nom + email valides suffisent, le reste du brief peut être partiel.
$invalides = [];
if ($nom === '')                                                 $invalides[] = 'nom';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $invalides[] = 'email';

if ($invalides) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Merci d\'indiquer au moins votre nom et un email valide.', 'fields' => $invalides]);
    exit;
}

$destinataire = 'clarisse@studio-toinon.fr';
$sujet        = 'Nouveau brief' . ($client !== '' ? ' — ' . $client : '');

$lignes = [];
if ($client !== '') $lignes[] = 'Client / projet : ' . $client;
$lignes[] = 'Contact : ' . $nom;
$lignes[] = 'Email : ' . $email;
if ($tel !== '')    $lignes[] = 'Téléphone : ' . $tel;
$lignes[] = '';
$lignes[] = str_repeat('—', 24);
$lignes[] = '';
$lignes[] = $message;
$lignes[] = '';
$lignes[] = '— Envoyé depuis le questionnaire de brief de studio-toinon.fr';
$corps = implode("\n", $lignes);

// Anti-injection d'en-têtes : on retire tout retour à la ligne de l'email du visiteur.
$emailReply = str_replace(["\r", "\n"], '', $email);

$entetes  = 'From: Studio Toinon <clarisse@studio-toinon.fr>' . "\r\n";
$entetes .= 'Reply-To: ' . $emailReply . "\r\n";
$entetes .= 'MIME-Version: 1.0' . "\r\n";
$entetes .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$entetes .= 'Content-Transfer-Encoding: 8bit';

// Sujet encodé UTF-8 (accents corrects dans toutes les messageries)
$sujetEncode = '=?UTF-8?B?' . base64_encode($sujet) . '?=';

$envoye = @mail($destinataire, $sujetEncode, $corps, $entetes, '-f' . $destinataire);

if ($envoye) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => "L'envoi a échoué. Réessayez ou écrivez directement à clarisse@studio-toinon.fr."]);
}
