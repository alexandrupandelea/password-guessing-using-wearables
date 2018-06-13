#!/usr/bin/python
from dataparser import *
import pandas as pd
import matplotlib.pylab as plt
import seaborn as sns
from tsfresh.examples.robot_execution_failures import download_robot_execution_failures, load_robot_execution_failures
from tsfresh import extract_features, extract_relevant_features, select_features
from tsfresh.utilities.dataframe_functions import impute
from tsfresh.feature_extraction import ComprehensiveFCParameters
from sklearn.tree import DecisionTreeClassifier
from sklearn.cross_validation import train_test_split
from sklearn.metrics import classification_report
from sklearn.neighbors import KNeighborsClassifier
from argparse import ArgumentParser

DECISION_TREE = 'dt'
KNN = 'knn'

def get_features(y, relevant_features, data):
    sensor_data_list = dict_as_list(data)
    df = pd.DataFrame(sensor_data_list,
        columns=['id', 'time', 'accx', 'accy','accz', 'gyrox', 'gyroy', 'gyroz'])

    extraction_settings = ComprehensiveFCParameters()
    if relevant_features:
        X = extract_relevant_features(df, y, column_id = 'id', column_sort = 'time',
            default_fc_parameters = extraction_settings)
    else:
        X = extract_features(df, column_id = 'id', column_sort = 'time',
            default_fc_parameters = extraction_settings, impute_function = impute)

    return X

def decision_tree_classifier(X, y, test_size):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = test_size)

    cl = DecisionTreeClassifier()
    cl.fit(X_train, y_train)

    print(classification_report(y_test, cl.predict(X_test)))

def k_nearest_neighbors_classifier(X, y, test_size, k):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = test_size)

    cl = KNeighborsClassifier(n_neighbors = k)
    cl.fit(X_train, y_train)

    print(classification_report(y_test, cl.predict(X_test)))

def nr_pressed_keys_classifier(args, classifier):
    y = get_nr_pressed_key_classes()
    y = pd.Series(y)

    X = get_features(y, args.relevant_features, sensor_data)

    if classifier == DECISION_TREE:
        decision_tree_classifier(X, y, args.test_size)
    elif classifier == KNN:
        k_nearest_neighbors_classifier(X, y, args.test_size, args.k_val)
    else:
        print "please use a valid classifier"

def original_text_classifier(args, classifier):
    y = pd.Series(single_pressed_keys)

    X = get_features(y, args.relevant_features, single_sensor_data)

    if classifier == DECISION_TREE:
        decision_tree_classifier(X, y, args.test_size)
    elif classifier == KNN:
        k_nearest_neighbors_classifier(X, y, args.test_size, args.k_val)
    else:
        print "please use a valid classifier"

def main():
    p = ArgumentParser()
    p.add_argument('-otc', '--original_text_classifier', dest = 'original_text_classifier',
        action = 'store', choices = [DECISION_TREE, KNN],
        help='Recover original text classifier. Choose classifier type: \
        dt Decision Tree classifier; knn K-nearest-neighbor classifier')
    p.add_argument('-knc', '--key_number_classifier', dest = 'key_number_classifier',
        action = 'store', choices = [DECISION_TREE, KNN],
        help='Detect the number of pressed keys .Choose classifier type: \
        dt Decision Tree classifier; knn K-nearest-neighbor classifier')
    p.add_argument('-rf', '--relevant_features', action = 'store_true')
    p.add_argument('-ts', '--test_size', type = float, default = 0.2,
        help='The percentage from the dataset to be used for testing')
    p.add_argument('-k', '--k_val', type = int, default = 3,
        help='value of k for K-nearest-neighbors')
    p.add_argument('-t', '--time_margin', type = int, default = 250,
        help = 'Time margin for a key in ms')

    args = p.parse_args()

    build_pressed_keys_dict()
    build_sensor_data_dict()
    build_single_dicts(args.time_margin)

    if args.original_text_classifier:
        original_text_classifier(args, args.original_text_classifier)
    elif args.key_number_classifier:
        nr_pressed_keys_classifier(args, args.key_number_classifier)
    else:
        print "Please choose a classifier"

if __name__ == '__main__':
    main()