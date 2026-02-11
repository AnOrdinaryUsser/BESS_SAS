#include <ESP32Servo.h>
#include <AccelStepper.h>

// Definición de los pines para el puente H L298N
const int IN1 = 32; // Puedes cambiar estos pines según tu conexión
const int IN2 = 33;
const int IN3 = 13;
const int IN4 = 14;

// Definición de los pines para los sensores
int sensorInd = 26; // Pin A0 (analógico)
int sensorpin = 5; // Pin digital D4 (ajusta según tu conexión)

// Variables para almacenar los valores de los sensores
int indValue;
float metalDetected;

// Variable para saber si las puertas están cerradas
bool puertasCerradas = false;

// Definición de los servos
Servo servo1;  // Crear un objeto para el primer servo
Servo servo2;  // Crear un objeto para el segundo servo

int pos1 = 20;  // Variable para la posición inicial del primer servo
int pos2 = 150;   // Variable para la posición inicial del segundo servo
const int stepDelay = 10;  // Retardo en milisegundos entre cada paso

// Umbral para detectar si hay un objeto presente
const int objetoPresenteUmbral = 5; // Ajusta este valor según tus necesidades

// Instancia de AccelStepper
AccelStepper stepper(AccelStepper::FULL4WIRE, 2, 4, 22, 23); // Ajusta los pines según tu configuración

// Definir las posiciones en pasos
#define INICIO 0
#define PUERTAS -300
#define CAMARA -1400
#define PUNTO1 -1100
#define PUNTO2 -2600
#define FINAL -3800

void setup() {
  // Configuración de los pines del puente H como salida
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  // Configuración del pin del sensor capacitivo como entrada
  pinMode(sensorpin, INPUT);

  // Iniciar comunicación serie a 115200 baudios
  Serial.begin(115200);

  // Adjuntar los servos a los pines correspondientes (ajustar los pines según tu configuración)
  servo1.attach(18);  // Pin GPIO 18
  servo2.attach(19);  // Pin GPIO 19

  // Inicializar las posiciones de los servos
  servo1.write(pos1);
  servo2.write(pos2);

  // Configurar la velocidad máxima y aceleración del motor
  stepper.setMaxSpeed(500);    // Ajusta según tus necesidades
  stepper.setAcceleration(250); // Ajusta según tus necesidades
  
  //Serial.println("Sistema inicializado.");
  //Serial.println("Envía '1' para abrir las puertas, '2' para cerrar las puertas.");
  //Serial.println("Envía 'o' para mover servo1 de 150 a 0 grados y servo2 de 150 a 10 grados.");
  //Serial.println("Envía 'c' para mover servo1 de 0 a 150 grados y servo2 de 10 a 150 grados.");
  //Serial.println("Envía '0', '1', '2' o '3' para mover el motor paso a paso a posiciones predefinidas.");
}

void loop() {
  // Control de las puertas mediante el monitor serie
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');

    if (command == "1") {
      // Abrir puertas
      digitalWrite(IN1, HIGH);
      digitalWrite(IN2, LOW);
      digitalWrite(IN3, HIGH);
      digitalWrite(IN4, LOW);
      delay(300);
      digitalWrite(IN1, LOW);
      digitalWrite(IN2, LOW);
      digitalWrite(IN3, LOW);
      digitalWrite(IN4, LOW);
      puertasCerradas = false;
      //Serial.println("Puertas abiertas");
    } else if (command == "2") {
      // Cerrar puertas
      digitalWrite(IN1, LOW);
      digitalWrite(IN2, HIGH);
      digitalWrite(IN3, LOW);
      digitalWrite(IN4, HIGH);
      delay(300);
      digitalWrite(IN1, LOW);
      digitalWrite(IN2, LOW);
      digitalWrite(IN3, LOW);
      digitalWrite(IN4, LOW);
      puertasCerradas = true;
      //Serial.println("Puertas cerradas");
    } else if (command == "o") {
      //Serial.println("Moviendo servo1 de 150 a 0 grados y servo2 de 150 a 10 grados...");
      moveServos(10, 150);
      //Serial.println("Servos en posición: servo1 a 0 grados, servo2 a 10 grados.");
    } else if (command == "c") {
      //Serial.println("Moviendo servo1 de 0 a 150 grados y servo2 de 10 a 150 grados...");
      moveServos(150, 10);
      //Serial.println("Servos en posición: servo1 a 150 grados, servo2 a 150 grados.");
    } else if (command == "n1") {
      moveToPosition(INICIO);
    } else if (command == "n2") {
      moveToPosition(PUNTO1);
    } else if (command == "n3") {
      moveToPosition(PUNTO2);
    } else if (command == "n4") {
      moveToPosition(FINAL);
    } else if (command == "n0") {
      moveToPosition(PUERTAS);
    } else if (command == "nc") {
       moveToPosition(CAMARA);
    }
  }

  // Solo iniciar la detección de materiales si las puertas están cerradas
  if (puertasCerradas) {
    // Leer valor analógico del sensor
    indValue = analogRead(sensorInd);
    delay(10);

    // Leer valor digital del sensor capacitivo
    int sensorstate = digitalRead(sensorpin);
    delay(500);

    // Convertir valor analógico a porcentaje
    metalDetected = (float)indValue * 100 / 1024.0;
    delay(50);

    // Verificar si hay un objeto presente
    if (indValue > objetoPresenteUmbral || sensorstate != 0) {
      // DETECCIÓN DE METALES
      if (indValue >= 250) {
        //Serial.print("Metal Detectado ");
        //Serial.print(metalDetected);
        //Serial.print(" METAL: ");
        //Serial.print(indValue);
        //Serial.print(" S: ");
        //Serial.println(sensorstate);
      }
      // DETECCIÓN DE VIDRIO
      else if (indValue <= 250 && sensorstate == 1) {
        //Serial.print("Vidrio Detectado ");
        //Serial.print(metalDetected);
        //Serial.print(" METAL: ");
        //Serial.print(indValue);
        //Serial.print(" S: ");
        //Serial.println(sensorstate);
      }
      // DETECCIÓN DE PLÁSTICO
      else if (indValue <= 250 && sensorstate != 1) {
        //Serial.print("Plástico Detectado ");
        //Serial.print(metalDetected);
        //Serial.print(" METAL: ");
        //Serial.print(indValue);
        //Serial.print(" S: ");
        //Serial.println(sensorstate);
      }
    }
  }

  // Actualizar AccelStepper
  stepper.run();
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

void moveToPosition(int targetPosition) {
  stepper.moveTo(targetPosition);
}
