#include <gtk/gtk.h>
#include "keylogger.h"

static guint keylogger_tag = -1;

static void
on_send_button_clicked (GtkWidget *widget,
                   gpointer   data)
{
    g_print ("Hello World\n");

    if (keylogger_tag != -1)
    {
        g_source_remove (keylogger_tag);
        keylogger_tag = -1;
    }
}

static void
on_window_destroy (GtkWidget *object,
                   gpointer   user_data)
{
    keylogger_stop();

    gtk_main_quit();
}

int
main (int    argc,
      char **argv)
{
    GtkWidget *window;
    GtkWidget *send_button;
    GtkBuilder *builder;

    gtk_init (&argc, &argv);

    builder = gtk_builder_new ();
    gtk_builder_add_from_file (builder, "keylogger-window.ui", NULL);

    window = GTK_WIDGET (gtk_builder_get_object (builder, "window"));
    g_signal_connect (window,
                      "destroy",
                      G_CALLBACK (on_window_destroy),
                      NULL);

    send_button = GTK_WIDGET (gtk_builder_get_object (builder, "send_button"));
    g_signal_connect (send_button,
                      "clicked",
                      G_CALLBACK (on_send_button_clicked),
                      NULL);

    gtk_widget_show_all (window);

    keylogger_init(argc, argv);

    keylogger_tag = g_idle_add_full (G_PRIORITY_DEFAULT_IDLE,
                                     keylogger_read_event,
                                     NULL,
                                     NULL);

    gtk_main();

    return 0;
}