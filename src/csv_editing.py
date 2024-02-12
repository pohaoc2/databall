import pandas as pd
import numpy as np

df = pd.read_csv("/Users/derrickong/Desktop/CSE 512/Final Project/mlb2017.csv", encoding = "utf-8")

df = df.drop("CS", axis = 1)
df = df.drop("TB", axis = 1)
df = df.drop("GDP", axis = 1)
df = df.drop("HBP", axis = 1)
df = df.drop("SH", axis = 1)
df = df.drop("SF", axis = 1)
df = df.drop("IBB", axis = 1)
df = df.drop("Name-additional", axis = 1)

df["Name"] = df["Name"].str.replace("*", "")
df["Name"] = df["Name"].str.replace("#", "")

def create_dataframe_column(strings_list, df_length):
    # Calculate the number of repetitions needed
    num_repetitions = df_length // len(strings_list)

    # Repeat each string in the list for the desired number of repetitions
    repeated_strings = np.repeat(strings_list, num_repetitions)

    # Handle the remaining rows if df_length is not evenly divisible by the length of strings_list
    remaining_rows = df_length % len(strings_list)
    repeated_strings = np.concatenate((repeated_strings, strings_list[:remaining_rows]))

    # Create a DataFrame with a single column using the repeated strings
    df = pd.DataFrame({'Column': repeated_strings})

    return df

team_abbrs = ['ARI', 'ATL', 'BAL', 'BOS', 'CHC', 'CWS', 
               'CIN', 'CLE', 'COL', 'DET', 'HOU', 'KC',
               'LAA', 'LAD', 'MIA', 'MIL', 'MIN', 'NYM',
               'NYY', 'OAK', 'PHI', 'PIT', 'SD', 'SF', 'SEA',
               'STL', 'TB', 'TEX', 'TOR', 'WAS']
team_names = ['Arizona Diamondbacks', 'Atlanta Braves', 
                   'Baltimore Orioles', 'Boston Red Sox', 
                   'Chicago Cubs', 'Chicago White Sox', 
                   'Cincinnati Reds', 'Cleveland Guardians', 
                   'Colorado Rockies', 'Detroit Tigers', 'Houston Astros', 
                   'Kansas City Royal', 'Los Angeles Angels', 
                   'Los Angeles Dodgers', 'Miami Marlins', 
                   'Milwaukee Brewers', 'Minnesota Twins', 
                   'New York Mets', 'New York Yankees', 
                   'Oakland Athletics', 'Philadelphia Phillies', 
                   'Pittsburgh Pirates', 'San Diego Padres',
                   'San Francisco Giants','Seattle Mariners', 
                   'St. Louis Cardinals', 'Tampa Bay Rays', 
                   'Texas Rangers', 'Toronto Blue Jays', 
                  ' Washington Nationals']

teamabbr_df = create_dataframe_column(team_abbrs, len(df))
df['Abbr'] = teamabbr_df

teamname_df = create_dataframe_column(team_names, len(df))
df['Team'] = teamname_df

df = df.iloc[:, [0, 1, 2, 3, 22, 21, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]

print(df.to_string())

df.to_csv("/Users/derrickong/Desktop/CSE 512/Final Project/mlb2017_clean.csv", index = False, encoding = "utf-8")