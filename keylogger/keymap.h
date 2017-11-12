#include <linux/input-event-codes.h>

void keymap_init_map();

char keymap_get_key(int code);

int keymap_is_special_key(int code);
