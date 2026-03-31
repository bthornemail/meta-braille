CC = gcc
CFLAGS = -O3 -march=native -Wall -pthread
LDFLAGS = -lwebsockets -lpthread

TARGET = meta_circular_runtime
LEGACY_TARGET = fano_server
SOURCES = fano_server.c websocket.c sse.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET) $(LEGACY_TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(OBJECTS) -o $(TARGET) $(LDFLAGS)

$(LEGACY_TARGET): $(TARGET)
	cp $(TARGET) $(LEGACY_TARGET)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET) $(LEGACY_TARGET)

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
