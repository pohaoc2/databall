import pandas as pd
import numpy as np

df = pd.read_csv("/Users/derrickong/Desktop/CSE 512/Final Project/mlb17to22.csv")

df.loc[df.Rk == 9, "Pos"] = "DH/UTL"

print(df.to_string())

df.to_csv("/Users/derrickong/Desktop/CSE 512/Final Project/mlb17to22.csv", index = False)