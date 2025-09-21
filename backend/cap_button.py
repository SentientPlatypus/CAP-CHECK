import serial

class CapButton:
    BLINK_FAST = 3
    BLINK_MED = 2
    BLINK_SLOW = 1

    ON = 4
    OFF = 5

    P1  = 10
    P2 = 20
    BOTH = 30

    def __init__(self, port="COM10", baudrate=9600, timeout=1):
        self.ser = serial.Serial(port, baudrate, timeout=timeout)

    def send_command(self, player: int, command: int):
        """SEND A COMMAND TO THE BUTTON, SPECIFICALLY FOR THE LIGHTS"""
        msgs = []
        match (player, command):
            case (self.P1, self.ON):
                msgs.append("A")
            case (self.P1, self.OFF):
                msgs.append("a")    
            case (self.P2, self.ON):
                msgs.append("B")
            case (self.P2, self.OFF):
                msgs.append("b")
            case (self.BOTH, self.ON):
                msgs.append("A")
                msgs.append("B")
            case (self.BOTH, self.OFF):
                msgs.append("a")
                msgs.append("b")
            case (self.P1, self.BLINK_FAST):
                msgs.append("3")
            case (self.P1, self.BLINK_MED):
                msgs.append("2")
            case (self.P1, self.BLINK_SLOW):
                msgs.append("1")
            case (self.P2, self.BLINK_FAST):
                msgs.append("6")
            case (self.P2, self.BLINK_MED):
                msgs.append("5")
            case (self.P2, self.BLINK_SLOW):
                msgs.append("4")
            case (self.BOTH, self.BLINK_FAST):
                msgs.append("3")
                msgs.append("6")
            case (self.BOTH, self.BLINK_MED):
                msgs.append("2")
                msgs.append("5")
            case (self.BOTH, self.BLINK_SLOW):
                msgs.append("1")
                msgs.append("4")
        
        for msg in msgs:
            self.ser.write(msg.encode("ascii"))
        
if __name__ == "__main__":
    import time
    btn = CapButton()
    btn.send_command(CapButton.BOTH, CapButton.BLINK_FAST)
    time.sleep(2)
    btn.send_command(CapButton.BOTH, CapButton.OFF)

# example flask endpoint usage:
# @app.get("/api/blinker/<int:player>/<int:command>")
# def api_blinker(player: int, command: int):
#     btn = CapButton()
#     btn.send_command(player, command)