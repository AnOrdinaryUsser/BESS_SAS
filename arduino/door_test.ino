#include <ESP32Servo.h>

Servo servo1;  // Crear un objeto para el primer servo
Servo servo2;  // Crear un objeto para el segundo servo

int pos1 = 150;  // Variable para la posición inicial del primer servo
int pos2 = 10;   // Variable para la posición inicial del segundo servo
const int stepDelay = 10;  // Retardo en milisegundos entre cada paso

void setup() {
  // Adjuntar los servos a los pines correspondientes (ajustar los pines según tu configuración)
  servo1.attach(18);  // Pin GPIO 18
  servo2.attach(19);  // Pin GPIO 19

  // Inicializar las posiciones de los servos
  servo1.write(pos1);
  servo2.write(pos2);

  // Iniciar la comunicación serial a 115200 bps
  Serial.begin(115200);

  // Mensaje inicial
  Serial.println("Servos inicializados.");
  Serial.println("Envía 'o' para mover servo1 de 150 a 0 grados y servo2 de 150 a 10 grados.");
  Serial.println("Envía 'c' para mover servo1 de 0 a 150 grados y servo2 de 10 a 150 grados.");
}

void loop() {
  // Comprobar si hay datos disponibles en la terminal
  if (Serial.available() > 0) {
    // Leer el carácter ingresado
    char ch = Serial.read();

    // Comprobar si el carácter es 'o' para mover los servos
    if (ch == 'o') {
      Serial.println("Moviendo servo1 de 150 a 0 grados y servo2 de 150 a 10 grados...");
      moveServos(0, 150);
      Serial.println("Servos en posición: servo1 a 0 grados, servo2 a 10 grados.");
    }
    // Comprobar si el carácter es 'c' para mover los servos
    else if (ch == 'c') {
      Serial.println("Moviendo servo1 de 0 a 150 grados y servo2 de 10 a 150 grados...");
      moveServos(140, 10);
      Serial.println("Servos en posición: servo1 a 150 grados, servo2 a 150 grados.");
    }
  }
}

void moveServos(int targetPos1, int targetPos2) {
  // Mover los servos a las nuevas posiciones paso a paso
  while (pos1 != targetPos1 || pos2 != targetPos2) {
    if (pos1 < targetPos1) {
      pos1++;
    } else if (pos1 > targetPos1) {
      pos1--;
    }
    servo1.write(pos1);

    if (pos2 < targetPos2) {
      pos2++;
    } else if (pos2 > targetPos2) {
      pos2--;
    }
    servo2.write(pos2);

    delay(stepDelay);
  }
}
