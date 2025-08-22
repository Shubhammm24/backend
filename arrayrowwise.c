#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define ROWS 50
#define COLS 50
#define ARRAY_SIZE (ROWS * COLS)

typedef struct {
    int valid;
    int tag;
    int lru_counter;
} CacheBlock;

int getSetIndex(int block_number, int num_sets) {
    return block_number % num_sets;
}

int getTag(int block_number, int num_sets) {
    return block_number / num_sets;
}

int main() {

  

    int cache_size, memory_size, block_size, K; // Set associativity
    printf("Enter cache size (in bytes): ");
    scanf("%d", &cache_size);
    printf("Enter main memory size (in bytes): ");
    scanf("%d", &memory_size);
    printf("Enter block size (in bytes): ");
    scanf("%d", &block_size);
    printf("Enter K (number of lines per set): ");
    scanf("%d", &K);

    int num_cache_blocks = cache_size / block_size;
    int num_sets = num_cache_blocks / K;

    // Create and initialize 2D float array
    float a[ROWS][COLS];
    srand(time(NULL));
    for (int i = 0; i < ROWS; i++)
        for (int j = 0; j < COLS; j++)
            a[i][j] = (float)(rand() % 1000) / 10.0;

    // Simulate cache
    CacheBlock** cache = (CacheBlock**)malloc(num_sets * sizeof(CacheBlock*));
    for (int i = 0; i < num_sets; i++) {
        cache[i] = (CacheBlock*)malloc(K * sizeof(CacheBlock));
        for (int j = 0; j < K; j++) {
            cache[i][j].valid = 0;
            cache[i][j].tag = -1;
            cache[i][j].lru_counter = 0;
        }
    }

    int hits = 0, misses = 0;
    int float_size = sizeof(float);
    int accesses = 0;

    // Access the array row-wise
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            int address = (i * COLS + j) * float_size;
            int block_number = address / block_size;
            int set_index = getSetIndex(block_number, num_sets);
            int tag = getTag(block_number, num_sets);
            int found = 0;

            // Search in cache set
            for (int k = 0; k < K; k++) {
                if (cache[set_index][k].valid && cache[set_index][k].tag == tag) {
                    found = 1;
                    hits++;
                    cache[set_index][k].lru_counter = 0;
                } else if (cache[set_index][k].valid) {
                    cache[set_index][k].lru_counter++;
                }
            }

            if (!found) {
                misses++;
                // Find LRU block
                int lru_index = 0;
                int max_lru = -1;
                for (int k = 0; k < K; k++) {
                    if (!cache[set_index][k].valid) {
                        lru_index = k;
                        break;
                    }
                    if (cache[set_index][k].lru_counter > max_lru) {
                        max_lru = cache[set_index][k].lru_counter;
                        lru_index = k;
                    }
                }
                // Replace the block
                cache[set_index][lru_index].valid = 1;
                cache[set_index][lru_index].tag = tag;
                cache[set_index][lru_index].lru_counter = 0;

                // Increment LRU for others
                for (int k = 0; k < K; k++) {
                    if (k != lru_index && cache[set_index][k].valid)
                        cache[set_index][k].lru_counter++;
                }
            }

            accesses++;
        }
    }

    double hit_ratio = (double)hits / accesses;
    printf("\nTotal accesses: %d\n", accesses);
    printf("Cache Hits: %d\n", hits);
    printf("Cache Misses: %d\n", misses);
    printf("Hit Ratio: %.4f\n", hit_ratio);

    // Free memory
    for (int i = 0; i < num_sets; i++) {
        free(cache[i]);
    }
    free(cache);

    printf("Name:Shubham Ranjan , Scholar No. 23U03088");

    return 0;
}
