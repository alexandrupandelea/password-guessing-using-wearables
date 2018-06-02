#!/usr/bin/python
import MySQLdb
import sys
import matplotlib.pyplot as plt
from argparse import ArgumentParser

TIMESTAMP = 0
KEY = 1
ACCX = 1
ACCY = 2
ACCZ = 3
GYROX = 4
GYROY = 5
GYROZ = 6

LARGE_TIMEDIF = 1000

left_hand_keys = ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z',
                  'x', 'c', 'v', 'b', '1', '2', '3', '4', '5']
right_hand_keys = ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm',
                  '6', '7', '8', '9', '0']

pressed_keys = {}
sensor_data = {}

def build_pressed_keys_dict():
    sql = "select * from pressedKeys"
    db = MySQLdb.connect("localhost","root","","datadb")
    cursor = db.cursor()

    cursor.execute(sql)
    data = cursor.fetchall()

    for i in range(0, len(data)):
        if data[i][0] in pressed_keys:
            pressed_keys[data[i][0]].append((data[i][1], data[i][2]))
        else:
            pressed_keys[data[i][0]] = [(data[i][1], data[i][2])]

def build_sensor_data_dict():
    sql = "select * from sensorData"
    db = MySQLdb.connect("localhost","root","","datadb")
    cursor = db.cursor()

    cursor.execute(sql)
    data = cursor.fetchall()

    for i in range(0, len(data)):
        if data[i][0] in sensor_data:
            sensor_data[data[i][0]].append((data[i][1], data[i][2], data[i][3],
                data[i][4], data[i][5], data[i][6], data[i][7]))
        else:
            sensor_data[data[i][0]] = [(data[i][1], data[i][2], data[i][3],
                data[i][4], data[i][5], data[i][6], data[i][7])]

def delete_input_from_table(input_id, table_name):
    sql = "delete from " + table_name + " where id=" + str(input_id)
    db = MySQLdb.connect("localhost","root","","datadb")
    cursor = db.cursor()

    try:
        cursor.execute(sql)
        db.commit()
    except:
        db.rollback()

    db.close()

# Remove inconsistent inputs from the database
def clean_database():
    # delete inputs that have incosistent timestamps:
    # - a previous timestamp larger than a future one (caused by not waiting for syncing)
    # - a large difference between two timestamps (caused by using same id for two distinct
    # inputs or not waiting for time synchronization)
    for input_id in sensor_data.keys():
        for i in range(0, len(sensor_data[input_id]) - 1):
            if sensor_data[input_id][i][TIMESTAMP] > sensor_data[input_id][i + 1][TIMESTAMP]:
                delete_input_from_table(input_id, "sensorData")
                break
            if sensor_data[input_id][i + 1][TIMESTAMP] - sensor_data[input_id][i][TIMESTAMP] >= LARGE_TIMEDIF:
                delete_input_from_table(input_id, "sensorData")
                break

    # delete inputs from pressed keys with no
    # sensor data correspondent
    for input_id in pressed_keys.keys():
        if input_id not in sensor_data:
            delete_input_from_table(input_id, "pressedKeys")

    # delete inputs from sensor data with no
    # pressed keys correspondent
    for input_id in sensor_data.keys():
        if input_id not in pressed_keys:
            delete_input_from_table(input_id, "sensorData")

def create_figure(time, datax, datay, dataz, text, title, chars, text_time):
    fig = plt.figure()

    # show keys at the top of the plot
    max_val = max([max(datax), max(datay), max(dataz)])

    ax1 = fig.add_subplot(111)
    ax1.set_title(title + ' values for the text \'' + text + '\'')
    ax1.set_xlabel('Time (ms)')
    ax1.set_ylabel('Sensor values')

    ax1.plot(time, datax, c='b', label='x axis')
    ax1.plot(time, datay, c='r', label='y axis')
    ax1.plot(time, dataz, c='g', label='z axis')
    ax1.scatter(text_time, [max_val for x in text_time], 10, c='orange', label='pressed keys')

    for i in range(0, len(chars)):
        ax1.annotate(chars[i], (text_time[i], max_val))

    ax1.legend()

def normalise_time(time):
    time = [int(var) for var in time]
    start_time = time[0]
    time = [var - start_time for var in time]

    return time

def plot(input_id):
    time = [sample[TIMESTAMP] for sample in sensor_data[input_id]]
    accx = [sample[ACCX] for sample in sensor_data[input_id]]
    accy = [sample[ACCY] for sample in sensor_data[input_id]]
    accz = [sample[ACCZ] for sample in sensor_data[input_id]]
    gyrox = [sample[GYROX] for sample in sensor_data[input_id]]
    gyroy = [sample[GYROY] for sample in sensor_data[input_id]]
    gyroz = [sample[GYROZ] for sample in sensor_data[input_id]]

    text_time = [sample[TIMESTAMP] for sample in pressed_keys[input_id]]
    chars = [sample[KEY] for sample in pressed_keys[input_id]]

    # show time starting from 0
    time = normalise_time(time)
    text_time = normalise_time(text_time)

    # get the text for this input
    text = ""
    for sample in pressed_keys[input_id]:
        text += sample[KEY]

    create_figure(time, accx, accy, accz, text, "Accelerometer", chars, text_time)
    create_figure(time, gyrox, gyroy, gyroz, text, "Gyroscope", chars, text_time)

    plt.show()

# convert the data dictionaries into lists
# to be able to use them with pandas
def dict_as_list(dic):
    res = []
    for key in dic.keys():
        for tupl in dic[key]:
            container = [key]
            for tuple_elem in tupl:
                container.append(tuple_elem)
            res.append(container)

    return res

def main():
    p = ArgumentParser()
    p.add_argument('-c', '--clean', action = 'store_true',
        help = 'remove inconsistent inputs from the database')
    p.add_argument('-p', '--plot', type = int,
        help = 'Plot the data for a specific input')
    p.add_argument('-s', '--stats', action = 'store_true',
        help = 'show data statistics')

    args = p.parse_args()

    build_pressed_keys_dict()
    build_sensor_data_dict()

    if args.clean:
        clean_database()

    if args.stats:
        print "Watch inputs nr: " + str(len(sensor_data)) + \
            "\nDesktop inputs nr: " + str(len(pressed_keys))

    if args.plot != None:
        plot(int(args.plot))

if __name__ == '__main__':
    main()
