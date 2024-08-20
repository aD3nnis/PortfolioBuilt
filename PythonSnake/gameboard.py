from directions import Directions

class Grid:
    def __init__(self, game):
        # pixel dimensions for game border
        self.right_border = (game.game_width/2)
        self.left_border = -(game.game_width/2)
        self.top_border = (game.game_height/2)
        self.bottom_border = -(game.game_height/2)
        # container for all valid x coordinates (increments of 20)
        self.valid_x = []
        x = self.right_border
        while x >= self.left_border:
            self.valid_x.append(x)
            x -= 20
        # countainer for all valid y coordinates (increments of 20)
        self.valid_y = []
        y = self.top_border
        while y >= self.bottom_border:
            self.valid_y.append(y)
            y -= 20
        # container for all boolean tied to each (x,y) coordinate
        # false means it's empty, true means it's occupied
        # number second half of tuple refers to type of occupied
        # 0 is walls, 1 is any tail
        # So each head can been considered an occupied space without causing self collision,
        # But tails are dangerous for everyone, and we've made a distinction for walls if that proves to be useful
        self.grid = {}
        for x in self.valid_x:
            for y in self.valid_y:
                # sets borders to True
                if x == self.right_border or x == self.left_border or y == self.top_border or y == self.bottom_border:
                    self.grid[(x,y)] = (True, 0)
                else:
                    self.grid[(x,y)] = (False, 0)
        # Contain both the (x,y) coordinate of the heads location but also the snake.direction of the snake
        # The key is the snake.number
        # Filled in self.heads[snake.number] = ((snake.head.xcor(), snake.head.ycor()), snake.direction)
        self.heads = {}
        #
        self.occupiedSpaceList = {}
        #
        self.listOfWall = []
        for x in self.valid_x:
            self.listOfWall.append((x, self.top_border))
            self.listOfWall.append((x, self.bottom_border))
        for y in self.valid_y:
            self.listOfWall.append((self.left_border, y))
            self.listOfWall.append((self.right_border, y))
    #
    # This is to make it easier to determine if a coordinate is occupied
    # Optionally, a snake can include themselves to exclude the location of their head.
    def isOccupied(self, x, y, snake = "None"):
        # if coordinate is marked occupied
        if self.grid[(x,y)][0] == True:
            return True
        else:
            for key in self.heads.keys():
                if snake != "None":
                    # Skip you own head
                    if key == snake.number:
                        continue
                # If coordinate exists in head locations
                if self.heads[key][0] == (x,y):
                    return True
            return False
    # Generates a container with (x,y) coordinates and direction used to get there
    # Based on provided (x,y) coordinate and provided direction used to get there
    def getSuccessors(self, x, y, direction = Directions.STOP):
        possibleSuccessors = []
        if direction != Directions.NORTH:
            possibleSuccessors.append(((x, (y-20)), Directions.SOUTH))
        if direction != Directions.SOUTH:
            possibleSuccessors.append(((x, (y+20)), Directions.NORTH))
        if direction != Directions.WEST:
            possibleSuccessors.append((((x+20), y), Directions.EAST))
        if direction != Directions.EAST:
            possibleSuccessors.append((((x-20), y), Directions.WEST))
        return possibleSuccessors
    
    # creates the list of occupied spacesm except walls, try to use only once per turn to speed up game
    def createList(self, key):
        # Delete old container
        if key in self.occupiedSpaceList:
            del self.occupiedSpaceList[key]
        # Create new one
        self.occupiedSpaceList[key] = []
        for x in self.valid_x:
            if x != self.left_border and x != self.right_border:
                for y in self.valid_y:
                    if y != self.top_border and y != self.bottom_border:
                        if self.grid[(x,y)][0] == True:
                            self.occupiedSpaceList[key].append((x,y))
        for otherSnake in self.heads.keys():
            if otherSnake == key:
                continue
            self.occupiedSpaceList[key].append(self.heads[otherSnake][0])

    # Returns a list of occupied spaces
    def asList(self, key):
        return self.occupiedSpaceList[key]
    
    def wallList(self):
        return self.listOfWall