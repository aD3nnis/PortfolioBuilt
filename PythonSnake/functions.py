import turtle

# Insure that the dimensions of the game are in increments of 20
def normalize(num1, num2):
    if num1 > 0:
        num1 -= num1 % 20
    else:
        num1 += num1 % 20
    if num2 > 0:
        num2 -= num2 % 20
    else:
        num2 += num2 % 20
    return (num1, num2)

def create_screen(game):
    screen = turtle.Screen()
    # wipes previous version screen
    screen.clearscreen()
    screen.title(game.title)
    screen.bgcolor(game.bgcolor)
    num1, num2 = normalize(game.game_width, game.game_height)
    game.game_width = num1 - (num1 % 40)
    game.game_height = num2 - (num2 % 40)
    # First two variable determine size, second two variables determine window startup location
    screen.setup(game.game_width, game.game_height, startx=None, starty=100)
    # Turns off the screen updates
    screen.tracer(0)
    return screen

def create_scoreboard(game):
    pen = turtle.Turtle()
    pen.speed(0)
    pen.color(game.textColor)
    # prevents scoreboard from drawing lines
    pen.penup()
    # hides the turtle that writes the scoreboard
    pen.hideturtle()
    # sets scoreboard at the top
    pen.goto(0, ((game.game_height/2)-(game.game_height/4)))
    pen.write(f"Highscore: {game.high_score}\nPlayer Score: {game.player_score} Enemies: {game.enemy_remaining}", align="center", font=("Courier", 24, "normal"))
    pen.write("Choose a difficulty\n\n\n\n",align="center", font=("Courier", 24, "normal"))
    pen.write("Easy: 0 Normal: 1 Hard: 2 Legendary: 3\n\n\n",align="center", font=("Courier", 24, "normal"))
    return pen

def game_over(game):
    pen = turtle.Turtle()
    pen.speed(0)
    pen.penup()
    pen.hideturtle()
    pen.goto(0, ((game.game_height/2)-(game.game_height/4)))
    pen.write("GAME OVER \n", align="center", font=("Courier", 24, "normal"))
    pen.write("press g to play again",align="center", font=("Courier", 24, "normal"))
    return pen

# Get the distance from the one location to another, divided by 20 to better represent the number of moves (since each move is 20 pixels)
def manhattanDistance(coordinate1, coordinate2):
    x1, y1 = coordinate1
    x2, y2 = coordinate2
    xd = abs(x1-x2)/20
    yd = abs(y1-y2)/20
    return (xd+yd)

#
def set_enemy_int(game, pen, new_value):
    game.enemy_int = new_value + 2
    pen.clear()
    pen.write(f"Highscore: {game.high_score}\nPlayer Score: {game.player_score} Enemies: {game.enemy_remaining}", align="center", font=("Courier", 24, "normal"))
    pen.write("Difficulty Chosen\n\n\n\n",align="center", font=("Courier", 24, "normal"))
    if new_value == 0:
        pen.write("Easy: 0\n\n\n",align="center", font=("Courier", 24, "normal"))
    if new_value == 1:
        pen.write("Normal: 1\n\n\n",align="center", font=("Courier", 24, "normal"))
    if new_value == 2:
        pen.write("Hard: 2\n\n\n",align="center", font=("Courier", 24, "normal"))
    if new_value == 3:
        pen.write("Legendary: 3\n\n\n",align="center", font=("Courier", 24, "normal"))
    return new_value 

'''
evaluation
'''
# for evaluation function
# coordinates == occupied space: ---score
# coordinate == food location: +++score
# coordinate == near food: +score
# coordinate == near other snake head: -score
# distance traveled: ++score
def evaluationFunction(closestToFood, coordinate, key, grid, goal, steps):
    eval = steps
    
    # Create a list of all occupied spaces
    occupied = grid.asList(key)
    occupiedDist = []
    for occupiedCor in occupied:
        # if the coordinate is an occupied space
        if coordinate == occupiedCor:
            # Negative reward for colliding with occupied space
            eval -= 10000
            return eval
        # Otherwise add it to the list
        occupiedDist.append(5/manhattanDistance(coordinate, occupiedCor))
    occupied = grid.wallList()
    for occupiedCor in occupied:
        # if the coordinate is an occupied space
        if coordinate == occupiedCor:
            # Negative reward for colliding with occupied space
            eval -= 10000
            return eval
        # Otherwise add it to the list
        occupiedDist.append(1/manhattanDistance(coordinate, occupiedCor))
    
    # If this snake is closest to the food
    if closestToFood == True or key == 0:
        if coordinate == goal.coordinate():
            # Positive reward for getting food divided by the distance traveled to get there, to encourage getting their quickly
            eval += (10000/steps)
        else:
            # Positive reward for getting closer towards food
            eval += (5/manhattanDistance(coordinate, goal.coordinate()))
    
    # Get the average distance to an occupied space as a negative reward
    eval -= (sum(occupiedDist)/len(occupiedDist))

    return eval