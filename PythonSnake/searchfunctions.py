import random
from copy import deepcopy
from directions import Directions
import functions


"""
The simple reflex agents
"""
#
#
# Snake will literally go any direction except reverse
def trulyRandomChoice(snake, gridCopy):
    snake.direction = Directions.randomDirectionNoReverse(snake)
    snake.move(gridCopy)
#
#
# Snake will always avoid walls.
def randomChoiceNoWalls(snake, grid, gridCopy):
    # Get head's coordinates
    x = snake.head.xcor()
    y = snake.head.ycor()
    # All the options that aren't walls and no reverse (should always be 1 choice)
    options = snake.getNoWallActions(x, y, grid)
    snake.direction = random.choice(options)
    snake.move(gridCopy)
#
#
#
# Snake will always avoid colliding.
def randomChoiceNoCollision(snake, grid, gridCopy):
    # Get head's coordinates
    x = snake.head.xcor()
    y = snake.head.ycor()
    # All options that don't result in a collision
    options = snake.getLegalActions(x, y, grid)
    # If options are empty, just pick a random direction, you'll die anyways.
    if options == []:
        snake.direction = Directions.randomDirection()
    else:
        snake.direction = random.choice(options)
    snake.move(gridCopy)
#
#    
# Snakes avoid collisions while also heading towards food
def weightedRandomChoice(snake, grid, gridCopy, goal, weightAdded = 5):
    # Get head's coordinates
    x = snake.head.xcor()
    y = snake.head.ycor()
    # Container of legal moves
    options = snake.getLegalActions(x, y, grid)
    # If options are empty, just pick a random direction, you'll die anyways.
    if options == []:
        snake.direction = Directions.randomDirection()
    else:
        # Skip all this if we have only 1 legal move
        if len(options) > 1:
            # create a copy of the original legal directions
            options_copy = deepcopy(options)
            fx = goal.food.xcor()
            fy = goal.food.ycor()
            # If legal direction is in the direction of food
            # Adds more of that direction to the list to weight the choices
            # Does adding 
            for direction in options:
                if direction == Directions.NORTH and fy > y:
                    for steps in range(weightAdded):
                        options_copy.append(direction)
                if direction == Directions.SOUTH and fy < y:
                    for steps in range(weightAdded):
                        options_copy.append(direction)
                if direction == Directions.EAST and fx > x:
                    for steps in range(weightAdded):
                        options_copy.append(direction)
                if direction == Directions.WEST and fx < x:
                    for steps in range(weightAdded):
                        options_copy.append(direction)
            # Copy over results
            options = options_copy
        # Randomly choice choice from container
        snake.direction = random.choice(options)
        snake.move(gridCopy)


"""
Getting into making choices several steps ahead
"""
def maxMain(snake, grid, gridCopy, goal, depth):
    # creates list for finding all occupied spaces
    grid.createList(snake.number)
    #
    closestToFood = False
    # This snake's Distance to the food
    foodDistance = functions.manhattanDistance(grid.heads[snake.number][0], goal.coordinate())
    # Set the ceiling
    friendDistanceToFood = float("inf")
    # figure out if we're closest to the food now
    for otherSnakes in grid.heads.keys():
        # if Self or the Player, skip
        if otherSnakes == snake.number or otherSnakes == 0:
            continue
        # Find the closest friendly snake to food
        if friendDistanceToFood > functions.manhattanDistance(grid.heads[otherSnakes][0], goal.coordinate()):
            friendDistanceToFood = functions.manhattanDistance(grid.heads[otherSnakes][0], goal.coordinate())
    # If this snake is closest to the food
    if foodDistance < friendDistanceToFood:
        closestToFood = True
    # Now for the current snake
    firstMove = grid.getSuccessors(snake.head.xcor(), snake.head.ycor(), snake.direction)
    max = float('-inf')
    maxOutputs = []
    for move in firstMove:
        result = maxSelf(closestToFood, move, snake.number, grid, goal, depth)
        if max == result[0]:
            maxOutputs.append(move[1])
        if max < result[0]:
            max = result[0]
            # Overides the direction the snake should travel in
            maxOutputs.clear()
            maxOutputs.append(move[1])
    snake.direction = random.choice(maxOutputs)
    # must end with this to make current snake move
    snake.move(gridCopy)

# Recursively returns the best option down the path
def maxSelf(closestToFood, move, key, grid, goal, depthGoal, depthCur = 1, estimatedPath = [], steps = 1):
    # Create a copy of the path
    copiedPath = deepcopy(estimatedPath)
    
    # If this coordinate already exists this snakes path, end this branch here
    for coordinates in copiedPath:
        if move[0] == coordinates:
            return ((-10000), copiedPath)
    
    # Add coordinates of this move to that copied of the path this snake has taken
    copiedPath.append(move[0])
    
    # If we've finished by hitting the depth, hitting an occupied space, or getting the food
    # Don't worry about passing key into "isOccupied", because colliding with former location of own head is potentially also bad
    if depthGoal <= depthCur or grid.isOccupied(move[0][0], move[0][1]) or move[0] == goal.coordinate():
        return (functions.evaluationFunction(closestToFood, move[0], key, grid, goal, steps), copiedPath)
    
    # Get all the next moves
    nextMoves = grid.getSuccessors(move[0][0], move[0][1], move[1])
    # Set the floor
    max = float('-inf')
    # Container that will pass up the estimated score and path to get there
    maxPath = []
    # For every next move
    for nextMove in nextMoves:
        # run miniMax again
        result = maxSelf(closestToFood, nextMove, key, grid, goal, depthGoal, depthCur+1, copiedPath, steps+1)
        if max == result[0]:
            maxPath.append(result)
        # if score is higher than previously offered path, replace max score and path to return
        if max < result[0]:
            max = result[0]
            maxPath.clear()
            maxPath.append(result)
    return random.choice(maxPath)

# AlphaBeta Pruning!!!
def alphaBetaMain(snake, grid, gridCopy, goal, depth):
    # creates list for finding all occupied spaces
    grid.createList(snake.number)
    #
    closestToFood = False
    # This snake's Distance to the food
    foodDistance = functions.manhattanDistance(grid.heads[snake.number][0], goal.coordinate())
    # Set the ceiling
    friendDistanceToFood = float("inf")
    # figure out if we're closest to the food now
    for otherSnakes in grid.heads.keys():
        # if Self or the Player, skip
        if otherSnakes == snake.number or otherSnakes == 0:
            continue
        # Find the closest friendly snake to food
        if friendDistanceToFood > functions.manhattanDistance(grid.heads[otherSnakes][0], goal.coordinate()):
            friendDistanceToFood = functions.manhattanDistance(grid.heads[otherSnakes][0], goal.coordinate())
    # If this snake is closest to the food
    if foodDistance < friendDistanceToFood:
        closestToFood = True
    alpha = float('-inf')
    beta = float('inf')
    # Get the possible first moves for this snake
    firstMove = grid.getSuccessors(snake.head.xcor(), snake.head.ycor(), snake.direction)
    # Container for optimal choices
    maxOutputs = []
    # Check if player snake is in range to be worth considering
    if (depth*2) < functions.manhattanDistance(grid.heads[snake.number][0], grid.heads[0][0]):
        for move in firstMove:
            # Closest to food: true/false about being the closest enemy snake to food
            # Alpha/Beta:
            # Grid.Heads[0]/move: player's coordinate & direction / this snakes coordinate & direction of possible first move
            # 0/snake.number: the keys(snake.number) for player snake / this snake
            # grid: locations of all occupied and unoccupied coordinates
            # goal: the food
            # depth: how far down the branches we're going
            result = alphaBeta(closestToFood, alpha, beta, grid.heads[0], move, 0, snake.number, grid, goal, depth)
            if alpha == result[0]:
                maxOutputs.append(move[1])
            if alpha < result[0]:
                alpha = result[0]
                # Overides the direction the snake should travel in
                maxOutputs.clear()
                maxOutputs.append(move[1])
    # If the player snake is far away, just do the normal max function
    else:
        for move in firstMove:
            result = maxSelf(closestToFood, move, snake.number, grid, goal, depth)
            if alpha == result[0]:
                maxOutputs.append(move[1])
            if alpha < result[0]:
                alpha = result[0]
                # Overides the direction the snake should travel in
                maxOutputs.clear()
                maxOutputs.append(move[1]) 
    snake.direction = random.choice(maxOutputs)
    # must end with this to make current snake move
    snake.move(gridCopy)

# Alternates examining possible moves and paths for both the current snake and the player
def alphaBeta(closestToFood, alpha, beta, move, otherMove, key, otherKey, grid, goal, depthGoal, depthCur = 1, steps = 1, path = [], otherPath = []):
    # if last branch was player:
    # player: otherMove, otherKey, otherPath
    # enemy: move, key, path

    # if last branch was enemy:
    # player: move, key, path
    # enemy: otherMove, otherKey, otherPath
    
    # Create a deepcopy both paths
    copiedPath = deepcopy(path)
    copiedOtherPath = deepcopy(otherPath)
    
    # If this coordinate is already in the opposite snake's path, prune the branch here
    for coordinates in copiedPath:
        if otherMove[0] == coordinates:
            return ((-10000), copiedOtherPath)
    
    # If this coordinate is already in this snake's path, prune the branch here
    for coordinates in copiedOtherPath:
        if otherMove[0] == coordinates:
            return ((-10000), copiedOtherPath)
        
    # Prune branches where the player moves out of range of this snake
    if key == 0:
        if ((depthGoal-steps)*2) < functions.manhattanDistance(move[0], otherMove[0]):
            return (functions.evaluationFunction(closestToFood, otherMove[0], otherKey, grid, goal, steps), copiedOtherPath)
    # If we've returned to the enemy snake, move the step and depth forward 1
    else:
        depthCur += 1
        steps += 1
    
    # Copies move from previous recursion to corresponding path
    copiedOtherPath.append(otherMove[0])
    
    # If we've finished by hitting the depth, hitting an occupied space, or getting the food
    # Don't worry about passing key into "isOccupied", because colliding with former location of own head is potentially also bad
    if depthGoal <= depthCur or grid.isOccupied(otherMove[0][0], otherMove[0][1]) or otherMove[0] == goal.coordinate():
        return (functions.evaluationFunction(closestToFood, otherMove[0], otherKey, grid, goal, steps), copiedOtherPath)
    
    
    #
    #
    # If we've finished checking an end condition on the previous snake's move,
    # It's time to get this snake's next move
    nextMoves = grid.getSuccessors(move[0][0], move[0][1], move[1])
    # Container that will path with optimal estimated score
    pathToReturn = []
    # If we're examining the player snake
    if key == 0:
        # sets the ceiling
        score = float('inf')
        # For every next move
        for thisMove in nextMoves:
            # run miniMax again (swap player and enemy values)
            result = alphaBeta(closestToFood, alpha, beta, otherMove, thisMove, otherKey, key, grid, goal, depthGoal, depthCur, steps, copiedOtherPath, copiedPath)
            # Find the min score
            if score > result[0]:
                score = result[0]
                pathToReturn = result[1]
            # If the min is smaller than max's best option on path to root
            if score < alpha:
                # Stop looking
                return result
            # If min is smaller than min's best option on path to root, make it the new min's best option on path to root
            beta = min(beta, score)
        return (score, pathToReturn)
    # If we're examining the enemy snake
    else:
        # sets the floor
        score = float('-inf')
        # For every next move
        for thisMove in nextMoves:
            # run miniMax again (swap player and enemy values)
            result = alphaBeta(closestToFood, alpha, beta, otherMove, thisMove, otherKey, key, grid, goal, depthGoal, depthCur, steps, copiedOtherPath, copiedPath)
            # Find the max score
            if score < result[0]:
                score = result[0]
                pathToReturn = result[1]
            # If the max is larger than min's best option on path to root   
            if score > beta:
                # Stop looking
                return result
            # If max is larger than max's best option on path to root, make it the new max's best option on path to root
            alpha = max(alpha, score)
        return (score, pathToReturn)