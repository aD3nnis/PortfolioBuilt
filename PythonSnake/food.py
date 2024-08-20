import turtle
import random
import functions

class Food:
    def __init__(self, game):
        self.food = turtle.Turtle()
        self.food.speed(0)
        self.food.shape("circle")
        self.food.color(game.food_color)
        self.food.penup()
        self.food.goto(0,0)
    def reset_food(self, grid):
        while True:
            # Move the food to a random spot
            x = random.choice(grid.valid_x)
            y = random.choice(grid.valid_y)
            # Just in case
            functions.normalize(x,y)
            # insures food lands in an unoccupied space
            if not grid.isOccupied(x, y):
                break
            '''
            Game will break here if all coordinates are occupied,
            which shouldn't happen before player death.
            '''
        # sets new food location
        self.food.goto(x,y)
    def coordinate(self):
        return (self.food.xcor(), self.food.ycor())