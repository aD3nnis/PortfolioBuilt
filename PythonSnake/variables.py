class Statics:
    def __init__(self):
        # number of enemies
        self.enemy_count = 10
        # sets the randomness of the enemy snakes 
        self.enemy_int = 1
        # Time delay between turns
        self.game_delay = 0.1
        # Depth of searches
        self.search_depth = 5
        # Scoreboard starting scores
        self.player_score = 0
        self.high_score = 0
        self.enemy_remaining = self.enemy_count
        # Screen dimensions
        self.game_height = 1000
        self.game_width = 1000
        # Screen specifics
        self.title = "Snake Fight"
        self.bgcolor = "light green"
        self.textColor = "black"

        # Snake Visuals
        # 6 head colors
        self.snake_color_1 = ("dark green", "dark red", "dark blue", "dark violet", "dark goldenrod", "dark orange")
        # 7 body colors
        self.snake_color_2 = ("green", "red", "blue", "violet", "yellow", "orange", "teal")
        # Food Visuals
        self.food_color = "white"
        # Game Start
        self.game_start = False
        # Game Over
        self.game_over = False
