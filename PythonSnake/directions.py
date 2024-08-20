import random

class Directions:
    NORTH = ("North", (0, 20))
    SOUTH = ("South", (0, -20))
    EAST = ("East", (20, 0))
    WEST = ("West", (-20, 0))
    STOP = ("Stop", (0, 0))
    #
    # Just returns a random direction
    def randomDirection():
        # Random number between 0-3
        choice = random.choice(range(4))
        if choice == 0:
            return Directions.NORTH
        if choice == 1:
            return Directions.EAST
        if choice == 2:
            return Directions.SOUTH
        if choice == 3:
            return Directions.WEST
    #
    # Returns a random direction except the reverse of current direction
    def randomDirectionNoReverse(snake):
        while True:
            # Random number between 0-3
            choice = random.choice(range(4))
            if choice == 0 and snake.direction != Directions.SOUTH:
                return Directions.NORTH
            if choice == 1 and snake.direction != Directions.WEST:
                return Directions.EAST
            if choice == 2 and snake.direction != Directions.NORTH:
                return Directions.SOUTH
            if choice == 3 and snake.direction != Directions.EAST:
                return Directions.WEST
    
        