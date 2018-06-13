#!/usr/bin/python
from dataparser import *
import sys
import collections
import itertools
import numpy as np
import matplotlib.pyplot as plt
from argparse import ArgumentParser
from scipy.stats import mode
from sklearn.metrics import classification_report
from sklearn.cross_validation import train_test_split

def dist(a, idx_a, b, idx_b):
    res = 0

    for i in range(0, 6):
        res += abs(a[i][idx_a] - b[i][idx_b])

    return res

class KnnDtwClassifier(object):
    def __init__(self, n_neighbors=5, max_warping_window=10000):
        self.n_neighbors = n_neighbors
        self.max_warping_window = max_warping_window

    def fit(self, x, y):
        self.x = x
        self.y = y

    def _dtw_distance(self, ts_a, ts_b):
        # Create cost matrix via broadcasting with large int
        M, N = len(ts_a[0]), len(ts_b[0])
        cost = sys.maxint * np.ones((M, N))

        # Initialize the first row and column
        cost[0, 0] = dist(ts_a, 0, ts_b, 0)
        for i in xrange(1, M):
            cost[i, 0] = cost[i-1, 0] + dist(ts_a, i, ts_b, 0)

        for j in xrange(1, N):
            cost[0, j] = cost[0, j-1] + dist(ts_a, 0, ts_b, j)

        # Populate rest of cost matrix within window
        for i in xrange(1, M):
            for j in xrange(max(1, i - self.max_warping_window),
                            min(N, i + self.max_warping_window)):
                choices = cost[i - 1, j - 1], cost[i, j-1], cost[i-1, j]
                cost[i, j] = min(choices) + dist(ts_a, i, ts_b, j)

        # Return DTW distance given window
        return cost[-1, -1]

    def _dist_matrix(self, x, y):
        dm_count = 0

        # Compute full distance matrix of dtw distances between x and y
        dm = np.zeros((len(x), len(y)))

        for i in xrange(0, len(x)):
            for j in xrange(0, len(y)):
                dm[i, j] = self._dtw_distance(x[i], y[j])
                # Update progress bar

        return dm

    def predict(self, x):
        dm = self._dist_matrix(x, self.x)

        # Identify the k nearest neighbors
        knn_idx = dm.argsort()[:, :self.n_neighbors]

        self.y = np.array(self.y)
        # Identify k nearest labels
        knn_labels = self.y[knn_idx]

        print knn_labels

        # Choose class based on neighbors
        mode_data = mode(knn_labels, axis=1)
        mode_label = mode_data[0]

        return mode_label.ravel()

def knn_dtw_classifier(X, y, args):

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = args.test_size)

    cl = KnnDtwClassifier(n_neighbors = args.k_val, max_warping_window = args.max_warping_window)
    cl.fit(X_train, y_train)
    label = cl.predict(X_test)

    print classification_report(y_test, label)

def main():
    p = ArgumentParser()
    p.add_argument('-k', '--k_val', type = int, default = 3,
        help='value of k for K-nearest-neighbors')
    p.add_argument('-mww', '--max_warping_window', type = int, default = 10,
        help='The maximum value for dtw\'s warping window')
    p.add_argument('-t', '--time_margin', type = int, default = 250,
        help = 'Time margin for a key in ms')
    p.add_argument('-ts', '--test_size', type = float, default = 0.2,
        help='The percentage from the dataset to be used for testing')
    p.add_argument('-c', '--classify', dest = 'classify',
        action = 'store', choices = ['kn', 'ot'],
        help='Choose what to classify: kn - the number of keys pressed; ot - guess originial text')

    args = p.parse_args()

    build_pressed_keys_dict()
    build_sensor_data_dict()
    build_single_dicts(args.time_margin)

    if args.classify == 'kn':
        X = dict_as_list_without_id(sensor_data)

        y = get_nr_pressed_key_classes().values()
    elif args.classify == 'ot':
        X = dict_as_list_without_id(single_sensor_data)

        y = single_pressed_keys.values()
    else:
        print "Please choose a problem to classify"
        return

    knn_dtw_classifier(X, y, args)

if __name__ == '__main__':
    main()
