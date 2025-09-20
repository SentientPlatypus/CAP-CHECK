// Two-player LED + Spacebar HID for Raspberry Pi Pico
#include <Keyboard.h>

const int P1_LED_PIN = 16;   // adjust to your wiring
const int P2_LED_PIN = 17;   // adjust to your wiring
const int PI_LED     = LED_BUILTIN;

const int BUTTON_LED = 19;
const int BUTTON_PIN = 18;   // pushbutton to GND (use INPUT_PULLUP if wired to ground)

int lastState = HIGH;

enum LedMode {
  OFF_MODE = 0,
  SOLID_ON,
  BLINK_1HZ,  // toggle every 500 ms
  BLINK_2HZ,  // toggle every 250 ms
  BLINK_4HZ   // toggle every 125 ms
};

struct PlayerLed {
  int pin;
  LedMode mode = OFF_MODE;
  unsigned long lastToggleMs = 0;
  int currentLevel = LOW;  // tracks the actual pin level for blinking
};

PlayerLed P1{P1_LED_PIN};
PlayerLed P2{P2_LED_PIN};

unsigned long modeToInterval(LedMode m) {
  switch (m) {
    case BLINK_1HZ: return 500UL;
    case BLINK_2HZ: return 250UL;
    case BLINK_4HZ: return 125UL;
    default:        return 0UL; // OFF or SOLID_ON don't blink
  }
}

void applyModeImmediate(PlayerLed &pl) {
  // For OFF/SOLID_ON, set level once; for blink modes, leave level as-is and let updater toggle.
  if (pl.mode == OFF_MODE) {
    pl.currentLevel = LOW;
    digitalWrite(pl.pin, LOW);
  } else if (pl.mode == SOLID_ON) {
    pl.currentLevel = HIGH;
    digitalWrite(pl.pin, HIGH);
  }
  // Reset the toggle timer whenever mode changes
  pl.lastToggleMs = millis();
}

void updateBlink(PlayerLed &pl, unsigned long now) {
  if (pl.mode == BLINK_1HZ || pl.mode == BLINK_2HZ || pl.mode == BLINK_4HZ) {
    unsigned long interval = modeToInterval(pl.mode);
    if (now - pl.lastToggleMs >= interval) {
      pl.currentLevel = (pl.currentLevel == LOW) ? HIGH : LOW;
      digitalWrite(pl.pin, pl.currentLevel);
      pl.lastToggleMs = now;
    }
  }
  // OFF/SOLID_ON are handled immediately on mode set; nothing to do here.
}

void setup() {
  pinMode(P1_LED_PIN, OUTPUT);
  pinMode(P2_LED_PIN, OUTPUT);
  pinMode(BUTTON_LED, OUTPUT);
  pinMode(PI_LED, OUTPUT);

  // If your button is wired to GND, INPUT_PULLUP is recommended:
  pinMode(BUTTON_PIN, INPUT); // consider INPUT_PULLUP if you have bouncing/floating issues

  digitalWrite(P1_LED_PIN, LOW);
  digitalWrite(P2_LED_PIN, LOW);

  Serial.begin(9600);
  Keyboard.begin();

  // start with both off
  applyModeImmediate(P1);
  applyModeImmediate(P2);
}

void loop() {
  unsigned long now = millis();
  int state = digitalRead(BUTTON_PIN);

  // Mirror button state onto BUTTON_LED
  if (state == HIGH) {
    digitalWrite(BUTTON_LED, HIGH);
  } else {
    digitalWrite(BUTTON_LED, LOW);
  }

  // Button pressed edge: (state goes HIGH from LOW in your current logic)
  if (state == HIGH && lastState == LOW) {
    digitalWrite(PI_LED, HIGH);
    Keyboard.press(' ');
    delay(50); // small debounce for HID press
    Keyboard.releaseAll();
  } else {
    digitalWrite(PI_LED, LOW);
  }
  lastState = state;

  // Handle serial commands
  if (Serial.available() > 0) {
    char c = Serial.read();
    switch (c) {
      // Existing on/off controls (override modes)
      case 'A': P1.mode = SOLID_ON; applyModeImmediate(P1); break;
      case 'a': P1.mode = OFF_MODE; applyModeImmediate(P1); break;
      case 'B': P2.mode = SOLID_ON; applyModeImmediate(P2); break;
      case 'b': P2.mode = OFF_MODE; applyModeImmediate(P2); break;

      case 'Y': P1.mode = SOLID_ON; P2.mode = SOLID_ON; applyModeImmediate(P1); applyModeImmediate(P2); break;
      case 'X': P1.mode = OFF_MODE; P2.mode = OFF_MODE; applyModeImmediate(P1); applyModeImmediate(P2); break;

      // New blink modes
      // P1
      case '1': P1.mode = BLINK_1HZ; applyModeImmediate(P1); break;
      case '2': P1.mode = BLINK_2HZ; applyModeImmediate(P1); break;
      case '3': P1.mode = BLINK_4HZ; applyModeImmediate(P1); break;
      // P2
      case '4': P2.mode = BLINK_1HZ; applyModeImmediate(P2); break;
      case '5': P2.mode = BLINK_2HZ; applyModeImmediate(P2); break;
      case '6': P2.mode = BLINK_4HZ; applyModeImmediate(P2); break;

      default: break; // ignore unknown commands
    }
  }

  // Update blinking (non-blocking)
  updateBlink(P1, now);
  updateBlink(P2, now);

  delay(1); // small breather
}
