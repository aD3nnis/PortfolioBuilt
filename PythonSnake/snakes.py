import turtle
import random
import functions
from directions import Directions
import searchfunctions


class Snake:
    def __init__(self, game, num, grid):
        self.number = num
        self.head = turtle.Turtle()
        self.head.speed(0)
        self.head.shape("square")
        self.head.penup()
        self.additionalInits(game, grid)
        # The initial movement choice
        self.direction = Directions.STOP
        # puts head on the map
        grid.heads[self.number] = ((self.head.xcor(), self.head.ycor()), self.direction)
        # Collided
        self.collided = False
        # If snake ate food
        self.ate_food = False
        # The tail
        self.segments = []
    #
    #
    # Things unique to player snake
    def additionalInits(self, game, grid):
        # Set snake head color
        self.head.color(game.snake_color_1[self.number])
        # Set staring location
        x = (-game.game_width/4)
        x, y = functions.normalize(x, 0)
        self.head.goto(x, y)
    #
    #
    # Directional commands, only used for player snake
    def go_up(self):
        if self.direction != Directions.SOUTH:
            self.direction = Directions.NORTH
    def go_down(self):
        if self.direction != Directions.NORTH:
            self.direction = Directions.SOUTH
    def go_left(self):
        if self.direction != Directions.EAST:
            self.direction = Directions.WEST
    def go_right(self):
        if self.direction != Directions.WEST:
            self.direction = Directions.EAST
    #
    #
    # Function that moves head
    def move(self, gridCopy):
        # Get coordinates
        x = self.head.xcor()
        y = self.head.ycor()
        # Get change in coordinates
        xx = self.direction[1][0]
        yy = self.direction[1][1]
        # Set new coordinates
        self.head.setx(x + xx)
        self.head.sety(y + yy)
        # Move head to new location
        gridCopy.heads[self.number] = ((self.head.xcor(),self.head.ycor()), self.direction)
    #
    #
    # Moves the tail and sets occupied and unnoccupied locations
    def tailandcleanup(self, gridCopy):
        # If food was eaten, skip cleanup
        if self.ate_food == True:
            self.ate_food = False
        # If snake didn't eat, and it's tail exists, mark coordinate of last piece of tail as unnoccupied
        elif self.segments != []:
            x = self.segments[-1].xcor()
            y = self.segments[-1].ycor()
            gridCopy.grid[(x,y)] = (False, 0)
        # Move the end segments first in reverse order
        # Range(start, end, increment)
        for index in range(len(self.segments)-1, 0, -1):
            x = self.segments[index-1].xcor()
            y = self.segments[index-1].ycor()
            self.segments[index].goto(x, y)
        # Move segment 0 to where the head is, if there is a tail
        if len(self.segments) > 0:
            x = self.head.xcor()
            y = self.head.ycor()
            self.segments[0].goto(x,y)
            # Set former coordinate of head occupied tail space
            gridCopy.grid[(x,y)] = (True, 1)
    #
    #
    # Function that checks for food and collision, and moves tail
    def step(self, game, gridCopy, pen):
        # Checks to see if any command has been received
        if self.direction == Directions.STOP:
            game.game_start = False
            return
        # Starts the game so enemies will now take their turns
        game.game_start = True
        # If snake ate food and didn't die
        if self.ate_food == True:
            # Adds a segment
            new_segment = turtle.Turtle()
            new_segment.speed(0)
            new_segment.shape("square")
            new_segment.color(game.snake_color_2[self.number])
            new_segment.penup()
            self.segments.append(new_segment)
            # change scoreboard
            game.player_score += 1
            if game.player_score > game.high_score:
                game.high_score = game.player_score
            pen.clear()
            pen.write(f"Highscrore: {game.high_score}\nPlayer Score: {game.player_score} Enemies: {game.enemy_remaining}", align="center", font=("Courier", 24, "normal"))
        # Handle the tail and grid
        self.tailandcleanup(gridCopy)
        # Finally moves head
        self.move(gridCopy)
    
    # Checks if food was found and/if snake has collided
    def checkSnake(self, game, grid, goal):
        # creates list of occupied space except own head
        grid.createList(self.number)
        # Checks if collided with food
        if self.coordinate() == goal.coordinate():
            self.ate_food = True
            # reset food coordinate
            goal.reset_food(grid)
        # Checks if collision
        if grid.isOccupied(self.head.xcor(), self.head.ycor(), self):
            self.collided = True
            game.game_over = True
    
    def coordinate(self):
        return (self.head.xcor(), self.head.ycor())


# these snakes are controlled by search algorithms 
class Enemy(Snake):
    #
    #
    # Things unique to enemy snakes
    def additionalInits(self, game, grid):
        # Insures we don't go out of scope
        colorNumber = self.number
        while colorNumber > 5:
            colorNumber -= 6
        # Set snake head color
        self.head.color(game.snake_color_1[colorNumber])
        # Set enemy snake starting coordinate
        while True:
            x = random.choice(grid.valid_x)
            y = random.choice(grid.valid_y)
            # Just in case
            functions.normalize(x,y)
            # insure enemy head starts in an unoccpied space
            if not grid.isOccupied(x, y, self):
                break
        self.head.goto(x,y)
        self.is_dead = False
        self.on_board = True
    #
    #
    # Return is collided
    def isCollided(self):
        return self.collided
    #
    #
    # Return is dead
    def isDead(self):
        return self.is_dead
    #
    #
    # Return is on board
    def isOnBoard(self):
        return self.on_board
    #
    #
    # Setting all the Snakes coordinates to unoccupied
    def killSnake(self, game, grid, pen):
        self.is_dead = True
        # Remove head from container
        del grid.heads[self.number]
        
        # Set tail to unoccupied spaces
        for segment in self.segments:
            x = segment.xcor()
            y = segment.ycor()
            grid.grid[(x,y)] = (False, 0)
        # change scoreboard
        game.enemy_remaining -= 1
        pen.clear()
        pen.write(f"Highscrore: {game.high_score}\nPlayer Score: {game.player_score} Enemies: {game.enemy_remaining}", align="center", font=("Courier", 24, "normal"))
    #
    #
    # Animation for dying snake
    def removeSnake(self):
        # If head is still visible
        if self.head.isvisible():
            # Hide the head
            self.head.hideturtle()
            # If snake has a tail
            if self.segments == []:
                self.on_board = False
        # If head has already been taken care of
        else:
            for segment in self.segments:
                if segment.isvisible():
                    # Hide earliest unhidden segment
                    segment.hideturtle()
                    return
            self.on_board = False
    #
    #
    # Function that checks for food and collision, and moves tail. Calls decision process
    def step(self, game, grid, gridCopy, goal):
        # Skips turn if the game hasn't started yet
        if game.game_start == False:
            return
        #
        # If snake ate food and didn't die
        if self.ate_food == True:
            # Adds a segment
            new_segment = turtle.Turtle()
            new_segment.speed(0)
            new_segment.shape("square")
            # Insures we don't go out of scope
            colorNumber = self.number
            while colorNumber > 6:
                colorNumber -= 7
            new_segment.color(game.snake_color_2[colorNumber])
            new_segment.penup()
            self.segments.append(new_segment)
        # Handle the tail and grid
        self.tailandcleanup(gridCopy)
        # Functions for deciding where to move
        # match game.enemy_int:
        #     case 0:
        #         self.trulyRandomChoice(grid)
        #     case 1:
        #         self.randomChoice(grid)
        #     case 2:
        #         self.weightedRandomChoice(grid, goal)
        #     case 3:
        #         pass
        #     case default:
        #         pass
        # all I changed was the match case to be this below because I was using an older version of python
        
        if game.enemy_int == 0:       
            searchfunctions.trulyRandomChoice(self, gridCopy)
        elif game.enemy_int == 1:
            searchfunctions.randomChoiceNoWalls(self, grid, gridCopy)
        elif game.enemy_int == 2:
            searchfunctions.randomChoiceNoCollision(self, grid, gridCopy)
        elif game.enemy_int == 3:
            searchfunctions.weightedRandomChoice(self, grid, gridCopy, goal)
        elif game.enemy_int == 4: 
            searchfunctions.maxMain(self, grid, gridCopy, goal, game.search_depth)
        elif game.enemy_int == 5:
            searchfunctions.alphaBetaMain(self, grid, gridCopy, goal, game.search_depth)
        else:
            pass
        
        


    #
    # Checks if snake ate food and/or collided, but doesn't cause game over
    def checkSnake(self, grid, goal):
        # Checks if last turn got the food
        if self.coordinate() == goal.coordinate():
            self.ate_food = True
            # reset food location
            goal.reset_food(grid)
        # Checks if collision
        if grid.isOccupied(self.head.xcor(), self.head.ycor(), self):
            self.collided = True
    #
    #
    # Gets all the legal moves, just returns directions
    def getLegalActions(self, x, y, grid):
        options = []
        if not grid.isOccupied((x-20), y) and self.direction != Directions.EAST:
            options.append(Directions.WEST)
        if not grid.isOccupied((x+20), y) and self.direction != Directions.WEST:
            options.append(Directions.EAST)
        if not grid.isOccupied(x, (y-20)) and self.direction != Directions.NORTH:
            options.append(Directions.SOUTH)
        if not grid.isOccupied(x, (y+20)) and self.direction != Directions.SOUTH:
            options.append(Directions.NORTH)
        return options
    #
    #
    # Gets all Successors except reverse and running into a Wall
    def getNoWallActions(self, x, y, grid):
        options = []
        if (x-20) != grid.left_border and self.direction != Directions.EAST:
            options.append(Directions.WEST)
        if (x+20) != grid.right_border and self.direction != Directions.WEST:
            options.append(Directions.EAST)
        if (y-20) != grid.bottom_border and self.direction != Directions.NORTH:
            options.append(Directions.SOUTH)
        if (y+20) != grid.top_border and self.direction != Directions.SOUTH:
            options.append(Directions.NORTH)
        return options