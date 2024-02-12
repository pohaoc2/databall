import pandas as pd
import numpy as np

df = pd.read_csv("/Users/derrickong/Desktop/CSE 512/Final Project/mlb17to22.csv")

years = [2022, 2021, 2019, 2018, 2017]

years_repeated = np.repeat(years, 270)

df["Year"] = years_repeated

print(df)

df = df.iloc[:, [0, 1, 2, 3, 4, 5, 23, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]]

print(df)

df.to_csv("/Users/derrickong/Desktop/CSE 512/Final Project/mlb17to22.csv", index = False)