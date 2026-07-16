#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>

const char* ssid = "GANTI_NAMA_WIFI";
const char* password = "GANTI_PASSWORD_WIFI";

// Pakai IP/laptop yang menjalankan backend dummy.
// Contoh lokal:
// const char* serverBaseUrl = "http://192.168.1.10:3000";
const char* serverBaseUrl = "http://192.168.1.10:3000";
const char* nodeName = "SoilMonitoringESP8266";
const char* nodeLocation = "Field Sector A";

const int soilSensorPin = A0;
const unsigned long serialInterval = 2000;
const unsigned long serverInterval = 5000;

int adcValue = 0;
int moisturePercent = 0;
String soilStatus = "Tidak tersedia";

String getSoilStatus(int kelembaban) {
  if (kelembaban <= 30) {
    return "Kering";
  }

  if (kelembaban <= 70) {
    return "Lembab";
  }

  return "Basah";
}

void readSoilSensor() {
  adcValue = analogRead(soilSensorPin);
  moisturePercent = map(adcValue, 1024, 498, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  soilStatus = getSoilStatus(moisturePercent);
}

void connectToWiFi() {
  const unsigned long wifiTimeout = 20000;
  const unsigned long startAttempt = millis();

  Serial.println("Menghubungkan ke WiFi...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < wifiTimeout) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi berhasil terhubung");
    Serial.print("IP ESP8266: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi belum terhubung");
    Serial.println("Periksa SSID dan password, lalu upload ulang");
  }
}

String buildJsonPayload() {
  String jsonPayload = "{";
  jsonPayload += "\"kelembaban\":" + String(moisturePercent) + ",";
  jsonPayload += "\"status\":\"" + soilStatus + "\",";
  jsonPayload += "\"adc\":" + String(adcValue) + ",";
  jsonPayload += "\"node_name\":\"" + String(nodeName) + "\",";
  jsonPayload += "\"location\":\"" + String(nodeLocation) + "\"";
  jsonPayload += "}";

  return jsonPayload;
}

bool beginHttpClient(HTTPClient& http, const String& url) {
  if (url.startsWith("https://")) {
    static WiFiClientSecure secureClient;
    secureClient.setInsecure();
    http.begin(secureClient, url);
    http.setTimeout(15000);
    return true;
  }

  static WiFiClient client;
  http.begin(client, url);
  http.setTimeout(15000);
  return true;
}

void testBackendConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Tes backend gagal: WiFi belum terhubung");
    return;
  }

  HTTPClient http;
  String targetUrl = String(serverBaseUrl) + "/ping";
  beginHttpClient(http, targetUrl);
  const int httpResponseCode = http.GET();

  Serial.print("Tes koneksi backend: ");
  Serial.println(targetUrl);
  Serial.print("HTTP Response Ping: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    Serial.print("Respons Ping: ");
    Serial.println(http.getString());
  } else {
    Serial.print("Error Ping: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Gagal kirim data: WiFi belum terhubung");
    return;
  }

  HTTPClient http;
  String targetUrl = String(serverBaseUrl) + "/api/sensor";
  String jsonPayload = buildJsonPayload();

  beginHttpClient(http, targetUrl);
  http.addHeader("Content-Type", "application/json");
  const int httpResponseCode = http.POST(jsonPayload);

  Serial.print("Kirim data ke server: ");
  Serial.println(targetUrl);
  Serial.print("Payload JSON: ");
  Serial.println(jsonPayload);
  Serial.print("HTTP Response: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    Serial.print("Respons Server: ");
    Serial.println(http.getString());
  } else {
    Serial.print("Keterangan Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println();
  Serial.println("Booting ESP8266...");
  Serial.println("Memulai sistem monitoring kelembaban tanah...");

  connectToWiFi();
  testBackendConnection();
}

void loop() {
  static unsigned long lastSerialUpdate = 0;
  static unsigned long lastServerUpdate = 0;

  if (millis() - lastSerialUpdate >= serialInterval) {
    lastSerialUpdate = millis();
    readSoilSensor();

    Serial.println("----- Data Sensor -----");
    Serial.print("Status WiFi: ");
    Serial.println(WiFi.status() == WL_CONNECTED ? "Terhubung" : "Terputus");
    Serial.print("IP ESP8266: ");
    Serial.println(WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "Belum tersedia");
    Serial.print("Nilai ADC: ");
    Serial.println(adcValue);
    Serial.print("Kelembaban: ");
    Serial.print(moisturePercent);
    Serial.println("%");
    Serial.print("Status Tanah: ");
    Serial.println(soilStatus);
    Serial.println("-----------------------");
  }

  if (millis() - lastServerUpdate >= serverInterval) {
    lastServerUpdate = millis();
    readSoilSensor();
    sendDataToServer();
  }
}
