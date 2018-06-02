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
from argparse import ArgumentParser

def get_features(y, relevant_features):
    sensor_data_list = dict_as_list(sensor_data)
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

def nr_pressed_keys_decision_tree_classifier(relevant_features, test_size):
    y = {}

    for key in pressed_keys.keys():
        text = ""
        nr_pressed_keys = 0
        all_digits = True

        for tupl in pressed_keys[key]:
            text += tupl[KEY]
            if tupl[KEY] in left_hand_keys:
                nr_pressed_keys += 1
            if not tupl[KEY].isdigit():
                all_digits = False

        # we made the assumption that if the text is
        # all digits, then it's written only with the left hand
        if all_digits == True:
            nr_pressed_keys = len(text)

        y[key] = nr_pressed_keys

    y = pd.Series(y)

    X = get_features(y, relevant_features)

    decision_tree_classifier(X, y, test_size)

def original_text_decision_tree_classifier(relevant_features):
    y = {}

    for key in pressed_keys.keys():
        text = ""
        for tupl in pressed_keys[key]:
            text += tupl[KEY]

        y[key] = text

    y = pd.Series(y)

    X = get_features(y, relevant_features)

    decision_tree_classifier(X, y)

def main():
    p = ArgumentParser()
    p.add_argument('-otc', '--original_text_classifier', dest = 'original_text_classifier',
        action = 'store', choices = ['dt'],
        help='Recover original text classifier. Choose classifier type:\n \
        - dt Decision Tree classifier')
    p.add_argument('-knc', '--key_number_classifier', dest = 'key_number_classifier',
        action = 'store', choices = ['dt'],
        help='Detect the number of pressed keys .Choose classifier type:\n \
        - dt Decision Tree classifier')
    p.add_argument('-rf', '--relevant_features', action = 'store_true')
    p.add_argument('-ts', '--test_size', type = float, default = 0.2,
        help='The percentage from the dataset to be used for testing')

    args = p.parse_args()

    build_pressed_keys_dict()
    build_sensor_data_dict()

    if args.original_text_classifier and args.original_text_classifier == 'dt':
        original_text_decision_tree_classifier(args.relevant_features, args.test_size)
    elif args.key_number_classifier and args.key_number_classifier == 'dt':
        nr_pressed_keys_decision_tree_classifier(args.relevant_features, args.test_size)
    else:
        print "Please choose a classifier"

if __name__ == '__main__':
    main()