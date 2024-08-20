import time
from copy import deepcopy
from snakes import Snake
from snakes import Enemy
from food import Food
from gameboard import Grid
from functools import partial
import functions
import turtle



# Resets the game
def restartGame(game, screen):
        # pen2 = turtle.Turtle()
        # pen2.speed(0)
        # pen2.color(game.textColor)
        # # prevents scoreboard from drawing lines
        # pen2.penup()
        # # hides the turtle that writes the scoreboard
        # pen2.hideturtle()
        # # sets scoreboard at the top
        # pen2.goto(0, ((game.game_height/2)-(game.game_height/4)))
        # pen2.write(f"GAME OVER", align="center", font=("Courier", 24, "normal"))
    
        # Clears all the previous turtles
        screen.clearscreen()
        # Needed to keep the game fast
        screen.tracer(0)
        # Put the background color back
        screen.bgcolor(game.bgcolor)
        # Game is no longer over
        game.game_over = False
        game.player_score = 0
        game.enemy_remaining = game.enemy_count
        # Snake won't move until keystroke
        game.game_start = False
        pen_game_over = functions.game_over(game)
        screen.listen()    
        screen.onkeypress(lambda:[ pen_game_over.clear(),setupGame(game, screen)], "g")     


        # pen.clear()
        # pen.write("Game Over", align="center", font=("Courier", 24, "normal"))
        # setupGame(game, screen)

def setupGame(game, screen):
    grid = Grid(game)
    player = Snake(game, 0, grid)
    opponents = []
    for num in range(game.enemy_count):
        opponents.append(Enemy(game, num+1, grid))  
    goal = Food(game)
    pen = functions.create_scoreboard(game)
    # Keyboard bindings
    
    screen.listen()
    screen.onkeypress(lambda: functions.set_enemy_int(game, pen, 0), "0")
    screen.onkeypress(lambda: functions.set_enemy_int(game, pen, 1), "1")
    screen.onkeypress(lambda: functions.set_enemy_int(game, pen, 2), "2")
    screen.onkeypress(lambda: functions.set_enemy_int(game, pen, 3), "3")
    screen.onkeypress(None, "g")
    screen.onkeypress(player.go_up, "w")
    screen.onkeypress(player.go_up, "8")
    screen.onkeypress(player.go_down, "s")
    screen.onkeypress(player.go_down, "5")
    screen.onkeypress(player.go_left, "a")
    screen.onkeypress(player.go_left, "4")
    screen.onkeypress(player.go_right, "d")
    screen.onkeypress(player.go_right, "6")
    # Where the turns actually take place
    while game.game_over == False:
        # create copy of grid      
        gridCopy = deepcopy(grid)
        player.step(game, gridCopy, pen)
        for enemy in opponents:
            # If snake is alive
            if not enemy.isDead():
                # Make it take a step
                enemy.step(game, grid, gridCopy, goal)
            # Removes piece of enemy with is_dead = true and on_board = true from view
            elif enemy.isOnBoard():
                enemy.removeSnake()
        # Check if player collided
        player.checkSnake(game, gridCopy, goal)
        # Check if enemies collided
        for enemy in opponents:
            if not enemy.isDead():
                # Set collided enemy snakes to collided = true
                enemy.checkSnake(gridCopy, goal)
        # Merge original with copy
        grid = deepcopy(gridCopy)
        # Kill collided enemies
        for enemy in opponents:
            # Kills enemies with collided = true but is_dead = false
            if enemy.isCollided() and not enemy.isDead():
                enemy.killSnake(game, grid, pen)
        screen.update()
        time.sleep(game.game_delay)
    restartGame(game, screen)
    