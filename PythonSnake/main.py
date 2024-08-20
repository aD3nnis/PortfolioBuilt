# Ava Dennis
# Christopher Strand

# Base design adapted from @TokyoEdTech
# https://gist.github.com/wynand1004/ec105fd2f457b10d971c09586ec44900


from variables import Statics
import functions
import gameplay

game = Statics()
screen = functions.create_screen(game)
gameplay.setupGame(game, screen)


"""
screen.mainloop() is probably not necessary anymore
"""
# stops game from auto closing
screen.mainloop()

