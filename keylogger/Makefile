all: keylogger

keylogger: keylogger.o keymap.o
	gcc keylogger.o keymap.o -o keylogger

keylogger.o: keylogger.c
	gcc -Wall -c keylogger.c

keymap.o: keymap.c
	gcc -Wall -c keymap.c

clean:
	rm -f *.o keylogger