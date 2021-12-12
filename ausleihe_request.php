<?php
require "config.php";
$rfid1;
$rfid2;
$data['user'] = array();
$data['device'] = array();
$data['message'] = '';
$data['response'] = 9;
global $pdo, $usercardtype, $data, $device_1, $device_2;
if ($rfid1 = isset($_GET['rfid1'])) {
  $rfid1 = $_GET['rfid1'];
}
if ($rfid2 = isset($_GET['rfid2'])) {
  $rfid2 = $_GET['rfid2'];
}


/*
rfid1 muss Usercard sein und rfid2 Gerät, wenn man ausleihen möchte.

Wenn nur rfid1:
- Entweder Ipad für Rückgabe
- Oder Info für Usercard
*/

//wenn Input
if (!empty($rfid1 AND $rfid2)) {
  if (rfid_form($rfid1) AND rfid_form($rfid2)) {
    $stm1 = "SELECT * FROM rfid_devices LEFT JOIN rfid_device_type ON rfid_devices.device_type = rfid_device_type.device_type_id WHERE rfid_devices.rfid_code = '".$rfid1."'";
    $stm2 = "SELECT * FROM rfid_devices LEFT JOIN rfid_device_type ON rfid_devices.device_type = rfid_device_type.device_type_id WHERE rfid_devices.rfid_code = '".$rfid2."'";
    $device_1 = $pdo->query($stm1)->fetch();
    $device_2 = $pdo->query($stm2)->fetch();
    if ($device_1['device_type'] == $usercardtype AND $device_2['device_type'] != $usercardtype) {
      $user = "SELECT * FROM user WHERE rfid_code = '".$device_1['device_id']."'";
      $user = $pdo->query($user)->fetch();
      if ($user['rfid_device_id'] == 0) {
        CreateUserObject(1);
        $status_stm = "SELECT * FROM user WHERE rfid_device_id = '".$device_2['device_id']."'";
        $device_status = $pdo->query($status_stm)->fetch();
        if (empty($device_status)) {
          $update_stm = $pdo->query("UPDATE user SET rfid_device_id = ".$device_2['device_id']." WHERE rfid_code = '".$device_1['device_id']."'");
          $device_status = $pdo->query($status_stm)->fetch();
          if (!empty($device_status['rfid_device_id'])) {
            message(0);
            CreateUserObject(1); // User Status aktualisieren
            CreateDeviceObject(2);
            event(1);
          }
          else {
            CreateDeviceObject(2);
            message();}}
        else {
          message(6);
          CreateDeviceObject(2);
        }}
      else {
        message(5);
        CreateUserObject(1);
        CreateDeviceObject(2);
    }}
    else {
      if (empty($device_2)) {message(3);}
      elseif ($device_2['device_type'] == $usercardtype) {message(7);}}}
  else {message(3);}}
elseif(!empty($rfid1)) {
  if (rfid_form($rfid1)) {
    $stm1 = "SELECT * FROM rfid_devices LEFT JOIN rfid_device_type ON rfid_devices.device_type = rfid_device_type.device_type_id WHERE rfid_devices.rfid_code = '".$rfid1."'";
    $device_1 = $pdo->query($stm1)->fetch();
    if (!empty($device_1)) {
      if ($device_1['device_type'] == $usercardtype) {
        CreateUserObject(1);
        message(2);
        CollectHistoryData();
      }
      else {
        $status_stm = "SELECT * FROM user WHERE rfid_device_id = '".$device_1['device_id']."'";
        $device_status_ = $pdo->query($status_stm)->fetch();
        if (!empty($device_status_)) {
          CreateUserObject(1);
          $update_stm = $pdo->query("UPDATE user SET rfid_device_id = '0' WHERE rfid_device_id = '".$device_1['device_id']."'");
          $device_status_ = $pdo->query($status_stm)->fetch();
          if (empty($device_status_['rfid_device_id'])) {
            message(1);
            CreateDeviceObject(1);
            event(0);
          }
          else {
            CreateDeviceObject(1);
            message();
        }}
        else {
          CreateDeviceObject(1);
          message(4);
    }}}
    else {
      message(3);
  }}
  else {
      message(3);
}}
elseif (empty($rfid1) and empty($rfid2)) {
  message(9);
}

function message($messageID) {
  global $data;
  switch ($messageID) {
  case 0:
      $data['message'] = $data['message']."Ausleihen erfolgreich. ";
      $data['response'] = '0';
      break;
  case 1:
      $data['message'] = $data['message']."Rückgabe erfolgreich. ";
      $data['response'] = '1';
      break;
  case 2:
      $data['message'] = $data['message']."Info erfolgreich. ";
      $data['response'] = '2';
      break;
  case 3:
      $data['message'] = $data['message']."Device/Usercard nicht Registriert. ";
      $data['response'] = '3';
      break;
  case 4:
      $data['message'] = $data['message']."Device kann nicht zurückgegeben werden, weil es nicht ausgeliehen wird. ";
      $data['response'] = '4';
      break;
  case 5:
      $data['message'] = $data['message']."Device kann nicht ausgeliehen weil man bereits etwas ausleiht. ";
      $data['response'] = '5';
      break;
  case 6:
      $data['message'] = $data['message']."Device wird bereits ausgeliehen. ";
      $data['response'] = '6';
      break;
  case 7:
      $data['message'] = $data['message']."Es handelt sich nicht um ein Device. ";
      $data['response'] = '7';
      break;
  case 9:
      $data['message'] = $data['message']."Keine rfid Angabe. ";
      $data['response'] = '9';
      break;
  default:
     $data['message'] = $data['message']."Unexpected Error ";
     $data['response'] = '8';
}}

function CreateUserObject($device_a) {
  global $rfid1, $data, $device_1, $device_2, $pdo, $device_status_, $usercardtype;
  $device = "device_".$device_a;
  $variable = (${$device}['device_type'] == $usercardtype) ? "rfid_code" : "rfid_device_id";
  $user_stm = "SELECT * FROM user LEFT JOIN klassen ON klassen.id = user.klasse WHERE ".$variable." = '".${$device}['device_id']."'";
  $user_data = $pdo->query($user_stm)->fetch();
  $data['user']['vorname'] = $user_data['vorname'];
  $data['user']['nachname'] = $user_data['name'];
  $data['user']['user_id'] = $user_data['user_id'];
  $data['user']['klasse'] = $user_data['klassen_name'];
  $data['user']['status'] = $user_data['rfid_device_id'];
}

function CreateDeviceObject($device_a) { // status muss noch automatisiert werden.
  global $data, $device_1, $device_2, $pdo, $usercardtype;
  $device = "device_".$device_a;
  $variable = (${$device}['device_type'] == $usercardtype) ? "rfid_code" : "rfid_device_id";
  $object_stm = "SELECT * FROM user WHERE ".$variable." = '".${$device}['device_id']."'";
  $object_data = $pdo->query($object_stm)->fetch();
  $status = ($object_data) ? $object_data['user_id'] : "false";
  $device = "device_".$device_a;
  $data['device']['device_type'] = ${$device}['name']; // varable variables: Call Variable from String with Index for Array
  $data['device']['status'] = $status;
  $data['device']['id'] = ${$device}['device_id'];
  $data['device']['rfid_code'] = ${$device}['rfid_code'];
}

function CollectHistoryData() {
  global $data, $device_1, $pdo, $rfid_read;
  $history_stm = "SELECT device_id, status, time_stamp FROM rfid_event WHERE event_type_id = '".$rfid_read."' AND user_id = '".$data['user']['user_id']."' LIMIT 20";
  $history = $pdo->query($history_stm)->fetch();
  $data['user']['history'] = $history;
}

function event($status) {
  global $rfid_read, $pdo, $data;
  $rfid_event = $pdo->query("INSERT INTO rfid_event (id, event_type_id, user_id, device_id, status, time_stamp) VALUES (NULL, ".$rfid_read.", ".$data['user']['user_id'].", ".$data['device']['id'].", ".$status.", date('Y-m-d H:i:s'))");
}

echo json_encode($data);
?>
