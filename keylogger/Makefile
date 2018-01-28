all: keylogger

keylogger: keylogger.o keymap.o window.o
	gcc `pkg-config --cflags gtk+-3.0 glib-2.0` keylogger.o keymap.o window.o -o keylogger `pkg-config --libs gtk+-3.0`

keylogger.o: keylogger.c
	gcc `pkg-config --cflags glib-2.0` -Wall -c keylogger.c

keymap.o: keymap.c
	gcc -Wall -c keymap.c

window.o: window.c
	gcc `pkg-config --cflags gtk+-3.0` -c -Wall window.c `pkg-config --libs gtk+-3.0`

clean:
	rm -f *.o keylogger window