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
#include "keymap.h"

int main (int argc, char *argv[])
{
    struct input_event ev[64];
    int fd, rd, size = sizeof (struct input_event), i;
    char name[256] = "Unknown";
    char *device = NULL;

    /* Setup check */
    if (argv[1] == NULL){
        printf("Specify path to device\n");
        exit (0);
    }

    if ((getuid ()) != 0)
        printf("Needs to be run as root\n");

    if (argc > 1)
        device = argv[1];

    /* Open Device */
    if ((fd = open (device, O_RDONLY)) == -1)
        printf("%s is not a valid device\n", device);

    /* Print Device Name */
    ioctl (fd, EVIOCGNAME (sizeof (name)), name);
    printf("Reading from: %s %s\n", device, name);

    keymap_init_map();

    while (1){
        rd = read(fd, ev, size);

        if (rd < (int) sizeof(struct input_event))
        {
            perror("error reading\n");
        }

        for (i = 0; i < rd / size; i++)
        {
            /* detect key press event */
            if (ev[i].type == EV_KEY && ev[i].value == REP_MAX)
            {
                printf("%ld.%06ld code %d key %c\n", ev[i].time.tv_sec, ev[i].time.tv_usec, ev[i].code, keymap_get_key(ev[i].code));
            }

            /* TODO: detect key release (useful for shift or capslock) */
        }
    }

    close(fd);

    return 0;
}