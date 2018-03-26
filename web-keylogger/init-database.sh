#!/bin/bash

mysql -u root <<MY_QUERY
	drop database if exists datadb;
	create database if not exists datadb;
	use datadb;
	create table pressedKeys(timestamp bigint, pressedKey varchar(1),
		keyCode int, primary key(timestamp));
	create table sensorData(timestamp bigint, accx float, accy float, accz float,
		gyrox float, gyroy float, gyroz float, primary key(timestamp));
MY_QUERY