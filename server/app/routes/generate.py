import pandas as pd
import numpy as np

import math
from types import MethodType


asset_names = ["HealthCare", "A-rated", "NJ"]
asset_constraints = pd.DataFrame(index=asset_names, columns=['min_weight', 'max_weight'],
                                 data=[[0.1,0.35], [0.05,0.30],[0.15,0.4]])

ranking = pd.Series(index=asset_names, data=[0.006, 0.005, 0.004])

initial_weights = pd.Series(index=asset_names, data = 1 / len(asset_names))

class Distribution:
    def __init__(self, asset_constraints, initial_weights, ranking):
        ranked_asset_names = ranking.sort_values(ascending=False).index
        self.asset_names = ranked_asset_names
        self.asset_constraints = asset_constraints.reindex(self.asset_names)
        
        self.initial_weights = initial_weights.reindex(self.asset_names)
        
        self.available_weights = self.get_available_weights()
        print(".....self.available_weights .......",self.available_weights  )
        self.weight_evolution = None
        self.selected_weights = None

    def run(self):
        self.weight_evolution = pd.DataFrame(columns=self.asset_names)
       
        self.selected_weights = pd.Series(
            index=self.asset_names, data=[min(row) for row in self.available_weights])
    
        return self.backtracking(0)        
        
    def get_available_weights(self):
        available_weights = \
                         pd.DataFrame(index=np.arange(100,-1,-5)/100, columns=self.asset_constraints.index,
                                      data=np.tile(np.arange(100,-1,-5)/100,
                                                   reps=(len(self.asset_constraints.index),1)).T)
        #minimum weights
        available_weights[available_weights < self.asset_constraints.min_weight] = np.nan

        #maximum weights
        available_weights[available_weights > self.asset_constraints.max_weight] = np.nan

        return np.array([row[~np.isnan(row)] for row in available_weights.T.values])

    def backtracking(self, level):
        # are we in the last level -> len available_weights is 3 if you have 3 assets, so 3 Levels
        is_leaf = (level + 1) > len(self.available_weights) - 1
  
        #get available weights for the assets that correspond to the current level
        available_weights = self.available_weights[level]
        
        # Prune 1 = (0.1+0.05+0.15) + ([0.35,0.3,....] - 0.1) = 0.3 + [0.25,0.2,...] = 0.55, 0.5,...
        sum_candidate_weights = math.fsum(self.selected_weights) + (available_weights - self.selected_weights[level])
        
        mask = (np.isclose(sum_candidate_weights, 1, atol=0.0001) if is_leaf else(sum_candidate_weights <= 1))
        print('sum_candidate_weights == 1',sum_candidate_weights, np.isclose(sum_candidate_weights, 1, atol=0.0001))
        #mask = sum_candidate_weights <= 1
        available_weights = available_weights[mask]
        #print('mask........available_weights..', mask,available_weights)
        
        for i in range(0, len(available_weights)):
            previous_selected_weights = self.selected_weights.copy()
            print("......previous_selected_weights ......",previous_selected_weights )
            self.selected_weights[level] = available_weights[i]
            print("............",level, i )
            self.weight_evolution = self.weight_evolution.append(
                self.selected_weights, ignore_index=True)
            print("....... self.weight_evolution .....",  self.weight_evolution  )
            if self.is_valid():
                return self.selected_weights
            elif not is_leaf:
                result = self.backtracking(level+1)
                if result is not None:
                    return result
                self.selected_weights = previous_selected_weights
        return None

    def is_valid(self):
        print('is_valid', math.fsum(self.selected_weights)== 1.0)
        return math.fsum(self.selected_weights)== 1.0


distribution = Distribution(asset_constraints, initial_weights, ranking)
result = distribution.run()
print(result)
