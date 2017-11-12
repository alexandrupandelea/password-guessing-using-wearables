#include "keymap.h"

static char key_map[KEY_MAX] = {0};

/* Sets a minimalistic mapping between the
 * codes and the typed character
 */
void keymap_init_map()
{
    /* letters */
    key_map[KEY_A] = 'a';
    key_map[KEY_B] = 'b';
    key_map[KEY_C] = 'c';
    key_map[KEY_D] = 'd';
    key_map[KEY_E] = 'e';
    key_map[KEY_F] = 'f';
    key_map[KEY_G] = 'g';
    key_map[KEY_H] = 'h';
    key_map[KEY_I] = 'i';
    key_map[KEY_J] = 'j';
    key_map[KEY_K] = 'k';
    key_map[KEY_L] = 'l';
    key_map[KEY_M] = 'm';
    key_map[KEY_N] = 'n';
    key_map[KEY_O] = 'o';
    key_map[KEY_P] = 'p';
    key_map[KEY_Q] = 'q';
    key_map[KEY_R] = 'r';
    key_map[KEY_S] = 's';
    key_map[KEY_T] = 't';
    key_map[KEY_U] = 'u';
    key_map[KEY_V] = 'v';
    key_map[KEY_W] = 'w';
    key_map[KEY_X] = 'x';
    key_map[KEY_Y] = 'y';
    key_map[KEY_Z] = 'z';

    /* digits */
    key_map[KEY_0] = '0';
    key_map[KEY_1] = '1';
    key_map[KEY_2] = '2';
    key_map[KEY_3] = '3';
    key_map[KEY_4] = '4';
    key_map[KEY_5] = '5';
    key_map[KEY_6] = '6';
    key_map[KEY_7] = '7';
    key_map[KEY_8] = '8';
    key_map[KEY_9] = '9';

    /* numpad digits */
    key_map[KEY_KP0] = '0';
    key_map[KEY_KP1] = '1';
    key_map[KEY_KP2] = '2';
    key_map[KEY_KP3] = '3';
    key_map[KEY_KP4] = '4';
    key_map[KEY_KP5] = '5';
    key_map[KEY_KP6] = '6';
    key_map[KEY_KP7] = '7';
    key_map[KEY_KP8] = '8';
    key_map[KEY_KP9] = '9';

    key_map[KEY_GRAVE] = '`';
    key_map[KEY_MINUS] = '-';
    key_map[KEY_EQUAL] = '=';
    key_map[KEY_SLASH] = '/';
    key_map[KEY_BACKSLASH] = '\\';
    key_map[KEY_LEFTBRACE] = ']';
    key_map[KEY_RIGHTBRACE] = '[';
    key_map[KEY_SEMICOLON] = ';';
    key_map[KEY_BACKSLASH] = '\'';
    key_map[KEY_COMMA] = ',';
    key_map[KEY_DOT] = '.';

    key_map[KEY_KPDOT] = '.';
    key_map[KEY_KPSLASH] = '/';
    key_map[KEY_KPASTERISK] = '*';
    key_map[KEY_KPMINUS] = '-';

    key_map[KEY_SPACE] = ' ';
}

/*
 */
int keymap_is_special_key(int code)
{
    return key_map[code] == 0 ? 1 : 0;
}

/* Returns the typed character corresponding for a code
 * 
 */
char keymap_get_key(int code)
{
    if (keymap_is_special_key(code))
        return 0;

    return key_map[code];
}